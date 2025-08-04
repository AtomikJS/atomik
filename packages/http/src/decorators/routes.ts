import 'reflect-metadata';

function createRouteDecorator(method: string) {
  return (path: string): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
      const routes = Reflect.getMetadata('routes', target.constructor) || [];
      routes.push({ method, path, handlerName: propertyKey });
      Reflect.defineMetadata('routes', routes, target.constructor);
      return descriptor;
    };
  };
}

export const Get = createRouteDecorator('GET');
export const Post = createRouteDecorator('POST');
export const Put = createRouteDecorator('PUT');
export const Delete = createRouteDecorator('DELETE');
export const Patch = createRouteDecorator('PATCH');
export const Options = createRouteDecorator('OPTIONS');
export const Head = createRouteDecorator('HEAD');
