module.exports = {
  create(Obj, req) {
    Obj.PAGE = "USER";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "USER ACTIVITY";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;

    Obj.message = "Created New ";
    if (Obj.data.role === 1) {
      Obj.message += "Admin User ";
    } else {
      Obj.message += "Staff ";
    }
    Obj.message += `<span class='noti_bold'>${Obj.data.name} </span> by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  update(Obj, req) {
    Obj.PAGE = "USER";
    Obj.PURPOSE = "UPDATE";
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
    Obj.message = "Modified ";

    if (Obj.data.role === 1) {
      Obj.message += "Admin User ";
    } else {
      Obj.message += "Staff ";
    }
    Obj.message += `<span class='noti_bold'>${Obj.data.name} </span> by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
};
