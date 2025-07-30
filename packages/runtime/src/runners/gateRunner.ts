import { Container } from '@atomikjs/core';
import { CanPass, RequestFrame } from '../contracts/canPass';
import { GATE_METADATA } from '../decorators/gate';

export async function runGates(
  instance: any,
  handlerName: string,
  frame: RequestFrame
): Promise<boolean> {
  const classGates: Array<new (...args: any[]) => CanPass> = Reflect.getMetadata(GATE_METADATA, instance.constructor) || [];
  const methodGates: Array<new (...args: any[]) => CanPass> = Reflect.getMetadata(GATE_METADATA, instance, handlerName) || [];

  const all = [...classGates, ...methodGates];

  for (const GateClass of all) {
    const gate: CanPass = Container.resolve(GateClass);
    const result = await gate.pass(frame);
    if (!result) return false;
  }

  return true;
}
