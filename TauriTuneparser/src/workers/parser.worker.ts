import { parseLibraryXml } from 'src/utils/parser';
import { Parser_InboundMessage } from './workers.types';
import { handleError, handleMessage } from './workers.helpers';

addEventListener('message', (message: MessageEvent<Parser_InboundMessage>) => {
  const { cmd } = message.data;

  switch (cmd) {
    case 'parse':
      const parsedObjs = parseLibraryXml(message.data.payload);
      handleMessage(parsedObjs);
      return;

    default:
  }

  handleError('Unsupported message command');
});
