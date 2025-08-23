
db = db.getSiblingDB('mydb');

db.createUser({
  user: 'badisjl99',
  pwd: '123951Ba008',
  roles: [
    {
      role: 'readWrite',
      db: 'mydb'
    },
    {
      role: 'dbAdmin',
      db: 'mydb'
    }
  ]
});

print('Database mydb initialized successfully');
print('User badisjl99 created with readWrite and dbAdmin roles');