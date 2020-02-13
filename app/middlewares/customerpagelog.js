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
    Obj.message = `<span class='noti_bold'>New Customer added</span> by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.name}</span>, <span class='noti_bold'>${Obj.data.mobile_no}</span>`;

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
    Obj.message = `<span class='noti_bold'>Customer profile edited</span> by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.name}</span>, <span class='noti_bold'>${Obj.data.mobile_no}</span>`;

    return Obj;
  },
  updategroup(Obj, req) {
    Obj.PURPOSE = "UPDATE GROUP";
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
    Obj.message = `<span class='noti_bold'>Customer profile <span class='noti_highlight'>${Obj.data.name}</span>, `;
    Obj.message += `Discount Group updated</span> by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  updategst(Obj, req) {
    Obj.PURPOSE = "UPDATE GSTIN";
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
    Obj.message = `<span class='noti_bold'>Customer profile <span class='noti_highlight'>${Obj.data.name}</span>, `;
    Obj.message += `GSTIN Treatment updated</span> by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
};
