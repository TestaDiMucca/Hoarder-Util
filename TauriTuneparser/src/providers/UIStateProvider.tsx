import React, { createContext, useState } from 'react';

interface UIStateContextValues {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

export const UIStateContext = createContext<UIStateContextValues>({
  loading: false,
  setLoading: (_) => {},
});

interface ProviderProps {}

const UIStateProvider: React.FC<React.PropsWithChildren<ProviderProps>> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <UIStateContext.Provider value={{ loading, setLoading }}>
      {children}
    </UIStateContext.Provider>
  );
};

export default UIStateProvider;
