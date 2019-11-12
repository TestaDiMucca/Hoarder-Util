const useLocal = true;
export const SERVER = process.env.NODE_ENV === 'production' ? '' : useLocal ? 'http://127.0.0.1:5003' : 'http://192.168.168.239:5003';

export const DEFAULT_USER = 'Kazuma-Kazuma';