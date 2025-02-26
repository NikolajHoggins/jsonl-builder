"use client";

import React from "react";
import { MessageType, MessageProps } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Message: React.FC<MessageProps> = ({ message, onUpdate, onDelete }) => {
  const handleRoleChange = (value: string) => {
    const role = value as MessageType["role"];
    onUpdate({ ...message, role });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...message, content: e.target.value });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <Select value={message.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive"
            aria-label="Delete message"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Content
          </Label>
          <Textarea
            id="content"
            value={message.content}
            onChange={handleContentChange}
            placeholder="Enter message content..."
            className="min-h-[100px] resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Message;
