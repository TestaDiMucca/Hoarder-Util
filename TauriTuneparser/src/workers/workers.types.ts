import { Graphs, MediaRecord } from 'src/types/types';
import { VideoIncludeSettings } from 'src/utils/configs';

type OutboundErrorPayload = {
  error: string;
  state: 'error';
};

export type Parser_InboundMessage = {
  cmd: 'parse';
  payload: string;
};

export type Parser_OutboundMessage =
  | OutboundErrorPayload
  | {
      state: 'success';
      data: MediaRecord[];
    };

export type Composer_InboundMessage = {
  graph: Graphs.genrePie;
  data: MediaRecord[];
  options: {
    videoSettings: VideoIncludeSettings;
    classifications: string;
  };
};

/** @todo type according to graph */
export type Composer_OutboundMessage =
  | OutboundErrorPayload
  | {
      state: 'success';
      data: any;
    };
