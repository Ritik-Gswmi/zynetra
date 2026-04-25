import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { UsersService } from './users.service';
import { RequireAuthGuard } from '../auth/require-auth.guard';
import { badRequest } from '../../lib/http-errors';

@Controller()
export class MeController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(RequireAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: Request & { user?: any }, @Body() body: { name?: string; email?: string }) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');
    const user = await this.users.updateProfile(userId, { name: body.name, email: body.email });
    if (!user) badRequest('User not found');
    return { id: user.id, name: user.name, email: user.email };
  }
}

