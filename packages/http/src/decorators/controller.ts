import 'reflect-metadata';

export function Controller(basePath: string): ClassDecorator {
  return target => {
    Reflect.defineMetadata('basePath', basePath, target);
  };
}
