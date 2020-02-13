/* global parseFloat */
const currencytxt = "₹ ";
module.exports = {
  savePo(Obj, req) {
    Obj.PAGE = "PURCHASE ORDER";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "TODO";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.total).toFixed(2);
    Obj.message = `New PO <span class='noti_bold'>${Obj.data.po_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `Amount ${currencytxt}${amount}, <span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updatePo(Obj, req) {
    Obj.PAGE = "PURCHASE ORDER";
    Obj.PURPOSE = "UPDATE";
    Obj.MENU = "TODO";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `PO <span class='noti_bold'>${Obj.data.po_no}</span> has been updated by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  createPootp(Obj, req) {
    Obj.PAGE = "PURCHASE ORDER OTP";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "TODO";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
//    if (req.session.branch) {
//      Obj.division = req.session.branch;
//      Obj.division_name = req.session.branch_name;
//    } else {
      Obj.division_name = "Lotus Knits";
//    }

    Obj.message = `OTP for your purchase order <span class='noti_bold'>${Obj.data.po_no}</span> is <span class='noti_highlight noti_bold'>${Obj.data.OTP}</span>.<br/>`;
    Obj.message += `<span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updatePostatus(Obj, req) {
    Obj.PAGE = "PURCHASE ORDER";
    Obj.PURPOSE = "STATUS UPDATE";
    Obj.MENU = "TODO";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `PO <span class='noti_bold'>${Obj.data.po_no}</span> has been <span class='noti_bold'>${Obj.status}</span>`;
    Obj.message += ` by <span class='noti_highlight'>${Obj.name}</span>.<br/>at <span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
};
