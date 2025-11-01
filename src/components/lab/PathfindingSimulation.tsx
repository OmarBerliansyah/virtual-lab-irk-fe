import { useState, useRef, useEffect, useCallback, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  MapPin,
  Flag,
  Play,
  RotateCcw,
  Info,
  Circle,
  Move,
  Minus,
  MousePointer,
  Edit,
  Trash2,
  Copy,
  RefreshCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Node {
  id: number;
  x: number;
  y: number;
  label?: string;
}

interface Edge {
  id: string;
  from: number;
  to: number;
  weight: number;
}

type Mode = "addNode" | "addEdge" | "setStart" | "setEnd" | "select" | "edit";
type Algorithm = "bfs" | "dfs" | "tsp";

// --- Algorithm Visualization Step Interfaces ---
interface AlgoStep {
  visited: number[];
  path: number[];
  queue?: number[]; // For BFS
  stack?: number[]; // For DFS
  current?: number;
}

// --- Constants ---
const NODE_RADIUS = 15;
const CLICK_THRESHOLD = NODE_RADIUS * 1.5;

// --- Helper Functions ---
const getDistance = (n1: Node, n2: Node): number => {
  return Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
};

const getNearestNode = (x: number, y: number, nodes: Node[]): Node | null => {
  let nearest: Node | null = null;
  let minDist = Infinity;
  for (const node of nodes) {
    const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
    if (dist < minDist && dist < CLICK_THRESHOLD) {
      minDist = dist;
      nearest = node;
    }
  }
  return nearest;
};

// --- Main Component ---
const PathfindingSimulation = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNode, setStartNode] = useState<number | null>(null);
  const [endNode, setEndNode] = useState<number | null>(null);
  
  const [mode, setMode] = useState<Mode>("addNode");
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [addEdgeStart, setAddEdgeStart] = useState<number | null>(null);
  
  // Selection and interaction state
  const [selectedNodes, setSelectedNodes] = useState<Set<number>>(new Set());
  const [selectedEdges, setSelectedEdges] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState<{ type: 'node' | 'edge'; id: number | string } | null>(null);
  
  // Visualization state
  const [visResult, setVisResult] = useState<{ path: string, cost: number } | null>(null);
  const [visSteps, setVisSteps] = useState<AlgoStep[]>([]);
  const [currentStep, setCurrentStep] = useState<AlgoStep | null>(null);
  
  // Canvas responsive state
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Handle algorithm change with state reset
  const handleAlgorithmChange = (newAlgorithm: Algorithm) => {
    // Reset visualization state when changing algorithms
    setIsVisualizing(false);
    setCurrentStep(null);
    setVisResult(null);
    setVisSteps([]);
    setAddEdgeStart(null);
    
    // Clear end node for TSP since it doesn't need one
    if (newAlgorithm === "tsp") {
      setEndNode(null);
    }
    
    setAlgorithm(newAlgorithm);
    
    toast({
      title: "Algorithm Changed",
      description: `Switched to ${newAlgorithm.toUpperCase()}. Visualization state reset.`,
    });
  };

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const maxWidth = Math.min(rect.width - 32, 1200); // 16px padding each side, max 1200px
        const height = Math.max(400, Math.min(600, maxWidth * 0.6)); // Aspect ratio with bounds
        setCanvasSize({ width: maxWidth, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Update canvas dimensions when size changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasSize.width;
      canvasRef.current.height = canvasSize.height;
    }
  }, [canvasSize]);

  // --- Drawing Logic ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const step = currentStep;

    // Draw Edges
    edges.forEach((edge) => {
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      if (!from || !to) return;

      ctx.strokeStyle = selectedEdges.has(edge.id) ? "#f59e0b" : "#a1a1aa"; // highlight selected
      ctx.lineWidth = selectedEdges.has(edge.id) ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      
      // Draw weight
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.fillStyle = selectedEdges.has(edge.id) ? "#f59e0b" : "#71717a";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(edge.weight.toFixed(0), midX, midY - 5);
    });
    
    // Draw Path (from visualization)
    if (step && step.path.length > 1) {
      ctx.strokeStyle = "#ef4444"; // destructive
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < step.path.length - 1; i++) {
        const from = nodes.find(n => n.id === step.path[i]);
        const to = nodes.find(n => n.id === step.path[i + 1]);
        if (from && to) {
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
        }
      }
      ctx.stroke();
    }

    // Draw Nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);

      // Determine fill color based on state
      if (selectedNodes.has(node.id)) ctx.fillStyle = "#f59e0b"; // amber-500 (selected)
      else if (node.id === startNode) ctx.fillStyle = "#22c55e"; // green-500
      else if (node.id === endNode) ctx.fillStyle = "#ef4444"; // red-500
      else if (step?.current === node.id) ctx.fillStyle = "#f97316"; // orange-500 (current)
      else if (step?.path.includes(node.id)) ctx.fillStyle = "#ec4899"; // pink-500 (on path)
      else if (step?.visited.includes(node.id)) ctx.fillStyle = "#a855f7"; // purple-500 (visited)
      else if (step?.queue?.includes(node.id) || step?.stack?.includes(node.id)) ctx.fillStyle = "#06b6d4"; // cyan-500 (in queue)
      else ctx.fillStyle = "#3b82f6"; // blue-500 (default)

      ctx.fill();
      ctx.strokeStyle = selectedNodes.has(node.id) ? "#f59e0b" : "#ffffff";
      ctx.lineWidth = selectedNodes.has(node.id) ? 4 : 3;
      ctx.stroke();

      // Draw node ID or label
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((node.label || node.id.toString()), node.x, node.y);
    });
  }, [nodes, edges, startNode, endNode, currentStep, selectedEdges, selectedNodes]);

  // Effect to draw on state change
  useEffect(() => {
    draw();
  }, [nodes, edges, startNode, endNode, currentStep, draw]);

  // --- Canvas Click Logic ---
  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isVisualizing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = getNearestNode(x, y, nodes);

    switch (mode) {
      case "addNode":
        if (!clickedNode) {
          const newNodeId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
          setNodes([...nodes, { id: newNodeId, x, y }]);
        }
        break;
      
      case "addEdge":
        if (clickedNode) {
          if (addEdgeStart === null) {
            setAddEdgeStart(clickedNode.id);
            toast({ title: `Selected node ${clickedNode.id}. Select second node to create edge.` });
          } else if (addEdgeStart !== clickedNode.id) {
            const fromNode = nodes.find(n => n.id === addEdgeStart);
            if (!fromNode) return;
            
            const edgeExists = edges.some(edge => 
              (edge.from === addEdgeStart && edge.to === clickedNode.id) ||
              (edge.from === clickedNode.id && edge.to === addEdgeStart)
            );
            
            if (!edgeExists) {
              const weight = getDistance(fromNode, clickedNode);
              const newEdge: Edge = { id: `${addEdgeStart}-${clickedNode.id}`, from: addEdgeStart, to: clickedNode.id, weight };
              setEdges([...edges, newEdge]);
            }
            setAddEdgeStart(null);
          }
        } else {
          setAddEdgeStart(null);
        }
        break;

      case "setStart":
        if (clickedNode) setStartNode(clickedNode.id);
        break;
      
      case "setEnd":
        if (clickedNode) setEndNode(clickedNode.id);
        break;
        
      case "select":
        if (clickedNode) {
          if (e.ctrlKey || e.metaKey) {
            // Multi-select with Ctrl/Cmd
            const newSelected = new Set(selectedNodes);
            if (newSelected.has(clickedNode.id)) {
              newSelected.delete(clickedNode.id);
            } else {
              newSelected.add(clickedNode.id);
            }
            setSelectedNodes(newSelected);
          } else {
            // Single select
            setSelectedNodes(new Set([clickedNode.id]));
          }
          setSelectedEdges(new Set()); // Clear edge selection
        } else {
          // Click on empty space - check if clicking on edge
          const clickedEdge = getEdgeAt(x, y);
          if (clickedEdge) {
            if (e.ctrlKey || e.metaKey) {
              const newSelected = new Set(selectedEdges);
              if (newSelected.has(clickedEdge.id)) {
                newSelected.delete(clickedEdge.id);
              } else {
                newSelected.add(clickedEdge.id);
              }
              setSelectedEdges(newSelected);
            } else {
              setSelectedEdges(new Set([clickedEdge.id]));
            }
            setSelectedNodes(new Set()); // Clear node selection
          } else {
            // Clear all selections
            setSelectedNodes(new Set());
            setSelectedEdges(new Set());
          }
        }
        break;
        
      case "edit":
        if (clickedNode) {
          const newLabel = prompt(`Enter new label for node ${clickedNode.id}:`, clickedNode.label || clickedNode.id.toString());
          if (newLabel !== null) {
            setNodes(nodes.map(n => n.id === clickedNode.id ? { ...n, label: newLabel } : n));
          }
        } else {
          const clickedEdge = getEdgeAt(x, y);
          if (clickedEdge) {
            const newWeight = prompt(`Enter new weight for edge ${clickedEdge.id}:`, clickedEdge.weight.toString());
            if (newWeight !== null && !isNaN(parseFloat(newWeight))) {
              setEdges(edges.map(e => e.id === clickedEdge.id ? { ...e, weight: parseFloat(newWeight) } : e));
            }
          }
        }
        break;
    }
  };

  // Helper function to detect edge clicks
  const getEdgeAt = (x: number, y: number): Edge | null => {
    for (const edge of edges) {
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      if (!from || !to) continue;
      
      // Calculate distance from point to line segment
      const dist = distanceToLineSegment(x, y, from.x, from.y, to.x, to.y);
      if (dist < 10) { // 10px tolerance for edge selection
        return edge;
      }
    }
    return null;
  };

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Delete selected items
  const deleteSelected = () => {
    if (selectedNodes.size > 0) {
      const nodesToDelete = Array.from(selectedNodes);
      
      // Remove nodes
      setNodes(nodes.filter(n => !nodesToDelete.includes(n.id)));
      
      // Remove edges connected to deleted nodes
      setEdges(edges.filter(e => !nodesToDelete.includes(e.from) && !nodesToDelete.includes(e.to)));
      
      // Clear start/end if they were deleted
      if (startNode && nodesToDelete.includes(startNode)) setStartNode(null);
      if (endNode && nodesToDelete.includes(endNode)) setEndNode(null);
    }
    
    if (selectedEdges.size > 0) {
      const edgesToDelete = Array.from(selectedEdges);
      setEdges(edges.filter(e => !edgesToDelete.includes(e.id)));
    }
    
    // Clear selections
    setSelectedNodes(new Set());
    setSelectedEdges(new Set());
  };

  // Copy selected items (simplified - just duplicates nodes)
  const copySelected = () => {
    if (selectedNodes.size > 0) {
      const nodesToCopy = nodes.filter(n => selectedNodes.has(n.id));
      const maxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) : 0;
      
      const copiedNodes = nodesToCopy.map((node, index) => ({
        ...node,
        id: maxId + index + 1,
        x: node.x + 50, // Offset the copy
        y: node.y + 50,
        label: node.label ? `${node.label}_copy` : undefined
      }));
      
      setNodes([...nodes, ...copiedNodes]);
      setSelectedNodes(new Set(copiedNodes.map(n => n.id)));
      
      toast({ 
        title: "Nodes Copied", 
        description: `Copied ${copiedNodes.length} nodes` 
      });
    }
  };

  // --- Algorithm Logic ---

  const buildAdjList = (): Map<number, { to: number, weight: number }[]> => {
    const adj = new Map<number, { to: number, weight: number }[]>();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
      adj.get(e.from)?.push({ to: e.to, weight: e.weight });
      adj.get(e.to)?.push({ to: e.from, weight: e.weight }); // Undirected graph
    });
    return adj;
  };

  const visualize = (steps: AlgoStep[], finalPath: number[], totalCost: number) => {
    setIsVisualizing(true);
    setVisResult(null);
    let step = 0;
    
    const interval = setInterval(() => {
      if (step < steps.length) {
        setCurrentStep(steps[step++]);
      } else {
        clearInterval(interval);
        setIsVisualizing(false);
        const finalStep = steps[steps.length - 1] || { visited: [], path: finalPath };
        setCurrentStep({ ...finalStep, path: finalPath }); // Set final path
        setVisResult({ 
          path: finalPath.join(" → "),
          cost: totalCost
        });
        toast({ title: "Visualization Complete", description: `Path: ${finalPath.join(" → ")}`});
      }
    }, 200); // Speed of visualization
  };

  const startVisualization = () => {
    if (!startNode) {
      toast({ variant: "destructive", title: "No start node selected."});
      return;
    }
    
    // For BFS and DFS, end node is required
    if ((algorithm === "bfs" || algorithm === "dfs") && !endNode) {
      toast({ 
        variant: "destructive", 
        title: `${algorithm.toUpperCase()} requires both start and end nodes.`
      });
      return;
    }
    
    const adj = buildAdjList();
    const steps: AlgoStep[] = [];
    let finalPath: number[] = [];
    let totalCost: number = 0;

    // --- BFS ---
    if (algorithm === "bfs") {      
      const q: number[] = [startNode];
      const visited: number[] = [startNode];
      const parent = new Map<number, number | null>([[startNode, null]]);
      
      steps.push({ visited: [...visited], path: [], queue: [...q] });
      
      let found = false;
      while (q.length > 0) {
        const current = q.shift()!;
        if (current === endNode) {
          found = true;
          break;
        }
        
        adj.get(current)?.forEach(neighbor => {
          if (!visited.includes(neighbor.to)) {
            visited.push(neighbor.to);
            parent.set(neighbor.to, current);
            q.push(neighbor.to);
          }
        });
        steps.push({ visited: [...visited], path: [], queue: [...q], current });
      }

      if (found) {
        let at = endNode;
        while(at !== null) {
          finalPath.unshift(at);
          at = parent.get(at)!;
        }
      }
    }
    
    // --- DFS ---
    else if (algorithm === "dfs") {
      const s: number[] = [startNode];
      const visited: number[] = [];
      const parent = new Map<number, number | null>();
      
      let found = false;
      while (s.length > 0) {
        const current = s.pop()!;
        
        if(visited.includes(current)) continue;
        visited.push(current);
        steps.push({ visited: [...visited], path: [], stack: [...s], current });

        if (current === endNode) {
          found = true;
          break;
        }
        
        adj.get(current)?.reverse().forEach(neighbor => { // reverse to explore in typical order
          if (!visited.includes(neighbor.to)) {
            parent.set(neighbor.to, current);
            s.push(neighbor.to);
          }
        });
      }
      
      if (found) {
        let at = endNode;
        while(at !== null) {
          finalPath.unshift(at);
          at = parent.get(at)!;
        }
      }
    }
    
    // --- TSP (Nearest Neighbor Heuristic) ---
    else if (algorithm === "tsp") {
      if (nodes.length < 2) {
        toast({ 
          variant: "destructive", 
          title: "TSP requires at least 2 nodes."
        });
        return;
      }
      
      const unvisited = new Set(nodes.map(n => n.id));
      let current = startNode;
      unvisited.delete(current);
      finalPath = [current];
      steps.push({ visited: [current], path: [current], current });

      while(unvisited.size > 0) {
        let nearestDist = Infinity;
        let nearestNode: number | null = null;
        
        const currentNode = nodes.find(n => n.id === current)!;
        
        unvisited.forEach(nodeId => {
          const neighborNode = nodes.find(n => n.id === nodeId)!;
          const dist = getDistance(currentNode, neighborNode);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestNode = nodeId;
          }
        });

        if (nearestNode) {
          totalCost += nearestDist;
          current = nearestNode;
          unvisited.delete(current);
          finalPath.push(current);
          steps.push({ visited: [...finalPath], path: [...finalPath], current });
        }
      }
      
      // Return to start
      const lastNode = nodes.find(n => n.id === current)!;
      const start = nodes.find(n => n.id === startNode)!;
      totalCost += getDistance(lastNode, start);
      finalPath.push(startNode);
      steps.push({ visited: [...finalPath], path: [...finalPath], current: startNode });
    }
    
    // Calculate final path cost for BFS/DFS
    if (finalPath.length > 1 && algorithm !== 'tsp') {
      for (let i = 0; i < finalPath.length - 1; i++) {
        const edge = edges.find(e => 
          (e.from === finalPath[i] && e.to === finalPath[i+1]) || 
          (e.from === finalPath[i+1] && e.to === finalPath[i])
        );
        if (edge) totalCost += edge.weight;
      }
    }
    
    visualize(steps, finalPath, totalCost);
  };
  
  const reset = () => {
    setNodes([]);
    setEdges([]);
    setStartNode(null);
    setEndNode(null);
    setIsVisualizing(false);
    setAddEdgeStart(null);
    setCurrentStep(null);
    setVisResult(null);
    setVisSteps([]);
    setSelectedNodes(new Set());
    setSelectedEdges(new Set());
    setIsDragging(false);
    setIsEditing(null);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={(val: Mode) => val && setMode(val)}
          disabled={isVisualizing}
        >
          <ToggleGroupItem value="addNode" aria-label="Add Node">
            <Circle className="mr-2 h-4 w-4" /> Add Node
          </ToggleGroupItem>
          <ToggleGroupItem value="addEdge" aria-label="Add Edge">
            <Move className="mr-2 h-4 w-4" /> Add Edge
          </ToggleGroupItem>
          <ToggleGroupItem value="setStart" aria-label="Set Start">
            <MapPin className="mr-2 h-4 w-4" /> Start
          </ToggleGroupItem>
          {algorithm !== "tsp" && (
            <ToggleGroupItem value="setEnd" aria-label="Set End">
              <Flag className="mr-2 h-4 w-4" /> End
            </ToggleGroupItem>
          )}
          <ToggleGroupItem value="select" aria-label="Select">
            <MousePointer className="mr-2 h-4 w-4" /> Select
          </ToggleGroupItem>
          <ToggleGroupItem value="edit" aria-label="Edit">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </ToggleGroupItem>
        </ToggleGroup>
        
        <Select 
          value={algorithm}
          onValueChange={handleAlgorithmChange}
          disabled={isVisualizing}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bfs">BFS (Pathfinding)</SelectItem>
            <SelectItem value="dfs">DFS (Pathfinding)</SelectItem>
            <SelectItem value="tsp">TSP (Nearest Neighbor)</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={startVisualization} disabled={isVisualizing}>
          <Play className="mr-2 h-4 w-4" />
          {isVisualizing ? "Visualizing..." : "Visualize"}
        </Button>
        <Button onClick={reset} variant="outline" disabled={isVisualizing}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        
        {(selectedNodes.size > 0 || selectedEdges.size > 0) && (
          <>
            <Button 
              onClick={deleteSelected} 
              variant="destructive" 
              size="sm"
              disabled={isVisualizing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            <Button 
              onClick={copySelected} 
              variant="outline" 
              size="sm"
              disabled={isVisualizing}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Selected
            </Button>
            </>
          )}
      </div>
      
      <div ref={containerRef} className="border rounded-lg overflow-hidden bg-muted/50">
        <ContextMenu>
          <ContextMenuTrigger>
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onClick={handleCanvasClick}
              className="w-full cursor-crosshair"
              style={{ display: 'block' }}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            {selectedNodes.size > 0 && (
              <>
                <ContextMenuItem onClick={() => setMode("edit")}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Selected
                </ContextMenuItem>
                <ContextMenuItem onClick={copySelected}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Selected
                </ContextMenuItem>
                <ContextMenuItem onClick={deleteSelected} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem onClick={() => setMode("addNode")}>
              <Circle className="mr-2 h-4 w-4" />
              Add Node Mode
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setMode("addEdge")}>
              <Move className="mr-2 h-4 w-4" />
              Add Edge Mode
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setMode("select")}>
              <MousePointer className="mr-2 h-4 w-4" />
              Select Mode
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => {
              setCurrentStep(null);
              setVisResult(null);
              setIsVisualizing(false);
            }}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Clear Visualization
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {visResult && (
        <Alert>
          <AlertDescription className="text-lg">
            <strong>Result:</strong> {visResult.path}
            <br/>
            <strong>Total Cost:</strong> {visResult.cost.toFixed(2)}
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Add Node:</strong> Click on empty space to create a node.</li>
            <li><strong>Add Edge:</strong> Click one node, then another to connect them.</li>
            <li><strong>Start Node:</strong> Required for all algorithms. Click a node to set it as Start.</li>
            {algorithm !== "tsp" && (
              <li><strong>End Node:</strong> Required for BFS/DFS. Click a node to set it as destination.</li>
            )}
            {algorithm === "tsp" && (
              <li><strong>TSP Mode:</strong> Only requires a Start node. Finds a tour visiting all nodes and returning to start.</li>
            )}
            <li><strong>Select Mode:</strong> Use Ctrl/Cmd+click for multi-selection. Right-click for context menu.</li>
            <li><strong>Responsive Canvas:</strong> Canvas automatically adjusts to window size for optimal viewing.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PathfindingSimulation;