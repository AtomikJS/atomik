import { IncomingMessage, ServerResponse } from 'http';

export interface RequestFrame {
  req: IncomingMessage;
  res: ServerResponse;
  handlerName: string;
  className: string;
}

export interface CanPass {
  pass(frame: RequestFrame): boolean | Promise<boolean>;
}
