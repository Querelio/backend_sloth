import { Matches } from 'class-validator';

export class AgendaSessionsDateQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must use YYYY-MM-DD format',
  })
  date: string;
}
