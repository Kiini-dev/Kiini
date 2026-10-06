import { appendCannedResponse, cannedResponseToText } from "./CannedResponsePicker";

describe("canned response draft helpers", () => {
  it("converts formatted HTML into readable plain text", () => {
    expect(cannedResponseToText("<p>Hello <strong>there</strong></p><ul><li>First</li><li>Second</li></ul>"))
      .toBe("Hello there\n- First\n- Second");
  });

  it("appends plain-text responses without replacing the existing draft", () => {
    expect(appendCannedResponse("Existing draft", "Saved response"))
      .toBe("Existing draft\n\nSaved response");
  });

  it("appends rich responses to an existing HTML draft", () => {
    expect(appendCannedResponse("<p>Existing draft</p>", "<p>Saved <strong>response</strong></p>", "html"))
      .toBe("<p>Existing draft</p><p></p><p>Saved <strong>response</strong></p>");
  });
});
