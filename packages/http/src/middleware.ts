import { IncomingMessage, ServerResponse } from 'http';

export type MiddlewareFunction = (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => Promise<void>;

export class MiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  use(mw: MiddlewareFunction) {
    this.middlewares.push(mw);
  }

  async execute(req: IncomingMessage, res: ServerResponse) {
    let index = -1;
    const next = async () => {
      index++;
      if (index < this.middlewares.length) {
        await this.middlewares[index](req, res, next);
      }
    };
    await next();
  }
}
