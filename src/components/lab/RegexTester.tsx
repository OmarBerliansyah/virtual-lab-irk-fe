import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const RegexTester = () => {
  const [pattern, setPattern] = useState("\\b[A-Z]\\w+");
  const [flags, setFlags] = useState("g");
  const [sourceText, setSourceText] = useState(
    "Hello World! This is a Sample Text for Testing Regular Expressions. It contains Various Words and Numbers like 123 and 456."
  );
  const [highlightedText, setHighlightedText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (!pattern) {
        setHighlightedText(sourceText);
        setError("");
        return;
      }

      const regex = new RegExp(pattern, flags);
      const highlighted = sourceText.replace(regex, (match) => {
        return `<mark class="bg-secondary text-secondary-foreground px-1 rounded">${match}</mark>`;
      });

      setHighlightedText(highlighted);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid regex pattern");
      setHighlightedText(sourceText);
    }
  }, [pattern, flags, sourceText]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pattern">Regex Pattern</Label>
          <Input
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern"
            className="font-mono"
          />
        </div>
        <div>
          <Label htmlFor="flags">Flags</Label>
          <Input
            id="flags"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="e.g., g, i, m"
            className="font-mono"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="sourceText">Source Text</Label>
        <Textarea
          id="sourceText"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter text to test"
          className="min-h-32 font-mono"
        />
      </div>

      <div>
        <Label>Results (Matches Highlighted)</Label>
        <div
          className="min-h-32 p-4 rounded-md border bg-muted/50 font-mono text-sm whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Common flags:</strong> g (global), i (case-insensitive), m (multiline).
          Matches are highlighted in real-time as you type.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RegexTester;
