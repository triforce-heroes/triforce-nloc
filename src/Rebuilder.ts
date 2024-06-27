import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";
import iconv from "iconv-lite";

import { Entry } from "./types/Entry.js";

export function rebuild(hash: number, entries: Entry[]) {
  const offsetsBuilder = new BufferBuilder();
  const textsBuilder = new BufferBuilder();

  offsetsBuilder.writeString("NLOC"); // NLOC magic.
  offsetsBuilder.writeUnsignedInt32(0x00_00_00_02); // NLOC version.
  offsetsBuilder.writeUnsignedInt32(hash); // NLOC language hash.
  offsetsBuilder.writeUnsignedInt32(entries.length); // NLOC entries count.
  offsetsBuilder.writeUnsignedInt32(0x00_00_00_00); // Unknown.

  for (const [entryKey, entryMessage] of entries) {
    offsetsBuilder.writeUnsignedInt32(entryKey); // Entry key.
    offsetsBuilder.writeUnsignedInt32(textsBuilder.length / 4); // Entry offset.

    textsBuilder.writeString(iconv.encode(entryMessage, "utf-32le"));
    textsBuilder.writeUnsignedInt32(0);
  }

  offsetsBuilder.push(textsBuilder.build());

  const headerBuilder = new BufferBuilder();

  headerBuilder.writeUnsignedInt32(0x12_02_70_20);
  headerBuilder.writeUnsignedInt32(offsetsBuilder.length);
  headerBuilder.pad(512);

  offsetsBuilder.pad(512);

  return Buffer.concat([headerBuilder.build(), offsetsBuilder.build()]);
}
