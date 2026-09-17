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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { CreatedResourceDto } from '../common/dto/created-resource.dto';
import {
  ContractsService,
  FormattedContract,
  FormattedContractWithRelations,
} from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@ApiTags('contracts')
@ApiBearerAuth('JWT')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a contract' })
  @ApiCreatedResponse({ type: CreatedResourceDto })
  create(
    @Body() createContractDto: CreateContractDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreatedResourceDto> {
    return this.contractsService.create(createContractDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List own contracts' })
  @ApiOkResponse({ description: 'List of contracts with relations' })
  findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedContractWithRelations[]> {
    return this.contractsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Contract with relations' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedContractWithRelations> {
    return this.contractsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated contract' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedContract> {
    return this.contractsService.update(id, updateContractDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a contract' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Contract deleted' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.contractsService.remove(id, user.sub);
  }
}
