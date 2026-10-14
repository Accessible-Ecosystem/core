import { describe, it, expect } from "vitest";
import { firstCharacterToLowerCase } from "../../src/helpers.js";

describe("firstCharacterToLowerCase", () => {
  it.each([
    ["", ""],
    ["aBc", "aBc"],
    ["ABC", "aBC"],
    ["1abc", "1abc"],
  ])("should transform %j into %j", (input, expected) => {
    expect(firstCharacterToLowerCase(input)).toBe(expected);
  });

  it.each([123, null, undefined, {}, []])("should reject %j", (value) => {
    expect(() => firstCharacterToLowerCase(value)).toThrow(TypeError);
  });
});
