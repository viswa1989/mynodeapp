module.exports = {
  saveOutwarddelivery(Obj, req) {
    Obj.PAGE = "DELIVERY OUTWARD";
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

    Obj.message = `New Delivery <span class='noti_bold'>${Obj.data.delivery_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.customer_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.customer_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateOutwarddelivery(Obj, req) {
    Obj.PAGE = "DELIVERY OUTWARD";
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

    Obj.message = `Delivery <span class='noti_bold'>${Obj.data.delivery_no}</span> edited by <span class='noti_highlight'>${Obj.name}</span>.`;
    Obj.message += `<br/><span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.customer_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.customer_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  saveReturndelivery(Obj, req) {
    Obj.PAGE = "DELIVERY RETURN";
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

    Obj.message = `New Return <span class='noti_bold'>${Obj.data.delivery_no}</span> created by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.customer_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.customer_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
  updateReturndelivery(Obj, req) {
    Obj.PAGE = "DELIVERY RETURN";
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

    Obj.message = `Return delivery<span class='noti_bold'>${Obj.data.delivery_no}</span> edited by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;
    Obj.message += `<span class='noti_bold'>${Obj.data.order_no}</span>, <span class='noti_highlight'>${Obj.data.customer_name}</span>, `;
    Obj.message += `<span class='noti_bold'>${Obj.data.customer_mobile_no}</span><br/><span class='noti_bold'>${Obj.division_name}</span>`;

    return Obj;
  },
};
