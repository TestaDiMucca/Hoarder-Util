import { Node, Edge, Position, MarkerType } from '@vue-flow/core';
import dagre from 'dagre';
import { v4 as uuidv4 } from 'uuid';
import { ProcessingModule, ProcessingModuleType } from '@shared/common.types';

export type ChartNodeData = {
    label: string;
    pipelineModule?: ProcessingModule;
    fromModuleId?: string;
    branchIndex?: number;
};

type ChartNode = Node & {
    data: ChartNodeData;
    type: 'default' | 'branch' | 'new';
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
    const validNodeIds = new Set<string>(pipelineModules.map((m) => m.id));

    const addNewButtonNode = (fromModuleId: string, linkLabel?: string, branchIndex?: number) => {
        const id = uuidv4();
        nodes.push({
            id,
            data: {
                label: 'Add new',
                fromModuleId,
                branchIndex,
            },
            type: 'new',
            targetPosition: Position.Top,
        });

        links.push({
            id: `link-${fromModuleId}-${id}`,
            source: fromModuleId,
            label: linkLabel,
            target: id,
            style: { strokeDasharray: 1 },
            markerEnd: MarkerType.ArrowClosed,
        });
    };

    pipelineModules.forEach((pipelineModule) => {
        nodes.push({
            id: pipelineModule.id,
            data: {
                label: pipelineModule.type,
                pipelineModule,
            },
            type: 'default',
        });

        if (pipelineModule.type === ProcessingModuleType.branch) {
            pipelineModule.branches.forEach((branch, i) => {
                if (!branch.targetModule || !validNodeIds.has(branch.targetModule)) {
                    addNewButtonNode(pipelineModule.id, branch.label, i);
                    return;
                }

                // todo: common with below
                links.push({
                    id: `link-${pipelineModule.id}-${branch.targetModule}`,
                    source: pipelineModule.id,
                    label: branch.label,
                    animated: true,
                    type: 'smoothstep',
                    target: branch.targetModule,
                    markerEnd: MarkerType.ArrowClosed,
                    style: {
                        strokeWidth: '2px',
                    },
                });
            });
        } else if (pipelineModule.nextModule && validNodeIds.has(pipelineModule.nextModule)) {
            links.push({
                id: `link-${pipelineModule.id}-${pipelineModule.nextModule}`,
                source: pipelineModule.id,
                target: pipelineModule.nextModule,
                animated: true,
                type: 'smoothstep',
                markerEnd: MarkerType.ArrowClosed,
                style: {
                    strokeWidth: '2px',
                },
            });
        } else {
            addNewButtonNode(pipelineModule.id);
        }
    });

    return {
        nodes: calculateDagreLayout(nodes, links),
        links,
    };
};

const calculateDagreLayout = (
    nodes: UnPositionedChartNode[],
    edges: ChartLink[],
    direction: 'TB' | 'LR' = 'TB',
): ChartNode[] => {
    const g = new dagre.graphlib.Graph();

    g.setGraph({ rankdir: direction });
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => {
        g.setNode(node.id, { width: 120, height: 50 });
    });

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // todo: persist if exists
    return nodes.map((node) => {
        const { x, y } = g.node(node.id);
        return {
            ...node,
            position: { x, y },
        };
    });
};
