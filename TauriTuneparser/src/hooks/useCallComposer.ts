import { Graphs } from 'src/types/types';
import useLibraryContext from './useLibraryContext';
import { useCallback, useEffect, useState } from 'react';
import { callComposer } from 'src/workers/compose.handler';

const useCallComposer = <T>(graph: Graphs) => {
  const [data1, setData1] = useState<T[]>([]);
  const [data2, setData2] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const { library } = useLibraryContext();

  const getData = useCallback(async () => {
    if (library.length === 0) return setLoading(false);

    const data = await callComposer<T>(graph, library);

    if (!data) return setLoading(false);

    setData1(data.data1);
    if (data.data2?.length) setData2(data.data2);
  }, [library, graph]);

  useEffect(() => {
    void getData();
  }, [library, graph]);

  return {
    loading,
    data1,
    data2,
  };
};

export default useCallComposer;
