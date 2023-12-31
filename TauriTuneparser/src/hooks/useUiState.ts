import { useContext } from 'react';
import { UIStateContext } from 'src/providers/UIStateProvider';

export default function useUiState() {
  return useContext(UIStateContext);
}
