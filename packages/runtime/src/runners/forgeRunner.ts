import { CanForge } from '../contracts/canForge';
import { FORGE_METADATA } from '../decorators/forge';
import { Container } from '@atomikjs/core';

export async function runForges(
  instance: any,
  handlerName: string,
  input: any
): Promise<any> {
  type ForgeConstructor = new () => CanForge;
  const classForges: ForgeConstructor[] = Reflect.getMetadata(FORGE_METADATA, instance.constructor) || [];
  const methodForges: ForgeConstructor[] = Reflect.getMetadata(FORGE_METADATA, instance, handlerName) || [];

  const all = [...classForges, ...methodForges];

  let current = input;

  for (const ForgeClass of all) {
    const forge: CanForge = Container.resolve(ForgeClass);
    current = await forge.forge(current);
  }

  return current;
}