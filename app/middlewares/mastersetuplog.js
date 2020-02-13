module.exports = {
  create(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "USER ACTIVITY";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `Created New <span class='noti_bold'>${Obj.data.name}</span> in ${Obj.PAGENAME} by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  update(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "USER ACTIVITY";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    Obj.message = `Modified <span class='noti_bold'>${Obj.data.name} in </span>${Obj.PAGENAME} by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  delete(Obj, req) {
    Obj.PURPOSE = "DELETE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "USER ACTIVITY";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    Obj.message = `Removed <span class='noti_bold'>${Obj.data.name} in </span>${Obj.PAGENAME} by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  createProcess(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "USER ACTIVITY";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `Created New <span class='noti_bold'>${Obj.data.name}</span> process in ${Obj.data.division_id.name} `;
    Obj.message += `division by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  updateProcess(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "USER ACTIVITY";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    Obj.message = `Modified <span class='noti_bold'>${Obj.data.name} process in </span>${Obj.data.division_id.name} `;
    Obj.message += `by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  updatecontractorProcess(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "USER ACTIVITY";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    Obj.message = `Updated <span class='noti_bold'>${Obj.company_name} contractor process details by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
};
