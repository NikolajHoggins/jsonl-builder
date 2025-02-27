"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const ConversationExample: React.FC<ConversationExampleProps> = ({
  id,
  messages,
  title,
  onUpdate,
  onDelete,
  onDuplicate,
  onTitleChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed || false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || `Example ${id + 1}`);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Update local state when prop changes
  useEffect(() => {
    if (isCollapsed !== undefined) {
      setLocalCollapsed(isCollapsed);
    }
  }, [isCollapsed]);

  // Update local title when prop changes
  useEffect(() => {
    if (title) {
      setLocalTitle(title);
    }
  }, [title]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

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

  // Get a summary of the example for the collapsed view
  const getSummary = () => {
    const messageCount = messages.length;
    const firstMessage = messages[0]?.content || "";
    const truncatedContent =
      firstMessage.length > 60
        ? firstMessage.substring(0, 60) + "..."
        : firstMessage;

    return `${messageCount} message${
      messageCount !== 1 ? "s" : ""
    } - ${truncatedContent}`;
  };

  const toggleCollapse = () => {
    const newCollapsedState = !localCollapsed;
    setLocalCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(id, newCollapsedState);
    }
  };

  const startEditingTitle = () => {
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    if (onTitleChange && localTitle.trim() !== "") {
      onTitleChange(id, localTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setLocalTitle(title || `Example ${id + 1}`);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8"
            aria-label={localCollapsed ? "Expand example" : "Collapse example"}
          >
            {localCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                ref={titleInputRef}
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={saveTitle}
                className="h-8 w-[200px] text-lg font-medium"
                aria-label="Edit example title"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={saveTitle}
                className="h-8 w-8"
                aria-label="Save title"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <CardTitle className="text-lg font-medium">
                {localTitle}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditingTitle}
                className="h-6 w-6 opacity-50 hover:opacity-100"
                aria-label="Edit title"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}

          {localCollapsed && (
            <span className="text-sm text-muted-foreground ml-2">
              {getSummary()}
            </span>
          )}
        </div>
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

      <div className={cn(localCollapsed && "hidden")}>
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
      </div>
    </Card>
  );
};

export default ConversationExample;
