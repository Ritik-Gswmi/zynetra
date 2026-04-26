import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RequireAuthGuard } from '../auth/require-auth.guard';
import { badRequest } from '../../lib/http-errors';
import { WishlistService } from './wishlist.service';

@Controller()
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @UseGuards(RequireAuthGuard)
  @Get('wishlist')
  async getWishlist(@Req() req: Request & { user?: any }) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');
    const courseIds = await this.wishlist.getCourseIds(userId);
    return { courseIds };
  }

  @UseGuards(RequireAuthGuard)
  @Put('wishlist')
  async setWishlist(@Req() req: Request & { user?: any }, @Body() body: { courseIds?: unknown }) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');
    const courseIds = await this.wishlist.setCourseIds(userId, body?.courseIds);
    return { courseIds };
  }
}

