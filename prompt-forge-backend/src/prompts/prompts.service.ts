import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { AiService } from '../ai/ai.service';
import { Readable } from 'stream';
import { BadRequestException } from '@nestjs/common';

// FIX 1: Correct import syntax for csv-parser
import csv from 'csv-parser';

@Injectable()
export class PromptsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  create(createPromptDto: CreatePromptDto) {
    const { name, projectId, template } = createPromptDto;
    return this.prisma.prompt.create({
      data: {
        name,
        projectId,
        versions: {
          create: {
            versionNumber: 1,
            template: template,
            commitMessage: 'Initial save',
          },
        },
      },
      include: { versions: true },
    });
  }

  // Update a prompt's name or metadata
  update(id: string, updatePromptDto: any) {
    // You can replace 'any' with UpdatePromptDto if you have it
    return this.prisma.prompt.update({
      where: { id },
      data: updatePromptDto,
    });
  }

  // Delete a prompt and all its versions
  remove(id: string) {
    return this.prisma.prompt.delete({
      where: { id },
    });
  }

  findAll() {
    return this.prisma.prompt.findMany();
  }

  findOne(id: string) {
    return this.prisma.prompt.findUnique({
      where: { id },
      include: { versions: true },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { versions: true },
    });
  }

  async createVersion(
    promptId: string,
    template: string,
    model: string,
    commitMessage?: string,
  ) {
    const lastVersion = await this.prisma.promptVersion.findFirst({
      where: { promptId },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    return this.prisma.promptVersion.create({
      data: {
        promptId,
        template,
        model,
        versionNumber: newVersionNumber,
        commitMessage: commitMessage || `v${newVersionNumber}`,
      },
    });
  }

  // Inside PromptsService class...

  async runBatch(promptId: string, fileBuffer: Buffer) {
    const promptVersion = await this.prisma.promptVersion.findFirst({
      where: { promptId },
      orderBy: { versionNumber: 'desc' },
    });

    if (!promptVersion) {
      throw new BadRequestException(
        'Please SAVE the prompt (v1) before running batch tests.',
      );
    }

    const stream = Readable.from(fileBuffer.toString());
    const rows: any[] = await new Promise((resolve, reject) => {
      const items: any[] = [];
      stream
        .pipe(csv())
        .on('data', (data) => items.push(data))
        .on('end', () => resolve(items))
        .on('error', (err) => reject(err));
    });

    // 1. Create a new Batch Run record
    const batchRun = await this.prisma.batchRun.create({
      data: { promptId },
    });

    const results: any[] = [];

    for (const row of rows) {
      let populatedTemplate = promptVersion.template;
      for (const [key, value] of Object.entries(row)) {
        populatedTemplate = populatedTemplate.replace(
          new RegExp(`{{${key}}}`, 'g'),
          String(value),
        );
      }

      let output = '';
      let status = 'success';

      try {
        const response = await this.aiService.generateText(
          populatedTemplate,
          promptVersion.model,
        );
        output = response.content;
      } catch (error) {
        output = 'Failed to generate';
        status = 'error';
      }

      // 2. Save each result to the Database
      await this.prisma.batchResult.create({
        data: {
          batchRunId: batchRun.id,
          inputs: row, // Prisma handles JSON automatically
          output: output,
          status: status,
        },
      });

      // Add to array to return to UI immediately
      results.push({ inputs: row, output, status });
    }

    return results;
  }
}
