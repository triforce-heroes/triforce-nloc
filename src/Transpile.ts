import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import iconv from "iconv-lite";

import { Container } from "./types/Container.js";
import { Entry } from "./types/Entry.js";

const nlocHeaderLength = 20;

export function transpile(buffer: Buffer): Container {
  const entries: Entry[] = [];

  const headerConsumer = new BufferConsumer(buffer);

  headerConsumer.skip(4); // Header (always 0x12027020).

  const nlocLength = headerConsumer.readUnsignedInt32();

  headerConsumer.skipPadding(512); // Padding.
  headerConsumer.skip(4); // NLOC magic.
  headerConsumer.skip(4); // NLOC version (always 0x00000002).

  const nlocHash = headerConsumer.readUnsignedInt32();

  const entriesCount = headerConsumer.readUnsignedInt32();
  const entriesHeaderLength = 8 * entriesCount;

  headerConsumer.skip(4); // Unknown (always 0).

  const entriesOffset = headerConsumer.byteOffset + entriesHeaderLength;
  const entriesConsumer = new BufferConsumer(
    buffer.subarray(
      entriesOffset,
      entriesOffset + nlocLength - nlocHeaderLength - entriesHeaderLength,
    ),
  );

  for (let i = 0; i < entriesCount; i++) {
    const entryKey = headerConsumer.readUnsignedInt32();
    const entryOffset = headerConsumer.readUnsignedInt32();

    entriesConsumer.seek(entryOffset * 4);

    const entryLetters: Buffer[] = [];

    while (true) {
      const entryLetter = entriesConsumer.read(4);

      if (entryLetter.readUInt32LE() === 0) {
        break;
      }

      entryLetters.push(entryLetter);
    }

    entries.push([
      entryKey,
      iconv.decode(Buffer.concat(entryLetters), "utf-32le"),
    ]);
  }

  return [nlocHash, entries];
}
