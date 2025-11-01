import { useState, useMemo } from "react";
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
import { Plus, Minus, Calculator, Info, Book, Zap } from "lucide-react";
import * as math from "mathjs";

// --- Gauss-Jordan Logic Ported from SPL.java ---
const EPSILON = 1e-10;

type SolutionType = "unique" | "parametric" | "none" | "";
type SolutionResult = {
  type: SolutionType;
  solution: string;
  rref: number[][];
};

function solveUsingGaussJordan(matrix: number[][]): SolutionResult {
  let m = matrix.map(row => [...row]); // Deep copy
  const numRows = m.length;
  const numCols = m[0].length;
  const numVars = numCols - 1;

  let lead = 0;
  for (let r = 0; r < numRows; r++) {
    if (lead >= numCols) break;
    let i = r;
    while (Math.abs(m[i][lead]) < EPSILON) {
      i++;
      if (i === numRows) {
        i = r;
        lead++;
        if (lead === numCols) return analyzeRREF(m, numVars);
      }
    }
    [m[i], m[r]] = [m[r], m[i]]; // Swap rows

    let val = m[r][lead];
    for (let j = 0; j < numCols; j++) {
      m[r][j] /= val; // Normalize row
    }

    for (let i = 0; i < numRows; i++) {
      if (i === r) continue;
      val = m[i][lead];
      for (let j = 0; j < numCols; j++) {
        m[i][j] -= val * m[r][j]; // Zero out other entries in column
      }
    }
    lead++;
  }

  // Clean up near-zero values
  m = m.map(row => row.map(cell => (Math.abs(cell) < EPSILON ? 0 : cell)));

  return analyzeRREF(m, numVars);
}

// Ported from SPL.java's checkSolusi, solusiBanyak, etc.
function analyzeRREF(rref: number[][], numVars: number): SolutionResult {
  let solutionString = "";
  const pivotCols: number[] = [];
  const freeVars: number[] = [];

  // Check for inconsistent rows [0 0 ... | 1]
  for (const row of rref) {
    const mainCoeffs = row.slice(0, numVars);
    const constant = row[numVars];
    const isAllZeroCoeffs = mainCoeffs.every(val => Math.abs(val) < EPSILON);

    if (isAllZeroCoeffs && Math.abs(constant) > EPSILON) {
      return { type: "none", solution: "System has no solution (inconsistent).", rref };
    }
  }

  // Find pivot columns and free variables
  let validRows = 0;
  for(let r = 0; r < rref.length; r++) {
    let pivotFound = false;
    for(let c = 0; c < numVars; c++) {
      if (Math.abs(rref[r][c] - 1) < EPSILON) {
        pivotCols[c] = validRows; // Store row index for this variable
        pivotFound = true;
        validRows++;
        break;
      } else if (Math.abs(rref[r][c]) > EPSILON) {
        // This shouldn't happen in perfect RREF, but good to check
        pivotFound = true;
        validRows++;
        break;
      }
    }
  }

  for (let i = 0; i < numVars; i++) {
    if (pivotCols[i] === undefined) {
      freeVars.push(i);
    }
  }

  // Case 2: Solusi Unik
  if (freeVars.length === 0) {
    const solution = [];
    for (let i = 0; i < numVars; i++) {
      solution[i] = rref[pivotCols[i]][numVars].toFixed(4);
      solutionString += `${String.fromCharCode(120 + i)} = ${solution[i]}\n`;
    }
    return { type: "unique", solution: solutionString, rref };
  }

  // Case 3: Solusi Parametrik (Banyak)
  let paramIndex = 1;
  const solutionParams = Array(numVars).fill(null);
  
  for (const freeVarIndex of freeVars) {
    solutionParams[freeVarIndex] = `t${paramIndex++}`;
  }

  for (let i = 0; i < numVars; i++) {
    if (solutionParams[i] !== null) continue; // Skip free vars

    const pivotRow = rref[pivotCols[i]];
    let paramStr = `${pivotRow[numVars].toFixed(4)}`;
    
    for (const freeVarIndex of freeVars) {
      const coeff = pivotRow[freeVarIndex];
      if (Math.abs(coeff) > EPSILON) {
        paramStr += ` ${-coeff > 0 ? '+' : ''} ${-coeff.toFixed(4)}${solutionParams[freeVarIndex]}`;
      }
    }
    solutionParams[i] = paramStr;
  }
  
  solutionString = solutionParams
    .map((s, i) => `${String.fromCharCode(120 + i)} = ${s}`)
    .join("\n");

  return { type: "parametric", solution: solutionString, rref };
}

// --- End of Gauss-Jordan Logic ---

const SLESolver = () => {
  const [size, setSize] = useState(3);
  const [method, setMethod] = useState("gaussian");
  const [matrix, setMatrix] = useState<string[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(4).fill("0"))
  );
  const [solution, setSolution] = useState<string>("");
  const [solutionType, setSolutionType] = useState<SolutionType>("");
  const [solutionMethod, setSolutionMethod] = useState<string>("");
  const [error, setError] = useState("");

  const methodInfo = useMemo(() => {
    switch (method) {
      case "gaussian":
        return {
          title: "Gauss-Jordan Elimination",
          description: "Uses row operations to reduce matrix to reduced row echelon form (RREF). Works for all system types.",
          advantages: [
            "Handles any system size and type",
            "Can determine unique, infinite, or no solutions",
            "Shows complete solution analysis",
            "Works with non-square matrices"
          ],
          limitations: [
            "More computational steps than Cramer's rule for unique solutions",
            "Requires careful handling of floating-point precision"
          ],
          complexity: "O(n³) operations",
          bestFor: "General purpose, educational understanding of solution types",
          icon: <Book className="h-4 w-4" />
        };
      case "cramer":
        return {
          title: "Cramer's Rule",
          description: "Uses determinants to solve square systems. Only works when the system has a unique solution.",
          advantages: [
            "Direct formula for unique solutions",
            "Fast for small systems (n ≤ 3)",
            "Elegant mathematical approach",
            "Each variable solved independently"
          ],
          limitations: [
            "Only works for square matrices (n×n)",
            "Requires non-zero determinant",
            "Cannot handle infinite or no-solution cases",
            "Computationally expensive for large n"
          ],
          complexity: "O(n!·n) for determinant calculation",
          bestFor: "Small square systems with guaranteed unique solutions",
          icon: <Zap className="h-4 w-4" />
        };
      default:
        return null;
    }
  }, [method]);

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
      setSolution("");
      setSolutionType("");
      setSolutionMethod("");

      const numMatrix = matrix.map(row => row.map(cell => parseFloat(cell) || 0));
      const A = numMatrix.map(row => row.slice(0, -1));
      const b = numMatrix.map(row => row[row.length - 1]);
      
      let resultText = "";
      
      if (method === "gaussian") {
        const result = solveUsingGaussJordan(numMatrix);
        setSolutionType(result.type);
        setSolution(result.solution);
        setSolutionMethod("Gauss-Jordan Elimination");
      } 
      else if (method === "cramer") {
        if (A.length !== A[0].length) {
          throw new Error("Cramer's rule requires a square matrix (N variables, N equations).");
        }
        const detA = math.det(A);
        
        if (Math.abs(detA) < EPSILON) {
           // If det is 0, it could be "none" or "parametric".
           // We run Gauss-Jordan to find out which one.
          const result = solveUsingGaussJordan(numMatrix);
          setSolutionType(result.type);
          setSolution(result.solution);
          setSolutionMethod("Cramer's Rule");
          if (result.type === "none") setError("Determinant is zero. System has no solution.");
          if (result.type === "parametric") setError("Determinant is zero. System has infinite solutions.");
        } else {
          const cramerResult = [];
          for (let i = 0; i < size; i++) {
            const Ai = A.map(row => [...row]);
            for (let j = 0; j < size; j++) {
              Ai[j][i] = b[j];
            }
            const detAi = math.det(Ai);
            cramerResult.push(detAi / detA);
          }
          
          const variables = Array.from({ length: size }, (_, i) => String.fromCharCode(120 + i));
          resultText = cramerResult
            .map((val, idx) => `${variables[idx]} = ${val.toFixed(4)}`)
            .join("\n");
          
          setSolutionType("unique");
          setSolution(resultText);
          setSolutionMethod("Cramer's Rule");
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to solve system");
      setSolution("");
      setSolutionType("");
      setSolutionMethod("");
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
              <SelectItem value="gaussian">Gauss-Jordan Elimination</SelectItem>
              <SelectItem value="cramer">Cramer's Rule (Square Matrix Only)</SelectItem>
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
          <Label>
            {solutionMethod} (
            {solutionType === "unique" && "Unique Solution"}
            {solutionType === "parametric" && "Infinite Solutions"}
            {solutionType === "none" && "No Solution"}
            )
          </Label>
          <div className="mt-2 p-4 rounded-md border bg-secondary/50">
            <pre className="font-mono text-lg whitespace-pre-wrap">{solution}</pre>
          </div>
        </div>
      )}

      <Alert>
        <div className="flex items-start gap-3">
          {methodInfo?.icon}
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">
                {methodInfo?.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {methodInfo?.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-green-700 dark:text-green-400 mb-1"> Advantages:</p>
                <ul className="space-y-1 text-muted-foreground">
                  {methodInfo?.advantages.map((advantage, i) => (
                    <li key={i}>• {advantage}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-400 mb-1"> Limitations:</p>
                <ul className="space-y-1 text-muted-foreground">
                  {methodInfo?.limitations.map((limitation, i) => (
                    <li key={i}>• {limitation}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs">
              <div>
                <span className="font-medium">Complexity:</span>
                <span className="text-muted-foreground ml-1">{methodInfo?.complexity}</span>
              </div>
              <div>
                <span className="font-medium">Best for:</span>
                <span className="text-muted-foreground ml-1">{methodInfo?.bestFor}</span>
              </div>
            </div>
            
            {method === "cramer" && size !== matrix[0]?.length - 1 && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Cramer's rule requires a square matrix. Current matrix is {size}×{size+1}. 
                  {size > matrix[0]?.length - 1 ? " Reduce matrix size or use Gauss-Jordan." : " Matrix size is appropriate."}
                </p>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default SLESolver;