const FORCE_DEV = false;

export const isDev = FORCE_DEV || process.env.APP_IS_DEV ? true : false;
