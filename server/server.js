require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const expressSanitizer = require("express-sanitizer");
const router = require("./router");
const cors = require("cors");
const http = require("http");
const { sendMemberCounts } = require("./configController");

const port = process.env.PORT || 4000;

const app = express();

const httpServer = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(expressSanitizer());

app.use(router);

module.exports = {
    httpServer
};
