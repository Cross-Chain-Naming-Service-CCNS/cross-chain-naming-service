npm install
npm run build
npm start

# Or with PM2 for production:
npm install -g pm2
pm2 start dist/index.js --name walrus-gateway
pm2 startup
pm2 save