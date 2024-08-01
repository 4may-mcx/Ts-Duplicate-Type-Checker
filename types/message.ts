export interface EventMessage {
  value: string;
}

export interface FileListMessage {
  value: string[];
}

export type DuplicateTypeMessage = Array<{
  typeSignature: string;
  occurrences: {
    file: string;
    name: string;
  }[];
}>;
