import { DIContainer } from '@atomikjs/core';
import { CanWrap } from '../contracts/canWrap';
import { RequestFrame } from '../contracts/types';

export async function runWraps(
  wrappers: any[],
  container: DIContainer,
  frame: RequestFrame,
  handler: () => Promise<any>
): Promise<any> {

    console.log('[DEBUG] Running wraps:', wrappers.map(w => w.name));

  let next = handler;
  for (let i = wrappers.length - 1; i >= 0; i--) {
    const instance = container.resolve<CanWrap>(wrappers[i]);
    const currentNext = next;
    next = () => instance.wrap(frame, currentNext);
  }
  return next();
}
