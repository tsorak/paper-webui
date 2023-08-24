export interface PlayerSentMessage {
  playername: string;
  message: string;
  timestamp: string;
  command?: {
    commandName: string;
    args: string[];
  };
}

export interface ServerSentMessage {
  message: string;
  timestamp: string;
}
