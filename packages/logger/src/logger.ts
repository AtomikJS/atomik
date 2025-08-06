import fs from 'fs';
import { LogEntry, LogLevel } from './types';
import { getLoggerConfig } from './config';

const logs: LogEntry[] = [];

function writeLogToFile(entry: LogEntry) {
  const cfg = getLoggerConfig();
  if (cfg.filePath) {
    try {
      const existing = JSON.parse(fs.readFileSync(cfg.filePath, 'utf-8')) || [];
      existing.push(entry);
      fs.writeFileSync(cfg.filePath, JSON.stringify(existing, null, 2));
    } catch (e) {
    }
  }
}

function createLogFunction(level: LogLevel) {
  return (
    title: string,
    message: string,
    options?: { category?: string; metadata?: Record<string, any> }
  ) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      title,
      message,
      level,
      category: options?.category,
      metadata: options?.metadata,
    };

    logs.push(entry);
    writeLogToFile(entry);
  };
}

export const log = {
  debug: createLogFunction('debug'),
  info: createLogFunction('info'),
  warn: createLogFunction('warn'),
  error: createLogFunction('error'),
};

export function getLogs(filter?: {
  title?: string;
  category?: string;
  level?: LogLevel;
}): LogEntry[] {
  return logs.filter(log => {
    return (
      (!filter?.title || log.title.includes(filter.title)) &&
      (!filter?.category || log.category === filter.category) &&
      (!filter?.level || log.level === filter.level)
    );
  });
}