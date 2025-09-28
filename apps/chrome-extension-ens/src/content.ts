interface InfuraResponse {
  jsonrpc: string;
  id: number;
  result: string;
}

interface ENSCallParams {
  to: string;
  data: string;
}

const INFURA_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

async function makeInfuraCall(params: ENSCallParams): Promise<string> {
  const response = await fetch(INFURA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [params],
      id: 1,
    }),
  });

  const data: InfuraResponse = await response.json();
  return data.result;
}

function stringToHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToString(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str;
}

function createIframe(url: string, ensName: string): void {
  document.documentElement.innerHTML = `
      <html>
        <head>
          <title>${ensName}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${url}" allowfullscreen></iframe>
        </body>
      </html>
    `;
}

(async function resolveENS(): Promise<void> {
  const ensName = window.location.hostname.replace(/^www\./, "");
  if (!ensName.endsWith(".eth")) return;

  console.log("Resolving ENS:", ensName);

  try {
    // Get ENS resolver address
    const namehash = ensName
      .split(".")
      .reverse()
      .map((label) => stringToHex(label).padStart(64, "0"))
      .join("");

    const resolverResult = await makeInfuraCall({
      to: ENS_REGISTRY,
      data: "0x0178b8bf" + namehash,
    });

    const resolverAddress = "0x" + resolverResult.slice(-40);

    // Get content hash from resolver
    const contentResult = await makeInfuraCall({
      to: resolverAddress,
      data: "0xbc1c58d1" + namehash,
    });

    if (!contentResult || contentResult === "0x") {
      console.log("No content hash found");
      return;
    }

    console.log("Content hash:", contentResult);

    const decoded = hexToString(contentResult.slice(2));
    if (!decoded.startsWith("walrus://0x")) {
      console.log("Not a Walrus hash");
      return;
    }

    const hexValue = decoded.substring(11);
    const base36Value = BigInt("0x" + hexValue).toString(36);
    const targetUrl = `https://${base36Value}.stablerecruit.com/`;

    console.log("Redirecting to:", targetUrl);
    createIframe(targetUrl, ensName);
  } catch (error) {
    console.error("ENS resolution error:", error);
  }
})();
