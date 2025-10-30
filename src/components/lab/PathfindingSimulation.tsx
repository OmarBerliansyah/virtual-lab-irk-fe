import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, MapPin, Flag, Play, RotateCcw, Info } from "lucide-react";

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
  weight: number;
}

const PathfindingSimulation = () => {
  const [image, setImage] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges] = useState<Edge[]>([]);
  const [startNode, setStartNode] = useState<number | null>(null);
  const [endNode, setEndNode] = useState<number | null>(null);
  const [selectingStart, setSelectingStart] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setNodes([]);
        setStartNode(null);
        setEndNode(null);
        setPath([]);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Generate sample nodes for demonstration
        const sampleNodes: Node[] = [
          { id: 0, x: img.width * 0.2, y: img.height * 0.3 },
          { id: 1, x: img.width * 0.5, y: img.height * 0.2 },
          { id: 2, x: img.width * 0.8, y: img.height * 0.4 },
          { id: 3, x: img.width * 0.3, y: img.height * 0.7 },
          { id: 4, x: img.width * 0.7, y: img.height * 0.8 },
        ];
        
        setNodes(sampleNodes);
        drawGraph(ctx, sampleNodes, [], null, null, []);
      };
      
      img.src = image;
      imageRef.current = img;
    }
  }, [image]);

  const drawGraph = (
    ctx: CanvasRenderingContext2D | null,
    nodes: Node[],
    edges: Edge[],
    start: number | null,
    end: number | null,
    pathNodes: number[]
  ) => {
    if (!ctx || !imageRef.current) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw edges
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
    ctx.lineWidth = 2;
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // Draw path
    if (pathNodes.length > 1) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.beginPath();
      const firstNode = nodes.find((n) => n.id === pathNodes[0]);
      if (firstNode) {
        ctx.moveTo(firstNode.x, firstNode.y);
        for (let i = 1; i < pathNodes.length; i++) {
          const node = nodes.find((n) => n.id === pathNodes[i]);
          if (node) {
            ctx.lineTo(node.x, node.y);
          }
        }
        ctx.stroke();
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
      
      if (node.id === start) {
        ctx.fillStyle = "#22c55e";
      } else if (node.id === end) {
        ctx.fillStyle = "#ef4444";
      } else {
        ctx.fillStyle = "#3b82f6";
      }
      
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw node ID
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.id.toString(), node.x, node.y);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest node
    let closestNode: Node | null = null;
    let minDist = Infinity;

    nodes.forEach((node) => {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      if (dist < minDist && dist < 30) {
        minDist = dist;
        closestNode = node;
      }
    });

    if (closestNode) {
      if (selectingStart) {
        setStartNode(closestNode.id);
        setSelectingStart(false);
      } else if (selectingEnd) {
        setEndNode(closestNode.id);
        setSelectingEnd(false);
      }
      
      const ctx = canvasRef.current.getContext("2d");
      drawGraph(
        ctx,
        nodes,
        edges,
        selectingStart ? closestNode.id : startNode,
        selectingEnd ? closestNode.id : endNode,
        path
      );
    }
  };

  const findPath = () => {
    if (startNode === null || endNode === null) {
      alert("Please select both start and end nodes");
      return;
    }

    // Simple demonstration path (in real implementation, use Dijkstra or A*)
    const demonstrationPath = [startNode, endNode];
    setPath(demonstrationPath);

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      drawGraph(ctx, nodes, edges, startNode, endNode, demonstrationPath);
    }
  };

  const reset = () => {
    setStartNode(null);
    setEndNode(null);
    setPath([]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      drawGraph(ctx, nodes, edges, null, null, []);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="graph-image">Upload Graph Image</Label>
        <div className="mt-2">
          <label htmlFor="graph-image">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </span>
            </Button>
          </label>
          <input
            id="graph-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {image && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectingStart ? "default" : "outline"}
              onClick={() => {
                setSelectingStart(true);
                setSelectingEnd(false);
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Select Start Node
            </Button>
            <Button
              variant={selectingEnd ? "default" : "outline"}
              onClick={() => {
                setSelectingEnd(true);
                setSelectingStart(false);
              }}
            >
              <Flag className="mr-2 h-4 w-4" />
              Select End Node
            </Button>
            <Button onClick={findPath} variant="secondary">
              <Play className="mr-2 h-4 w-4" />
              Find Path
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-muted/50">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full h-auto cursor-crosshair"
            />
          </div>

          {startNode !== null && endNode !== null && (
            <div className="text-sm text-muted-foreground">
              Path from node <strong className="text-secondary">{startNode}</strong> to node{" "}
              <strong className="text-destructive">{endNode}</strong>
              {path.length > 0 && `: ${path.join(" → ")}`}
            </div>
          )}
        </>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> This is a simplified visualization. Upload an image, and sample nodes will be generated.
          In a full implementation, computer vision (opencv.js) would detect nodes and edges from the image automatically.
          The current version demonstrates the UI and interaction flow.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PathfindingSimulation;
