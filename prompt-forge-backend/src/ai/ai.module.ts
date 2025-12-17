import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // <--- THIS IS CRITICAL. DO NOT REMOVE.
})
export class AiModule {}
