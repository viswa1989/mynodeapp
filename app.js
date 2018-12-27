require("app-module-path").addPath(__dirname);
require('v8-profiler');
const express = require("express");
// var socket_io    = require( "socket.io" );
const helmet = require("helmet");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const app = express();
app.use(compression());

const mongoose = require("mongoose");

app.set("env", "development");

const config = require("./app/config/settings")[app.get("env")];
const sockethelpers = require("./app/helpers/socketHelper");
const socketevents = require("./app/config/socket");
const scheduler = require('./app/helpers/smscronhelper');
const filecleanscheduler = require('./app/helpers/filecleanercronhelper');

// view engine setup
app.set("port", config.port);
global.fupload = path.join(`${__dirname}/public/Uploads/`);
app.set("views", path.join(__dirname, "app/views/"));

app.engine("html", require("ejs").renderFile);

app.set("view engine", "html");
// app.set("view engine", "jade");

// Set helmet for express app
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: "PHP 5.3.0" }));
app.use(helmet.frameguard({ action: "deny" }));

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const databaseUrl = `${config.db.protocol}://${config.db.host}:${config.db.port}/${config.db.database}`;

app.use("/app", express.static(path.join(__dirname, "public")));
app.set("port", config.port);

mongoose.connect(databaseUrl, (err) => {
  if (err) {
    console.log("connection error", err);
  } else {
    console.log("connection successful");
  }
});

const server = app.listen(app.get("port"), () => {
  console.log(`Express server listening on port ${config.port}`);
  // debug("Express server listening on port " + server.address().port);
});

// Socket.io
const io = require("socket.io").listen(server, {
  transports: [
    "jsonp-polling",
    "xhr-polling",
    "polling",
  ],
  path: "/socket.io",
  pingInterval: 25000,
  pingTimeout: 60000,
});

// io.sockets.on("connection", function (socket) {
// console.log("Socket.io user connected");
//    // debug("Socket.io user connected");
// });
io.use((socket, next) => {
  const userID = socket.request._query.userId;
  const Role = socket.request._query.Role;

  const userSocketId = socket.id;
  const userD = {
    user_id: userID,
    role: Role,
    socketId: userSocketId
  };

  if (socket.request._query.Division) {
    userD.division_id = socket.request._query.Division;
  }

  sockethelpers.updateSocketId(userD, (error, response) => {
    next();
  });
  socketevents(io);
});

app.use((req, res, next) => {
  req.env = app.get("env");
  res.io = io;
  next();
});

require("./app/routes")(app);

app.get("*", (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// app.listen(config.port, function () {
//   console.log("Example app listening on port "+app.get("port"));
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err.status,
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send("error", {
    message: err.message,
    error: {},
  });
});

// app.disable("x-powered-by");
app.disable("x-session-token");
//scheduler.start();
filecleanscheduler.start();
module.exports = app;
