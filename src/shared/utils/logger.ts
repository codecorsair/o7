import { pino } from 'pino';
const dest = pino.destination('/dev/null');
dest[Symbol.for('pino.metadata')] = true;
export function createLogger(name?: string) {
  const logger = pino(
    {
      name: name || 'default',
      level: 'debug'
    },
    dest
  );

  return {
    log: logger.info.bind(logger),
    trace: logger.trace.bind(logger),
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    fatal: logger.fatal.bind(logger),
    silent: logger.silent.bind(logger)
  };
}
