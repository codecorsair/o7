export function assert<T>(msg: string, ...args: any[]): T {
  const arg: T | undefined = args.find(
    (arg) => arg !== undefined && arg !== null && arg !== ''
  );
  if (arg === undefined) {
    throw new Error(`${msg}: '${args.join("', '")}'`);
  }

  let value = arg;
  if (typeof value === 'string') {
    try {
      value = parseInt(value, 10);
    } catch (error) {}
  }

  const type = typeof value;

  switch (type) {
    case 'string':
      if (value.length === 0) {
        throw new Error(`${msg}: '${args.join("', '")}'`);
      }
      return value as T;
    case 'number':
      if (Number.isNaN(value)) {
        throw new Error(`${msg}: '${args.join("', '")}'`);
      }
      return value as T;
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) {
          throw new Error(`${msg}: '${args.join("', '")}'`);
        }
        return value as T;
      }
      if (Object.keys(value).length === 0) {
        throw new Error(`${msg}: '${args.join("', '")}'`);
      }
      return value as T;
    default:
      return value as T;
  }
}
