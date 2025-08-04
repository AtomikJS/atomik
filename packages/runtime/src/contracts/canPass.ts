import { RequestFrame } from "./types";

export interface CanPass {
  pass(frame: RequestFrame): boolean | Promise<boolean>;
}
