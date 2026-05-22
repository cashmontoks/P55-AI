
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
  TOOL = 'tool'
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  groundingLinks?: GroundingLink[];
  functionCalls?: any[];
  toolResponses?: any[];
  thinking?: string;
  userIcon?: string; // Base64 or URL for custom icon
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
}

export interface CustomTool {
  id: string;
  name: string;
  description: string;
  parameters: any; // The JSON schema for parameters
}

export enum AppMode {
  GENERAL = 'general',
  NEWS = 'news',
  LEARNING = 'learning',
  DEVELOPER = 'developer'
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}
