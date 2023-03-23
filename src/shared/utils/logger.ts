import { pinio } from 'pinio';

export function createLogger() {
  const logger = pinio(
    pinio.destination({
      minLength: 4096,
      sync: false
    })
  );

  return logger;
}
