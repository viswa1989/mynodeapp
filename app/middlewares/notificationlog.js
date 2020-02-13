const logModel = require("../../app/models/ActivityModel");

module.exports = {
  savelog(Obj, res) {
    const activityModel = new logModel({
      message: Obj.message,
      name: Obj.name,
      user: Obj.user,
      role: Obj.role,
      data: Obj.data,
      MENU: Obj.MENU,
      PAGE: Obj.PAGE,
      PURPOSE: Obj.PURPOSE,
      division_name: Obj.division_name,
      division: Obj.division,
    });
    if (Obj.data && Obj.data !== null && Obj.data !== "" && Obj.data._id) {
      activityModel.linkid = Obj.data._id;
    }

    activityModel.save((err, users) => {
      if (err || !users) {
        console.log(err);
      } else {
        res.io.sockets.emit("updateNotification", users);
      }
    });
  },
};
