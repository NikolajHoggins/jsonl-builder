"use client";

import React, { useState, useEffect } from "react";
import ConversationExample from "./ConversationExample";
import { MessageType } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy, Download } from "lucide-react";
import { toast } from "sonner";

type Example = {
  id: number;
  messages: MessageType[];
};

const JsonlBuilder: React.FC = () => {
  const [examples, setExamples] = useState<Example[]>([
    {
      id: 0,
      messages: [{ role: "user", content: "" }],
    },
  ]);
  const [jsonlOutput, setJsonlOutput] = useState<string>("");

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
    toast.success("Example duplicated");
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">JSONL Builder</h1>
        <Button onClick={addExample} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add New Example
        </Button>
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
