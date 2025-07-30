import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import 'reflect-metadata';
import { MiddlewareManager, MiddlewareFunction } from './middleware';
import { ParamType } from './decorators/params';
import { DIContainer } from '@atomikjs/core';

interface HttpServerOptions {
  port: number;
  controllers?: any[];
  container: DIContainer;
  globalMiddlewares?: MiddlewareFunction[];
  logger?: (...args: any[]) => void;
  onStart?: () => void;
  onError?: (err: any, req: IncomingMessage, res: ServerResponse) => void;
}

export class HttpServer {
  private server!: http.Server;
  private middlewareManager = new MiddlewareManager();

  constructor(private options: HttpServerOptions) {
    const { globalMiddlewares = [], logger = console.log } = options;
    globalMiddlewares.forEach(mw => this.middlewareManager.use(mw));
    this.options.logger = logger;
  }

  public async start() {
    this.server = http.createServer(this.requestHandler.bind(this));
    this.server.listen(this.options.port, () => {
      this.options.logger?.(`[AtomikJS] Server listening on port ${this.options.port}`);
      this.options.onStart?.();
    });
  }

  private async requestHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      await this.middlewareManager.execute(req, res);
      await this.routeRequest(req, res);
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err, req, res);
      } else {
        res.statusCode = 500;
        const errorMessage = (typeof err === 'object' && err !== null && 'message' in err) ? (err as any).message : String(err);
        res.end(`Internal Server Error: ${errorMessage}`);
      }
    }
  }

  private normalizePath(path: string): string {
    return ('/' + path).replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private matchRoute(routePath: string, requestPath: string) {
    const routeParts = routePath.split('/').filter(Boolean);
    const pathParts = requestPath.split('/').filter(Boolean);
    if (routeParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = pathPart;
      } else if (routePart !== pathPart) {
        return null;
      }
    }

    return params;
  }

  private async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch (e) {
          resolve({});
        }
      });
      req.on('error', reject);
    });
  }

  private async resolveHandlerParams(
    prototype: any,
    handlerName: string,
    req: IncomingMessage,
    res: ServerResponse,
    params: Record<string, string>
  ) {
    const metadata = Reflect.getMetadata('params', prototype, handlerName) || [];
    const query = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
    const body = await this.parseBody(req);

    const args: any[] = [];
    for (const { index, type, key } of metadata) {
      switch (type) {
        case ParamType.PARAM:
          args[index] = params[key!] || null;
          break;
        case ParamType.QUERY:
          args[index] = query.get(key!) || null;
          break;
        case ParamType.BODY:
          args[index] = body;
          break;
        case ParamType.REQUEST:
          args[index] = req;
          break;
        case ParamType.RESPONSE:
          args[index] = res;
          break;
      }
    }
    return args;
  }

  private async routeRequest(req: IncomingMessage, res: ServerResponse) {
    const method = req.method || 'GET';
    let url = req.url || '/';

    url = url.split('?')[0];
    const normalizedUrl = this.normalizePath(url);

    for (const ControllerClass of this.options.controllers || []) {
      const basePath: string = Reflect.getMetadata('basePath', ControllerClass);
      if (!basePath) continue;

      const normalizedBasePath = this.normalizePath(basePath);

      if (normalizedUrl.startsWith(normalizedBasePath)) {
        const routes = Reflect.getMetadata('routes', ControllerClass) || [];
        let relativePath = normalizedUrl.slice(normalizedBasePath.length) || '/';
        if (!relativePath.startsWith('/')) relativePath = '/' + relativePath;

        for (const route of routes) {
          const normalizedRoutePath = this.normalizePath(route.path);
          const params = this.matchRoute(normalizedRoutePath, relativePath);
          if (route.method === method && params) {
            const controllerInstance = this.options.container.resolve(ControllerClass) as any;

            const middlewares: MiddlewareFunction[] =
              Reflect.getMetadata('middlewares', ControllerClass.prototype, route.handlerName) || [];

            for (const mw of middlewares) {
              await mw(req, res, async () => {});
            }

            const handler = controllerInstance[route.handlerName].bind(controllerInstance);
            const args = await this.resolveHandlerParams(ControllerClass.prototype, route.handlerName, req, res, params);
            const result = await handler(...args);

            if (!res.writableEnded) {
              res.statusCode = 200;
              if (typeof result === 'object') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end(result?.toString() || '');
              }
            }
            return;
          }
        }
      }
    }

    res.statusCode = 404;
    res.end('Not Found');
  }

  public use(middleware: MiddlewareFunction) {
    this.middlewareManager.use(middleware);
  }
}
