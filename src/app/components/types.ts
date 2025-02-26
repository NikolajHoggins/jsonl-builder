export type MessageType = {
  role: "user" | "assistant" | "developer";
  content: string;
};

export type ConversationExampleProps = {
  id: number;
  messages: MessageType[];
  onUpdate: (id: number, messages: MessageType[]) => void;
  onDelete: (id: number) => void;
};

export interface MessageProps {
  message: MessageType;
  onUpdate: (message: MessageType) => void;
  onDelete: () => void;
}
