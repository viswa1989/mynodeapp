module.exports = {
  loginuser(Obj, req) {
    Obj.PAGE = "LOGIN";
    Obj.PURPOSE = "LOGIN";
    Obj.MENU = "USER ACTIVITY";

    Obj.message = `<span class='noti_highlight'>${Obj.name}</span> <span class='noti_bold'> logged in</span> to the portal.`;

    return Obj;
  },
  logoutuser(Obj, req) {
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    Obj.MENU = "USER ACTIVITY";

    Obj.message = `<span class='noti_highlight'>${Obj.name}</span> <span class='noti_bold'> logged out</span> from portal.`;
    return Obj;
  },
  resetuser(Obj, req) {
    Obj.PAGE = "RESET PASSWORD";
    Obj.PURPOSE = "RESET PASSWORD";
    Obj.MENU = "USER ACTIVITY";

    Obj.message = `<span class='noti_highlight'>${Obj.name}</span> <span class='noti_bold'> logged out</span> from portal.`;
    return Obj;
  },
};
