import * as ffmpeg from 'fluent-ffmpeg';

import output from './output';
import { getTempName } from './files';

/**
 * Get hash of existing metadata in a media obj
 */
export const readTags = async (
  filePath: string
): Promise<null | ffmpeg.FfprobeData> =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, meta) =>
      err ? reject(err) : resolve(meta)
    );
  });

/**
 * Write a record of tags into a file
 */
export const writeTags = async (
  filePath: string,
  tags: Record<string, string | number>,
  onProgress?: (p: number) => void
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

    let totalTime: number;

    ffmpeg(filePath)
      .outputOptions(...meta)
      .audioCodec('copy')
      .videoCodec('copy')
      .output(getTempName(filePath))
      .on('codecData', (data) => {
        totalTime = parseInt(data.duration.replace(/:/g, ''));
      })
      .on('start', () => onProgress(0))
      .on('end', () => resolve())
      .on('progress', (p: FfmpegProgress) => {
        if (!totalTime || totalTime <= 0) return;

        const time = parseInt(p.timemark.replace(/:/g, ''));
        onProgress((time / totalTime) * 100);
      })
      .on('error', (e) => reject(e))
      .run();
  });

type FfmpegProgress = {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number;
};
