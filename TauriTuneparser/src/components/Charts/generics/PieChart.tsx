import React, { useCallback, useState } from 'react';
import {
  PieChart as DefaultPieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

import { DUSK, FOREST } from 'src/utils/palettes';
import ResponsiveContainer from './ResponsiveContainer';
import { CHART_SIZE } from './charts.constants';

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
    <ResponsiveContainer>
      <DefaultPieChart width={CHART_SIZE * 2} height={CHART_SIZE}>
        <Pie
          data={upperData}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={isNested ? 90 : 130}
          fill="#8884d8"
          minAngle={2}
          label={percentGateFormatter(0.01)}
        >
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

        {isNested && (
          <Pie
            data={lowerData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={110}
            outerRadius={130}
            fill="#82ca9d"
            minAngle={1}
            label={focusedKey ? undefined : percentGateFormatter(0.03)}
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
const RADIAN = Math.PI / 180;

const percentGateFormatter = (useGate?: number) => (v: any) => {
  const { innerRadius, outerRadius, midAngle, cx, cy } = v;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const split = v.name.split(':');
  const displayName = (split[1] ?? split[0]).toLowerCase();

  if (useGate && v.percent < useGate) return null;

  const commonProps: React.SVGAttributes<SVGTextElement> = {
    x: x,
    y: y,
    textAnchor: x > cx ? 'start' : 'end',
    fontSize: useGate ? 7 : 12,
    fontWeight: 300,
    dominantBaseline: 'central',
  };

  return (
    <g>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="10 10" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="glow" />
          <feMergeNode in="glow" />
        </feMerge>
      </filter>
      <text
        {...commonProps}
        stroke="black"
        style={{
          filter: 'url(#glow)',
        }}
      >
        {displayName}
      </text>
      <text {...commonProps} stroke="white">
        {displayName}
      </text>
    </g>
  );
};
