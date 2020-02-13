const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, req.folder);
  },
  filename(req, file, cb) {
    const getFileExt = function (fileName) {
      const fileext = fileName.split(".");
      if (fileext.length === 1 || (fileext[0] === "" && fileext.length === 2)) {
        return "";
      }
      return fileext.pop();
    };
    let fileextension = getFileExt(file.originalname);

    req.fileName = `${Date.now()}-${Math.floor(((Math.random() * 1000) + (Math.random() * 9000)))}${1}.${fileextension}`;// add extension
    fileextension = null;
    cb(null, req.fileName);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    const ext = path.extname(file.originalname);
    if (req.allowedExt && req.allowedExt.indexOf(ext.toLowerCase()) > -1) {
      return callback(null, true);
    }
    req.errortxt = "Invalid File Format.";
    return callback(new Error("Invalid File Format."), false);

    // if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.txt' && ext !== '.csv' && ext !== '.xlsx' &&
    //     ext !== '.xls' && ext !== '.docx' && ext !== '.doc' && ext !== '.pdf') {
    //         return callback(new Error('Invalid File Format.'), null);
    // }
  },
  limits: { fileSize: 1 * 2048 * 2048 },
}).single("file");
module.exports = upload;
