const CronJob = require('cron').CronJob;
const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require("path");

const cleanschedulerFactory = function() {
  return {
    start: function() {
      new CronJob('00 30 23 * * *', function() {
        const uploadsDir = `${global.fupload}export_files`;

        fs.readdir(uploadsDir, function(err, files) {
          files.forEach(function(file, index) {
            fs.stat(path.join(uploadsDir, file), function(err, stat) {
              var endTime, now;
              if (err) {
                console.log(err);
              } else {
//              now = new Date().getTime();
//              endTime = new Date(stat.ctime).getTime() + 3600000;
//              if (now > endTime) {
                return rimraf(path.join(uploadsDir, file), function(errs) {
                  if (errs) {
                    console.log(errs);
                  }
                  console.log('Report files successfully deleted');
                });
              }
            });
          });
        });
      }, null, true, 'Asia/Kolkata');
    },
  };
};

module.exports = cleanschedulerFactory();