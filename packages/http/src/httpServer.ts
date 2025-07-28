import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import 'reflect-metadata';
import { MiddlewareManager, MiddlewareFunction } from './middleware';
import { DIContainer } from '@atomikjs/core';

export class HttpServer {
  private server!: http.Server;
  private middlewareManager = new MiddlewareManager();

  constructor(
    private port: number,
    private controllers: any[],
    private container: DIContainer,
    private globalMiddlewares: MiddlewareFunction[] = [],
    private logger: (...args: any[]) => void = console.log,
    private errorHandler?: (err: any, req: IncomingMessage, res: ServerResponse) => void
  ) {
    this.globalMiddlewares.forEach(mw => this.middlewareManager.use(mw));
    this.errorHandler = errorHandler || ((err, req, res) => {
      res.statusCode = 500;
      res.end(`Internal Server Error: ${err.message || err}`);
    });
  }

  start() {
    this.server = http.createServer(async (req, res) => {
      try {
        await this.middlewareManager.execute(req, res);
        await this.handleRequest(req, res);
      } catch (err) {
        this.errorHandler!(err, req, res);
      }
    });
    this.server.listen(this.port);
    this.logger(`[AtomikJS] Server listening on port ${this.port}`);
  }

  private normalizePath(path: string): string {
    return ('/' + path).replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const method = req.method || 'GET';
    let url = req.url || '/';

    url = url.split('?')[0];
    const normalizedUrl = this.normalizePath(url);

    console.log(`[DEBUG] Incoming request: ${method} ${normalizedUrl}`);

    for (const ControllerClass of this.controllers) {
      const basePath: string = Reflect.getMetadata('basePath', ControllerClass);
      if (!basePath) {
        console.log(`[DEBUG] No basePath for controller ${ControllerClass.name}`);
        continue;
      }

      const normalizedBasePath = this.normalizePath(basePath);
      console.log(`[DEBUG] Checking controller ${ControllerClass.name} with basePath: ${normalizedBasePath}`);

      if (normalizedUrl.startsWith(normalizedBasePath)) {
        const routes = Reflect.getMetadata('routes', ControllerClass) || [];
        console.log(`[DEBUG] Found ${routes.length} routes for controller ${ControllerClass.name}`);

        let relativePath = normalizedUrl.slice(normalizedBasePath.length);
        if (!relativePath.startsWith('/')) {
          relativePath = '/' + relativePath;
        }
        if (relativePath === '') {
          relativePath = '/';
        }

        console.log(`[DEBUG] Relative path: ${relativePath}`);

        for (const route of routes) {
          const normalizedRoutePath = this.normalizePath(route.path);
          console.log(`[DEBUG] Comparing ${method} ${relativePath} with ${route.method} ${normalizedRoutePath}`);

          if (route.method === method && relativePath === normalizedRoutePath) {
            console.log(`[DEBUG] Route matched! Executing ${route.handlerName}`);

            type AnyController = { [key: string]: (...args: any[]) => any };
            const controllerInstance = this.container.resolve(ControllerClass) as AnyController;
            
            const middlewares: MiddlewareFunction[] =
              Reflect.getMetadata('middlewares', ControllerClass.prototype, route.handlerName) || [];

            for (const mw of middlewares) {
              await mw(req, res, async () => {});
            }

            const result = await controllerInstance[route.handlerName](req, res);

            if (!res.writableEnded) {
              res.statusCode = 200;
              if (typeof result === 'object') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } else if (typeof result === 'string') {
                res.setHeader('Content-Type', 'text/plain');
                res.end(result);
              } else {
                res.end();
              }
            }
            return;
          }
        }
      }
    }

    console.log(`[DEBUG] No route found for ${method} ${normalizedUrl}`);
    res.statusCode = 404;
    res.end('Not Found');
  }

  use(mw: MiddlewareFunction) {
    this.middlewareManager.use(mw);
  }
}