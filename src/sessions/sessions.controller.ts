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
  FormattedSession,
  FormattedSessionWithRelations,
  SessionsService,
} from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('sessions')
@ApiBearerAuth('JWT')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a session' })
  @ApiCreatedResponse({ type: CreatedResourceDto })
  create(
    @Body() createSessionDto: CreateSessionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreatedResourceDto> {
    return this.sessionsService.create(createSessionDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List own sessions' })
  @ApiOkResponse({ description: 'List of sessions with relations' })
  findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedSessionWithRelations[]> {
    return this.sessionsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Session with relations' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedSessionWithRelations> {
    return this.sessionsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated session' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedSession> {
    return this.sessionsService.update(id, updateSessionDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a session' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Session deleted' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.sessionsService.remove(id, user.sub);
  }
}
