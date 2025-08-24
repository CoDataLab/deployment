// /mongo-init.js

db = db.getSiblingDB('mydb');

db.createUser({
  user: 'badis',
  pwd: '12332.100Pk3dz?fde07',
  roles: [
    {
      role: 'readWrite',
      db: 'mydb',
    },
  ],
});