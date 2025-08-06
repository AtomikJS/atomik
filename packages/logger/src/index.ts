import { LoggerConfig, setLoggerConfig } from './config';
import { startSftpSync } from './sftpManual';

export * from './logger';
export * from './config';
export * from './types';
export * from './loggerController';

export function configureLogger(config: LoggerConfig) {
  setLoggerConfig(config);

  if (config.sftp) {
    startSftpSync();
  }
}