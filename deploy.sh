#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | xargs)
else
  echo "Error: .env file not found."
  exit 1
fi

# Check if required variables are set
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Error: DOMAIN and EMAIL must be set in the .env file."
  exit 1
fi

echo "🚀 Starting deployment for $DOMAIN..."

# --- Step 1: Initial Certbot Challenge ---
# We need to get the SSL certificate. Nginx must be running on port 80
# to answer the challenge from Let's Encrypt.

# Create dummy cert files if they don't exist to allow Nginx to start
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "### Creating dummy SSL certificate for Nginx to start..."
  mkdir -p certbot/conf/live/$DOMAIN
  docker compose run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:4096 -days 1\
      -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
      -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
      -subj '/CN=localhost'" certbot
  echo
fi

# Create dummy dhparams if they don't exist
if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
    echo "### Creating dummy dhparams for Nginx to start..."
    mkdir -p certbot/conf
    docker compose run --rm --entrypoint "\
        openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048" certbot
fi

# Start all services. Nginx will use the dummy certs for now.
echo "### Starting all services..."
docker compose up --force-recreate -d

# --- Step 2: Obtain the real SSL Certificate ---
echo "### Deleting dummy certificate..."
docker compose run --rm --entrypoint "\
  rm -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/privkey.pem" certbot

echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
# Command to get the real certificate
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

# --- Step 3: Reload Nginx with the real certificate ---
echo "### Reloading Nginx to apply the new SSL certificate..."
docker compose exec nginx nginx -s reload

echo "✅ Deployment successful!"
echo "Your MERN stack is now live at https://$DOMAIN"