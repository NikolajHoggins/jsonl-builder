"use client";

import React, { useState, useEffect, useRef } from "react";
import ConversationExample from "./ConversationExample";
import { MessageType } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Copy,
  Download,
  Upload,
  FileUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
};

type ImportMode = "overwrite" | "append";

// Define a type for the message in imported JSON
interface ImportedMessage {
  role: string;
  content: string;
  [key: string]: unknown;
}

const JsonlBuilder: React.FC = () => {
  const [examples, setExamples] = useState<Example[]>([
    {
      id: 0,
      messages: [{ role: "user", content: "" }],
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
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Generate JSONL output whenever examples change
  useEffect(() => {
    const jsonl = examples
      .map((example) => {
        // Skip empty examples
        if (example.messages.every((msg) => msg.content.trim() === "")) {
          return null;
        }

        return JSON.stringify({
          messages: example.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });
      })
      .filter(Boolean)
      .join("\n");

    setJsonlOutput(jsonl);
  }, [examples]);

  const addExample = () => {
    const newId =
      examples.length > 0 ? Math.max(...examples.map((e) => e.id)) + 1 : 0;
    setExamples([
      ...examples,
      {
        id: newId,
        messages: [{ role: "user", content: "" }],
      },
    ]);
  };

  const updateExample = (id: number, messages: MessageType[]) => {
    setExamples(
      examples.map((example) =>
        example.id === id ? { ...example, messages } : example
      )
    );
  };

  const deleteExample = (id: number) => {
    setExamples(examples.filter((example) => example.id !== id));
    // Also remove from collapsed state
    const newCollapsedExamples = { ...collapsedExamples };
    delete newCollapsedExamples[id];
    setCollapsedExamples(newCollapsedExamples);
  };

  const duplicateExample = (id: number, messages: MessageType[]) => {
    const newId =
      examples.length > 0 ? Math.max(...examples.map((e) => e.id)) + 1 : 0;

    // Create a deep copy of the messages
    const messagesCopy = JSON.parse(JSON.stringify(messages));

    // Find the index of the example to duplicate
    const exampleIndex = examples.findIndex((example) => example.id === id);

    // Insert the new example after the original
    const newExamples = [...examples];
    newExamples.splice(exampleIndex + 1, 0, {
      id: newId,
      messages: messagesCopy,
    });

    setExamples(newExamples);

    // Set the same collapsed state as the original
    setCollapsedExamples({
      ...collapsedExamples,
      [newId]: collapsedExamples[id] || false,
    });

    toast.success("Example duplicated");
  };

  const handleToggleCollapse = (id: number, collapsed: boolean) => {
    setCollapsedExamples({
      ...collapsedExamples,
      [id]: collapsed,
    });
  };

  const toggleCollapseAll = () => {
    const newCollapsedState = !allCollapsed;
    setAllCollapsed(newCollapsedState);

    // Create a new object with all examples set to the new state
    const newCollapsedExamples: Record<number, boolean> = {};
    examples.forEach((example) => {
      newCollapsedExamples[example.id] = newCollapsedState;
    });

    setCollapsedExamples(newCollapsedExamples);
  };

  const downloadJsonl = () => {
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
  };

  const copyToClipboard = () => {
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processImport = () => {
    if (!importText.trim()) {
      toast.error("No JSONL content to import");
      return;
    }

    try {
      // Split the input by newlines and parse each line as JSON
      const lines = importText.trim().split("\n");
      const parsedExamples: Example[] = [];
      let nextId =
        examples.length > 0 ? Math.max(...examples.map((e) => e.id)) + 1 : 0;

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
                id: nextId++,
                messages: validMessages as MessageType[],
              });
            }
          }
        } catch (lineError) {
          console.error("Error parsing line:", line, lineError);
          // Continue with other lines even if one fails
        }
      }

      if (parsedExamples.length === 0) {
        toast.error("No valid examples found in the imported content");
        return;
      }

      // Update the examples based on the import mode
      if (importMode === "overwrite") {
        setExamples(parsedExamples);
        // Reset collapsed states
        setCollapsedExamples({});
        toast.success(
          `Imported ${parsedExamples.length} examples (overwrite mode)`
        );
      } else {
        // Append mode
        setExamples([...examples, ...parsedExamples]);
        toast.success(
          `Imported ${parsedExamples.length} examples (append mode)`
        );
      }

      // Close the dialog and reset the import text
      setImportDialogOpen(false);
      setImportText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing JSONL:", error);
      toast.error("Failed to import JSONL. Please check the format.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">JSONL Builder</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapseAll}
            className="flex items-center gap-1 ml-4"
            aria-label={
              allCollapsed ? "Expand all examples" : "Collapse all examples"
            }
          >
            {allCollapsed ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Expand All</span>
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Collapse All</span>
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Import JSONL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Import JSONL</DialogTitle>
                <DialogDescription>
                  Paste JSONL content or upload a JSONL file to import examples.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="import-mode">Import Mode</Label>
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
                        Append to existing examples
                      </SelectItem>
                      <SelectItem value="overwrite">
                        Overwrite existing examples
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="jsonl-content">JSONL Content</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      className="flex items-center gap-1"
                    >
                      <FileUp className="h-4 w-4" />
                      Upload File
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".jsonl,.json,text/plain"
                      className="hidden"
                    />
                  </div>
                  <Textarea
                    id="jsonl-content"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"messages": [{"role": "user", "content": "example content"}]}'
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={processImport}>
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={addExample} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add New Example
          </Button>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {examples.map((example) => (
          <ConversationExample
            key={example.id}
            id={example.id}
            messages={example.messages}
            onUpdate={updateExample}
            onDelete={deleteExample}
            onDuplicate={duplicateExample}
            isCollapsed={collapsedExamples[example.id]}
            onToggleCollapse={handleToggleCollapse}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">JSONL Output</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!jsonlOutput}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={downloadJsonl}
                disabled={!jsonlOutput}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
            {jsonlOutput ||
              "No valid examples yet. Add content to see JSONL output."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonlBuilder;
