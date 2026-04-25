import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { badRequest } from '../../lib/http-errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signup(params: { name: string; email: string; password: string }) {
    const name = (params.name ?? '').trim();
    const email = (params.email ?? '').trim().toLowerCase();
    const password = params.password ?? '';
    if (!name || !email || !password) badRequest('Missing fields');

    const existing = await this.users.findByEmail(email);
    if (existing) badRequest('Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, passwordHash });
    const token = await this.jwt.signAsync({ sub: user.id });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  async login(params: { email: string; password: string }) {
    const email = (params.email ?? '').trim().toLowerCase();
    const password = params.password ?? '';
    if (!email || !password) badRequest('Missing fields');

    const user = await this.users.findByEmail(email);
    if (!user) badRequest('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) badRequest('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: user.id });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}

