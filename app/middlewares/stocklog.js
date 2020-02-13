/* global parseFloat */
const currencytxt = "₹ ";
module.exports = {
  createGrn(Obj, req) {
    Obj.PAGE = "GRN";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.total_amt).toFixed(2);

    Obj.message = `New GRN <span class='noti_bold'>${Obj.data.grn_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `Amount ${currencytxt}${amount}, <span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  createGrnreturn(Obj, req) {
    Obj.PAGE = "RETURN STOCK";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.return_amt).toFixed(2);

    Obj.message = `One or more items were returned from GRN <span class='noti_bold'>${Obj.data.grn_no}</span> by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span>.<br/>Amount ${currencytxt}${amount},`;
    Obj.message += ` <span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  createOpeningstock(Obj, req) {
    Obj.PAGE = "STOCK";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `New Stock item <span class='noti_bold'>${Obj.data.product_name}</span> of quanity ${Obj.data.quantity} for `;
    Obj.message += `<span class='noti_bold'>${Obj.data.division_id.name}</span> added by  <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  updateOpeningstock(Obj, req) {
    Obj.PAGE = "STOCK";
    Obj.PURPOSE = "UPDATE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `Stock Edited at <span class='noti_bold'>${Obj.division_name}</span> by  <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  createUtilizedstock(Obj, req) {
    Obj.PAGE = "UTILIZED STOCK";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `New Utilized Stock item <span class='noti_bold'>${Obj.data.product_name}</span> of quanity ${Obj.data.quantity} for `;
    Obj.message += `<span class='noti_bold'>${Obj.data.division_id.name}</span> added by  <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  updateUtilizedstock(Obj, req) {
    Obj.PAGE = "UTILIZED STOCK";
    Obj.PURPOSE = "UPDATE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `Utilized Stock item <span class='noti_bold'>${Obj.data.product_name}</span> has been edited by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span> at <span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  deleteUtilizedstock(Obj, req) {
    Obj.PAGE = "UTILIZED STOCK";
    Obj.PURPOSE = "DELETE";
    Obj.MENU = "STOCK";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `Utilized Stock item <span class='noti_bold'>${Obj.data.product_name}</span> has been removed by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span> at <span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
};
