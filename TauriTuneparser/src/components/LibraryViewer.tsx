import {
  Box,
  Select,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
} from '@chakra-ui/react';
import React, { ChangeEvent, useCallback, useState } from 'react';

import { GenrePieType, Graphs } from 'src/types/types';
import GenrePie from './Charts/GenrePie';
import TimelineView from './Charts/TimelineView';
import GroupingPie from './Charts/GroupingPie';
import TopBar from './Navs/TopBar';
import EmptyState from './EmptyState';
import H2 from './common/H2';
import SubText from './common/SubText';

const GRAPH_COMPONENT_MAP: Record<Graphs, React.ReactNode> = {
  [Graphs.genrePie]: <GenrePie />,
  [Graphs.genrePlays]: <GenrePie type={GenrePieType.plays} />,
  [Graphs.genreArtists]: <GenrePie type={GenrePieType.artists} />,
  [Graphs.addedTimeline]: <TimelineView />,
  [Graphs.groupingsPie]: <GroupingPie />,
};

export default function LibraryViewer() {
  const [selectedGraph, setSelectedGraph] = useState<Graphs | null>(null);

  const handleSelectGraph = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const choice = (e.target.value as Graphs) ?? null;

    setSelectedGraph(choice);
  }, []);

  return (
    <Box w="full" h="full">
      <TopBar>
        <Box w="30%" h="fit-content">
          <Select
            placeholder="Select a graph"
            onChange={handleSelectGraph}
            background="white"
          >
            {Object.values(Graphs).map((graph) => (
              <option value={graph}>{GRAPH_NAMES[graph]}</option>
            ))}
          </Select>
        </Box>
      </TopBar>

      {selectedGraph && (
        <Card minH="40vh" w="full">
          <Stack divider={<StackDivider />} spacing="2">
            <CardHeader>
              <H2>{GRAPH_NAMES[selectedGraph]}</H2>
              <SubText>{GRAPH_DESC[selectedGraph]}</SubText>
            </CardHeader>
            <CardBody>{GRAPH_COMPONENT_MAP[selectedGraph]}</CardBody>
          </Stack>
        </Card>
      )}
      {!selectedGraph && <EmptyState />}
    </Box>
  );
}

const GRAPH_NAMES: Record<Graphs, string> = {
  [Graphs.genrePie]: 'Genres by song count',
  [Graphs.genrePlays]: 'Genres by plays',
  [Graphs.genreArtists]: 'Genres by artists',
  [Graphs.addedTimeline]: 'Timeline of imports',
  [Graphs.groupingsPie]: 'Groupings',
};
const GRAPH_DESC: Record<Graphs, string> = {
  [Graphs.genrePie]:
    'Count of songs per genre. Shows where the library skews by song count.',
  [Graphs.genrePlays]:
    'Count of plays per genre. Shows what genres have been listened to most.',
  [Graphs.genreArtists]:
    "Count of artists per genre. Shows the skew of artists regardless of each artists' discography size",
  [Graphs.addedTimeline]: 'When songs were added over time.',
  [Graphs.groupingsPie]:
    'Ratio of custom groupings. Grouping fields are read as a CSV to support multiple "tags"',
};
