export enum VideoIncludeSettings {
  include = 'include',
  exclude = 'exclude',
  only = 'only',
}

const LS_CLASSIFICATIONS = 'classifications';
const LS_VIDEO_INCLUSION = 'videoInclusion';

const safeParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (_e) {
    return null;
  }
};

const configFactory = <T extends string>({
  configName,
  defaultValue,
  json,
}: {
  configName: string;
  defaultValue?: T;
  json?: boolean;
}) => ({
  get: (): T => {
    const rawStored = localStorage.getItem(configName);

    const stored = json && rawStored ? safeParse(rawStored) : rawStored;

    return (stored as T) ?? defaultValue;
  },
  set: (val: T) => {
    localStorage.setItem(configName, json ? JSON.stringify(val) : val);
  },
});

/** @todo break into string[] and upgrade UI accordingly */
export const Classifications = configFactory<string>({
  configName: LS_CLASSIFICATIONS,
});

export const VideoInclusion = configFactory<VideoIncludeSettings>({
  configName: LS_VIDEO_INCLUSION,
  defaultValue: VideoIncludeSettings.exclude,
});
