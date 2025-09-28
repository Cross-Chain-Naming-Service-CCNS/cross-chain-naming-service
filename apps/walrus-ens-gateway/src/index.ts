import express from "express";
import { getRawContentHash } from "./getRawContentHash";
import { idToBase36 } from "./objectIdToSiteId";

const app = express();
const PORT = process.env.PORT || 3001;
const PORTAL_URL = "https://stablerecruit.com"; // Your portal URL

app.use("/:id", async (req, res, next) => {
  // Ignore requests for favicon.ico

  // Extract ENS from subdomain or path
  const hostname = req.hostname;
  let ensName = "";

  if (hostname.includes(".ccns.live")) {
    ensName = hostname.split(".ccns.live")[0];
  } else {
    // req.path does not include the full original URL, so use req.originalUrl instead
    ensName = req.originalUrl.split("/")[1];
  }

  console.log(req.originalUrl);
  console.log("Requested ENS:", ensName);

  if (!ensName) {
    return res
      .status(400)
      .send("ENS name required either as subdomain or path");
  }

  try {
    const siteId = await resolveENSToWalrusSiteId(ensName);

    if (!siteId) {
      return res.status(404).send("No Walrus site found");
    }

    console.log("Resolved siteId:", siteId);

    // Proxy to your portal
    const portalUrl = `https://${siteId}.stablerecruit.com${req.path}${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`;

    console.log(portalUrl);

    const response = await fetch(portalUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).filter(
            ([_, value]) => value !== undefined
          )
        ),
        "X-Walrus-Site-Id": siteId,
      },
    });

    const content = await response.arrayBuffer();
    res.set(Object.fromEntries(response.headers.entries()));
    res.send(Buffer.from(content));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

async function resolveENSToWalrusSiteId(
  ensName: string
): Promise<string | null> {
  // Your existing logic
  const contentHash = await getRawContentHash(ensName);
  const siteId = idToBase36(
    contentHash
      ? contentHash.startsWith("0x")
        ? contentHash.slice(2)
        : contentHash
      : ""
  );

  return siteId;
}

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
