const FORCE_PROD = false;

export const isDev = process.env.APP_IS_DEV && !FORCE_PROD ? true : false;
