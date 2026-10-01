import { Module } from '@nestjs/common';
import { PrismaService } from './infra/prisma.service';
import { RedisService } from './infra/redis.service';
import { AuditService } from './infra/audit.service';
import { OtpController } from './auth/otp.controller';
import { OffersController } from './market/offers.controller';
import { TradesController } from './market/trades.controller';
import { BondController } from './bond/bond.controller';
import { OpsController } from './ops/ops.controller';
import { LedgerService } from './ledger/ledger.service';
import { PaystackService } from './infra/paystack.service';
import { MailService } from './infra/mail.service';
import { StorageService } from './infra/storage.service';

@Module({
  controllers: [OtpController, OffersController, TradesController, BondController, OpsController],
  providers: [PrismaService, RedisService, AuditService, LedgerService, PaystackService, MailService, StorageService],
})
export class AppModule {}
