const CronJob = require('cron').CronJob;
const Smsqueue = require("../../app/models/SmsqueueModel");

const schedulerFactory = function() {
  return {
    start: function() {
      new CronJob('0 */5 * * * *', function() {
        const dt = new Date();
        console.log("--------------------------------------------");
        console.log("Running SMS queue worker at "+dt);
        console.log("--------------------------------------------");
        Smsqueue.sendNotifications();
      }, null, true, 'Asia/Kolkata');
    },
  };
};

module.exports = schedulerFactory();