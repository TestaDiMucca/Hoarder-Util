import { Box, Select } from '@chakra-ui/react';
import React, { ChangeEvent, useCallback, useState } from 'react';

import { GenrePieType, Graphs } from 'src/types/types';
import GenrePie from './Charts/GenrePie';
import TimelineView from './Charts/TimelineView';
import GroupingPie from './Charts/GroupingPie';
import TopBar from './Navs/TopBar';
import EmptyState from './EmptyState';

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
            <option value={Graphs.genrePie}>Genre pie</option>
            <option value={Graphs.genrePlays}>Genre plays</option>
            <option value={Graphs.genreArtists}>Genre artists</option>
            <option value={Graphs.addedTimeline}>Added over time</option>
            <option value={Graphs.groupingsPie}>Groupings pie</option>
          </Select>
        </Box>
      </TopBar>

      {selectedGraph && (
        <Box minH="40vh" w="full">
          {GRAPH_COMPONENT_MAP[selectedGraph]}
        </Box>
      )}
      {!selectedGraph && <EmptyState />}
    </Box>
  );
}
