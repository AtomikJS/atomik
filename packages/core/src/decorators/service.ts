import { Container } from '../container';

export function Service(): ClassDecorator {
  return target => {
    Reflect.defineMetadata('isService', true, target);
    
    try {
      Container.register(target, { useClass: target as unknown as new (...args: any[]) => any });
    } catch (error) {
      console.warn(`[Service] Could not register ${target.name} immediately:`, error);
    }
  };
}