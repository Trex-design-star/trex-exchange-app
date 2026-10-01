import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private offers: OffersService) {}

  @Get()
  list(@Query('all') all?: string) {
    return this.offers.list(all !== '1');
  }

  @Post()
  create(@Body() dto: any) {
    // Vendor comes from the session in production; demo vendor until auth lands.
    return this.offers.create(dto.vendorId ?? 'demo-vendor', dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.offers.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offers.remove(id);
  }
}
