import { useCallback, useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  LabelList,
  Legend,
  Cell,
} from 'recharts';

import useLibraryContext from 'src/hooks/useLibraryContext';
import { Graphs } from 'src/types/types';
import { DUSK, FOREST } from 'src/utils/palettes';
import { callComposer } from 'src/workers/compose.handler';

type DataPoint = {
  name: string;
  value: number;
};

const CHART_SIZE = 400;

export default function GenrePie() {
  const { library } = useLibraryContext();
  const [genreData, setGenreData] = useState<DataPoint[]>([]);
  const [classData, setClassData] = useState<DataPoint[]>([]);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const getData = useCallback(async () => {
    if (library.length === 0) return;

    const data = (await callComposer(Graphs.genrePie, library)) as {
      allGenres: any[];
      genreClass: any[];
    };

    setGenreData(data.allGenres);
    if (data.genreClass.length) setClassData(data.genreClass);
  }, [library]);

  useEffect(() => {
    void getData();
  }, [library.length]);

  const onFocus = useCallback((o: { value: string }) => {
    setFocusedKey(o.value);
  }, []);

  const onBlur = useCallback((_o: any) => {
    setFocusedKey(null);
  }, []);

  return (
    <ResponsiveContainer minHeight={CHART_SIZE} minWidth={CHART_SIZE * 2}>
      <PieChart width={CHART_SIZE * 2} height={CHART_SIZE}>
        {classData.length && (
          <Pie
            data={classData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#8884d8"
          >
            <LabelList
              dataKey="name"
              style={{ fontSize: '60%', textTransform: 'lowercase' }}
            />
            {classData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={DUSK[index % DUSK.length]}
                fillOpacity={
                  focusedKey ? (focusedKey === entry.name ? 1 : 0.4) : 1
                }
              />
            ))}
          </Pie>
        )}

        <Pie
          data={genreData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={110}
          outerRadius={130}
          fill="#82ca9d"
        >
          {genreData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={FOREST[index % FOREST.length]}
              fillOpacity={
                focusedKey ? (focusedKey === entry.name ? 1 : 0.4) : 1
              }
              stroke={focusedKey === entry.name ? 'red' : undefined}
            />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="left"
          style={{
            fontSize: '60%',
            fontWeight: 400,
            textTransform: 'capitalize',
          }}
          wrapperStyle={{
            maxHeight: '400px',
            overflowY: 'auto',
            textTransform: 'lowercase',
          }}
          formatter={formatLegend}
          onMouseEnter={onFocus}
          onMouseLeave={onBlur}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

const formatLegend = (
  _: string,
  v: { value?: string; payload?: { percent?: number; value?: number } }
) =>
  `${v.value} (${v.payload?.value} - ${(
    (v.payload?.percent ?? 0) * 100
  ).toFixed(2)}%)`;
