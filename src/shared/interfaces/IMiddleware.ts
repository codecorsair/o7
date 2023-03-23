export enum IMiddlewareType {
  COMMAND_INTERACTION = "COMMAND_INTERACTION",
  COMMAND_AUTOCOMPLETE = "COMMAND_AUTOCOMPLETE",
}

export interface IMiddleware {
  disabled?: boolean;
  type: IMiddlewareType;
  intercept: (...args: any[]) => Promise<any>;
}
