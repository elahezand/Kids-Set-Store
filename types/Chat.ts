import { IPagination } from "./common";

export interface IChatParticipant {
  _id: string;
  username?: string;
  phone?: string;
  profilePicture?: string | null;
}

export interface IConversationListing {
  _id: string;
  title: string;
  images?: string[];
  price?: number;
}

export interface IConversation {
  _id: string;
  participants: IChatParticipant[];
  listing?: IConversationListing | null;
  lastMessage?: {
    body: string;
    sender: string | null;
    sentAt: string | null;
  };
  unreadCount?: Record<string, number>;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  conversation: string;
  sender: string;
  body: string;
  attachments?: string[];
  readAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: IConversation[];
  pagination: IPagination;
}

export interface MessagesResponse {
  success: boolean;
  data: IMessage[];
  pagination: IPagination;
}

export interface SendMessagePayload {
  body: string;
  attachments?: string[];
}

export interface StartConversationPayload {
  recipientId: string;
  listingId?: string | null;
  message: string;
}
