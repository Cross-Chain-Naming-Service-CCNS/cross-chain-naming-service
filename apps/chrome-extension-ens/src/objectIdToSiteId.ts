// Base36 alphabet: 0-9, a-z
const BASE36_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export function bytesToBase36(bytes: Buffer): string {
  // Validate input
  if (!(bytes instanceof Buffer) || bytes.length === 0) {
    throw new Error("Invalid input: bytes must be a non-empty Buffer");
  }

  // Convert bytes to a big integer
  let value = BigInt("0x" + bytes.toString("hex"));

  // Convert to base36
  let result = "";
  while (value > 0) {
    const remainder = Number(value % 36n);
    result = BASE36_ALPHABET[remainder] + result;
    value = value / 36n;
  }

  // Return '0' for zero value, otherwise the result
  return result || "0";
}

// Main function to convert ObjectID to Base36
export function idToBase36(id_long: string | Buffer): string {
  const id = id_long.slice(8);
  try {
    // Convert input to Buffer if it's a hex string
    let bytes: Buffer;
    if (typeof id === "string") {
      // Validate hex string (64 chars for 32 bytes)
      if (!/^[0-9a-fA-F]{64}$/.test(id)) {
        throw new Error(
          "Invalid ObjectID: must be a 64-character hexadecimal string"
        );
      }
      bytes = Buffer.from(id, "hex");
    } else if (id instanceof Buffer) {
      if (id.length !== 32) {
        throw new Error("Invalid ObjectID: Buffer must be 32 bytes");
      }
      bytes = id;
    } else {
      throw new Error("Invalid input: ObjectID must be a hex string or Buffer");
    }

    return bytesToBase36(bytes);
  } catch (error) {
    throw new Error(`Failed to convert to Base36: ${error.message}`);
  }
}

// // Example usage
// try {
//   const id = "9d67eeabaf2cb97d3f32bbdf4711e14aa6491f93bbb8f3784b1bdb97632b89e5";
//   const base36 = idToBase36(id);
//   console.log(base36); // Outputs the Base36-encoded string
// } catch (error) {
//   console.error(error.message);
// }
