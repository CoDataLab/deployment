// /mongo-init.js

db = db.getSiblingDB('mydb');

db.createUser({
  user: 'badis',
  pwd: '12332Mps100Pk3dzfde07',
  roles: [
    {
      role: 'readWrite',
      db: 'mydb',
    },
  ],
});