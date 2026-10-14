import { describe, it, expect } from "vitest";
import { firstCharacterToUpperCase } from "../../src/helpers.js";

describe("firstCharacterToUpperCase", () => {
  it.each([
    ["", ""],
    ["aBc", "ABc"],
    ["ABC", "ABC"],
    ["1abc", "1abc"],
  ])("should transform %j into %j", (input, expected) => {
    expect(firstCharacterToUpperCase(input)).toBe(expected);
  });

  it.each([123, null, undefined, {}, []])("should reject %j", (value) => {
    expect(() => firstCharacterToUpperCase(value)).toThrow(TypeError);
  });
});
