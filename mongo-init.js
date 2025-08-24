// /mongo-init.js

// Switch to the application database. MongoDB will create it if it doesn't exist.
db = db.getSiblingDB('mydb');

// Create a non-root user with read/write permissions for the application
db.createUser({
  user: 'badis',
  pwd: '123321@00Pkdz?;fde07', // This password must match MONGO_APP_PASSWORD in your .env file
  roles: [
    {
      role: 'readWrite',
      db: 'mydb',
    },
  ],
});