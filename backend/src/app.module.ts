import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { LedgerService } from './ledger/ledger.service';
import { RatesService } from './rates/rates.service';
import { ResendService } from './notifications/resend.service';
import { PaystackService } from './bond/paystack.service';
import { OffersService } from './offers/offers.service';
import { OffersController } from './offers/offers.controller';
import { TradesService } from './trades/trades.service';
import { TradesController } from './trades/trades.controller';
import { DisputesService } from './disputes/disputes.service';
import { DisputesController } from './disputes/disputes.controller';
import { BondService } from './bond/bond.service';
import { BondController } from './bond/bond.controller';
import { WebhooksController } from './bond/webhooks.controller';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [OffersController, TradesController, DisputesController, BondController, WebhooksController, AdminController],
  providers: [
    PrismaService, LedgerService, RatesService, ResendService, PaystackService,
    OffersService, TradesService, DisputesService, BondService,
  ],
})
export class AppModule {}
