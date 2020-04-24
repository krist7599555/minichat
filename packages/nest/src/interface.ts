export interface ChatState {
  latest: Date;
  subscribe: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  display_name: string;
  rooms: Record<string, ChatState>;
}
export interface Room {
  id: string;
  title: string;
}
export interface RoomExtend extends Room {
  unreads?: number;
  latest_message?: string;
}
export interface Message {
  userid: string;
  roomid: string;
  text: string;
  time: Date;
}
