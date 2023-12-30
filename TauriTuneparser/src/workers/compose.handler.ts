import throttle from 'lodash/throttle';

import { Graphs, MediaRecord } from 'src/types/types';
import ComposerWorker from './compose.worker?worker';
import {
  Composer_InboundMessage,
  Composer_OutboundMessage,
} from './workers.types';
import { Classifications, VideoInclusion } from 'src/utils/configs';

const callComposerRaw = (graph: Graphs, rawData: MediaRecord[]): Promise<any> =>
  new Promise((resolve, reject) => {
    const worker = new ComposerWorker();

    const payload: Composer_InboundMessage = {
      graph,
      data: rawData,
      options: {
        videoSettings: VideoInclusion.get(),
        classifications: Classifications.get() ?? '',
      },
    };

    worker.postMessage(payload);

    worker.addEventListener(
      'message',
      (message: MessageEvent<Composer_OutboundMessage>) => {
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

export const callComposer = throttle(callComposerRaw, 1000);
