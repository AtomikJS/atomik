import 'reflect-metadata';
import { CRON_METADATA } from '../metadata/constants';
import { TimeoutOptions } from '../types';

export function After(ms: number, options: TimeoutOptions = {}) {
  return (target: any, propertyKey: string) => {
    const jobs = Reflect.getMetadata(CRON_METADATA, target.constructor) || [];
    jobs.push({ type: 'timeout', propertyKey, timeout: ms, options });
    Reflect.defineMetadata(CRON_METADATA, jobs, target.constructor);
  };
}
