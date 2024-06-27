import { readFileSync } from "node:fs";

import { expect, describe, it } from "vitest";

import { transpile } from "../src/Transpile.js";
import { Entry } from "../src/types/Entry.js";

describe("transpile", () => {
  const samples = [
    ["sample-single.nloc", 0, [[20, "Hello"]]],
    [
      "sample-double.nloc",
      0,
      [
        [20, "Hello"],
        [40, "World!"],
      ],
    ],
  ] satisfies Array<[file: string, hash: number, entries: Entry[]]>;

  it.each(samples)("transpile(%j)", (file, hash, entries) => {
    expect(
      transpile(readFileSync(`${__dirname}/fixtures/${file}`)),
    ).toStrictEqual([hash, entries]);
  });
});
