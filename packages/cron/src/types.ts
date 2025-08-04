import { Timezone } from "./enums/timezone";

export interface TimeoutOptions {
  name?: string;
  runOnInit?: boolean;
  timezone?: Timezone;
  afterJob?: string;
  [key: string]: any;
}