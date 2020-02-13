module.exports = {
  saveOrder(Obj, req) {
    Obj.PAGE = "ORDER";
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

    Obj.message = `New Order <span class='noti_bold'>${Obj.data.order_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.customer_name}</span>, <span class='noti_bold'>${Obj.data.customer_mobile_no}</span>`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateOrder(Obj, req) {
    Obj.PAGE = "ORDER";
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

    Obj.message = `Order <span class='noti_bold'>${Obj.data.order_no}</span> edited by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.customer_name}</span>, <span class='noti_bold'>${Obj.data.customer_mobile_no}</span>`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateFollowup(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "FOLLOWUP PERSON UPDATE";
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

    Obj.message = `Order <span class='noti_bold'>${Obj.data.order_no}</span> follow-up person updated by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    if (Obj.data.followupPerson && Obj.data.followupPerson !== null && Obj.data.followupPerson.name && Obj.data.followupPerson.mobile_no) {
      Obj.message += `New followup-person <span class='noti_highlight'>${Obj.data.followupPerson.name}</span>, `;
      Obj.message += `<span class='noti_bold'>${Obj.data.followupPerson.mobile_no}</span>`;
    } else {
      Obj.message += `<span class='noti_highlight'>${Obj.data.customer_name}</span>, `;
      Obj.message += `<span class='noti_bold'>${Obj.data.customer_mobile_no}</span>`;
    }

    return Obj;
  },
  saveSpecialprice(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "FOLLOWUP PERSON UPDATE";
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

    Obj.message = `New Special price for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `created by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  updateSpecialprice(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "PRICE UPDATE";
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

    Obj.message = `Special price for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `updated by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  deleteLabsummary(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "LAB SUMMARY DELETE";
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

    Obj.message = `Lab summary report for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `has been removed by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  deleteLabreport(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "LAB REPORT DELETE";
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

    Obj.message = `Lab summary report for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `has been removed by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  updateLabsummary(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "LAB SUMMARY UPDATE";
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

    Obj.message = `Lab summary details for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `has been updated by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  updateLabreport(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "LAB REPORT UPDATE";
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

    Obj.message = `Lab summary details for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `has been updated by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  saveLabsummary(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "LAB REPORT SUMMARY ADD";
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

    Obj.message = `New Lab summary details for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `has been added by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  saveLabreport(Obj, req) {
    Obj.PAGE = "ORDER";
    Obj.PURPOSE = "LAB REPORT ADD";
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

    Obj.message = `New Lab summary details for the Order <span class='noti_bold'>${Obj.data.order_no}</span> `;
    Obj.message += `has been added by <span class='noti_highlight'>${Obj.name}</span>.`;

    return Obj;
  },
  updateStatus(Obj, req) {
    Obj.PAGE = "ORDER";
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

    Obj.message = `Order <span class='noti_bold'>${Obj.data.order_no}</span> status updated to <span class='noti_bold'>`;
    Obj.message += `${Obj.data.order_status}</span>, by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.customer_name}</span>, <span class='noti_bold'>${Obj.data.customer_mobile_no}`;
    Obj.message += `</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateoutwardStatus(Obj, req) {
    Obj.PAGE = "CONTRACT OUTWARD";
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

    Obj.message = `Contract Outward <span class='noti_bold'>${Obj.data.outward_no}</span> status updated to <span class='noti_bold'>`;
    Obj.message += `${Obj.data.outward_status}</span>, by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.contractor_name}</span>`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
};
