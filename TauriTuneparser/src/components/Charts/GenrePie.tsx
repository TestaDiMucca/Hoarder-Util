import { useCallback, useEffect, useState } from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';

import useLibraryContext from 'src/hooks/useLibraryContext';
import { Graphs } from 'src/types/types';
import { callComposer } from 'src/workers/compose.handler';

type DataPoint = {
  name: string;
  value: number;
};

export default function GenrePie() {
  const { library } = useLibraryContext();
  const [genreData, setGenreData] = useState<DataPoint[]>([]);
  const [classData, setClassData] = useState<DataPoint[]>([]);

  const getData = useCallback(async () => {
    if (library.length === 0) return;

    const data = (await callComposer(Graphs.genrePie, library)) as {
      allGenres: any[];
      genreClass: any[];
    };

    console.log(library.length, data);

    setGenreData(data.allGenres);
    if (data.genreClass.length) setClassData(data.genreClass);
  }, [library]);

  useEffect(() => {
    void getData();
  }, [library.length]);

  return (
    <ResponsiveContainer minHeight={400} minWidth={400}>
      <PieChart width={400} height={400}>
        {classData.length && (
          <Pie
            data={classData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={60}
            fill="#8884d8"
          />
        )}

        <Pie
          data={genreData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          fill="#82ca9d"
          label
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
