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
