import { ElementCompact, xml2js } from 'xml-js';

export const parseXml = (str: string) =>
  xml2js(str, { compact: true }) as ElementCompact;
