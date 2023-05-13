import config from "../env";
import Observable from "../interfaces/observable.interface";
import Observer from "../interfaces/observer.interface";
import CacheService from "../interfaces/cache.interface";
import { UserMessage } from "../types/user-message.type";
import { chatCacheService } from "./chat-cache.service";

require("dotenv").config();

class ChatFrequencyService implements Observable {
  private readonly START_SIZE = 0;

  private _subscribers: Observer[] = [];

  //memory db
  private _userFrequencies: { [id: string]: number } = {};
  private _userTickers: { [id: string]: NodeJS.Timer } = {};
  private _userTickerTimes: { [id: string]: number } = {};
  private _messageCache: CacheService<UserMessage>;

  constructor(messageCache: CacheService<UserMessage>) {
    this._messageCache = messageCache;

    //main cache down ticker
    setInterval(() => {
      this.tickDown();
    }, config.ticker || 60000);
  }

  subscribe(observer: Observer): void {
    this._subscribers.push(observer);
  }

  //signal user activity
  public addUserMessage(message: string, id: string): UserMessage {
    if (this._userFrequencies[id] === undefined) {
      this._userFrequencies[id] = this.START_SIZE;

      //user's first message
      //create user ticker with 60 seconds rate of decrease
      this._userTickerTimes[id] = 60000;

      this._userTickers[id] = setInterval(() => {
        if (this._userFrequencies[id] > 0) {
          this._userFrequencies[id]--;
        }
      }, this._userTickerTimes[id]);
    } else {
      //every time a message is added
      //increase frequency (size)
      this._userFrequencies[id]++;

      //increase rate at which the size will tick down
      this.refreshUserTicker(id);
    }

    const userMessage: UserMessage = {
      message,
      size: this._userFrequencies[id],
    };
    this._messageCache.addMessage(userMessage);

    return userMessage;
  }

  private refreshUserTicker(id: string) {
    //halve time to next tick down
    if (this._userTickerTimes[id] > 5000) {
      this._userTickerTimes[id] /= 2;
    }

    clearInterval(this._userTickers[id]);
    this._userTickers[id] = setInterval(() => {
      if (this._userFrequencies[id] > 0) {
        this._userFrequencies[id]--;
      }

      //once ticked, decrease rate
      if (this._userTickerTimes[id] < 10000) {
        this._userTickerTimes[id] *= 2;
      }
    }, this._userTickerTimes[id]);
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

  public tickDown(): void {
    this._messageCache.applyTransformation((userMessage: UserMessage) => {
      userMessage.size > 0 && userMessage.size--;
      return userMessage;
    });

    this._subscribers.forEach((s) => s.publish());
  }
}

const chatFrequencyService = new ChatFrequencyService(chatCacheService);

export { chatFrequencyService };
