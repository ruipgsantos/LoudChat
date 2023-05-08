process.env.MESSAGE_CACHE_LIMIT = "5";
import { chatCacheService } from "../chat-cache.service";

require("dotenv").config();

const usermsg1 = { message: "message1", size: 1 };
const usermsg2 = { message: "message2", size: 2 };

describe("Test message cache", () => {
  beforeEach(() => {
    chatCacheService.resetQueue();
  });

  it("should return empty list", () => {
    expect(chatCacheService.getAllMessages()).toEqual([]);
    expect(chatCacheService.getLastMessage()).toBeUndefined;
  });
  it("should return the last added message", () => {
    chatCacheService.addMessage(usermsg1);
    chatCacheService.addMessage(usermsg2);

    expect(chatCacheService.getLastMessage()).toEqual(usermsg2);
  });
  it("should return all the messages", () => {
    chatCacheService.addMessage(usermsg1);
    chatCacheService.addMessage(usermsg2);

    expect(chatCacheService.getAllMessages()).toEqual([usermsg1, usermsg2]);
  });
  it("should return only the last ", () => {
    chatCacheService.addMessage(usermsg1);
    chatCacheService.addMessage(usermsg2);

    expect(chatCacheService.getAllMessages()).toEqual([usermsg1, usermsg2]);
  });
  it.only(`should return the last inserted ${process.env.MESSAGE_CACHE_LIMIT} messages`, () => {
    for (let i = 0; i < 10; i++) {
      chatCacheService.addMessage({
        message: `message${i}`,
        size: i,
      });
    }

    const allMessages = chatCacheService.getAllMessages();
    expect(allMessages).toHaveLength(5);
    expect(allMessages[0]).toEqual({ message: "message5", size: 5 });
    expect(allMessages[4]).toEqual({ message: "message9", size: 9 });
  });
});
