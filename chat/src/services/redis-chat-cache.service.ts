import { UserMessage } from "../types/user-message.type";
import CacheService from "../interfaces/cache.interface";
import config from "../env";
import { createClient, RedisClientType } from "redis";

/**
 * This implementation of UserMessage cache needs a HashMap to represent the data and
 * a List to keep track of the order and set a limit on the memory used
 */

//TODO: consider using decorators for connect/disconnect
export default class RedisChatCache implements CacheService<UserMessage> {
  private readonly MESSAGE_LIST = "UserMessageList";

  private _client: RedisClientType;
  private isAtLimit = false;
  private CACHE_LIMIT: number;

  public constructor() {
    const redisConf = config.redis;
    this._client = createClient({
      socket: {
        host: redisConf.host,
        port: redisConf.port,
      },
      password: redisConf.password,
    });

    this._client.on("error", (err: any) => {
      console.log(`redis error: ${err}`);
    });

    this.CACHE_LIMIT = config.messageCacheLimit || 20;
  }

  async addMessage(userMessage: UserMessage): Promise<UserMessage> {
    try {
      const currSize = await this._client.lPush(
        this.MESSAGE_LIST,
        JSON.stringify(userMessage)
      );

      this.isAtLimit = currSize >= this.CACHE_LIMIT;

      if (this.isAtLimit) {
        //pop tail from list and delete from hash
        await this._client.rPop(this.MESSAGE_LIST);
      }
    } catch (err) {
      console.error(err);
    }

    return userMessage;
  }

  async getAllMessages(): Promise<UserMessage[]> {
    try {
      const userMessagesArr = await this._client.lRange(
        this.MESSAGE_LIST,
        0,
        -1
      );

      const userMessages: UserMessage[] = [];

      userMessagesArr.forEach((str) => {
        userMessages.push(JSON.parse(str));
      });

      return userMessages.reverse();
    } catch (err) {
      console.error(err);
    }

    return [];
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }

  private stringsToUserMessages(strUserMessages: string[]): UserMessage[] {
    const userMessages: UserMessage[] = [];

    strUserMessages.forEach((str) => {
      userMessages.push(JSON.parse(str));
    });

    return userMessages;
  }

  async applyTransformation(
    transform: (element: UserMessage) => UserMessage
  ): Promise<void> {
    try {
      const lpushCommand = ["lpush", this.MESSAGE_LIST];
      const elementsToPush = [];

      const userMessagesArr = await this._client.lRange(
        this.MESSAGE_LIST,
        0,
        -1
      );

      const userMessages = this.stringsToUserMessages(userMessagesArr);

      for (let i = userMessages.length - 1; i >= 0; i--) {
        const usrMsg = userMessages[i];
        const newUsrMsg = transform(usrMsg);
        elementsToPush.push(JSON.stringify(newUsrMsg));
      }

      if (elementsToPush && elementsToPush.length > 0) {
        await this._client.del(this.MESSAGE_LIST);
        await this._client.sendCommand([...lpushCommand, ...elementsToPush]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async startup(): Promise<void> {
    await this._client.connect();
  }
  public async shutdown(): Promise<void> {
    await this._client.disconnect();
  }
}
