import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { AgendaService, FormattedAgendaSession } from './agenda.service';
import { AgendaSessionsDateQueryDto } from './dto/agenda-sessions-date-query.dto';

@ApiTags('agenda')
@ApiBearerAuth('JWT')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'List own agenda sessions' })
  @ApiOkResponse({ description: 'List of sessions with relations' })
  findSessions(
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedAgendaSession[]> {
    return this.agendaService.findSessions(user.sub);
  }

  @Get('sessions/date')
  @ApiOperation({ summary: 'List own agenda sessions by date' })
  @ApiQuery({
    name: 'date',
    example: '2026-07-01',
    description: 'Session date in YYYY-MM-DD format',
  })
  @ApiOkResponse({ description: 'List of sessions for the requested date' })
  findSessionsByDate(
    @Query() query: AgendaSessionsDateQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<FormattedAgendaSession[]> {
    return this.agendaService.findSessionsByDate(query.date, user.sub);
  }
}
