import { Container } from './container';
import { Events } from './events';

export class Module {
  private container = Container;
  private events = new Events();

  private controllers: any[] = [];
  private services: any[] = [];
  private providers: any[] = [];

  constructor(private options: {
    controllers?: any[];
    services?: any[];
    middlewares?: any[];
    providers?: any[];
    imports?: Module[];
  }) {}

  init() {
    (this.options.imports || []).forEach(mod => mod.init());

    const allServices = [
      ...(this.options.services || []),
      ...(this.options.imports?.flatMap(m => m.services) || [])
    ];
    const allControllers = [
      ...(this.options.controllers || []),
      ...(this.options.imports?.flatMap(m => m.controllers) || [])
    ];
    const allProviders = [
      ...(this.options.providers || []),
      ...(this.options.imports?.flatMap(m => m.providers) || [])
    ];

    this.services = allServices;
    this.controllers = allControllers;
    this.providers = allProviders;

    const all = [...allServices, ...allControllers, ...allProviders];
    all.forEach(p => this.container.register(p, { useClass: p }));
    all.forEach(p => this.container.resolve(p));
  }

  getContainer() {
    return this.container;
  }

  getEvents() {
    return this.events;
  }

  getControllers() {
    return this.controllers;
  }

  getProviders() {
    return this.providers;
  }
}


