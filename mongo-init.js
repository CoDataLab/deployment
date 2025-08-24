db = db.getSiblingDB('mydb')  // Use 'mydb' database

db.createUser(
  {
    user: "myuser",           // Application User
    pwd:  "securepassword", // Strong Password
    roles: [
      { role: "readWrite", db: "mydb" } // Only read/write access to 'mydb'
    ]
  }
);

// Create another user just for reading (example)
db.createUser(
  {
    user: "readonlyuser",
    pwd:  "verysecurepassword",
    roles: [
      { role: "read", db: "mydb" }
    ]
  }
);

db.getSiblingDB('admin').createUser(
  {
    user: "admin",
    pwd: "supersecureadminpassword",
    roles: [ { role: "root", db: "admin" } ]
  }
);