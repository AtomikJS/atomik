import 'reflect-metadata';

export enum ParamType {
  PARAM = 'param',
  QUERY = 'query',
  BODY = 'body',
  REQUEST = 'request',
  RESPONSE = 'response'
}

type ParamMetadata = {
  index: number;
  type: ParamType;
  key: string | null;
};

function createParamDecorator(type: ParamType, key: string | null = null): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (propertyKey === undefined) {
      throw new Error(`@${type} decorator must be used on a method`);
    }

    const existing: ParamMetadata[] = Reflect.getMetadata('params', target, propertyKey) || [];
    existing.push({ index: parameterIndex, type, key });
    Reflect.defineMetadata('params', existing, target, propertyKey);
  };
}

export function Param(paramName: string): ParameterDecorator {
  return createParamDecorator(ParamType.PARAM, paramName);
}

export function Query(paramName: string): ParameterDecorator {
  return createParamDecorator(ParamType.QUERY, paramName);
}

export function Body(): ParameterDecorator {
  return createParamDecorator(ParamType.BODY);
}

export function Req(): ParameterDecorator {
  return createParamDecorator(ParamType.REQUEST);
}

export function Res(): ParameterDecorator {
  return createParamDecorator(ParamType.RESPONSE);
}


function addParamMetadata(
  target: any,
  propertyKey: string | symbol,
  index: number,
  type: ParamType,
  key: string | null
) {
  const existing = Reflect.getMetadata('params', target, propertyKey) || [];
  existing.push({ index, type, key });
  Reflect.defineMetadata('params', existing, target, propertyKey);
}