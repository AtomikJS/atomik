import 'reflect-metadata';

export const SHIELD_METADATA = 'atomik:shield';

export function Shield(...shields: Function[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(SHIELD_METADATA, shields, target, propertyKey);
    } else {
      Reflect.defineMetadata(SHIELD_METADATA, shields, target);
    }
  };
}
