import { DIContainer } from '@atomikjs/core';
import { CanShield } from '../contracts/canShield';
import { RequestFrame } from '../contracts/types';
import { ShieldExecutor } from '../contracts/shieldExecutor';

export async function runShields(
  shields: any[],
  container: DIContainer,
  frame: RequestFrame,
  error: any
): Promise<boolean> {
  for (const ShieldClass of shields) {
    if (frame.res.writableEnded) {
      return true; 
    }
    
    try {
      const instance = container.resolve<CanShield>(ShieldClass);
      
      try {
        const { handled, responseSent } = await ShieldExecutor.executeShield(instance, error, frame);
        
        if (handled || responseSent) {
          return true;
        }
      } catch (shieldExecutionError) {
        continue;
      }
      
    } catch (containerError) {
      continue;
    }
  }
  
  return false;
}