import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { OffersModule } from './offers/offers.module';
import { TradesModule } from './trades/trades.module';
import { BondModule } from './bond/bond.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';
import { NotifyModule } from './notify/notify.module';

@Module({
  imports: [AuthModule, OffersModule, TradesModule, BondModule, AdminModule, UploadsModule, NotifyModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
