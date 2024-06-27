import { readFileSync } from "node:fs";

import { expect, describe, it } from "vitest";

import { rebuild } from "../src/Rebuilder.js";
import { Entry } from "../src/types/Entry.js";

describe("rebuild", () => {
  const samples = [
    [0, [[20, "Hello"]], "sample-single.nloc"],
    [
      0,
      [
        [20, "Hello"],
        [40, "World!"],
      ],
      "sample-double.nloc",
    ],
  ] satisfies Array<[hash: number, entries: Entry[], file: string]>;

  it.each(samples)("rebuild(%j, %j)", (hash, entries, file) => {
    expect(rebuild(hash, entries)).toStrictEqual(
      readFileSync(`${__dirname}/fixtures/${file}`),
    );
  });
});
