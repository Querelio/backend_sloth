import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
