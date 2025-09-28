# ENS Walrus Resolver Chrome Extension

Chrome extension that resolves ENS domains with Walrus content hashes.

## Development

```bash
# Install dependencies
pnpm install

# Build extension
pnpm build

# Load dist/ folder in Chrome extensions (developer mode)
```

## Setup

1. Get Infura Project ID from https://infura.io
2. Replace `YOUR_INFURA_PROJECT_ID` in `src/content.ts`
3. Build and load in Chrome

## Architecture

- TypeScript for type safety
- Turborepo integration
- Minimal dependencies
EOF

# Update root turbo.json to include this app
echo "
Add to your root turbo.json:

{
  \"pipeline\": {
    \"build\": {
      \"outputs\": [\"dist/**\"]
    },
    \"dev\": {
      \"cache\": false
    },
    \"type-check\": {}
  }
}

And to your root package.json scripts:
{
  \"scripts\": {
    \"build:chrome-ext\": \"turbo run build --filter=@repo/chrome-extension-ens\",
    \"dev:chrome-ext\": \"turbo run dev --filter=@repo/chrome-extension-ens\"
  }
}
"