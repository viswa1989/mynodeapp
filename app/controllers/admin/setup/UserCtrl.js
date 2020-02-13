const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const userpagelog = require("../../../../app/middlewares/userpagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const bcrypt = require("bcrypt");
const express = require("express");

const router = express.Router();
const UserModel = require("../../../../app/models/UsersModel");
const PrivilegeModel = require("../../../../app/models/AdminprivilegesmasterModel");
const UserprivilegeModel = require("../../../../app/models/UserprivilegesModel");
const fileUpload = require("../../../../app/helpers/fileUploader");

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `users ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

// Fetching all Division Admin user details
router.get("/adminlist", (req, res) => {
  const results = [];

  UserModel.find({role: 1, type: "user"}, (errs, data) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else {
      async.each(data, (user, callback) => {
        UserprivilegeModel.find({user_id: user._id}, (err, priv) => {
          const obj = user.toObject();
          obj.privileges = [];
          if (err) {
            results.push(obj);
            callback(err);
          } else {
            obj.privileges = priv;
            results.push(obj);
            callback(err);
          }
        });
      }, (err) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        }

        res.json(results);
      });
    }
  });
});

// Fetching all user details except Division Admin
router.get("/userlist/:id", (req, res) => {
  const filter = {};
  filter.role = {$nin: [1]};

  if (req.params.id && req.params.id !== "") {
    filter.division = req.params.id;
  }
  const results = [];

  UserModel.find(filter, (errs, data) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      return;
    }
    async.each(data, (user, callback) => {
      UserprivilegeModel.find({user_id: user._id}, (err, priv) => {
        const obj = user.toObject();
        obj.privileges = [];
        if (err) {
          results.push(obj);
          callback(err);
        } else {
          obj.privileges = priv;
          results.push(obj);
          callback(err);
        }
      });
    }, (err) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      res.json(results);
    });
  });
});

// Get current user details by user id
router.get("/me", (req, res) => {
  async.parallel([
    function (callback) { // Fetch user details
      const query = UserModel.findOne({_id: req.session.id}, "name username notification_seen");
      query.exec((err, user) => {
        if (err) {
          callback(err);
        }
        callback(null, user);
      });
    },
    function (callback) { // Fetch user privileges
      const select = "Remove Modify Read privilege_master_id";
      const query = UserprivilegeModel.find({user_id: req.session.id}, select);
      query.exec((err, Priv) => {
        if (err) {
          callback(err);
        }
        callback(null, Priv);
      });
    },
    function (callback) { // Fetch privilege master
      const select = "privilege_id page pid profile_picture";
      const query = PrivilegeModel.find({}, select);
      query.exec((err, Priv) => {
        if (err) {
          callback(err);
        }
        callback(null, Priv);
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      if (results === null || results[0] === null) {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }
      const userDetail = {};
      userDetail.user = results[0] || [];
      userDetail.privilege = results[1] || [];
      userDetail.masterprivilege = results[2] || [];

      return res.send({success: true, message: userDetail});
    }
  });
});

// Get current user profile
router.get("/userprofile", (req, res) => {
  const condition = {_id: req.session.id};
  const filter = {name: 1, username: 1, address: 1, role: 1, email_id: 1, mobile_no: 1, alternate_no: 1, type: 1, profile_picture: 1};

  UserModel.findOne(condition, filter, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json({success: true, data});
  });
});

// Get privileges list
router.get("/privilegelist", (req, res) => {
  PrivilegeModel.find({}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.json({success: true, data});
    }
  });
});

// Save user details
router.post("/create", (req, res) => {
  req.folder = `${global.fupload}profile_picture`;
  req.allowedExt = [".jpg", ".jpeg", ".png"];

  fileUpload(req, res, (err) => {
    if (err) {
      if (req.errortxt) {
        res.status(499).send({message: req.errortxt});
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(499).send({message: "File too large"});
      } else {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      }
      return;
    }
    const user = JSON.parse(req.body.data);

    let newUser = new UserModel({
      name: user.name,
      username: user.username,
      password: user.password,
      hash_password: bcrypt.hashSync(user.password, 10),
      join_date: user.join_date,
      division: user.division,
      profile_picture: req.fileName,
      address: user.address,
      role: user.role,
      email_id: user.email_id,
      salary: user.salary,
      mobile_no: user.mobile_no,
      alternate_no: user.alternate_no,
    });

    // schema before save actions
    newUser = commonfunction.beforeSave(newUser, req);

    newUser.save((usererr, users) => {
      if (usererr) {
        res.status(499).send({message: errorhelper.getErrorMessage(usererr)});
      } else if (users && users !== null && users._id) {
        if (user.privileges && user.privileges.length > 0) {
          user.privileges.forEach((priv) => {
            let usepriv = new UserprivilegeModel({
              user_id: users._id,
              privilege_master_id: priv.privilege_master_id,
              privilege_id: priv.privilege_id,
              Read: priv.Read,
              Modify: priv.Modify,
              Remove: priv.Remove,
            });

            usepriv = commonfunction.beforeSave(usepriv, req);
            usepriv.save((errs) => {
              if (errs) {
                res.status(499).send({message: errorhelper.getErrorMessage(errs)});
              }
            });
          });
        }
        const obj = {};
        obj.data = users;

        const logdata = userpagelog.create(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: `${users.name} profile successfully created!`, data: users});
      } else {
        res.send({success: false, message: "Something went wrong. Please try again later!"});
      }
    });
  });
});

// Update user details
router.post("/update", (req, res) => {
  UserModel.findOne({_id: req.body.userForm._id}, (err, user) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (user && user !== null && user._id) {
      // schema before save actions
      user = commonfunction.beforeSave(user, req);
      user.name = req.body.userForm.name;
      user.username = req.body.userForm.username;
      user.password = req.body.userForm.password;
      user.hash_password = bcrypt.hashSync(req.body.userForm.password, 10);
      user.join_date = req.body.userForm.join_date;
      user.division = req.body.userForm.division;
      user.address = req.body.userForm.address;
      user.profile_picture = req.body.userForm.profile_picture;
      user.role = req.body.userForm.role;
      user.email_id = req.body.userForm.email_id;
      user.salary = req.body.userForm.salary;
      user.mobile_no = req.body.userForm.mobile_no;
      user.alternate_no = req.body.userForm.alternate_no;

      user.save((useerr, adminuser) => {
        if (useerr) {
          res.status(499).send({message: errorhelper.getErrorMessage(useerr)});
        } else if (adminuser && adminuser !== null && adminuser._id) {
          UserprivilegeModel.remove({user_id: adminuser._id}).exec();

          if (req.body.userForm.privileges && req.body.userForm.privileges.length > 0) {
            req.body.userForm.privileges.forEach((priv) => {
              let userpriv = new UserprivilegeModel({
                user_id: adminuser._id,
                privilege_master_id: priv.privilege_master_id,
                privilege_id: priv.privilege_id,
                Read: priv.Read,
                Modify: priv.Modify,
                Remove: priv.Remove,
              });
              userpriv = commonfunction.beforeSave(userpriv, req);

              userpriv.save((errs) => {
                if (errs) {
                  res.status(499).send({message: errorhelper.getErrorMessage(errs)});
                }
              });
            });
          }

          const obj = {};
          obj.data = adminuser;
          const logdata = userpagelog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `${adminuser.name} profile successfully updated!`});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!"});
        }
      });
    } else {
      res.send({success: false, message: "User profile not found"});
    }
  });
});

router.post("/updateProfile", (req, res) => { /** Update user details * */
  UserModel.findOne({_id: req.body.userForm._id}, (err, user) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (user && user !== null && user._id) {
      // schema before save actions
      user = commonfunction.beforeSave(user, req);
      user.name = req.body.userForm.name;
      user.address = req.body.userForm.address;
      user.profile_picture = req.body.userForm.profile_picture;
      user.email_id = req.body.userForm.email_id;
      user.mobile_no = req.body.userForm.mobile_no;
      user.alternate_no = req.body.userForm.alternate_no;

      if (req.body.userForm.password && req.body.userForm.password !== "") {
        user.password = req.body.userForm.password;
        user.hash_password = bcrypt.hashSync(req.body.userForm.password, 10);
      }

      user.save((useerr, adminuser) => {
        if (useerr) {
          res.status(499).send({message: errorhelper.getErrorMessage(useerr)});
          return;
        } else if (adminuser && adminuser !== null && adminuser._id) {
          res.send({success: true, message: `${adminuser.name} profile successfully updated!`});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!"});
      });
    } else {
      res.send({success: false, message: "User profile not found"});
    }
  });
});

router.post("/update_picture", (req, res) => { /** Update users profile picture * */
  req.folder = `${global.fupload}profile_picture`;
  req.allowedExt = [".jpg", ".jpeg", ".png"];

  fileUpload(req, res, (err) => {
    if (err) {
      if (req.errortxt) {
        res.status(499).send({message: req.errortxt});
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(499).send({message: "File too large"});
      } else {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      }
      return;
    }
    const user = JSON.parse(req.body.data);
    const query = {_id: user._id};

    UserModel.findOneAndUpdate(query, {$set: {profile_picture: req.fileName}}, (useerr, userData) => {
      if (useerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(useerr)});
        return;
      } else if (userData && userData !== null && userData._id) {
        res.send({success: true, message: "File uploaded successfully", filename: req.fileName});
        return;
      }
      res.send({success: false, message: "Something went wrong. Please try again later!"});
    });
  });
});

// Delete admin user
router.post("/delete", (req, res) => {
  UserModel.findByIdAndRemove(req.body._id, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send("User successfully deleted!");
    }
  });
});

// Get user details by id
router.get("/view/:id", (req, res) => {
  const filter = {_id: req.params.id};
  const results = [];

  UserModel.find(filter, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      async.each(data, (user, callback) => {
        UserprivilegeModel.find({user_id: user._id}, (errs, priv) => {
          const obj = user.toObject();
          obj.privileges = [];
          if (errs) {
            results.push(obj);
            callback(errs);
          } else {
            obj.privileges = priv;
            results.push(obj);
            callback(errs);
          }
        });
      }, (errd) => {
        if (errd) {
          res.status(499).send({message: errorhelper.getErrorMessage(errd)});
          return;
        }
        res.json(results);
      });
    }
  });
});

module.exports = router;
