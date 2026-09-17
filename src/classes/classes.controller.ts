import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreatedResourceDto } from '../common/dto/created-resource.dto';
import { Class } from '../generated/prisma/client';
import { ClassesService, ClassWithRelations } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@ApiTags('classes')
@ApiBearerAuth('JWT')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a class' })
  @ApiCreatedResponse({ type: CreatedResourceDto })
  create(
    @Body() createClassDto: CreateClassDto,
  ): Promise<CreatedResourceDto> {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all classes' })
  @ApiOkResponse({ description: 'List of classes with relations' })
  findAll(): Promise<ClassWithRelations[]> {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Class with relations' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ClassWithRelations> {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated class' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a class' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Class deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.classesService.remove(id);
  }
}
