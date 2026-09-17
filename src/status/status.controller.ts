import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Status } from '../generated/prisma/client';
import { StatusService } from './status.service';

@ApiTags('status')
@ApiBearerAuth('JWT')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'List all statuses' })
  @ApiOkResponse({ description: 'List of statuses' })
  findAll(): Promise<Status[]> {
    return this.statusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a status by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Status' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Status> {
    return this.statusService.findOne(id);
  }
}
