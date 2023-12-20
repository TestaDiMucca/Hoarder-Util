/** Media files we'll operate on for the date rename util */
export const DATETAG_SUPPORTED_EXTENSIONS: Record<'img' | 'mov', string[]> = {
  img: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
  mov: ['mov', 'mp4', 'webm', 'gif'],
};

/**
 * Default match pattern to use for file -> tag
 */
export const DEFAULT_TAGGING_PATTERN = '%artist% - %title%';

export const APP_NAME = 'h-util';

export const APP_VER = '0.0.1';

export const PATH_ALIAS_STORE = 'pathAliases';
