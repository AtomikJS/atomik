type Listener = (...args: any[]) => any;

export class Events {
  private listeners = new Map<string, Listener[]>();

  on(event: string, listener: Listener) {
    const existing = this.listeners.get(event) || [];
    existing.push(listener);
    this.listeners.set(event, existing);
  }

  async emit(event: string, ...args: any[]) {
    const listeners = this.listeners.get(event) || [];
    for (const listener of listeners) {
      await listener(...args);
    }
  }
}
