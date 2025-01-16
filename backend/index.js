import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const port = process.env.port || 5000;

server.listen(port, () => {
  console.log("Server is running on port 5000");
});
