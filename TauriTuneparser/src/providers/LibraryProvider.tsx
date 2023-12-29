import React, { createContext, useState } from 'react';

import { MediaRecord } from 'src/types/types';

interface LibraryContextValues {
  library: MediaRecord[];
  setLibrary: (_: MediaRecord[]) => void;
}

export const LibraryContext = createContext<LibraryContextValues>({
  library: [],
  setLibrary: () => {},
});

interface ProviderProps {}

const LibraryProvider: React.FC<React.PropsWithChildren<ProviderProps>> = ({
  children,
}) => {
  const [library, setLibrary] = useState<MediaRecord[]>([]);

  return (
    <LibraryContext.Provider value={{ library, setLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
};

export default LibraryProvider;
