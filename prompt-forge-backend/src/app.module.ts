import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { PromptsModule } from './prompts/prompts.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, ProjectsModule, PromptsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
