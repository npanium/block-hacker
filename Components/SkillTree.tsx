"use client";
import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  ConnectionMode,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { skillsData } from "@/app/data/skillsData";
import { SkillData } from "@/app/types/skillTree";
import { useGameContext } from "./GameContext";
import {
  calculateNodePosition,
  groupSkillsByTier,
} from "@/app/utils/positioning";
import { generateEdgesForSkill } from "@/app/utils/edgeGeneration";

import { SkillNode } from "./SkillNode";

import { CreditsDisplay } from "./CreditsDisplay";
import { VictoryDisplay } from "./VictoryDisplay";

export const SkillTree: React.FC = () => {
  const { currency, unlockedSkills, isSkillUnlocked } = useGameContext();

  console.log("SkillTree render - checking dependencies:");
  console.log("unlockedSkills:", unlockedSkills);
  console.log("isSkillUnlocked ref:", isSkillUnlocked);

  // Generate nodes and edges
  const { nodes, edges } = useMemo(() => {
    console.log("useMemo is running - this should NOT spam");
    const skillsByTier = groupSkillsByTier(skillsData);
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Generate nodes with positioning
    skillsData.forEach((skill: any) => {
      const position = calculateNodePosition(
        skill,
        skillsByTier,
        unlockedSkills
      );

      // Skip hidden skills
      if (position.x === -10000 && position.y === -10000) {
        return;
      }

      generatedNodes.push({
        id: skill.id,
        type: "skillNode",
        position,
        data: {
          ...skill,
          isUnlocked: isSkillUnlocked(skill.id),
          // isAvailable: canPurchaseSkill(skill.id),
        },
        draggable: false,
      });

      // Generate edges for this skill
      const skillEdges = generateEdgesForSkill({
        skill,
        unlockedSkills,
        // isSkillAvailable: (skill: any) => canPurchaseSkill(skill.id),
        isSkillAvailable: () => true,
      });
      generatedEdges.push(...skillEdges);
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [unlockedSkills, isSkillUnlocked, skillsData]);
  // const skillsByTier = groupSkillsByTier(skillsData);
  // const nodes: Node[] = [];
  // const edges: Edge[] = [];

  const [reactFlowNodes, setNodes] = useState(nodes);
  const [reactFlowEdges, setEdges] = useState(edges);

  // React.useEffect(() => {
  //   setNodes(nodes);
  //   setEdges(edges);
  // }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );

  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const nodeTypes: NodeTypes = {
    skillNode: SkillNode,
  };

  // Calculate unlocked goals for victory display
  const unlockedGoals = skillsData.filter(
    (skill: any) => skill.isGoal && isSkillUnlocked(skill.id)
  );

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-radial from-slate-900 via-purple-900 to-blue-900">
      <CreditsDisplay credits={currency} />
      <VictoryDisplay unlockedGoals={unlockedGoals} />

      {/* React Flow */}
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Strict}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          panOnDrag={true}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          selectNodesOnDrag={false}
          defaultViewport={{ x: 400, y: 100, zoom: 0.8 }}
          minZoom={0.5}
          maxZoom={1.5}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={2} />
        </ReactFlow>
      </div>
    </div>
  );
};
