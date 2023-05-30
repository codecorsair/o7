export function assert<T>(msg: string, ...args: any[]): T {
  const arg: T | undefined = args.find(
    (arg) => arg !== undefined && arg !== null && arg !== ''
  );
  if (arg !== undefined) {
    if (arg instanceof Array && arg.length === 0) {
      throw new Error(`${msg}: '${args.join("', '")}'`);
    }
    return arg as T;
  }

  throw new Error(`${msg}: '${args.join("', '")}'`);
}
