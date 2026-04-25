import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return 'Zynetra Backend API is Running 🚀';
  }
}

