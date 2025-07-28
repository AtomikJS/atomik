export class Globals {
  private static instance: Globals;
  private store = new Map<string, any>();
  private constructor() {}
  static getInstance(): Globals {
    if (!Globals.instance) Globals.instance = new Globals();
    return Globals.instance;
  }
  set(key: string, value: any) {
    this.store.set(key, value);
  }
  get<T>(key: string): T | undefined {
    return this.store.get(key);
  }
}
