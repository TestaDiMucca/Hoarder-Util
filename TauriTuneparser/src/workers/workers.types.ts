import { MediaRecord } from 'src/types/types';

export type InboundMessage = {
  cmd: 'parse';
  payload: string;
};

export type OutboundMessage =
  | {
      error: string;
      state: 'error';
    }
  | {
      state: 'success';
      data: MediaRecord[];
    };
