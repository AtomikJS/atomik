import { RequestFrame } from './types';

export interface CanWrap {
  wrap(frame: RequestFrame, next: () => Promise<any>): Promise<any>;
}
