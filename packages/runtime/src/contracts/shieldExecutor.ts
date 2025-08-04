import { CanShield } from "./canShield";
import { RequestFrame } from "./types";

export class ShieldExecutor {
  static async executeShield(
    shieldInstance: CanShield, 
    error: any, 
    frame: RequestFrame
  ): Promise<{ handled: boolean; responseSent: boolean }> {
    const wasAlreadySent = frame.res.writableEnded;
    
    try {
      const result = await shieldInstance.catch(error, frame);
      const responseSent = frame.res.writableEnded;
      
      return {
        handled: result !== undefined || responseSent,
        responseSent: responseSent && !wasAlreadySent
      };
    } catch (shieldError) {      
      if (frame.res.writableEnded && !wasAlreadySent) {
        return { handled: true, responseSent: true };
      }
      
      return { handled: false, responseSent: false };
    }
  }
}