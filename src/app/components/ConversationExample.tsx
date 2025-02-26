"use client";

import React from "react";
import Message from "./Message";
import { MessageType, ConversationExampleProps } from "./types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy } from "lucide-react";

const ConversationExample: React.FC<ConversationExampleProps> = ({
  id,
  messages,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const addMessage = () => {
    const newMessages = [...messages, { role: "user" as const, content: "" }];
    onUpdate(id, newMessages);
  };

  const updateMessage = (index: number, updatedMessage: MessageType) => {
    const newMessages = [...messages];
    newMessages[index] = updatedMessage;
    onUpdate(id, newMessages);
  };

  const deleteMessage = (index: number) => {
    if (messages.length <= 1) {
      // Don't allow deleting the last message
      return;
    }
    const newMessages = messages.filter((_, i) => i !== index);
    onUpdate(id, newMessages);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">Example #{id + 1}</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDuplicate && onDuplicate(id, messages)}
            className="h-8 w-8 text-primary"
            aria-label="Duplicate example"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(id)}
            className="h-8 w-8 text-destructive"
            aria-label="Delete example"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            onUpdate={(updatedMessage: MessageType) =>
              updateMessage(index, updatedMessage)
            }
            onDelete={() => deleteMessage(index)}
          />
        ))}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={addMessage}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Message
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConversationExample;
