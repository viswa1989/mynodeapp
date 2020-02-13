const mongoose = require("mongoose");
const qs = require("querystring");
const http = require("http");
const SmsgatewayModel = require("../../app/models/SmsgatewayModel");
const textformathelper = require("../../app/helpers/dataencrypthelper");

const smsqueueSchema = new mongoose.Schema({
  message: {type: String, trim: true},
  page: {type: String, trim: true},
  msg_to: {type: String, trim: true},
    msgtype: {type: String, trim: true, default: 'text'}, //text|unicode
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  status: {type: String, default: true},
  attempt: {type: Number},
  reason: [{msg: {type: String, trim: true},
    date_attempt: {type: Date}}],
  is_deleted: {type: Boolean, default: false},
});

smsqueueSchema.statics.sendNotifications = function (callback) {
  function sendNotifications(smsdata, gatewayCred) {
    smsdata.forEach((msgdata) => {
      const options = {
        method: "POST",
        hostname: gatewayCred.url,
        port: null,
        path: "/SMSApi/rest/send",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
        },
      };

      const req = http.request(options, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const body = Buffer.concat(chunks);
          const respdata = JSON.parse(body.toString());
          
          if (respdata) {
            const updatedata = msgdata;

            if (respdata.status && respdata.status === "success") {
              updatedata.status = "Completed";
            }
            if (respdata.reason && respdata.reason !== "") {
              const objs = {};
              objs.msg = respdata.reason;
              objs.date_attempt = new Date();
              if (!updatedata.reason) {
                updatedata.reason = [];
              }
              updatedata.reason.push(objs);
            }
            if (respdata.invalidMobile && respdata.invalidMobile !== "") {
              if (!updatedata.invalidMobile) {
                updatedata.invalidMobile = "";
              }
              updatedata.invalidMobile = respdata.invalidMobile
            }
            updatedata.attempt += 1;
            Smsqueue.findByIdAndUpdate(msgdata._id, updatedata, (brerr, dbdata) => {

            });
          }
        });
      });
      const smsoptions = { 
        userId: gatewayCred.username,
        password: gatewayCred.password,
        sendMethod: 'simpleMsg',
        msgType: msgdata.msgtype,
        mobile: msgdata.msg_to,
        msg: msgdata.message,
        duplicateCheck: 'true',
        format: 'json' };
      if (gatewayCred.senderid && gatewayCred.senderid !== null && gatewayCred.senderid !== "") {
        smsoptions.senderId = gatewayCred.senderid
      }
      
      req.write(qs.stringify(smsoptions));
      req.end();
    });

    // Don't wait on success/failure, just indicate all messages have been
    // queued for delivery
    // if (callback) {
    //   callback.call();
    // }
    }

  SmsgatewayModel.findOne({ is_deleted: false }, (err, data) => {
    if (err) {
      return res.send({success: false, message: err});
    } else if (data && data !== null && data._id) {
      const gatewayCred = JSON.parse(JSON.stringify(data));
      gatewayCred.url = textformathelper.decrypt(gatewayCred.url);
      gatewayCred.username = textformathelper.decrypt(gatewayCred.username);
      gatewayCred.password = textformathelper.decrypt(gatewayCred.password);
      gatewayCred.senderid = textformathelper.decrypt(gatewayCred.senderid);
      
      Smsqueue.find({status: "Pending", attempt: {$lt: 4}}).sort({created: 1}).limit(50).then((smsdata) => {
        if (smsdata.length > 0) {
          sendNotifications(smsdata, gatewayCred);
        }
      });
    }        
  });
};

const Smsqueue = mongoose.model('smsqueue', smsqueueSchema);

module.exports = Smsqueue;
