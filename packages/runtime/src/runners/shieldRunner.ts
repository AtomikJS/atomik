import { DIContainer } from '@atomikjs/core';
import { CanShield } from '../contracts/canShield';
import { RequestFrame } from '../contracts/types';

export function runShields(
  shields: any[],
  container: DIContainer,
  frame: RequestFrame,
  error: any
) {
  for (const ShieldClass of shields) {
    const instance = container.resolve<CanShield>(ShieldClass);
    const result = instance.catch(error, frame);
    if (result !== undefined) {
      return result;
    }
  }
  throw error;
}
