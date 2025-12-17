import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a Project
  create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description || '', // Handle optional description
      },
    });
  }

  // 2. Find All Projects
  findAll() {
    return this.prisma.project.findMany({
      include: { prompts: true }, // Optional: Include prompts count if needed
    });
  }

  // 3. Find One Project
  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { prompts: true },
    });
  }

  // 4. Update
  update(id: string, updateProjectDto: any) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  // 5. Delete
  remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
