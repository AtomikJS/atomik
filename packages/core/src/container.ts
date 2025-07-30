import 'reflect-metadata';

export class DIContainer {
  public instances = new Map<any, any>();
  public providers = new Map<any, any>();

  register<T>(token: any, provider: { useClass: new (...args: any[]) => T }) {
    this.providers.set(token, provider.useClass);
  }

  resolve<T>(token: new (...args: any[]) => T): T {
    if (this.instances.has(token)) return this.instances.get(token);
    const TargetClass = this.providers.get(token);
    if (!TargetClass) throw new Error(`No provider found for ${token.toString()}`);

    const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', TargetClass) || [];
    const dependencies = paramTypes.map(dep => this.resolve(dep));
    const instance = new TargetClass(...dependencies);
    this.instances.set(token, instance);
    return instance;
  }
}

export const Container = new DIContainer();
