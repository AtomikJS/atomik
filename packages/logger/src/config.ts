import fs from 'fs';

export interface LoggerConfig {
  filePath?: string;
  sftp?: {
    host: string;
    port: number;
    username: string;
    password: string;
    remotePath: string;
    frequencyMinutes: number;
  };
  categories?: string[];
}

let config: LoggerConfig = {};

export function setLoggerConfig(cfg: LoggerConfig) {
  config = cfg;
  if (cfg.filePath && !fs.existsSync(cfg.filePath)) {
    fs.writeFileSync(cfg.filePath, '[]');
  }
}

export function getLoggerConfig(): LoggerConfig {
  return config;
}
