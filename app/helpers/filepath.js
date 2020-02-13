var express = require("express");
var path = require("path");
var app = express();


//File upload root directory
app.set("uploads", path.join(__dirname + "/public/Uploads/"));