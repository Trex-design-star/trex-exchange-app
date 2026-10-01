import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private trades: TradesService) {}

  @Post()
  open(@Body() dto: any, @Headers('x-idempotency-key') key?: string) {
    return this.trades.open({ ...dto, idemKey: key ?? dto.idemKey });
  }

  @Get()
  list() {
    return this.trades.recent();
  }

  @Post(':id/:action')
  act(@Param('id') id: string, @Param('action') action: string, @Body() body: any) {
    return this.trades.act(id, action, body);
  }
}
