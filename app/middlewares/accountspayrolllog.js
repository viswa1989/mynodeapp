module.exports = {
  updateCategory(Obj, req) {
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
    Obj.message = `Accounts payroll <span class='noti_bold'>${Obj.PAGENAME}</span> categories was edited by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  createTax(Obj, req) {
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
    Obj.message = `New Tax <span class='noti_bold'>${Obj.data.tax_name}</span> added`;
    Obj.message += ` by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  updateTax(Obj, req) {
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

    Obj.message = `Accounts payroll tax details was edited by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  deleteTax(Obj, req) {
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

    Obj.message = `Accounts payroll tax entry <span class='noti_bold'>${Obj.data.tax_name}</span> was removed by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
};
