export const handleError = (message: string) =>
  postMessage({
    error: message,
  });

export const handleMessage = <T>(data: T, state = 'success') =>
  postMessage({
    data,
    state,
  });
