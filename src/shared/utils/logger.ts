// import { pino } from 'pino';

export function createLogger() {
  const logger = console;
  // const logger = pino(
  //   pino.destination({
  //     minLength: 4096,
  //     sync: false
  //   })
  // );

  return logger;
}
