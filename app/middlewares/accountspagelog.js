/* global parseFloat */
const currencytxt = "₹ ";
module.exports = {
  create(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    Obj.message = `New Accounts Ledger <span class='noti_bold'>${Obj.data.name}</span> for `;
    Obj.message += `<span class='noti_bold'>${Obj.data.division_id.name}</span>,`;
    Obj.message += ` Created by <span class='noti_highlight'>${Obj.name}</span>.<br/>`;

    return Obj;
  },
  update(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    Obj.message = `Accounts Ledger <span class='noti_bold'>${Obj.data.name}</span> was edited by <span class='noti_highlight'>${Obj.name}</span>`;

    return Obj;
  },
  createTrans(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    if (Obj.data.transaction_type === "CREDIT") {
      Obj.message = `Amount received to the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
      Obj.message += ` by <span class='noti_highlight'>${Obj.name}</span><br/>`;
      Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;
    } else {
      Obj.message = `Amount debited from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
      Obj.message += ` by <span class='noti_highlight'>${Obj.name}</span><br/>`;
      Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;
    }

    return Obj;
  },
  updateTrans(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    if (Obj.data.transaction_type === "CREDIT") {
      Obj.message = `Amount credit entry from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
      Obj.message += ` was edited by <span class='noti_highlight'>${Obj.name}</span><br/>`;
      Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;
    } else {
      Obj.message = `Amount debit entry from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
      Obj.message += ` was edited by <span class='noti_highlight'>${Obj.name}</span><br/>`;
      Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;
    }

    return Obj;
  },
  deleteTrans(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    if (Obj.data.transaction_type === "CREDIT") {
      Obj.message = `Credit entry from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
      Obj.message += ` was removed by <span class='noti_highlight'>${Obj.name}</span><br/>`;
      Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;
    } else if (Obj.data.transaction_type === "DEBIT") {
      Obj.message = `Debit entry from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
      Obj.message += ` was removed by <span class='noti_highlight'>${Obj.name}</span><br/>`;
      Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;
    }

    return Obj;
  },
  deleteDebitnote(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
      
    Obj.message = `Debit Note from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
    Obj.message += ` was removed by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;

    return Obj;
  },
  deleteCreditnote(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
      
    Obj.message = `Credit Note from the Ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
    Obj.message += ` was removed by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `${currencytxt + amount}, ${Obj.data.payee_name}`;

    return Obj;
  },
  createTransfer(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.from.transaction_amount).toFixed(2);
    Obj.message = `New transfer entry from <span class='noti_bold'>${Obj.data.from.ledger_name}</span>`;
    Obj.message += ` to <span class='noti_highlight'>${Obj.data.to.ledger_name}</span>,`;
    Obj.message += ` Created by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `${currencytxt + amount}.`;

    return Obj;
  },
  updateTransfer(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }

    const amount = parseFloat(Obj.data.from.transaction_amount).toFixed(2);
    Obj.message = `Transfer entry from <span class='noti_bold'>${Obj.data.from.ledger_name}</span>`;
    Obj.message += ` to <span class='noti_highlight'>${Obj.data.to.ledger_name}</span>,`;
    Obj.message += ` was edited by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `${currencytxt + amount}.`;

    return Obj;
  },
  createPayment(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    Obj.message = `Payment entry to the ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>,`;
    Obj.message += ` Created by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `Amount ${currencytxt}${amount} <span class='noti_highlight'>${Obj.data.payee_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.payee_mobileno}</span>`;

    return Obj;
  },
  updatePayment(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    Obj.message = `Payment entry to the ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
    Obj.message += ` has been edited by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `Amount ${currencytxt}${amount} <span class='noti_highlight'>${Obj.data.payee_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.payee_mobileno}</span>`;

    return Obj;
  },
  createDebit(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    Obj.message = `Debit entry to the ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>,`;
    Obj.message += ` Created by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `Amount ${currencytxt}${amount} <span class='noti_highlight'>${Obj.data.payee_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.payee_mobileno}</span>`;

    return Obj;
  },
  createCredit(Obj, req) {
    Obj.PURPOSE = "CREATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    Obj.message = `Credit entry to the ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>,`;
    Obj.message += ` Created by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `Amount ${currencytxt}${amount} <span class='noti_highlight'>${Obj.data.payee_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.payee_mobileno}</span>`;

    return Obj;
  },
  updateDebit(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    Obj.message = `Debit entry to the ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
    Obj.message += ` has been edited by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `Amount ${currencytxt}${amount} <span class='noti_highlight'>${Obj.data.payee_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.payee_mobileno}</span>`;

    return Obj;
  },
  updateCredit(Obj, req) {
    Obj.PURPOSE = "UPDATE";
    Obj.user = req.session.id;
    Obj.role = req.session.role;
    Obj.name = req.session.name;
    Obj.MENU = "ACCOUNTS";
    if (req.session.branch) {
      Obj.division = req.session.branch;
      Obj.division_name = req.session.branch_name;
    } else {
      Obj.division_name = "Lotus Knits";
    }
    const amount = parseFloat(Obj.data.transaction_amount).toFixed(2);
    Obj.message = `Credit entry to the ledger <span class='noti_bold'>${Obj.data.ledger_name}</span>`;
    Obj.message += ` has been edited by <span class='noti_highlight'>${Obj.name}</span><br/>`;
    Obj.message += `Amount ${currencytxt}${amount} <span class='noti_highlight'>${Obj.data.payee_name}</span>,`;
    Obj.message += ` <span class='noti_bold'>${Obj.data.payee_mobileno}</span>`;

    return Obj;
  },
};
