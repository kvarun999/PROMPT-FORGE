import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // <--- Note the ./ (Same folder)

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
