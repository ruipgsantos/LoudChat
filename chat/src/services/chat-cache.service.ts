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

  async applyTransformation(
    transform: (element: UserMessage) => UserMessage
  ): Promise<void> {
    for (let [_, userMessage] of Object.entries(this.data)) {
      userMessage = transform(userMessage);
    }
  }

  public async addMessage(userMessage: UserMessage): Promise<UserMessage> {
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

  public async getAllMessages(): Promise<UserMessage[]> {
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

  public async startup(): Promise<void> {}
  public async shutdown(): Promise<void> {
    this.clear();
  }
}

export { ChatCacheService };
