import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;
const PORTAL_URL = "https://stablerecruit.com"; // Your portal URL

app.use("*", async (req, res) => {
  // Extract ENS from subdomain or path
  const hostname = req.hostname;
  let ensName = "";

  if (hostname.includes(".ccns.live")) {
    ensName = hostname.split(".ccns.live")[0];
  } else {
    ensName = req.path.split("/")[1];
  }

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

    // Proxy to your portal
    const portalUrl = `https://${siteId}.stablerecruit.com${req.path}${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`;

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
  if (true) {
    return "3x8fmq6n5ndy0ebk8xvd3pdqyjcnepg8qu7k3raidy71aw5w4l";
  }

  return null;
}

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
