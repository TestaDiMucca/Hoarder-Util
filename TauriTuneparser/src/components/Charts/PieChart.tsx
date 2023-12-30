import { useCallback, useState } from 'react';
import {
  PieChart as DefaultPieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  LabelList,
  Legend,
  Cell,
} from 'recharts';
import { DUSK, FOREST } from 'src/utils/palettes';

const CHART_SIZE = 400;

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  outerData: DataPoint[];
  innerData?: DataPoint[];
  formatLegend: (
    n: string,
    v: { value?: string; payload?: { percent?: number; value?: number } }
  ) => string;
};

export default function PieChart({
  innerData = [],
  outerData,
  formatLegend,
}: Props) {
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const onFocus = useCallback((o: { value: string }) => {
    setFocusedKey(o.value);
  }, []);

  const onBlur = useCallback((_o: any) => {
    setFocusedKey(null);
  }, []);

  const isNested = innerData.length > 0;
  const upperData = isNested ? innerData : outerData;
  const lowerData = outerData;

  return (
    <ResponsiveContainer minHeight={CHART_SIZE} minWidth={CHART_SIZE * 2}>
      <DefaultPieChart width={CHART_SIZE * 2} height={CHART_SIZE}>
        {isNested && (
          <Pie
            data={upperData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={isNested ? 90 : 130}
            fill="#8884d8"
          >
            <LabelList
              dataKey="name"
              style={{ fontSize: '60%', textTransform: 'lowercase' }}
            />
            {upperData.map((entry, index) => (
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

        {isNested && (
          <Pie
            data={lowerData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={110}
            outerRadius={130}
            fill="#82ca9d"
          >
            {lowerData.map((entry, index) => (
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
        )}

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
      </DefaultPieChart>
    </ResponsiveContainer>
  );
}
