import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SummaryStatCards } from "./SummaryStatCards";

describe("SummaryStatCards", () => {
  it("renders the compact Kiini: One Hub. Total Control-style icon block used by the new dashboard cards", () => {
    const html = renderToStaticMarkup(
      <SummaryStatCards
        cards={[
          {
            label: "Total Work Orders",
            value: 0,
            color: "blue",
            progress: 50,
          },
        ]}
      />
    );

    expect(html).toContain("h-9");
    expect(html).toContain("w-9");
    expect(html).toContain("rounded-md");
  });
});
