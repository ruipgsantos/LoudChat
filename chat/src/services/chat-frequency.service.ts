import CacheService from "../interfaces/cache.interface";
import { UserMessage } from "../types/UserMessage";
import { chatCacheService } from "./chat-cache.service";

class ChatFrequencyService {
  private readonly START_SIZE = 0;

  //memory db
  private _userFrequencies: { [id: string]: number } = {};
  private _messageCache: CacheService<UserMessage>;

  constructor(messageCache: CacheService<UserMessage>) {
    this._messageCache = messageCache;
  }

  //signal user activity
  public addUserMessage(message: string, id: string): UserMessage {
    if (this._userFrequencies[id] === undefined) {
      this._userFrequencies[id] = this.START_SIZE;
    } else {
      this._userFrequencies[id]++;
    }

    const userMessage: UserMessage = {
      message,
      size: this._userFrequencies[id],
    };
    this._messageCache.addMessage(userMessage);

    return userMessage;
  }

  public getLatestMessage(): UserMessage {
    return this._messageCache.getLastMessage();
  }

  public getAllMessages(): UserMessage[] {
    return this._messageCache.getAllMessages();
  }

  public clearMessages(): void {
    this._userFrequencies = {};
    this._messageCache.clear();
  }
}

const chatFrequencyService = new ChatFrequencyService(chatCacheService);

export { chatFrequencyService };
