import { Graphs } from 'src/types/types';
import PieChart from './PieChart';
import useCallComposer from 'src/hooks/useCallComposer';

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  usePlays?: boolean;
};

export default function GenrePie({ usePlays }: Props) {
  const { data1, data2 } = useCallComposer<DataPoint>(
    usePlays ? Graphs.genrePlays : Graphs.genrePie
  );

  const classData = data2;
  const genreData = data1;

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
