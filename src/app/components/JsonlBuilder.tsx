"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import ConversationExample from "./ConversationExample";
import { MessageType } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy, Download, Upload, FileUp } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Example = {
  id: number;
  messages: MessageType[];
  title?: string;
};

type ImportMode = "overwrite" | "append";

// Define a type for the message in imported JSON
interface ImportedMessage {
  role: string;
  content: string;
  [key: string]: unknown;
}

// Memoized row component for better performance
const ExampleRow = memo(
  ({
    example,
    ...props
  }: {
    example: Example;
    onUpdate: (id: number, messages: MessageType[]) => void;
    onDelete: (id: number) => void;
    onDuplicate: (id: number, messages: MessageType[]) => void;
    onTitleChange: (id: number, title: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: (id: number, collapsed: boolean) => void;
  }) => {
    return (
      <ConversationExample
        id={example.id}
        messages={example.messages}
        title={example.title}
        {...props}
      />
    );
  }
);

ExampleRow.displayName = "ExampleRow";

const JsonlBuilder: React.FC = () => {
  const [examples, setExamples] = useState<Example[]>([
    {
      id: 0,
      messages: [{ role: "user", content: "" }],
      title: "Example 1",
    },
  ]);
  const [jsonlOutput, setJsonlOutput] = useState<string>("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("append");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsedExamples, setCollapsedExamples] = useState<
    Record<number, boolean>
  >({});

  // For performance optimization with large lists
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const jsonlGenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced JSONL generation
  useEffect(() => {
    // Clear any existing timeout
    if (jsonlGenerationTimeoutRef.current) {
      clearTimeout(jsonlGenerationTimeoutRef.current);
    }

    // Set a new timeout
    jsonlGenerationTimeoutRef.current = setTimeout(() => {
      const jsonl = examples
        .map((example) => {
          // Skip empty examples
          if (example.messages.every((msg) => msg.content.trim() === "")) {
            return null;
          }

          return JSON.stringify({
            title: example.title || `Example ${example.id + 1}`,
            messages: example.messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          });
        })
        .filter(Boolean)
        .join("\n");

      setJsonlOutput(jsonl);
    }, 500); // Increased debounce time for better performance

    return () => {
      if (jsonlGenerationTimeoutRef.current) {
        clearTimeout(jsonlGenerationTimeoutRef.current);
      }
    };
  }, [examples]);

  // Handle scroll to load more examples
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      const bottomThreshold = 200; // px from bottom

      if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
        // Load more examples when near bottom
        setVisibleRange((prev) => ({
          start: prev.start,
          end: Math.min(prev.end + 10, examples.length),
        }));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [examples.length]);

  // Reset visible range when examples change significantly
  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(20, examples.length) });
  }, [examples.length]);

  const addExample = useCallback(() => {
    const newId =
      examples.length > 0 ? Math.max(...examples.map((e) => e.id)) + 1 : 0;
    setExamples((prevExamples) => [
      ...prevExamples,
      {
        id: newId,
        messages: [{ role: "user", content: "" }],
        title: `Example ${newId + 1}`,
      },
    ]);

    // Ensure the new example is visible
    setVisibleRange((prev) => ({
      start: prev.start,
      end: Math.max(prev.end, examples.length + 1),
    }));
  }, [examples]);

  const updateExample = useCallback((id: number, messages: MessageType[]) => {
    setExamples((prevExamples) =>
      prevExamples.map((example) =>
        example.id === id ? { ...example, messages } : example
      )
    );
  }, []);

  const updateExampleTitle = useCallback((id: number, title: string) => {
    setExamples((prevExamples) =>
      prevExamples.map((example) =>
        example.id === id ? { ...example, title } : example
      )
    );
  }, []);

  const deleteExample = useCallback((id: number) => {
    setExamples((prevExamples) =>
      prevExamples.filter((example) => example.id !== id)
    );

    // Also remove from collapsed state
    setCollapsedExamples((prev) => {
      const newCollapsedExamples = { ...prev };
      delete newCollapsedExamples[id];
      return newCollapsedExamples;
    });
  }, []);

  const duplicateExample = useCallback(
    (id: number, messages: MessageType[]) => {
      setExamples((prevExamples) => {
        const newId =
          prevExamples.length > 0
            ? Math.max(...prevExamples.map((e) => e.id)) + 1
            : 0;

        // Create a deep copy of the messages
        const messagesCopy = JSON.parse(JSON.stringify(messages));

        // Find the index of the example to duplicate
        const exampleIndex = prevExamples.findIndex(
          (example) => example.id === id
        );
        const originalExample = prevExamples[exampleIndex];

        // Insert the new example after the original
        const newExamples = [...prevExamples];
        newExamples.splice(exampleIndex + 1, 0, {
          id: newId,
          messages: messagesCopy,
          title: `${
            originalExample.title || `Example ${originalExample.id + 1}`
          } (Copy)`,
        });

        return newExamples;
      });

      // Set the same collapsed state as the original
      setCollapsedExamples((prev) => ({
        ...prev,
        [examples.length]: prev[id] || false,
      }));

      toast.success("Example duplicated");
    },
    [examples.length]
  );

  const handleToggleCollapse = useCallback((id: number, collapsed: boolean) => {
    setCollapsedExamples((prev) => ({
      ...prev,
      [id]: collapsed,
    }));
  }, []);

  const downloadJsonl = useCallback(() => {
    if (!jsonlOutput) return;

    const blob = new Blob([jsonlOutput], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversation_data.jsonl";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("JSONL file downloaded successfully");
  }, [jsonlOutput]);

  const copyToClipboard = useCallback(() => {
    if (!jsonlOutput) return;
    navigator.clipboard
      .writeText(jsonlOutput)
      .then(() => {
        toast.success("JSONL copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard");
      });
  }, [jsonlOutput]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
      };
      reader.readAsText(file);
    },
    []
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processImport = useCallback(() => {
    if (!importText.trim()) {
      toast.error("No JSONL content to import");
      return;
    }

    try {
      // Split the input by newlines and parse each line as JSON
      const lines = importText.trim().split("\n");
      const parsedExamples: Example[] = [];
      let nextId = 0;

      setExamples((prevExamples) => {
        nextId =
          prevExamples.length > 0
            ? Math.max(...prevExamples.map((e) => e.id)) + 1
            : 0;

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line.trim());

            if (parsed && parsed.messages && Array.isArray(parsed.messages)) {
              // Validate each message has role and content
              const validMessages = parsed.messages.filter(
                (msg: ImportedMessage) =>
                  msg &&
                  typeof msg === "object" &&
                  (msg.role === "user" ||
                    msg.role === "assistant" ||
                    msg.role === "developer") &&
                  typeof msg.content === "string"
              );

              if (validMessages.length > 0) {
                parsedExamples.push({
                  id: nextId,
                  messages: validMessages as MessageType[],
                  title: parsed.title || `Example ${nextId + 1}`,
                });
                nextId++;
              }
            }
          } catch (lineError) {
            console.error("Error parsing line:", line, lineError);
            // Continue with other lines even if one fails
          }
        }

        if (parsedExamples.length === 0) {
          toast.error("No valid examples found in the imported content");
          return prevExamples;
        }

        // Update the examples based on the import mode
        if (importMode === "overwrite") {
          // Reset collapsed states
          setCollapsedExamples({});
          toast.success(
            `Imported ${parsedExamples.length} examples (replaced existing)`
          );
          return parsedExamples;
        } else {
          // Append mode
          toast.success(
            `Imported ${parsedExamples.length} examples (appended)`
          );
          return [...prevExamples, ...parsedExamples];
        }
      });

      // Close the dialog after successful import
      setImportDialogOpen(false);
      setImportText("");
    } catch (error) {
      console.error("Error processing import:", error);
      toast.error("Failed to process import");
    }
  }, [importText, importMode]);

  // Only render visible examples for performance
  const visibleExamples = examples.slice(visibleRange.start, visibleRange.end);

  return (
    <div ref={containerRef}>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Conversation Examples</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addExample}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add New Example
            </Button>
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Import JSONL</DialogTitle>
                  <DialogDescription>
                    Paste JSONL content or upload a JSONL file
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="importMode">Import Mode</Label>
                    <Select
                      value={importMode}
                      onValueChange={(value) =>
                        setImportMode(value as ImportMode)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select import mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="append">
                          Append to existing
                        </SelectItem>
                        <SelectItem value="overwrite">
                          Replace existing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jsonlContent">JSONL Content</Label>
                    <Textarea
                      id="jsonlContent"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder='{"messages": [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]}'
                      className="min-h-[200px]"
                    />
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={triggerFileInput}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FileUp className="h-4 w-4" />
                      Upload JSONL File
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".jsonl,.json,text/plain"
                      className="hidden"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setImportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={processImport}>Import</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {visibleExamples.map((example) => (
          <ExampleRow
            key={example.id}
            example={example}
            onUpdate={updateExample}
            onDelete={deleteExample}
            onDuplicate={duplicateExample}
            onTitleChange={updateExampleTitle}
            isCollapsed={collapsedExamples[example.id] || false}
            onToggleCollapse={handleToggleCollapse}
          />
        ))}

        {examples.length > visibleRange.end && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Scroll to load more examples
            </p>
          </div>
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">JSONL Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
              {jsonlOutput || "No valid examples to display"}
            </pre>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-1"
              disabled={!jsonlOutput}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={downloadJsonl}
              className="flex items-center gap-1"
              disabled={!jsonlOutput}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonlBuilder;
