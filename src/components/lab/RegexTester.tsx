import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Info, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MatchResult {
  match: string;
  index: number;
  groups?: string[];
  namedGroups?: Record<string, string>;
}

const RegexTester = () => {
  const [pattern, setPattern] = useState("\\b[A-Z]\\w+");
  const [flags, setFlags] = useState("g");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceText, setSourceText] = useState(
    "Hello World! This is a Sample Text for Testing Regular Expressions. It contains Various Words and Numbers like 123 and 456."
  );
  const [highlightedText, setHighlightedText] = useState("");
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");
  const [isValidPattern, setIsValidPattern] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      if (!pattern) {
        // If pattern is empty, show original text without highlighting
        setHighlightedText(
          sourceText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        );
        setError("");
        setSearchResults([]);
        setIsValidPattern(true);
        return;
      }

      // Ensure 'g' flag is included for multiple matches
      const finalFlags = flags.includes('g') ? flags : flags + 'g';
      const regex = new RegExp(pattern, finalFlags);
      const matches: MatchResult[] = [];
      
      // Escape HTML special chars *before* applying regex
      const safeSourceText = sourceText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Collect detailed match information
      let match;
      const globalRegex = new RegExp(pattern, finalFlags);
      while ((match = globalRegex.exec(sourceText)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups
        });
        
        // Prevent infinite loop for zero-length matches
        if (match[0].length === 0) {
          globalRegex.lastIndex++;
        }
      }

      setSearchResults(matches);

      // Apply highlighting to the safe text
      const highlighted = safeSourceText.replace(new RegExp(pattern, finalFlags), (match) => {
        return `<mark class="bg-secondary text-secondary-foreground px-1 rounded font-semibold">${match}</mark>`;
      });

      setHighlightedText(highlighted);
      setError(matches.length > 0 ? `${matches.length} matches found.` : "No matches found.");
      setIsValidPattern(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid regex pattern");
      setIsValidPattern(false);
      setSearchResults([]);
      // Show original text if regex error
      setHighlightedText(
        sourceText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      );
    }
  }, [pattern, flags, sourceText]);

  const filteredResults = searchTerm 
    ? searchResults.filter(result => 
        result.match.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : searchResults;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSourceText(text);
        toast({
          title: "File Loaded",
          description: `${file.name} loaded successfully.`,
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a .txt file.",
      });
    }

    // Reset file input
    if (e.target) e.target.value = "";
  };



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pattern">Regex Pattern</Label>
          <Input
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern"
            className={`font-mono ${!isValidPattern ? 'border-red-500' : ''}`}
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
        <div>
          <Label htmlFor="search">Filter Results</Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter matches in real-time"
            className="font-mono"
          />
        </div>
      </div>

      {error && (
        <Alert variant={error.includes("Invalid") || !isValidPattern ? "destructive" : "default"}>
          <AlertDescription className="flex items-center gap-2">
            {isValidPattern && searchResults.length > 0 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="sourceText">Source Text</Label>
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload .txt File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
          />
        </div>
        <Textarea
          id="sourceText"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter text to test"
          className="min-h-32 font-mono"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label>Preview (Matches Highlighted)</Label>
          <div
            className="min-h-32 p-4 rounded-md border bg-muted/50 font-mono text-sm whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>

        <div>
          <Label>Match Results</Label>
          <Card className="min-h-32">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Detailed Results</span>
                <div className="flex gap-2">
                  {searchTerm && (
                    <Badge variant="outline">{filteredResults.length} filtered</Badge>
                  )}
                  <Badge variant="secondary">{searchResults.length} total</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {filteredResults.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "No matches found for current filter" : "No matches found"}
                </p>
              ) : (
                filteredResults.map((result, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Match #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(result.match)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Text:</span>
                        <code className="bg-secondary px-2 py-1 rounded text-xs font-mono">
                          "{result.match}"
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Position:</span>
                        <Badge variant="outline" className="text-xs">
                          {result.index}-{result.index + result.match.length - 1}
                        </Badge>
                      </div>
                      {result.groups && result.groups.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium">Capture Groups:</span>
                          {result.groups.map((group, groupIndex) => (
                            group && (
                              <div key={groupIndex} className="ml-2 text-xs">
                                Group {groupIndex + 1}: <code className="bg-secondary px-1 rounded">{group}</code>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                      {result.namedGroups && Object.keys(result.namedGroups).length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium">Named Groups:</span>
                          {Object.entries(result.namedGroups).map(([name, value]) => (
                            <div key={name} className="ml-2 text-xs">
                              {name}: <code className="bg-secondary px-1 rounded">{value}</code>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Text Upload:</strong> Upload .txt files for testing, view detailed match results with positions and capture groups, and test specific search terms.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RegexTester;

