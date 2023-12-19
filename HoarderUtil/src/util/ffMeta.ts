import * as ffmpeg from 'fluent-ffmpeg';
import output from './output';

export const readTags = async (
  filePath: string
): Promise<null | ffmpeg.FfprobeData> =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, meta) =>
      err ? reject(err) : resolve(meta)
    );
  });

/**
 * @todo seems to re-encode everything, can we improve the perf here?
 */
export const writeTags = async (
  filePath: string,
  tags: Record<string, string | number>
): Promise<void> =>
  new Promise((resolve, reject) => {
    const meta: string[] = [];

    const tagNames = Object.keys(tags);

    tagNames.forEach((tagName) => {
      meta.push('-metadata');
      meta.push(`${tagName}=${tags[tagName]}`);
    });

    output.log(
      `Starting ffmpeg job for ${filePath} with ${tagNames.length} tags`
    );

    ffmpeg(filePath)
      .outputOptions(...meta)
      .audioCodec('copy')
      .videoCodec('copy')
      .output(getTempName(filePath))
      .on('end', () => resolve())
      .on('progress', (_p: FfmpegProgress) => {})
      .on('error', (e) => reject(e))
      .run();
  });

export const getTempName = (fileName: string): string => {
  const split = fileName.split('.');
  split[split.length - 2] = `${split[split.length - 2]}_e`;
  return split.join('.');
};

type FfmpegProgress = {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number;
};
