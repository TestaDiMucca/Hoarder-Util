export enum VideoIncludeSettings {
  include = 'include',
  exclude = 'exclude',
  only = 'only',
}

const LS_CLASSIFICATIONS = 'classifications';
const LS_VIDEO_INCLUSION = 'videoInclusion';

const configFactory = <T extends string>(
  configName: string,
  defaultValue?: T
) => ({
  get: (): T => {
    const stored = localStorage.getItem(configName);

    return (stored ?? defaultValue ?? '') as T;
  },
  set: (val: T) => {
    localStorage.setItem(configName, val);
  },
});

/** @todo break into string[] and upgrade UI accordingly */
export const Classifications = configFactory<string>(LS_CLASSIFICATIONS, '');

export const VideoInclusion = configFactory<VideoIncludeSettings>(
  LS_VIDEO_INCLUSION,
  VideoIncludeSettings.exclude
);
