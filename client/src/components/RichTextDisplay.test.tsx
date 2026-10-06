import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichTextDisplay } from "./RichTextEditor";

describe("RichTextDisplay", () => {
  it("renders paragraphs, inline formatting, lists, and tables", () => {
    const { container } = render(
      <RichTextDisplay
        html="<p>First <strong>formatted</strong> paragraph</p><ul><li>List item</li></ul><table><tbody><tr><td>Cell</td></tr></tbody></table>"
      />,
    );

    expect(container.querySelector("p")?.textContent).toContain("First formatted paragraph");
    expect(container.querySelector("strong")?.textContent).toBe("formatted");
    expect(container.querySelector("ul li")?.textContent).toBe("List item");
    expect(container.querySelector("table td")?.textContent).toBe("Cell");
  });

  it("sanitizes scripts, event handlers, and unsafe link protocols", () => {
    const { container } = render(
      <RichTextDisplay
        html={'<p onclick="alert(1)">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">link</a>'}
      />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("p")?.hasAttribute("onclick")).toBe(false);
    expect(container.querySelector("a")?.getAttribute("href")).toBeNull();
    expect(container.textContent).toContain("Safe");
  });

  it("continues to display plain text", () => {
    const { container } = render(<RichTextDisplay html="Plain text" />);

    expect(container.textContent).toBe("Plain text");
  });
});
