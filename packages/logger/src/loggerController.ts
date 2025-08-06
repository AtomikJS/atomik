import { Controller, Get, Query } from '@atomikjs/http';
import { getLogs } from './logger';
import { LogLevel } from './types';

@Controller('/atomikjs/logs')
export class LoggerHttpController {
  @Get('/')
  listLogs(
    @Query('title') title?: string,
    @Query('category') category?: string,
    @Query('level') level?: LogLevel
  ) {
    return getLogs({ title, category, level });
  }
}
