const auth = require("../../../app/middlewares/auth");
const loginpagelogs = require("../../../app/middlewares/loginpagelog");
const notificationlog = require("../../../app/middlewares/notificationlog");
const bcrypt = require("bcrypt");
const express = require("express");

const router = express.Router();
const UserModel = require("../../../app/models/UsersModel");
const UsertrackModel = require("../../../app/models/UsertrackModel");
const mailer = require("../../../app/helpers/commonhelper");
const config = require("../../../app/config/settings");

router.post("/", (req, res) => {
  const condition = { username: req.body.username, role: { $in: [1, 2, 5] } };
  const select = "name username hash_password division role email_id mobile_no type";
  const query = UserModel.findOne(condition, select).populate("division", "name");
  query.exec((err, user) => {
    if (!err) {
      if (user) {
        if (user.comparePassword(req.body.password) && (req.body.username)) {
          const userdetails = {};
          userdetails.id = user._id;
          userdetails.name = user.name;
          userdetails.role = user.role;
          userdetails.username = user.username;
          if (user.role === 1) {
            userdetails.userrole = "superadmin";
          } else {
            userdetails.userrole = "divisionadmin";
          }

          userdetails.uagent = req.headers["user-agent"];

          if (userdetails.userrole !== "superadmin") {
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
          trackuser.save((trerr, trdat) => { });

          const logdata = loginpagelogs.loginuser(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          res.send({ success: true, message: "User logged successfully", token, user: userdetails });
          return;
        }
        return res.send({ success: false, message: "Enter valid password or username" });
      }
      return res.send({ success: false, message: "Username does not exist" });
    }
    return res.status(500).send({ success: false, message: "Something unexpected happened please try again later!!!" });
  });
});

router.post("/resetPassword", (req, res) => {
  if (req.body.userrole && req.body.userrole !== "") {
    const condition = { username: req.body.username };
    const password = auth.generatePassword(6);
    const select = "name username password division role email_id mobile_no type";
    const query = UserModel.findOne(condition, select).populate("division", "name");
    query.exec((err, user) => {
      if (!err) {
        if (user && user._id && password !== "") {
          user.password = password;
          user.hash_password = bcrypt.hashSync(password, 10);
          user.save((errs, users) => {
            if (errs) {
              res.status(500).send({ success: false, message: "Something unexpected happened please try again later!!!" });
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
                res.send({ success: true, message: "Username exist", data: responseStatus });
              }, res);
            } else {
              res.send({ success: false, message: "Something happened please try again later" });
            }
          });
        } else {
          res.send({ success: false, message: "Username does not exist" });
        }
      } else {
        res.status(500).send({ success: false, message: "Something unexpected happened please try again later!!!" });
      }
    });
  } else {
    res.status(499).send({ success: false, message: "Something unexpected happened please try again later!!!" });
  }
});

router.get("/logout", (req, res) => {
  auth.resetToken(req, res, (err, users) => {
    const data = { success: true };
    if (req.session && req.session !== null && req.session.id) {
      const userDetails = req.session;
      userDetails.action = "LOGOUT";

      const trackuser = new UsertrackModel(userDetails);
      trackuser.save((trerr, trdat) => { });
    }
    if (req.session && req.session !== null && req.session.id) {
      data.id = req.session.id;
    }
    res.send(data);
  });
});

module.exports = router;
