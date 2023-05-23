import { ChatCacheService } from "../chat-cache.service";
import { ChatFrequencyService } from "../chat-frequency.service";

describe("chat frequency service tests", () => {
  let chatFrequencyService: ChatFrequencyService;

  beforeEach(() => {
    chatFrequencyService = new ChatFrequencyService(new ChatCacheService());
  });
  afterEach(() => {
    chatFrequencyService.shutDown();
  });

  it("should add subsequent messages and size should increase", async () => {
    await expect(
      chatFrequencyService.addUserMessage("message1", "id1")
    ).resolves.toEqual({
      message: "message1",
      size: 0,
    });
    await expect(
      chatFrequencyService.addUserMessage("message1", "id1")
    ).resolves.toEqual({
      message: "message1",
      size: 1,
    });
    await expect(
      chatFrequencyService.addUserMessage("message1", "id1")
    ).resolves.toEqual({
      message: "message1",
      size: 2,
    });
  });
  it("should get correct latest message size after adding twice", async () => {
    chatFrequencyService.addUserMessage("message1", "id1");
    chatFrequencyService.addUserMessage("message2", "id1");

    const allMsgs = await chatFrequencyService.getAllMessages();

    expect(allMsgs[1]).toEqual({
      message: "message2",
      size: 1,
    });
  });
});
