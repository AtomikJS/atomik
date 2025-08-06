import 'reflect-metadata';
import { CRON_METADATA } from '../metadata/constants';
import { TimeoutOptions } from '../types';

export function Scheduled(cron: string, options: TimeoutOptions = {}) {
  return (target: any, propertyKey: string) => {
    const jobs = Reflect.getMetadata(CRON_METADATA, target.constructor) || [];
    jobs.push({ type: 'cron', propertyKey, cron, options });
    Reflect.defineMetadata(CRON_METADATA, jobs, target.constructor);
  };
}
