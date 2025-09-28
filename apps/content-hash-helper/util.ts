function hexToBase36(hex: string): string {
  try {
    // Remove '0x' prefix if present
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

    // Validate hex string
    if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
      throw new Error("Invalid hexadecimal string");
    }

    // Convert hex to BigInt
    const bigIntValue = BigInt(`0x${cleanHex}`);

    // Convert BigInt to base36
    const base36 = bigIntValue.toString(36);

    return base36;
  } catch (error) {
    console.error("Error converting hex to base36:", error);
    return "";
  }
}

// Example usage with the provided hex string
const hexInput =
  "0x90b2d6059d67eeabaf2cb97d3f32bbdf4711e14aa6491f93bbb8f3784b1bdb97632b89e5";
// 0x9d67eeabaf2cb97d3f32bbdf4711e14aa6491f93bbb8f3784b1bdb97632b89e5
// 0x90b2d6059d67eeabaf2cb97d3f32bbdf4711e14aa6491f93bbb8f3784b1bdb97632b89e5
const base36Output = hexToBase36(hexInput);
console.log(`Hex: ${hexInput}`);
console.log(`Base36: ${base36Output}`);
