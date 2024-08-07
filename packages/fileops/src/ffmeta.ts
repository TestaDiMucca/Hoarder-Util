import * as ffmpeg from 'fluent-ffmpeg';
import { getTempName } from '.';
const ffmpegCaller = require('fluent-ffmpeg');

/**
 * Get hash of existing metadata in a media obj
 */
export const readTags = async (filePath: string): Promise<null | ffmpeg.FfprobeData> =>
    new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, meta) => (err ? reject(err) : resolve(meta)));
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

        let totalTime: number;

        ffmpegCaller(filePath)
            .outputOptions(...meta)
            .audioCodec('copy')
            .videoCodec('copy')
            .output(getTempName(filePath))
            .on('codecData', (data: any) => {
                totalTime = parseInt(data.duration.replace(/:/g, ''));
            })
            .on('start', () => onProgress?.(0))
            .on('end', resolve)
            .on('progress', (p: FfmpegProgress) => {
                if (!totalTime || totalTime <= 0) return;

                const time = parseInt(p.timemark.replace(/:/g, ''));
                onProgress?.((time / totalTime) * 100);
            })
            .on('error', (e: Error) => reject(e))
            .run();
    });

export const compressVideo = async (filePath: string, crf: number, onProgress?: (p: number) => void) =>
    new Promise((resolve, reject) => {
        if (crf <= 0 || crf >= 51) throw new Error(`${crf} is invalid for CRF`);

        let totalTime: number;

        ffmpegCaller(filePath)
            .fps(30)
            .addOptions(['-crf 28'])
            .output(getTempName(filePath))
            .on('end', resolve)
            .on('codecData', (data: any) => {
                totalTime = parseInt(data.duration.replace(/:/g, ''));
            })
            .on('progress', (p: FfmpegProgress) => {
                if (!totalTime || totalTime <= 0) return;

                const time = parseInt(p.timemark.replace(/:/g, ''));
                onProgress?.((time / totalTime) * 100);
            })
            .on('error', (e: Error) => reject(e))
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
