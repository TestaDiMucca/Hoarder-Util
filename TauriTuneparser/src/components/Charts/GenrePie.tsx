import { useCallback, useEffect, useState } from 'react';

import useLibraryContext from 'src/hooks/useLibraryContext';
import { Graphs } from 'src/types/types';
import { callComposer } from 'src/workers/compose.handler';
import PieChart from './PieChart';

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  usePlays?: boolean;
};

export default function GenrePie({ usePlays }: Props) {
  const { library } = useLibraryContext();
  const [genreData, setGenreData] = useState<DataPoint[]>([]);
  const [classData, setClassData] = useState<DataPoint[]>([]);

  const getData = useCallback(async () => {
    if (library.length === 0) return;

    const data = (await callComposer(
      usePlays ? Graphs.genrePlays : Graphs.genrePie,
      library
    )) as {
      allGenres: any[];
      genreClass: any[];
    };

    setGenreData(data.allGenres);
    if (data.genreClass.length) setClassData(data.genreClass);
  }, [library, usePlays]);

  useEffect(() => {
    void getData();
  }, [library.length, usePlays]);

  return (
    <PieChart
      innerData={classData}
      outerData={genreData}
      formatLegend={formatLegend}
    />
  );
}

const formatLegend = (
  _: string,
  v: { value?: string; payload?: { percent?: number; value?: number } }
) =>
  `${v.value} (${v.payload?.value} - ${(
    (v.payload?.percent ?? 0) * 100
  ).toFixed(2)}%)`;
