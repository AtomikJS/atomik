export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  title: string;
  message: string;
  level: LogLevel;
  category?: string;
  metadata?: Record<string, any>;
}