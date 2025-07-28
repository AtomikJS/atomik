import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import 'reflect-metadata';
import { MiddlewareManager, MiddlewareFunction } from './middleware';

export class HttpServer {
  private server!: http.Server;
  private middlewareManager = new MiddlewareManager();

  constructor(
    private port: number,
    private controllers: any[],
    private globalMiddlewares: MiddlewareFunction[] = [],
    private errorHandler?: (err: any, req: IncomingMessage, res: ServerResponse) => void
  ) {
    this.globalMiddlewares = globalMiddlewares || [];
    this.errorHandler = errorHandler || ((err, req, res) => {
      res.statusCode = 500;
      res.end(`Internal Server Error: ${err.message || err}`);
    });
    this.globalMiddlewares.forEach(mw => this.middlewareManager.use(mw));
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
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const method = req.method || 'GET';
    const url = req.url || '/';

    for (const ControllerClass of this.controllers) {
      const basePath = Reflect.getMetadata('basePath', ControllerClass);
      if (!basePath) continue;

      if (url.startsWith(basePath)) {
        const routes = Reflect.getMetadata('routes', ControllerClass) || [];
        const relativePath = url.substring(basePath.length) || '/';

        for (const route of routes) {
          if (route.method === method && route.path === relativePath) {
            const controllerInstance = new ControllerClass();

            const routeMiddlewares: MiddlewareFunction[] = Reflect.getMetadata('middlewares', ControllerClass.prototype, route.handlerName) || [];

            for (const mw of routeMiddlewares) {
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
    res.statusCode = 404;
    res.end('Not Found');
  }

  use(mw: MiddlewareFunction) {
    this.middlewareManager.use(mw);
  }
}
