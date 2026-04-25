import { BadRequestException } from '@nestjs/common';

export function badRequest(message: string): never {
  throw new BadRequestException(message);
}

