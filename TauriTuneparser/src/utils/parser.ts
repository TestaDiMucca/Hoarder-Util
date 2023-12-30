import { ElementCompact, xml2js } from 'xml-js';

import { MediaRecord } from 'src/types/types';

export const parseXml = (str: string) =>
  xml2js(str, { nativeType: true }) as ElementCompact;

type Primitive = string | number | boolean;

type Node =
  | {
      elements: Node[];
      name: string;
      type: 'element';
    }
  | {
      name: string;
      type: 'text';
      text: string;
    };

type XMLKey = string;

const KEY_MAP: Record<XMLKey, keyof MediaRecord> = {
  'Track ID': 'id',
  Name: 'title',
  Artist: 'artist',
  Album: 'album',
  Genre: 'genre',
  'Date Added': 'dateAdded',
  Year: 'year',
  'Track Number': 'trackNo',
  Grouping: 'grouping',
  'Has Video': 'hasVideo',
  'Play Count': 'plays',
};

const extract = (node?: Node, el?: string) => {
  if (!node) return node;
  if (node.type === 'text') return node;
  if (!node.elements) return node;

  return node.elements.find((e) => e.name === el);
};

const getFirstText = (node: Node): Primitive =>
  node.type === 'text'
    ? node.text
    : node.elements
    ? getFirstText(node.elements[0])
    : node.name;

const parseMediaRecord = (record: Node): MediaRecord | null => {
  if (record.type === 'text' || !record.elements) return null;

  /* elements come in key : type pairs in the array */
  let keyName: string;
  const result: Partial<MediaRecord> = {};

  record.elements.forEach((e) => {
    if (e.name === 'key') {
      keyName = getFirstText(e) as string;
      return;
    }

    if (!keyName) return;

    const mapToKey = KEY_MAP[keyName];

    // @ts-ignore
    if (mapToKey) result[mapToKey] = getFirstText(e);
  });

  return result as MediaRecord;
};

const parseMediaRecordList = (records: Node) => {
  if (records.type === 'text') return [];

  return records.elements.reduce<Array<MediaRecord>>((a, v, _i) => {
    if (v.name === 'key' || v.type === 'text') return a;

    const parsed = parseMediaRecord(v);
    if (parsed) a.push(parsed);

    return a;
  }, []);
};

export const parseLibraryXml = (str: string) => {
  const parsed = parseXml(str) as Node;

  const pList = extract(parsed, 'plist');
  const pListDict = extract(pList, 'dict');
  const nestedDict = extract(pListDict, 'dict');

  if (!nestedDict) throw new Error('Unexpected format');

  return parseMediaRecordList(nestedDict);
};
