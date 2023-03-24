import { pino } from 'pino';

export function createLogger(name?: string) {
  const logger = pino(
    {
      name: name || 'default',
    },
    pino.destination({
      minLength: 4096,
      sync: false
    })
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
