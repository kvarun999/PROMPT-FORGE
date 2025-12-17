import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptsService.create(createPromptDto);
  }

  @Get()
  findAll() {
    return this.promptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promptsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromptDto: UpdatePromptDto) {
    return this.promptsService.update(id, updatePromptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promptsService.remove(id);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.promptsService.findByProject(projectId);
  }

  @Post(':id/versions')
  async createVersion(
    @Param('id') id: string,
    @Body() body: { template: string; model: string; commitMessage?: string },
  ) {
    return this.promptsService.createVersion(
      id,
      body.template,
      body.model,
      body.commitMessage,
    );
  }

  @Post(':id/batch')
  @UseInterceptors(FileInterceptor('file')) // Handles the file upload
  async runBatch(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.promptsService.runBatch(id, file.buffer);
  }
}
