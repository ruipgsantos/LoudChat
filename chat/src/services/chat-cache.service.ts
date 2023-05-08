type UserMessage = { message: string; size: number };

class ChatCacheService {
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

  public addMessage(userMessage: UserMessage) {
    this.head++;
    this.data[this.head] = userMessage;

    if (this.isAtLimit) {
      delete this.data[this.tail];
      this.tail++;
    } else if (this.head - this.tail >= this.CACHE_LIMIT - 1) {
      this.isAtLimit = true;
    }
  }

  public getLastMessage() {
    return this.data[this.head];
  }

  public getAllMessages() {
    const messageList: UserMessage[] = [];

    for (let i = this.tail; i <= this.head; i++) {
      messageList.push(this.data[i]);
    }

    return messageList;
  }

  public resetQueue() {
    this.data = {};
    this.head = -1;
    this.tail = 0;
    this.isAtLimit = false;
  }
}

const chatCacheService = new ChatCacheService();

export { chatCacheService };
