import { ethers } from "ethers";

// ABI for the ENS resolver's contenthash function
const resolverAbi = [
  "function contenthash(bytes32 node) external view returns (bytes memory)",
];

// Function to get raw contentHash for an ENS name
async function getRawContentHash(ensName: string): Promise<string | null> {
  try {
    // Connect to Sepolia testnet provider (replace with your provider URL)
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/"
    );

    // Normalize the ENS name to get its node hash
    const node = ethers.namehash(ensName);

    // Get the resolver for the ENS name
    const resolver = await provider.getResolver(ensName);

    if (!resolver) {
      throw new Error(`No resolver found for ENS name: ${ensName} on Sepolia`);
    }

    // Create a contract instance for the resolver
    const resolverContract = new ethers.Contract(
      resolver.address,
      resolverAbi,
      provider
    );

    // Call the contenthash function directly with the node hash
    const rawContentHash = await resolverContract.contenthash(node);

    if (!rawContentHash || rawContentHash === "0x") {
      console.log(`No contentHash set for ENS name: ${ensName} on Sepolia`);
      return null;
    }

    return rawContentHash;
  } catch (error) {
    console.error(
      `Error fetching raw contentHash for ${ensName} on Sepolia:`,
      error
    );
    return null;
  }
}

// Example usage
(async () => {
  const ensName = "walrus.eth"; // Replace with your ENS name registered on Sepolia
  const rawContentHash = await getRawContentHash(ensName);
  console.log(`Raw contentHash for ${ensName} on Sepolia:`, rawContentHash);

  // Optionally, attempt to decode or analyze the contentHash
  if (rawContentHash) {
    try {
      // Try decoding with @ensdomains/content-hash
      const contentHash = require("@ensdomains/content-hash");
      const decoded = contentHash.decode(rawContentHash);
      console.log("Decoded contentHash:", decoded);
    } catch (decodeError) {
      console.log("Failed to decode contentHash:", decodeError.message);
      console.log("Raw contentHash (as is):", rawContentHash);
    }
  }
})();
