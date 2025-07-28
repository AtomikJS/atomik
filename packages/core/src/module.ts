import { Container } from './container';
import { Events } from './events';

export class Module {
  private container = Container; // utilise le singleton Container
  private events = new Events();

  constructor(private options: {
    controllers?: any[];
    services?: any[];
    middlewares?: any[];
  }) {}

  init() {
    (this.options.services || []).forEach(svc => this.container.register(svc, { useClass: svc }));
    (this.options.controllers || []).forEach(ctrl => this.container.register(ctrl, { useClass: ctrl }));
    (this.options.middlewares || []).forEach(mw => this.container.register(mw, { useClass: mw }));
    
    (this.options.services || []).forEach(svc => this.container.resolve(svc));
    (this.options.controllers || []).forEach(ctrl => this.container.resolve(ctrl));
    (this.options.middlewares || []).forEach(mw => this.container.resolve(mw));
  }

  getContainer() {
    return this.container;
  }

  getEvents() {
    return this.events;
  }
}
