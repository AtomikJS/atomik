import { RequestFrame } from './types';

export interface CanShield {
  catch(exception: any, frame: RequestFrame): any | Promise<any>;
}