import 'reflect-metadata';

export const GATE_METADATA = 'atomik:gate';

export function Gate(...gates: Function[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(GATE_METADATA, gates, target, propertyKey);
    } else {
      Reflect.defineMetadata(GATE_METADATA, gates, target);
    }
  };
}
