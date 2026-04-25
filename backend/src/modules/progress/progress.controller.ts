import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RequireAuthGuard } from '../auth/require-auth.guard';
import { ProgressService } from './progress.service';
import { badRequest } from '../../lib/http-errors';

@Controller()
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @UseGuards(RequireAuthGuard)
  @Get('progress')
  async getProgress(@Req() req: Request & { user?: any }) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');
    return this.progress.toProgressSummary(userId);
  }
}

