import React, { createContext, useCallback, useEffect, useState } from 'react';

import { MediaRecord } from 'src/types/types';

interface LibraryContextValues {
  library: MediaRecord[];
  setLibrary: (_: MediaRecord[]) => void;
  renderKey: number;
}

export const LibraryContext = createContext<LibraryContextValues>({
  library: [],
  setLibrary: () => {},
  renderKey: 0,
});

interface ProviderProps {}

const LibraryProvider: React.FC<React.PropsWithChildren<ProviderProps>> = ({
  children,
}) => {
  const [library, setLibrary] = useState<MediaRecord[]>([]);
  const [renderKey, setRenderKey] = useState(0);

  const handleSetLibrary = useCallback((lib: MediaRecord[]) => {
    setLibrary(lib);
  }, []);

  useEffect(() => {
    setRenderKey(Math.random());
  }, [library.length]);

  return (
    <LibraryContext.Provider
      value={{ library, setLibrary: handleSetLibrary, renderKey }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export default LibraryProvider;
