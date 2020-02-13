module.exports = {
  filterdateBycategory(category) {
    const dayAvail = [];
    let start = new Date();
    let end = new Date();
    const isoDate = {};
    dayAvail.SUNDAY = 0;
    dayAvail.MONDAY = 1;
    dayAvail.TUESDAY = 2;
    dayAvail.WEDNESDAY = 3;
    dayAvail.THURSDAY = 4;
    dayAvail.FRIDAY = 5;
    dayAvail.SATURDAY = 6;
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    if (category === "YESTERDAY") {
      start = new Date(start.setDate(start.getDate() - 1));
      end = new Date(end.setDate(end.getDate() - 1));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    } else if (category !== "YESTERDAY" && category !== "TODAY") {
      const filterday = dayAvail[category];
      if (start.getDay() < filterday) {
        start = new Date(start.setDate(start.getDate() - start.getDay() - (7 - filterday)));
        end = new Date(end.setDate(end.getDate() - end.getDay() - (7 - filterday)));
      } else {
        start = new Date(start.setDate(start.getDate() - start.getDay() + filterday));
        end = new Date(end.setDate(end.getDate() - end.getDay() + filterday));
      }
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    }
    return isoDate;
  },
  filterdateByparam(category) {
    let start = new Date();
    let end = new Date();
    const isoDate = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    if (category === "TODAY") {
      start = new Date(start.setDate(start.getDate()));
      end = new Date(end.setDate(end.getDate()));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    } else if (category === "WEEK") {
      start = new Date(start.setDate(start.getDate() - 6));
      end = new Date(end.setDate(end.getDate()));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    } else if (category === "MONTH") {
      start = new Date(start.setDate(start.getDate() - 30));
      end = new Date(end.setDate(end.getDate()));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    }
    return isoDate;
  },
  filterformatdateByparam(category) {
    let start = new Date();
    let end = new Date();
    const isoDate = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    if (category === "TODAY") {
      start = new Date(start.setDate(start.getDate()));
      end = new Date(end.setDate(end.getDate()));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    } else if (category === "WEEK") {
      start = new Date(start.setDate(start.getDate() - 6));
      end = new Date(end.setDate(end.getDate()));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    } else if (category === "MONTH") {
      start = new Date(start.setDate(start.getDate() - 30));
      end = new Date(end.setDate(end.getDate()));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    }
    return isoDate;
  },
  getCustomergraphdate() {
    let start = new Date();
    let end = new Date();
    const isoDate = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);

    start = new Date(start.setDate(1));
    start = new Date(start.setMonth(start.getMonth() - 5));
    end = new Date(end.setDate(end.getDate()));
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);

    isoDate.month_from = start.getMonth();
    isoDate.month_to = end.getMonth();
    return isoDate;
  },
  filterBydate(startdt, enddt) {
    const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
    const start = new Date(startdt.replace(pattern, "$3-$2-$1"));
    const end = new Date(enddt.replace(pattern, "$3-$2-$1"));
    const isoDate = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    return isoDate;
  },
  filterBydateageing(from, to) {
    let start = new Date();
    let end = new Date();
    const isoDate = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    if (end > 0) {
      start = new Date(start.setDate(start.getDate() - to));
      end = new Date(end.setDate(end.getDate() - from));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    }
    return isoDate;
  },
  filterdateBydays(from, to) {
    let start = new Date();
    let end = new Date();
    const isoDate = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 59);
    isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
    isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    if (end > 0) {
      start = new Date(start.setDate(start.getDate() - to));
      end = new Date(end.setDate(end.getDate() - (from + 1)));
      isoDate.startDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
      isoDate.endDate = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
    }

    return isoDate;
  },
  filterparamageing(duedata) {
    let overallDues = [];
    for (let i = 0; i < duedata.length; i += 1) {
      const obj = {};
      obj.dueFrom = duedata[i];
      obj.title = duedata[i];
      if (i < duedata.length-1) {
        obj.dueTo = duedata[i+1];
        obj.title += "To"+duedata[i+1];
      } else {
        obj.dueTo = duedata[i];
        obj.title = "Above"+duedata[i];
      }
      overallDues.push(obj);
    }
    return overallDues;
  },
  getdaysfilter() {
    const start = new Date();
    let isoDate = {};

    start.setHours(23, 59, 59, 59);
    isoDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();

    return isoDate;
  },
  getsessionExpirytime() {
    return parseInt(600 * 60);
  },
  getCurrenttime() {
    const today = new Date();
    return parseInt(today.getTime());
  },
  beforeSave(Obj, req) {
    Obj.updated_by = req.session.id;
    Obj.updated = new Date();
    if (!Obj.created) {
      Obj.created_by = req.session.id;
      Obj.created = Obj.updated;
    }
    return Obj;
  },
  beforeSavelargedata(Obj, req) {
    Obj.updated_by = req.session.id;
    Obj.updated = new Date();
    Obj.updatedstaff_name = req.session.username;
    if (!Obj.created) {
      Obj.created_by = req.session.id;
      Obj.created = Obj.updated;
      Obj.createdstaff_name = req.session.username;
      Obj.createduser_type = req.session.role;
    }
    return Obj;
  },
  beforeSavetransfer(Obj, req) {
    Obj.updated_by = req.session.id;
    Obj.updated = new Date();
    Obj.updatedstaff_name = req.session.username;
    Obj.is_transfer = true;
    if (!Obj.created) {
      Obj.created_by = req.session.id;
      Obj.created = Obj.updated;
      Obj.createdstaff_name = req.session.username;
      Obj.createduser_type = req.session.role;
    }
    return Obj;
  },
  excelexportinfo(Obj, req) {
    Obj.creator = req.session.username;
    Obj.lastModifiedBy = req.session.username;
    Obj.created = new Date();
    Obj.modified = new Date();
    return Obj;
  },
  exceljobcardheader() {
    const reColumns=['Division', 'Job No', 'Job Date', 'Customer Name', 'Priority', 'Status', 'Job Ref no', 
        'Cust DC No', 'Cust DC Date', 'Fabric', 'Process', 'Colour', 'Dia', 'Lot No', 'No of Rolls', 'Weight'];
    return reColumns;
  },
  excelpendingdeliveryheader() {
    const reColumns=['Division', 'Job No', 'Job Date', 'Customer Name', 'Priority', 'Status', 'Job Ref no', 
        'Cust DC No', 'Cust DC Date', 'Fabric', 'Process', 'Colour', 'Dia', 'Lot No', 'No of Rolls', 'Weight', 'Del.Weight', 'Ret.Weight', 'Bal.Weight'];
    return reColumns;
  },
  exceljobcardids() {
    const reColumns=[
        {key:'division', width: 30 },
        {key:'order_no', width: 18 },
        {key:'order_date', width: 13 },
        {key:'customer_name', width: 25 },
        {key:'priority', width: 13 },
        {key:'order_status', width: 22 },
        {key:'order_reference_no', width: 13 },
        {key:'customer_dc_no', width: 13 },
        {key:'customer_dc_date', width: 13 },
        {key:'fabric', width: 18 },
        {key:'process', width: 30 },
        {key:'colour', width: 18 },
        {key:'dia', width: 19 },
        {key:'lot_no', width: 13 },
        {key:'rolls', width: 12 },
        {key:'weight', width: 16 },
    ];
    return reColumns;
  },
  excelpendingdeliveryids() {
    const reColumns=[
        {key:'division', width: 30 },
        {key:'order_no', width: 18 },
        {key:'order_date', width: 13 },
        {key:'customer_name', width: 25 },
        {key:'priority', width: 13 },
        {key:'order_status', width: 22 },
        {key:'order_reference_no', width: 13 },
        {key:'customer_dc_no', width: 13 },
        {key:'customer_dc_date', width: 13 },
        {key:'fabric', width: 18 },
        {key:'process', width: 30 },
        {key:'colour', width: 18 },
        {key:'dia', width: 19 },
        {key:'lot_no', width: 13 },
        {key:'rolls', width: 12 },
        {key:'weight', width: 16 },
        {key:'delivered_weight', width: 16 },
        {key:'returned_weight', width: 16 },
        {key:'balance_weight', width: 16 },
    ];
    return reColumns;
  },
  exceldeliveryheader() {
    const reColumns=['Division', 'Delivery No', 'Delivery Date', 'Customer Name', 'Job No', 'Job Date', 'Job Ref no', 
        'Cust DC No', 'Cust DC Date', 'Fabric', 'Process', 'Colour', 'Dia', 'Lot No', 'No of Rolls', 'Weight'];
    return reColumns;
  },
  exceldeliveryids() {
    const reColumns=[
        {key:'division', width: 30 },
        {key:'delivery_no', width: 18 },
        {key:'delivery_date', width: 13 },
        {key:'customer_name', width: 25 },
        {key:'order_no', width: 18 },
        {key:'order_date', width: 13 },
        {key:'order_reference_no', width: 13 },
        {key:'customer_dc_no', width: 13 },
        {key:'customer_dc_date', width: 13 },
        {key:'fabric', width: 18 },
        {key:'process', width: 30 },
        {key:'colour', width: 18 },
        {key:'dia' },
        {key:'lot_no', width: 13 },
        {key:'rolls', width: 12 },
        {key:'delivery_weight', width: 16 },
    ];
    return reColumns;
  },
  excelpendingpaymentheader() {
    const reColumns=['Division', 'Customer Name', '', 'Pending Amount', 'Total Pending Amount', 'Ledger Balance', 'Excess Payments'];
    return reColumns;
  },
  excelpendingpaymentids() {
    const reColumns=[
        {key:'division', width: 30 },
        {key:'customer_name', width: 30 },
        {key:'division_name', width: 18 },
        {key:'pending_amt', width: 18 },
        {key:'totalpending_amt', width: 18 },
        {key:'ledger_balance', width: 18 },
        {key:'excess_payments', width: 18 },
    ];
    return reColumns;
  },
  generateOTP(idLength) {
    let chars = "0,1,2,3,4,5,6,7,8,9";
    chars = chars.split(",");
    const min = 0;
    const max = chars.length - 1;
    let id = "";
    for (let i = 0; i < idLength; i += 1) {
      id += chars[Math.floor(Math.random() * (((max - min) + 1) + min))];
    }
    return id;
  },
  getdefaultAccount() {
    const bal = 0.00;
    const Currdate = new Date();
    let defAccounts = [
        {division_id : '', opening_balance : bal, current_balance : bal, opening_date : Currdate, name : "SALES CASH", type : "CASH", default : true},
        {division_id : '', opening_balance : bal, current_balance : bal, opening_date : Currdate, name : "CARD SALES", type : "BANK", default : true},
        {division_id : '', opening_balance : bal, current_balance : bal, opening_date : Currdate, name : "Invoice Receivable", type : "INVOICE", default : true},
        {division_id : '', opening_balance : bal, current_balance : bal, opening_date : Currdate, name : "DEBIT NOTE", type : "DEBIT NOTE", default : true},
        {division_id : '', opening_balance : bal, current_balance : bal, opening_date : Currdate, name : "CREDIT NOTE", type : "CREDIT NOTE", default : true}];
    return defAccounts;
  }
};
