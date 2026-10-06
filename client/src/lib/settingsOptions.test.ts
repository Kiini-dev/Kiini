import { describe, expect, it } from "vitest";
import { parseSettingsOptionList } from "./settingsOptions";

describe("parseSettingsOptionList", () => {
  it("reads custom UOM values from settings JSON arrays and preserves fallback values", () => {
    expect(parseSettingsOptionList(JSON.stringify(["Kg", "Boxes", { name: "Hours" }]), ["Hour"])).toEqual([
      "Kg",
      "Boxes",
      "Hours",
    ]);

    expect(parseSettingsOptionList("[]", ["Hour", "Day"])).toEqual(["Hour", "Day"]);
    expect(parseSettingsOptionList(null, ["Hour", "Day"])).toEqual(["Hour", "Day"]);
  });
});
