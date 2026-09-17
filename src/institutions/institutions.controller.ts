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
import { Institution } from '../generated/prisma/client';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@ApiTags('institutions')
@ApiBearerAuth('JWT')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create an institution' })
  @ApiCreatedResponse({ type: CreatedResourceDto })
  create(
    @Body() createInstitutionDto: CreateInstitutionDto,
  ): Promise<CreatedResourceDto> {
    return this.institutionsService.create(createInstitutionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all institutions' })
  @ApiOkResponse({ description: 'List of institutions' })
  findAll(): Promise<Institution[]> {
    return this.institutionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an institution by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Institution' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Institution> {
    return this.institutionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an institution' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated institution' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstitutionDto: UpdateInstitutionDto,
  ): Promise<Institution> {
    return this.institutionsService.update(id, updateInstitutionDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an institution' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Institution deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.institutionsService.remove(id);
  }
}
