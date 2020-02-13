const SmsModel = require("../../app/models/SmsqueueModel");
const formattemplate = require("string-template");
const PreferenceModel = require("../../app/models/PreferenceModel");

module.exports = {
  saveorder(Obj) {
    const smsqueue = new SmsModel({
      page: "ORDER",
      msg_to: Obj.customer_mobile_no,
      status: "Pending",
      attempt: 0,
    });
    PreferenceModel.findOne({module: "SMS_TEMPLATE", preference: "order"}, "preference value", (err, preference) => {
      let greeting;
      if (preference && preference !== null && preference._id && preference.value !== "") {
        greeting = formattemplate(preference.value, {
          name: Obj.customer_name,
          order_no: Obj.order_no,
          dc_no: Obj.customer_dc_no,
        });
        smsqueue.message = greeting;
        if (greeting !== "") {
          smsqueue.save((errs, sms) => {});
        }
      } else {
        greeting = formattemplate("Dear {name}, Your order {order_no} against the DC {dc_no} has been successfully placed.", {
          name: Obj.customer_name,
          order_no: Obj.order_no,
          dc_no: Obj.customer_dc_no,
        });
        smsqueue.message = greeting;
        if (greeting !== "") {
          smsqueue.save((errs, sms) => {});
        }
      }
    });
  },
  saveotp(Obj) {
    const smsqueue = new SmsModel({
      page: "PURCHASE ORDER",
      msg_to: Obj.mobile_no,
      status: "Pending",
      attempt: 0,
    });
    PreferenceModel.findOne({module: "SMS_TEMPLATE", preference: "purchase_order_otp"}, "preference value", (err, preference) => {
      let greeting;
      if (preference && preference !== null && preference._id && preference.value !== "") {
        greeting = formattemplate(preference.value, {
          po_no: Obj.po_no,
          OTP: Obj.OTP,
        });
        smsqueue.message = greeting;
        if (greeting !== "") {
          smsqueue.save((errs, sms) => {});
        }
      } else {
        greeting = formattemplate("OTP for your purchase order {po_no} is {OTP}.", {
          po_no: Obj.po_no,
          OTP: Obj.OTP,
        });
        smsqueue.message = greeting;
        if (greeting !== "") {
          smsqueue.save((errs, sms) => {});
        }
      }
    });
  },
};
