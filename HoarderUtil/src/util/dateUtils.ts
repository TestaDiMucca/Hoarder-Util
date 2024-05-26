import * as dateFormat from 'dateformat';
import output from './output';
/**
 * Formats to: 'YY-MM-DD-HH-mm'
 *
 * @todo create options
 */
export const formatDateString = (date: Date, mask = 'yy-mm-dd-HH-MM_') => {
  try {
    return dateFormat(date, mask);
  } catch (e: any) {
    output.error(`Error formatting dates: ${e.message}`);
  }
};

/**
 * Turn two colons in a date to dashes. This makes it parseable for Date()
 * @param date A date in format such as "2017:07:14 00:00:00" as returned by EXIF
 */
export const exifToJsDate = (date: string) => {
  let n = 0;
  const N = 1;
  return date
    .replace(/:/g, (match) => (n++ <= N ? '-' : match))
    .replace(' ', ':');
};
