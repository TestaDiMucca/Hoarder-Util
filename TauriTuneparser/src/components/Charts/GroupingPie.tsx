import useCallComposer from 'src/hooks/useCallComposer';
import { Graphs } from 'src/types/types';
import PieChart from './generics/PieChart';
import Spinner from '../common/Spinner';

type DataPoint = {
  name: string;
  value: number;
};

export default function GroupingPie() {
  const { data1, loading } = useCallComposer<DataPoint>(Graphs.groupingsPie);

  if (loading) return <Spinner />;

  return <PieChart outerData={data1} formatLegend={formatLegend} />;
}

const formatLegend = (
  _: string,
  v: { value?: string; payload?: { percent?: number; value?: number } }
) =>
  `${v.value} (${v.payload?.value} - ${(
    (v.payload?.percent ?? 0) * 100
  ).toFixed(2)}%)`;
