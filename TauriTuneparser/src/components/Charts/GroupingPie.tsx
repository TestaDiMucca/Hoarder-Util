import useCallComposer from 'src/hooks/useCallComposer';
import { Graphs } from 'src/types/types';
import PieChart from './generics/PieChart';

type DataPoint = {
  name: string;
  value: number;
};

export default function GroupingPie() {
  const { data1 } = useCallComposer<DataPoint>(Graphs.groupingsPie);

  return <PieChart outerData={data1} formatLegend={formatLegend} />;
}

const formatLegend = (
  _: string,
  v: { value?: string; payload?: { percent?: number; value?: number } }
) =>
  `${v.value} (${v.payload?.value} - ${(
    (v.payload?.percent ?? 0) * 100
  ).toFixed(2)}%)`;
