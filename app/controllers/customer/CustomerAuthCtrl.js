const auth = require("../../../app/middlewares/auth");
const errorhelper = require("../../../app/helpers/errorhelper");
const loginpagelogs = require("../../../app/middlewares/loginpagelog");
const notificationlog = require("../../../app/middlewares/notificationlog");
const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const CustomerModel = require("../../../app/models/CustomersModel");
const UsertrackModel = require("../../../app/models/UsertrackModel");
const mailer = require("../../../app/helpers/commonhelper");

router.post("/login", (req, res) => {
  if (req.body.userrole && req.body.userrole !== "") {
    if (!req.body.username && !req.body.password) {
      res.send({success: false, message: "Please enter your username and password."});
      return;
    }
    if (!req.body.username) {
      res.send({success: false, message: "Please enter your username."});
      return;
    }
    if (!req.body.password) {
      res.send({success: false, message: "Please enter your password."});
      return;
    }

    let condition = {email_id: req.body.username};
    const isNumber = req.body.username;
    if (isNumber.trim().length > 0 && !isNaN(isNumber)) {
      condition = {$or: [{email_id: req.body.username}, {mobile_no: req.body.username}]};
    }

    const select = "name email_id hash_password mobile_no is_active";
    const query = CustomerModel.findOne(condition, select);

    query.exec((err, user) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else if (user && user !== null && user._id && !user.is_deleted) {
        if (user.hash_password && user.hash_password !== null && user.hash_password !== "") {
          if (user.comparePassword(req.body.password) && (req.body.username)) { // generate token
            const userdetails = {};
            userdetails.id = user._id;
            userdetails.name = user.name;
            userdetails.role = 8;
            userdetails.username = user.email_id;
            userdetails.userrole = req.body.userrole;
            userdetails.uagent = req.headers["user-agent"];

            const ip = "";
            // var ip = req.headers["x-forwarded-for"] ||
            // req.connection.remoteAddress ||
            // req.socket.remoteAddress ||
            // req.connection.socket.remoteAddress;

            // ip = ip.split(",")[0];
            // ip = ip.split(":").slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"

            userdetails.ipaddress = ip;

            const token = auth.createToken(userdetails);
            const obj = {};
            obj.data = user;
            obj.user = user._id;
            obj.role = 8;
            obj.name = user.name;

            userdetails.action = "LOGIN";

            // var trackuser = new UsertrackModel(userdetails);
            // trackuser.save(function(trerr, trdat){});

            // var logdata = loginpagelogs.loginuser(obj, req);
            // if (logdata.message && logdata.message !== null) {
            //     notificationlog.savelog(logdata, res);
            // }

            res.send({success: true, message: "User logged successfully", token});
            return;
          }
          return res.send({success: false, message: "Invalid Credentials."});
        }
        return res.send({success: false, message: "Unauthorized user. Please contact administrator."});
      }
      return res.send({success: false, message: "Invalid Username."});
    });
  }
});

router.post("/resetPassword", (req, res) => {
  if (req.body.userrole && req.body.userrole !== "") {
    if (!req.body.username) {
      res.send({success: false, message: "Please enter your username."});
      return;
    }

    const condition = {username: req.body.username};
    const password = auth.generatePassword(6);
    if (req.body.userrole === "superadmin") {
      condition.role = 1;
    } else if (req.body.userrole === "divisionadmin") {
      condition.role = {$gt: 1, $lt: 8};
    }

    const select = "name username password division role email_id mobile_no type";
    const query = CustomerModel.findOne(condition, select).populate("division", "name");

    query.exec((err, user) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (user && user !== null && user._id && password !== "") {
        user.password = password;
        user.hash_password = bcrypt.hashSync(password, 10);

        user.save((errs, users) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (users && users !== null && users._id) {
            const locals = {
              email: users.email_id,
              subject: "Your password has been reset.",
              username: users.username,
              password: users.password,
            };
            const obj = {};
            obj.data = user;
            obj.user = user._id;
            obj.role = user.role;
            obj.name = user.name;

            if (user.role > 1 && user.division && user.division !== null && user.division._id) {
              obj.division = user.division._id;
              obj.division_name = user.division.name;
            } else {
              obj.division_name = "Lotus Knits";
            }

            const logdata = loginpagelogs.resetuser(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            mailer.sendMail("password_reset", locals, (ers, responseStatus, html, text) => {
              res.send({success: true, message: "Username exist", data: responseStatus});
            }, res);
          } else {
            res.send({success: false, message: "Something happened please try again later"});
          }
        });
      } else {
        res.send({success: false, message: "Invalid Username."});
      }
    });
  }
});

router.get("/logout", (req, res) => {
  auth.resetToken(req, res, (err, users) => {
    if (req.session && req.session !== null && req.session.id) {
      const userDetails = req.session;
      userDetails.action = "LOGOUT";

      const trackuser = new UsertrackModel(userDetails);
      trackuser.save((trerr, trdat) => {});
    }

    res.send({success: true});
  });
});

module.exports = router;
