import 'reflect-metadata';

function createRouteDecorator(method: string) {
  return (path: string): MethodDecorator => {
    return (target, propertyKey) => {
      const routes = Reflect.getMetadata('routes', target.constructor) || [];
      routes.push({ method, path, handlerName: propertyKey });
      Reflect.defineMetadata('routes', routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator('GET');
export const Post = createRouteDecorator('POST');
export const Put = createRouteDecorator('PUT');
export const Delete = createRouteDecorator('DELETE');
