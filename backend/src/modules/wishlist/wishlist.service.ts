import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { Wishlist, WishlistDocument } from './wishlist.schema';

function normalizeCourseIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of input) {
    if (typeof x !== 'string') continue;
    const id = x.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

@Injectable()
export class WishlistService {
  constructor(@InjectModel(Wishlist.name) private readonly wishlist: Model<WishlistDocument>) {}

  async getOrCreate(userId: string) {
    const existing = await this.wishlist.findOne({ userId }).exec();
    if (existing) return existing;
    return this.wishlist.create({ userId, courseIds: [] });
  }

  async getCourseIds(userId: string): Promise<string[]> {
    const doc = await this.getOrCreate(userId);
    return Array.isArray(doc.courseIds) ? doc.courseIds : [];
  }

  async setCourseIds(userId: string, courseIds: unknown): Promise<string[]> {
    const ids = normalizeCourseIds(courseIds);
    const doc = await this.getOrCreate(userId);
    doc.courseIds = ids;
    await doc.save();
    return doc.courseIds;
  }
}

