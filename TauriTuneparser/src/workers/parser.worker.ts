import { parseLibraryXml } from 'src/utils/parser';
import { InboundMessage } from './workers.types';

const handleError = (message: string) =>
  postMessage({
    error: message,
  });

const handleMessage = <T>(data: T, state = 'success') =>
  postMessage({
    data,
    state,
  });

addEventListener('message', (message: MessageEvent<InboundMessage>) => {
  if (message.data.cmd === 'parse') {
    const parsedObjs = parseLibraryXml(message.data.payload);
    handleMessage(parsedObjs);
    return;
  }

  handleError('Unsupported message command');
});
