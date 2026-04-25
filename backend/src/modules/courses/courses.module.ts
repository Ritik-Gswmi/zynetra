import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { ProgressModule } from '../progress/progress.module';
import { RequireAuthGuard } from '../auth/require-auth.guard';

@Module({
  imports: [ProgressModule],
  controllers: [CoursesController],
  providers: [CoursesService, RequireAuthGuard],
})
export class CoursesModule {}

