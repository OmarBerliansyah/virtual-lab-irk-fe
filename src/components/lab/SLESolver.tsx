import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Minus, Calculator } from "lucide-react";
import * as math from "mathjs";

const SLESolver = () => {
  const [size, setSize] = useState(3);
  const [method, setMethod] = useState("gaussian");
  const [matrix, setMatrix] = useState<string[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(4).fill("0"))
  );
  const [solution, setSolution] = useState<string>("");
  const [error, setError] = useState("");

  const updateMatrixSize = (newSize: number) => {
    setSize(newSize);
    const newMatrix = Array(newSize)
      .fill(null)
      .map((_, i) =>
        Array(newSize + 1)
          .fill(null)
          .map((_, j) => (matrix[i] && matrix[i][j]) || "0")
      );
    setMatrix(newMatrix);
  };

  const updateCell = (row: number, col: number, value: string) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = value;
    setMatrix(newMatrix);
  };

  const solveSLE = () => {
    try {
      setError("");
      
      // Convert string matrix to numbers
      const numMatrix = matrix.map(row => row.map(cell => parseFloat(cell) || 0));
      
      // Extract coefficient matrix (A) and constants vector (b)
      const A = numMatrix.map(row => row.slice(0, -1));
      const b = numMatrix.map(row => row[row.length - 1]);
      
      // Solve using math.js
      let result;
      
      if (method === "gaussian") {
        // Using LU decomposition (Gaussian elimination variant)
        result = math.lusolve(A, b);
      } else if (method === "cramer") {
        // Cramer's rule implementation
        const detA = math.det(A);
        
        if (Math.abs(detA) < 1e-10) {
          throw new Error("System has no unique solution (determinant is zero)");
        }
        
        result = [];
        for (let i = 0; i < size; i++) {
          const Ai = A.map(row => [...row]);
          for (let j = 0; j < size; j++) {
            Ai[j][i] = b[j];
          }
          const detAi = math.det(Ai);
          result.push([detAi / detA]);
        }
      }
      
      // Format solution
      const variables = Array.from({ length: size }, (_, i) => 
        String.fromCharCode(120 + i) // x, y, z, ...
      );
      
      const solutionText = result
        .map((val, idx) => `${variables[idx]} = ${(val[0] as number).toFixed(4)}`)
        .join("\n");
      
      setSolution(solutionText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to solve system");
      setSolution("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label>Matrix Size (N × N+1)</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateMatrixSize(Math.max(2, size - 1))}
              disabled={size <= 2}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center px-4 border rounded-md bg-muted">
              {size} × {size + 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateMatrixSize(Math.min(6, size + 1))}
              disabled={size >= 6}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <Label>Solving Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gaussian">Gaussian Elimination</SelectItem>
              <SelectItem value="cramer">Cramer's Rule</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Augmented Matrix [A|b]</Label>
        <div className="mt-2 overflow-x-auto">
          <div className="inline-block min-w-full">
            {matrix.map((row, i) => (
              <div key={i} className="flex gap-2 mb-2">
                {row.map((cell, j) => (
                  <div key={j} className="relative">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(i, j, e.target.value)}
                      className={`w-20 text-center font-mono ${
                        j === row.length - 1 ? "border-l-4 border-l-primary" : ""
                      }`}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          The last column represents the constants (right-hand side)
        </p>
      </div>

      <Button onClick={solveSLE} className="w-full" size="lg">
        <Calculator className="mr-2 h-4 w-4" />
        Calculate Solution
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {solution && (
        <div>
          <Label>Solution</Label>
          <div className="mt-2 p-4 rounded-md border bg-secondary/50">
            <pre className="font-mono text-lg whitespace-pre-wrap">{solution}</pre>
          </div>
        </div>
      )}

      <Alert>
        <AlertDescription>
          <strong>Tip:</strong> Enter coefficients in the matrix. For example, for the system:
          <br />
          2x + 3y = 8
          <br />
          x - y = -1
          <br />
          Enter: [2, 3, 8] and [1, -1, -1]
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SLESolver;
