import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Prompts')
@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new prompt' })
  create(@Body() createPromptDto: CreatePromptDto, @Request() req) {
    // Pass the userId from the authenticated request
    return this.promptsService.create(createPromptDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prompts' })
  findAll() {
    return this.promptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific prompt' })
  findOne(@Param('id') id: string) {
    return this.promptsService.findOne(id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get prompts by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.promptsService.findByProject(projectId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a prompt' })
  update(
    @Param('id') id: string,
    @Body() updatePromptDto: UpdatePromptDto,
    @Request() req,
  ) {
    return this.promptsService.update(id, updatePromptDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a prompt' })
  remove(@Param('id') id: string, @Request() req) {
    return this.promptsService.remove(id, req.user.userId);
  }

  @Post(':id/versions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new version for a prompt' })
  createVersion(
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

  @Post(':id/batch-test')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Run a batch test from CSV' })
  runBatch(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.promptsService.runBatch(id, file.buffer);
  }
}
