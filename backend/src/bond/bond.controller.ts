import { Controller, Post, Body, Headers } from '@nestjs/common';
import { BondService } from './bond.service';

@Controller('bond')
export class BondController {
  constructor(private bond: BondService) {}

  @Post('topup')
  topup(@Body() b: any, @Headers('x-idempotency-key') key?: string) {
    return this.bond.topup(b.vendorId ?? 'demo-vendor', b.currency, Math.round(b.amountMinor), key ?? b.idemKey);
  }

  @Post('release')
  release(@Body() b: any, @Headers('x-idempotency-key') key?: string) {
    return this.bond.release(b.vendorId ?? 'demo-vendor', b.currency, Math.round(b.amountMinor), b.bank, key ?? b.idemKey, b.secondBy);
  }

  @Post('switch')
  switch(@Body() b: any) {
    return this.bond.switchModel(b.vendorId ?? 'demo-vendor');
  }
}
