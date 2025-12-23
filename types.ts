
export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// Map API roles to display names
export const DisplayRole = {
  [Role.USER]: 'Lien',
  [Role.ASSISTANT]: 'Kael',
  [Role.SYSTEM]: 'System',
};

export interface FileAttachment {
  name: string;
  type: string; // MIME type
  url: string; // data URL for preview
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  files?: FileAttachment[];
}
