const auth = require("../../../app/middlewares/auth");
const errorhelper = require("../../../app/helpers/errorhelper");
const loginpagelogs = require("../../../app/middlewares/loginpagelog");
const notificationlog = require("../../../app/middlewares/notificationlog");
const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const UserModel = require("../../../app/models/UsersModel");
const UsertrackModel = require("../../../app/models/UsertrackModel");
const mailer = require("../../../app/helpers/commonhelper");
const config = require("../../../app/config/settings");

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

    const condition = {username: req.body.username};
    if (req.body.userrole === "superadmin") {
      condition.role = 1;
    } else if (req.body.userrole === "divisionadmin") {
      condition.role = {$gt: 1, $lt: 8};// role=2;
    }
    const select = "name username hash_password division role email_id mobile_no type";
    const query = UserModel.findOne(condition, select).populate("division", "name");

    query.exec((err, user) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else if (user && user !== null && user._id) {
        if (user.comparePassword(req.body.password) && (req.body.username)) { // generate token
          const userdetails = {};
          userdetails.id = user._id;
          userdetails.name = user.name;
          userdetails.role = user.role;
          userdetails.username = user.username;
          userdetails.userrole = req.body.userrole;
          userdetails.uagent = req.headers["user-agent"];
          const ip = "";
          //                    var ip = req.headers["x-forwarded-for"] ||
          //                    req.connection.remoteAddress ||
          //                    req.socket.remoteAddress ||
          //                    req.connection.socket.remoteAddress;
          //
          //                    ip = ip.split(",")[0];
          //                    ip = ip.split(":").slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"

          userdetails.ipaddress = ip;

          if (req.body.userrole !== "superadmin") {
            userdetails.branch = user.division._id;
            userdetails.branch_name = user.division.name;
          }

          const token = auth.createToken(userdetails);
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

          userdetails.action = "LOGIN";

          const trackuser = new UsertrackModel(userdetails);
          trackuser.save((trerr) => {});

          const logdata = loginpagelogs.loginuser(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: "User logged successfully", token});
          return;
        }
        return res.send({success: false, message: "Invalid Credentials."});
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
    const query = UserModel.findOne(condition, select).populate("division", "name");

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
            const cfg = config[req.env];
            let applink = cfg.applink;
            if (user.role === 1) {
              applink += "superadmin/login";
            } else {
              applink += "divisionadmin/login";
            }

            const locals = {
              email: users.email_id,
              subject: "Your password has been reset.",
              username: users.username,
              password: users.password,
              applink,
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

            mailer.sendMail("password_reset", locals, (err, responseStatus, html, text) => {
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
    const data = {success: true};
    if (req.session && req.session !== null && req.session.id) {
      const userDetails = req.session;
      userDetails.action = "LOGOUT";

      const trackuser = new UsertrackModel(userDetails);
      trackuser.save((trerr) => {});
    }
    if (req.session && req.session !== null && req.session.id) {
      data.id = req.session.id;
    }
    res.send(data);
  });
});

module.exports = router;
