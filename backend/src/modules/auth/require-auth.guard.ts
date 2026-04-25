import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RequireAuthGuard extends AuthGuard('jwt') {}

