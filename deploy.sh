#!/bin/bash
# Deployment script (./deploy.sh)

set -e  # Exit on any error

echo "🚀 Starting MERN Stack Deployment for codatalab.cloud"

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p nginx/conf.d nginx/logs certbot/conf certbot/www

# Set proper permissions
echo "🔐 Setting permissions..."
chmod +x deploy.sh
chmod 644 docker-compose.yml nginx/nginx.conf nginx/conf.d/default.conf
chmod 644 init-mongo.js

# Check if domain is accessible (optional - comment out if running locally)
echo "🌐 Checking domain accessibility..."
if ! ping -c 1 codatalab.cloud &> /dev/null; then
    echo "⚠️  Warning: codatalab.cloud is not accessible from this server."
    echo "   Make sure your DNS is properly configured."
    read -p "   Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Clean up old images (optional)
read -p "🗑️  Remove old Docker images to free up space? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker system prune -f
fi

# Build and start services (without SSL first)
echo "🏗️  Building and starting services..."
docker-compose up --build -d mongodb backend frontend

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Some services failed to start. Checking logs..."
    docker-compose logs
    exit 1
fi

# Start nginx temporarily for SSL certificate generation
echo "🔧 Starting temporary nginx for SSL setup..."
docker-compose up -d nginx

# Wait a bit for nginx to start
sleep 10

# Generate SSL certificates
echo "🔒 Generating SSL certificates..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d codatalab.cloud \
    -d www.codatalab.cloud

# Restart nginx with SSL configuration
echo "🔄 Restarting nginx with SSL..."
docker-compose restart nginx

# Setup certificate auto-renewal
echo "🔄 Setting up certificate auto-renewal..."
cat > renew-cert.sh << 'EOF'
#!/bin/bash
docker-compose run --rm certbot renew
docker-compose restart nginx
EOF
chmod +x renew-cert.sh

# Add to cron (optional)
echo "📅 To setup automatic certificate renewal, add this to your crontab:"
echo "0 0,12 * * * $(pwd)/renew-cert.sh"

# Final health check
echo "🏥 Performing final health check..."
sleep 10

# Check if all services are running
if docker-compose ps | grep -q "Exit"; then
    echo "❌ Some services failed. Showing logs:"
    docker-compose logs
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application should be accessible at:"
echo "   https://codatalab.cloud"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f [service-name]"
echo "   Restart: docker-compose restart [service-name]"
echo "   Stop all: docker-compose down"
echo "   Update: docker-compose up --build -d"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update your email in the certbot configuration"
echo "   2. Set up proper environment variables"
echo "   3. Configure your backend health check endpoint"
echo "   4. Test all functionality"