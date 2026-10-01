import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DisputesService } from './disputes.service';

@Controller('disputes')
export class DisputesController {
  constructor(private disputes: DisputesService) {}

  @Get()
  list() {
    return this.disputes.list();
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() body: { how: 'VENDOR-AT-FAULT' | 'EXONERATED' | 'PARTIAL'; secondBy?: string }) {
    return this.disputes.resolve(id, body.how, { secondBy: body.secondBy });
  }
}
