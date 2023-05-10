import CacheService from "../interfaces/cache.interface";
import { UserMessage } from "../types/user-message.type";

class ChatCacheService implements CacheService<UserMessage> {
  private data: { [index: number]: UserMessage } = {};
  private head = -1;
  private tail = 0;
  private isAtLimit = false;

  private CACHE_LIMIT: number;

  constructor() {
    this.CACHE_LIMIT = process.env.MESSAGE_CACHE_LIMIT
      ? Number(process.env.MESSAGE_CACHE_LIMIT)
      : 20;
  }

  public addMessage(userMessage: UserMessage): UserMessage {
    this.head++;
    this.data[this.head] = userMessage;

    if (this.isAtLimit) {
      delete this.data[this.tail];
      this.tail++;
    } else if (this.head - this.tail >= this.CACHE_LIMIT - 1) {
      this.isAtLimit = true;
    }

    return userMessage;
  }

  public getLastMessage(): UserMessage {
    return this.data[this.head];
  }

  public getAllMessages(): UserMessage[] {
    const messageList: UserMessage[] = [];

    for (let i = this.tail; i <= this.head; i++) {
      messageList.push(this.data[i]);
    }

    return messageList;
  }

  public clear(): void {
    this.data = {};
    this.head = -1;
    this.tail = 0;
    this.isAtLimit = false;
  }
}

const chatCacheService = new ChatCacheService();

export { chatCacheService };
