import { ProcessingModule, ProcessingModuleType } from '@shared/common.types';
import { Node, Edge } from '@vue-flow/core';
import dagre from 'dagre';

type ChartNode = Node & {
    module: ProcessingModule;
};
type ChartLink = Edge;

type UnPositionedChartNode = Omit<ChartNode, 'position'>;

/**
 * Modules are stored in a pseudo-linked-list and need to be transformed
 * into a format vue-flow can interpret
 */
export const buildPipelineTopology = (pipelineModules: ProcessingModule[]) => {
    const nodes: UnPositionedChartNode[] = [];
    const links: ChartLink[] = [];

    pipelineModules.forEach((pipelineModule) => {
        nodes.push({
            module: pipelineModule,
            id: pipelineModule.id,
            data: {
                label: pipelineModule.type,
            },
        });

        if (pipelineModule.type === ProcessingModuleType.branch) {
            pipelineModule.branches.forEach((branch) => {
                if (!branch.targetModule) return;

                links.push({
                    id: `link-${pipelineModule.id}-${branch.targetModule}`,
                    source: pipelineModule.id,
                    target: branch.targetModule,
                });
            });
        } else if (pipelineModule.nextModule) {
            links.push({
                id: `link-${pipelineModule.id}-${pipelineModule.nextModule}`,
                source: pipelineModule.id,
                target: pipelineModule.nextModule,
            });
        }
    });

    return {
        nodes: calculateDagreLayout(nodes, links),
        links,
    };
};

const calculateDagreLayout = (nodes: UnPositionedChartNode[], edges: ChartLink[], direction = 'TB'): ChartNode[] => {
    // Create a new directed graph
    const g = new dagre.graphlib.Graph();

    g.setGraph({ rankdir: direction }); // 'LR' for left-to-right, 'TB' for top-to-bottom
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => {
        g.setNode(node.id, { width: 120, height: 50 }); // Adjust width and height as needed
    });

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    return nodes.map((node) => {
        const { x, y } = g.node(node.id);
        return {
            ...node,
            position: { x, y },
        };
    });
};
