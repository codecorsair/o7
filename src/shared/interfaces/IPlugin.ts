import { IProtocol } from './IProtocol';

export abstract class IPlugin {
  protected protocol: IProtocol;

  constructor(protocol: IProtocol) {
    this.protocol = protocol;
  }

  abstract onInit(): void;
  abstract onDispose(): void;
}
