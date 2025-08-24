// /mongo-init.js

db = db.getSiblingDB('mydb');

db.createUser({
  user: 'badis',
  pwd: '123321@00Pk.3dz?fde07',
  roles: [
    {
      role: 'readWrite',
      db: 'mydb',
    },
  ],
});