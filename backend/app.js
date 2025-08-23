// app.js
const { server } = require('./server');

const PORT = process.env.PORT || 8082;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
