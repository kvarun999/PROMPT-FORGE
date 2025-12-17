import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { PromptsModule } from './prompts/prompts.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [ProjectsModule, PromptsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
