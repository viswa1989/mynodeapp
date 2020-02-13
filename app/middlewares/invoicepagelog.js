module.exports = {
  saveInvoice(Obj, req) {
    Obj.PAGE = "INVOICE";
    Obj.PURPOSE = "CREATE";
    Obj.MENU = "SALES";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `New Invoice <span class='noti_bold'>${Obj.data.invoice_no}</span> by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_highlight'>${Obj.data.customer_name}</span>, <span class='noti_bold'>${Obj.data.customer_mobile_no}</span>`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.data.division_id.name}</span>`;

    return Obj;
  },
  updateInvoice(Obj, req) {
    Obj.PAGE = "INVOICE";
    Obj.PURPOSE = "UPDATE";
    Obj.MENU = "SALES";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `Invoice <span class='noti_bold'>${Obj.data.invoice_no}</span> has been updated by `;
    Obj.message += `<span class='noti_highlight'>${Obj.name}</span>.<br/><span class='noti_highlight'>${Obj.data.customer_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.customer_mobile_no}</span><br/><span class='noti_bold'>${Obj.data.division_id.name}</span>`;

    return Obj;
  },
};
