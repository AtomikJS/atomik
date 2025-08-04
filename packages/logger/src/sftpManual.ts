import { Client, SFTPWrapper } from 'ssh2';
import fs from 'fs';
import { getLoggerConfig } from './config';

export function startSftpSync() {
  const cfg = getLoggerConfig();
  if (!cfg.sftp || !cfg.filePath) return;

  const { host, port, username, password, remotePath, frequencyMinutes } = cfg.sftp;
  const frequencyMs = frequencyMinutes * 60 * 1000;

  setInterval(() => {
    const conn = new Client();

    conn
      .on('ready', () => {
        conn.sftp((err: Error | undefined, sftp: SFTPWrapper) => {
          if (err) {
            conn.end();
            return;
          }

          const readStream = fs.createReadStream(cfg.filePath!);
          const writeStream = sftp.createWriteStream(remotePath);

          writeStream.on('close', () => {
            conn.end();
          });

          writeStream.on('error', (err: Error) => {
            conn.end();
          });

          readStream.pipe(writeStream);
        });
      })
      .on('error', (err: Error) => {
      })
      .connect({
        host,
        port,
        username,
        password,
      });
  }, frequencyMs);
}