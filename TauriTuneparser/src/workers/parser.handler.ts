import { MediaRecord } from 'src/types/types';
import ParserWorker from './parser.worker?worker';
import { Parser_OutboundMessage } from './workers.types';

export const callParser = (xmlString: string): Promise<MediaRecord[]> =>
  new Promise((resolve, reject) => {
    const worker = new ParserWorker();

    worker.postMessage({
      cmd: 'parse',
      payload: xmlString,
    });

    worker.addEventListener(
      'message',
      (message: MessageEvent<Parser_OutboundMessage>) => {
        switch (message.data.state) {
          case 'success':
            resolve(message.data.data);
            break;
          case 'error':
            reject(new Error(message.data.error));
            break;
          default:
            reject(new Error('Unknown message from worker'));
        }
      }
    );
  });
