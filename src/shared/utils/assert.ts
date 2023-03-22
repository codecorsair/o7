export function assert<T>(msg: string, ...args: any[]): T {
  const arg: T | undefined = args.find(
    (arg) => arg !== undefined && arg !== null && arg !== ""
  );
  if (arg) {
    return arg;
  }

  throw new Error(`${msg}: '${args.join("', '")}'`);
}