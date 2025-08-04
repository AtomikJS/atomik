import 'reflect-metadata';

export const FORGE_METADATA = 'atomik:forge';

export function Forge(...pipes: Function[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(FORGE_METADATA, pipes, target, propertyKey);
    } else {
      Reflect.defineMetadata(FORGE_METADATA, pipes, target);
    }
  };
}