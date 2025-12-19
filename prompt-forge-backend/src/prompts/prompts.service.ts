import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { AiService } from '../ai/ai.service';
import { Readable } from 'stream';
import csv from 'csv-parser';

@Injectable()
export class PromptsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async create(createPromptDto: CreatePromptDto, userId: string) {
    const { name, projectId, template } = createPromptDto;

    // Validate project belongs to user
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project)
      throw new BadRequestException('Project not found or access denied');

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

  async update(id: string, updatePromptDto: any, userId: string) {
    return this.prisma.prompt.update({
      where: { id },
      data: updatePromptDto,
    });
  }

  async remove(id: string, userId: string) {
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

  // --- BATCH TESTING LOGIC ---

  private getProviderFromModel(model: string): string {
    if (model.toLowerCase().includes('gemini')) return 'gemini';
    return 'groq'; // Default fallback
  }

  // ... inside PromptsService class ...

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

    // Parse CSV
    const stream = Readable.from(fileBuffer.toString());
    const rows: any[] = await new Promise((resolve, reject) => {
      const items: any[] = [];
      stream
        .pipe(csv())
        .on('data', (data) => items.push(data))
        .on('end', () => resolve(items))
        .on('error', (err) => reject(err));
    });

    // 1. Create Batch Run Record
    const batchRun = await this.prisma.batchRun.create({
      data: { promptId },
    });

    const results: any[] = [];
    const provider = this.getProviderFromModel(promptVersion.model);

    // 2. Process each row
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
      let latencyMs = 0;
      let tokenCount = 0;
      let cost = 0;

      try {
        const response = await this.aiService.generate(
          populatedTemplate,
          promptVersion.model,
          provider,
        );
        output = response.output;
        latencyMs = response.latencyMs;
        tokenCount = response.tokenUsage;
        cost = response.cost;
      } catch (error) {
        console.error('Batch generation error:', error);
        output = `Error: ${error.message}`;
        status = 'error';
      }

      // --- 🤖 AUTOMATED METRIC: JSON Validity Check ---
      // Requirement: "Implement at least one automated quality metric"
      let qualityScore = 0; // 0 = Fail, 1 = Pass
      try {
        // Try to parse the output. If it works, it's valid JSON.
        JSON.parse(output);
        qualityScore = 1;
      } catch (e) {
        // If it fails (e.g. normal text), score is 0
        qualityScore = 0;
      }

      // 3. Save detailed metrics to DB
      await this.prisma.batchResult.create({
        data: {
          batchRunId: batchRun.id,
          inputs: row,
          output: output,
          status: status,
          latencyMs: Math.round(latencyMs),
          tokenCount: tokenCount,
          cost: cost,
          qualityScore: qualityScore, // ✅ Saving the real score now
        },
      });

      results.push({
        inputs: row,
        output,
        status,
        latencyMs,
        cost,
        qualityScore, // ✅ Returning it to frontend
      });
    }

    return results;
  }
}
