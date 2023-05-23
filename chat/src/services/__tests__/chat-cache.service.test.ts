process.env.MESSAGE_CACHE_LIMIT = "5";
import { UserMessage } from "../../types/user-message.type";
import { ChatCacheService } from "../chat-cache.service";

require("dotenv").config();

const usermsg1 = { message: "message1", size: 1 };
const usermsg2 = { message: "message2", size: 2 };

describe("Test message cache", () => {
  let chatCacheService: ChatCacheService;

  beforeAll(() => {
    chatCacheService = new ChatCacheService();
  });

  beforeEach(() => {
    chatCacheService.clear();
  });

  it("should return empty list", async () => {
    await expect(chatCacheService.getAllMessages()).resolves.toEqual([]);
  });

  it("should return all the messages", async () => {
    chatCacheService.addMessage(usermsg1);
    chatCacheService.addMessage(usermsg2);

    await expect(chatCacheService.getAllMessages()).resolves.toEqual([
      usermsg1,
      usermsg2,
    ]);
  });
  it("should return only the last ", async () => {
    await chatCacheService.addMessage(usermsg1);
    await chatCacheService.addMessage(usermsg2);

    await expect(chatCacheService.getAllMessages()).resolves.toEqual([
      usermsg1,
      usermsg2,
    ]);
  });
  it(`should return the last inserted ${process.env.MESSAGE_CACHE_LIMIT} messages`, async () => {
    for (let i = 0; i < 10; i++) {
      chatCacheService.addMessage({
        message: `message${i}`,
        size: i,
      });
    }

    const allMessages = await chatCacheService.getAllMessages();
    expect(allMessages).toHaveLength(5);
    expect(allMessages[0]).toEqual({ message: "message5", size: 5 });
    expect(allMessages[4]).toEqual({ message: "message9", size: 9 });
  });
  it(`should perform transformation successfully`, async () => {
    for (let i = 0; i < 5; i++) {
      chatCacheService.addMessage({
        message: `message${i}`,
        size: 0,
      });
    }

    const allMessages = await chatCacheService.getAllMessages();
    allMessages.forEach((um) => expect(um.size).toEqual(0));

    chatCacheService.applyTransformation((um: UserMessage) => {
      const umcopy = um;
      umcopy.size++;
      return umcopy;
    });

    allMessages.forEach((um) => expect(um.size).toEqual(1));
  });
});
