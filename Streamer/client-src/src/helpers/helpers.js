/**
 * See if client is on FireFox, which does not play nicely with mp4 format
 */
export const isFirefox = () => typeof InstallTrigger !== 'undefined';