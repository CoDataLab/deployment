#!/bin/bash

echo "🚀 Setting up MongoDB Replica Set..."

# Step 1: Generate keyfile if it doesn't exist
if [ ! -f "mongo-keyfile" ]; then
    echo "📝 Generating MongoDB keyfile..."
    openssl rand -base64 756 > mongo-keyfile
    chmod 400 mongo-keyfile
    echo "✅ Keyfile generated successfully!"
else
    echo "✅ Keyfile already exists"
fi

# Step 2: Create replica-setup.js if it doesn't exist
if [ ! -f "replica-setup.js" ]; then
    echo "📝 Creating replica setup script..."
    cat > replica-setup.js << 'EOF'
try {
  print("Starting replica set initiation...");
  
  var config = {
    "_id": "rs0",
    "version": 1,
    "members": [
      {
        "_id": 0,
        "host": "mongo1:27017",
        "priority": 3
      },
      {
        "_id": 1,
        "host": "mongo2:27017", 
        "priority": 2
      },
      {
        "_id": 2,
        "host": "mongo3:27017",
        "priority": 1
      }
    ]
  };
  
  rs.initiate(config);
  
  print("Replica set configuration:");
  printjson(config);
  
  print("Waiting for replica set to stabilize...");
  sleep(15000);
  
  print("Replica set status:");
  rs.status();
  
} catch(e) {
  print("Error during replica set setup:");
  print(e);
}
EOF
    echo "✅ Replica setup script created!"
else
    echo "✅ Replica setup script already exists"
fi

# Step 3: Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Creating sample .env file - PLEASE UPDATE WITH YOUR VALUES!"
    cat > .env << 'EOF'
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=your_strong_root_password_here
JWT_SECRET=your_jwt_secret_here
COOKIE_NAME=your_cookie_name_here
EOF
    echo "🔧 Please edit .env file with your actual values before proceeding!"
else
    echo "✅ .env file exists"
fi

echo "🎉 Setup complete! You can now update your docker-compose.yml and run the replica set."