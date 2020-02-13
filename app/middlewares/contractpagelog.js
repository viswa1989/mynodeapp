module.exports = {
  saveOutward(Obj, req) {
    Obj.PAGE = "CONTRACT OUTWARD";
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

    Obj.message = `New Contract Outward <span class='noti_bold'>${Obj.data.outward_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.contractor_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.contractor_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateOutward(Obj, req) {
    Obj.PAGE = "CONTRACT OUTWARD";
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

    Obj.message = `Contract Outward <span class='noti_bold'>${Obj.data.outward_no}</span> edited by <span class='noti_highlight'>${Obj.name}</span>.`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.contractor_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.contractor_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  saveInward(Obj, req) {
    Obj.PAGE = "CONTRACT INWARD";
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

    Obj.message = `New Contract Inward <span class='noti_bold'>${Obj.data.inward_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.contractor_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.contractor_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateInward(Obj, req) {
    Obj.PAGE = "CONTRACT INWARD";
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

    Obj.message = `Contract Inward <span class='noti_bold'>${Obj.data.inward_no}</span> edited by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.contractor_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.contractor_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
};
