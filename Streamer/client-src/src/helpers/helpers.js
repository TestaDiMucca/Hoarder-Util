/**
 * See if client is on FireFox, which does not play nicely with mp4 format
 */
export const isFirefox = () => typeof InstallTrigger !== 'undefined';

/**
 * @param {string} filename 
 */
export const isMP4 = (filename) => filename.indexOf('mp4') !== -1 || filename.indexOf('m4v') !== -1;