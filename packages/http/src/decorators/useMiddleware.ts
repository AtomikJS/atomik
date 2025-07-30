import 'reflect-metadata';
import { MiddlewareFunction } from '../middleware';

export function UseMiddleware(...middlewares: MiddlewareFunction[]) {
  return function (target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
      const existing = Reflect.getMetadata('middlewares', target, propertyKey) || [];
      Reflect.defineMetadata('middlewares', [...existing, ...middlewares], target, propertyKey);
    } else {
      const existing = Reflect.getMetadata('middlewares', target) || [];
      Reflect.defineMetadata('middlewares', [...existing, ...middlewares], target);
    }
  };
}
