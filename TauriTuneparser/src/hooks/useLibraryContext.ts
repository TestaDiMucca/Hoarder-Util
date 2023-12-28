import { useContext } from 'react';
import { LibraryContext } from 'src/providers/LibraryProvider';

export default function useLibraryContext() {
  return useContext(LibraryContext);
}
