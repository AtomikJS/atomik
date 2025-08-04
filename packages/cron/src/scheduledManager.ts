import { CRON_METADATA } from './metadata/constants';
import type { TimeoutOptions } from './types';
import { CronJob } from 'cron';
type ScheduledTask = CronJob; 

type Job = {
  type: 'timeout' | 'interval' | 'cron';
  propertyKey: string;
  timeout?: number;
  interval?: number;
  cron?: string;
  options?: TimeoutOptions;
};

export class ScheduledManager {
    private readonly jobs: ScheduledTask[] = [];
    private readonly instances: any[] = [];

    constructor(private readonly serviceClasses: any[]) {
        this.instances = this.serviceClasses.map(ServiceClass => new ServiceClass());
    }

    public async start() {
        const jobCompleted = new Map<string, Promise<void>>();
        const jobCompletedResolvers = new Map<string, () => void>();

        const createJobCompletionPromise = (name: string) => {
        let resolver!: () => void;
        const promise = new Promise<void>(resolve => {
            resolver = resolve;
        });
        jobCompletedResolvers.set(name, resolver);
        jobCompleted.set(name, promise);
        };

        for (const instance of this.instances) {
        const target = instance.constructor;
        const jobs: Job[] = Reflect.getMetadata(CRON_METADATA, target) || [];
        for (const job of jobs) {
            if (job.options?.name && !jobCompleted.has(job.options.name)) {
            createJobCompletionPromise(job.options.name);
            }
        }
        }

        for (const instance of this.instances) {
        const target = instance.constructor;
        const jobs: Job[] = Reflect.getMetadata(CRON_METADATA, target) || [];

        for (const job of jobs) {
            const method = instance[job.propertyKey].bind(instance);

            switch (job.type) {
            case 'timeout':
                if (job.options?.runOnInit) method();

                if (job.options?.afterJob && jobCompleted.has(job.options.afterJob)) {
                jobCompleted.get(job.options.afterJob)!.then(() => {
                    setTimeout(() => {
                    method();
                    if (job.options?.name && jobCompletedResolvers.has(job.options.name)) {
                        jobCompletedResolvers.get(job.options.name)!();
                    }
                    }, job.timeout);
                });
                } else {
                setTimeout(() => {
                    method();
                    if (job.options?.name && jobCompletedResolvers.has(job.options.name)) {
                    jobCompletedResolvers.get(job.options.name)!();
                    }
                }, job.timeout);
                }
                break;

            case 'interval':
                if (job.options?.runOnInit) method();
                setInterval(method, job.interval);
                break;

            case 'cron':
            if (job.options?.runOnInit) method();

            const task = new CronJob(
                job.cron!,
                () => {
                method();
                if (job.options?.name && jobCompletedResolvers.has(job.options.name)) {
                    jobCompletedResolvers.get(job.options.name)!();
                }
                },
                null,
                true, 
                job.options?.timezone || 'UTC'
            );

            this.jobs.push(task);
            break;
            }
        }
        }
    }

    public stop() {
        for (const job of this.jobs) {
        job.stop();
        }
    }

    public getJobs() {
        return this.jobs.map(j => {
            const job = j as any;

            return {
            cronTime: j.cronTime?.source || '',
            timezone: job.timezone || 'UTC',
            running: job.running ?? false,
            };
        });
    }
}
