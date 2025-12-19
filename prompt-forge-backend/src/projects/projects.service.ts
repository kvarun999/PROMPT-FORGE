import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId: userId, // Link the project to the user
      },
    });
  }

  async findAll(userId: string) {
    // Only return projects belonging to the logged-in user
    return this.prisma.project.findMany({
      where: { userId },
      include: { prompts: true }, // Optional: include prompts if needed
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.project.findFirst({
      where: { id, userId }, // Ensure user owns the project
      include: { prompts: true },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    // Verify ownership before updating
    await this.findOne(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string, userId: string) {
    // Verify ownership before deleting
    await this.findOne(id, userId);

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
