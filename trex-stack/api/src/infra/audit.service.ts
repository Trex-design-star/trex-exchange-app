import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private db: PrismaService) {}
  log(actor: string, event: string) {
    return this.db.auditLog.create({ data: { actor, event } }).catch(() => null);
  }
}
