export function timeoutPromise<T>(ms: number, promise: Promise<T>) {
  let id;
  const timeout = new Promise<null>((_, reject) => {
    id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out in ${ms}ms.`);
      return null;
    }, ms)
  });
  return Promise.race([
    promise.then(response => {
      clearTimeout(id);
      return response;
    }),
    timeout
  ]);
}