import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('audit')
  audit() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  @Get('config')
  config() {
    return this.prisma.feeRule.findMany({ where: { active: true } });
  }

  @Post('market-rules')
  rule(@Body() b: { kind: string; target: string; state: string; reason?: string; actorId?: string }) {
    return this.prisma.marketRule.create({ data: b });
  }

  @Get('market-rules')
  rules() {
    return this.prisma.marketRule.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }
}
