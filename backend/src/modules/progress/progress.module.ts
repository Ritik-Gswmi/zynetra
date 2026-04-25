import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { Progress, ProgressSchema } from './progress.schema';
import { RequireAuthGuard } from '../auth/require-auth.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Progress.name, schema: ProgressSchema }])],
  controllers: [ProgressController],
  providers: [ProgressService, RequireAuthGuard],
  exports: [ProgressService],
})
export class ProgressModule {}

