import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from './app.module';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function bootstrap() {
  requireEnv('MONGODB_URI');
  requireEnv('JWT_SECRET');

  const app = await NestFactory.create(AppModule, { cors: true });
  const port = Number(process.env.PORT || 3000);

  // Attach MongoDB connection logs (works with @nestjs/mongoose).
  try {
    const connection = app.get<Connection>(getConnectionToken());
    connection.on('connected', () => {
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    });
    connection.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.log('MongoDB disconnected');
    });
    connection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err);
    });

    if (connection.readyState === 1) {
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    }
  } catch {
    // If Mongoose isn't configured, skip DB logs.
  }

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
}

void bootstrap();
