import 'reflect-metadata';

export const WRAP_METADATA = 'atomik:wrap';

export function Wrap(...wraps: Function[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(WRAP_METADATA, wraps, target, propertyKey);
    } else {
      Reflect.defineMetadata(WRAP_METADATA, wraps, target);
    }
  };
}