#!/bin/bash
set -e

DOMAIN="codatalab.cloud"
EMAIL="badisjlassi86@gmail.com"
WEB_CONTAINER="web"

echo "👉 Building and starting containers..."
docker compose up -d --build

# Check if cert already exists
if [ ! -f "./certbot-etc/live/$DOMAIN/fullchain.pem" ]; then
  echo "🔑 No certificate found. Requesting a new Let's Encrypt SSL cert for $DOMAIN ..."
  docker compose run --rm certbot certonly --webroot \
    -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos --no-eff-email
else
  echo "✅ Certificate already exists, skipping issuance."
fi

echo "👉 Copying SSL-enabled nginx config..."
docker cp ./frontend/nginx-ssl.conf $WEB_CONTAINER:/etc/nginx/conf.d/default.conf

echo "🔄 Reloading nginx..."
docker compose exec $WEB_CONTAINER nginx -s reload

echo "🎉 Deployment complete! Visit: https://$DOMAIN"
