import { chatFrequencyService } from "../chat-frequency.service";

describe("chat frequency service tests", () => {
  beforeEach(() => {
    chatFrequencyService.clearMessages();
  });

  it("should add subsequent messages and size should increase", () => {
    expect(chatFrequencyService.addUserMessage("message1", "id1")).toEqual({
      message: "message1",
      size: 0,
    });
    expect(chatFrequencyService.addUserMessage("message1", "id1")).toEqual({
      message: "message1",
      size: 1,
    });
    expect(chatFrequencyService.addUserMessage("message1", "id1")).toEqual({
      message: "message1",
      size: 2,
    });
  });
  it("should get correct latest message size after adding twice", () => {
    chatFrequencyService.addUserMessage("message1", "id1");
    chatFrequencyService.addUserMessage("message2", "id1");

    expect(chatFrequencyService.getLatestMessage()).toEqual({
      message: "message2",
      size: 1,
    });
  });
});
