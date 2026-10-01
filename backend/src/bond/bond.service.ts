import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { PaystackService } from './paystack.service';

const SWITCH_COOLDOWN_MS = 72 * 3600 * 1000;
const SECOND_APPROVAL_MINOR = 500_000_00; // ₦500,000 in kobo — configurable

@Injectable()
export class BondService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
    private paystack: PaystackService,
  ) {}

  private async bondFor(vendorId: string) {
    return this.prisma.bond.upsert({
      where: { vendorId },
      update: {},
      create: { vendorId, model: 'standing', base: 'USD', caps: {} },
    });
  }

  /** Open-trade exposure still locked against this vendor's capacity. */
  private async lockedTotal(vendorId: string): Promise<number> {
    const open = await this.prisma.trade.aggregate({
      where: { vendorId, state: { in: ['opened', 'payment_sent', 'payment_confirmed', 'delivery_sent', 'disputed'] } },
      _sum: { lockMinor: true },
    });
    return open._sum.lockMinor ?? 0;
  }

  async topup(vendorId: string, currency: string, amountMinor: number, idemKey?: string) {
    if (!(amountMinor > 0)) throw new BadRequestException('Amount must be above zero.');
    const bond = await this.bondFor(vendorId);
    const { duplicate } = await this.ledger.append({
      kind: 'topup', bondId: bond.id, amount: amountMinor, currency, idemKey,
    });
    const caps: any = { ...(bond.caps as any) };
    if (!duplicate) caps[currency] = (caps[currency] ?? 0) + amountMinor;
    await this.prisma.bond.update({ where: { id: bond.id }, data: { caps } });
    return { caps, duplicate };
  }

  async release(vendorId: string, currency: string, amountMinor: number, bank: { accountNumber: string; bankCode: string; name: string }, idemKey?: string, secondBy?: string) {
    if (!(amountMinor > 0)) throw new BadRequestException('Amount must be above zero.');
    if (await this.lockedTotal(vendorId)) throw new BadRequestException('Withdrawals need zero open trades.');
    const bond = await this.bondFor(vendorId);
    const caps: any = { ...(bond.caps as any) };
    if (amountMinor > (caps[currency] ?? 0)) throw new BadRequestException('That exceeds your free balance.');
    if (amountMinor > SECOND_APPROVAL_MINOR && !secondBy)
      throw new BadRequestException('Large amount — second approval required.');
    // Real payout first; the ledger only moves on Paystack confirmation.
    const recipient = await this.paystack.createRecipient(bank.name, bank.accountNumber, bank.bankCode);
    const reference = idemKey ?? `trex-${Date.now()}`;
    const transfer = await this.paystack.transfer(amountMinor, recipient.recipient_code, reference);
    if (transfer.status !== 'success') {
      // Queued for the retry worker (BullMQ + Redis); never silently dropped.
      await this.prisma.auditLog.create({ data: { actorId: vendorId, action: 'bond:release-queued', meta: { reference, amountMinor, currency } } });
      return { queued: true, reference };
    }
    caps[currency] -= amountMinor;
    await this.prisma.bond.update({ where: { id: bond.id }, data: { caps } });
    await this.ledger.append({ kind: 'release', bondId: bond.id, amount: -amountMinor, currency, idemKey });
    return { caps, reference, transfer: transfer.transfer_code };
  }

  async switchModel(vendorId: string) {
    if (await this.lockedTotal(vendorId)) throw new BadRequestException('Finish open trades first.');
    const bond = await this.bondFor(vendorId);
    if (bond.switchedAt && Date.now() - bond.switchedAt.getTime() < SWITCH_COOLDOWN_MS)
      throw new BadRequestException('You can switch plans again after 72 hours.');
    const model = bond.model === 'standing' ? 'pertrade' : 'standing';
    return this.prisma.bond.update({ where: { id: bond.id }, data: { model, switchedAt: new Date() } });
  }
}
