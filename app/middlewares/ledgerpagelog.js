module.exports = {
  create(Obj, req) {
    Obj.PAGE = "BRANCH ACCOUNT";
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

    Obj.message = `<span class='noti_bold'>New Accounts ledger <span class='noti_bold'>${Obj.data.name}</span> `;
    Obj.message += `for ${Obj.data.division_id.name} was Created by </span><span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  update(Obj, req) {
    Obj.PAGE = "BRANCH ACCOUNT";
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
    Obj.message = `Modified Accounts ledger <span class='noti_bold'>${Obj.data.name}</span> in `;
    Obj.message += `<span class='noti_bold'>${Obj.data.division_id.name}</span> by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
};
