import { Module } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module'; // <--- Ensure this path is correct

@Module({
  imports: [PrismaModule, AiModule], // <--- Add AiModule here
  controllers: [PromptsController],
  providers: [PromptsService],
})
export class PromptsModule {}
