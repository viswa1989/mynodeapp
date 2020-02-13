var multer  = require("multer");

var upload=multer().array();
		
module.exports = upload;