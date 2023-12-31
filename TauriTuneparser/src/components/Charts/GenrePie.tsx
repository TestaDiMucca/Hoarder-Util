import { GenrePieType, Graphs } from 'src/types/types';
import PieChart from './generics/PieChart';
import useCallComposer from 'src/hooks/useCallComposer';

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  type?: GenrePieType;
};

const TYPE_TO_GRAPH_MAP: Record<GenrePieType, Graphs> = {
  [GenrePieType.songs]: Graphs.genrePie,
  [GenrePieType.plays]: Graphs.genrePlays,
  [GenrePieType.artists]: Graphs.genreArtists,
};

export default function GenrePie({ type = GenrePieType.songs }: Props) {
  const { data1, data2 } = useCallComposer<DataPoint>(TYPE_TO_GRAPH_MAP[type]);

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
