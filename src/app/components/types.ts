export type MessageType = {
  role: "user" | "assistant" | "developer";
  content: string;
};

export type ConversationExampleProps = {
  id: number;
  messages: MessageType[];
  title?: string;
  onUpdate: (id: number, messages: MessageType[]) => void;
  onDelete: (id: number) => void;
  onDuplicate?: (id: number, messages: MessageType[]) => void;
  onTitleChange?: (id: number, title: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (id: number, collapsed: boolean) => void;
};

export interface MessageProps {
  message: MessageType;
  onUpdate: (message: MessageType) => void;
  onDelete: () => void;
}
