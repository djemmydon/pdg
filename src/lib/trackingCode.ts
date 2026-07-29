import { randomInt } from "crypto";

// Excludes visually ambiguous characters (0/O, 1/I/L) since the code is
// read aloud, typed by hand, and printed in emails.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

export function generateTrackingCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `PDG-${code}`;
}
