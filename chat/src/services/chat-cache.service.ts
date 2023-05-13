import config from "../env";
import CacheService from "../interfaces/cache.interface";
import { UserMessage } from "../types/user-message.type";

type UserMessageQueue = { [index: number]: UserMessage };
class ChatCacheService implements CacheService<UserMessage> {
  private data: UserMessageQueue = {};

  private head = -1;
  private tail = 0;
  private isAtLimit = false;

  private CACHE_LIMIT: number;

  constructor() {
    this.CACHE_LIMIT = config.messageCacheLimit || 20;
  }

  applyTransformation(transform: (element: UserMessage) => UserMessage): void {
    for (let [_, userMessage] of Object.entries(this.data)) {
      userMessage = transform(userMessage);
    }
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

export { ChatCacheService };
