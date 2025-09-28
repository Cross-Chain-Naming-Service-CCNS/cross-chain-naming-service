Pull Requests for ENS Integration with Walrus Sites
The following pull requests (PRs) enable the integration of Walrus, a Sui-based decentralized storage protocol, with the Ethereum Name Service (ENS), allowing EVM builders to host and resolve Walrus Sites (decentralized websites) under ENS domains (e.g., yourname.eth) on the Sepolia testnet and eventually mainnet. The integration introduces a custom walrus-site-ns multicodec to store hex-encoded Walrus site object IDs in the ENS contenthash field, converts these IDs to base36 for URL-friendly subnames (e.g., [base36_id].your-portal.eth.limo), and updates ENS libraries and tools to support resolution in browsers via a Chrome extension. A Fluence-deployed Walrus portal serves the content, leveraging web workers for efficient fetching.
1. Multicodec Registry Update

Repository: multiformats/multicodec
PR: #391
Changes:
Added a new multicodec entry for walrus-site-ns with protoCode 0xb59910 (or finalized code post-review).
Format: <varint protoCode><hex-encoded site object ID> for encoding Walrus site object IDs (Sui-based, representing full websites).
Purpose: Enables standardized encoding/decoding of Walrus site IDs in ENS contenthash fields, ensuring compatibility with multiformat standards.


Status: Awaiting review; mock protoCode used for testing.

2. Content-Hash Library Enhancement

Repository: ensdomains/content-hash
PR: #16
Changes:
Added walrus-ns profile to src/profiles.ts:
Encode: Converts hex site ID (e.g., 0x1a2b3c4d...) to bytes using hexStringToBytes.
Decode: Converts bytes back to hex (0x${bytesToHexString(bytes)}).


Updated src/index.ts to export the new profile.
Added tests in tests/content-hash.test.ts to verify encoding/decoding (e.g., encode('0x1a2b3c...') and decode(encoded)).
Updated README.md to document walrus-ns usage.


Purpose: Extends the @ensdomains/content-hash library to support encoding/decoding Walrus site object IDs for ENS contenthash.

3. ENS App UI Support

Repository: ensdomains/ens-app-v3
PR: #1064
Changes:
Updated package.json to depend on the modified @ensdomains/content-hash.
Modified src/utils/contenthash.ts to add walrus-ns to contentHashToProtocols and validate hex site IDs (regex: /^0x[a-fA-F0-9]+$/).
Enhanced src/features/records/ to support inputting hex site IDs in the UI (e.g., 0x1a2b3c4d...) for setting contenthash.
Added end-to-end tests in tests/e2e/makeName.spec.ts for Walrus contenthash setting.


Purpose: Enables users to set and manage Walrus site object IDs as contenthash records in the ENS Manager App, with proper validation and UI integration.

4. ENSJS Library Update

Repository: ensdomains/ensjs
PR: #260
Changes:
Updated package.json to use the modified @ensdomains/content-hash.
Ensured src/functions/contenthash.ts supports walrus-ns decoding via the updated library.
Added tests in tests/ to verify getContenthash returns the correct hex site ID (e.g., 0x1a2b3c4d...).


Purpose: Ensures the ensjs library can resolve Walrus site contenthashes, maintaining compatibility with ENS tools and clients.

Project Context
These PRs are part of a broader effort to enable EVM builders to host Walrus Sites (decentralized websites on Sui) under ENS domains. The workflow is:

Hosting: Builders use Walrus' site-builder CLI to publish a site, generating a hex site object ID (e.g., 0x1a2b3c4d...).
Base36 Subnames: The hex ID is converted to base36 (e.g., k2t6wyfsu4pfw...) for URL-friendly subnames (e.g., [base36_id].your-portal.eth.limo).
Fluence Portal: A decentralized Walrus portal, deployed via Fluence, resolves subnames to site content using Walrus SDK and Sui RPC.
Chrome Extension: A Manifest V3 extension intercepts .eth navigation, queries contenthash on Sepolia, decodes to hex ID, converts to base36, builds the portal URL, and renders content using web workers for performance.
Testing: Validated on Sepolia with a test domain (walrustest.eth) and a sample site (<h1>Test Walrus Site</h1>).

Next Steps

Review and Merge: Engage with maintainers to address feedback and finalize protoCode allocation.
Mainnet Migration: Adapt for Ethereum mainnet and Walrus mainnet for production use.
Ecosystem Adoption: Propose an ENSIP in ensdomains/ensips to formalize walrus-site-ns support.
Documentation: Update ensdomains/docs with Walrus integration guides.

This integration bridges Ethereum (ENS) and Sui (Walrus) ecosystems, leveraging Fluence for decentralized portal hosting, to provide a seamless, scalable solution for decentralized website hosting under ENS names.
