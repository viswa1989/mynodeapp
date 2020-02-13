const logModel = require("../../app/models/ActivityModel");

const highlightttxt = '<span class="noti_highlight">';
const boldtxt = '<span class="noti_bold">';
const highlightboldtxt = '<span class="noti_highlight noti_bold">';
const normaltxt = '<span class="noti_normal">';
const currencytxt = '<span class="noti_currency">';

module.exports = {
  logData(Obj, req) {
    Obj.created = new Date();
    if (Obj.PAGE !== "LOGIN") {
      if (Obj.PAGE !== "RESET PASSWORD" || (Obj.PAGE === "RESET PASSWORD" && req.session && req.session !== null && req.session.id)) {
        Obj.user = req.session.id;
        Obj.role = req.session.role;
        Obj.name = req.session.name;
        if (req.session.branch) {
          Obj.branch = req.session.branch;
          Obj.branch_name = req.session.branch_name;
        }
      }
    }

    if (Obj.PAGE === "ACCOUNTS" || Obj.PAGE === "ACCOUNTS LEDGER" || Obj.PAGE === "ACCOUNTS TRANSACTION" || Obj.PAGE === "ACCOUNTS TRANSFER" ||
            Obj.PAGE === "ACCOUNTS PAYMENT") {
      Obj.MENU = "ACCOUNTS";
    } else if (Obj.PAGE === "ACCOUNTS CATEGORY" || Obj.PAGE === "BRANCH ACCOUNT" || Obj.PAGE === "BRANCH ACCOUNT PREFIX" ||
        Obj.PAGE === "CUSTOMER" || Obj.PAGE === "CUSTOMER GROUP" || Obj.PAGE === "USER" || Obj.PAGE === "ITEM" || Obj.PAGE === "PREFERENCES" ||
        Obj.PAGE === "BRANCH" || Obj.PAGE === "BRAND" || Obj.PAGE === "CATEGORY" || Obj.PAGE === "COMPLAINTS" || Obj.PAGE === "ITEM GIVEN" ||
        Obj.PAGE === "SERVICE" || Obj.PAGE === "TAX" || Obj.PAGE === "LOGIN" || Obj.PAGE === "LOGOUT" || Obj.PAGE === "RESET PASSWORD") {
      Obj.MENU = "USER ACTIVITY";
    } else if (Obj.PAGE === "GRN" || Obj.PAGE === "RETURN STOCK" || Obj.PAGE === "SCRAP STOCK" || Obj.PAGE === "OPENING STOCK") {
      Obj.MENU = "STOCK";
    } else if (Obj.PAGE === "INVOICE") {
      Obj.MENU = "SALES";
    } else if (Obj.PAGE === "INWARD" || Obj.PAGE === "ORDER") {
      Obj.MENU = "TODO";
    }

    if (Obj.PAGE === "LOGIN") {
      Obj.message = `${highlightttxt + Obj.name}</span> ${boldtxt}logged in</span> to the portal.`;
    } else if (Obj.PAGE === "LOGOUT") {
      Obj.message = `${highlightttxt + Obj.name}</span> ${boldtxt}logged out</span> from the portal.`;
    } else if (Obj.PAGE === "RESET PASSWORD") {
      Obj.message = `${highlightttxt + Obj.name}</span> ${boldtxt}password</span> has been reset.`;
    } else if (Obj.PAGE === "CUSTOMER") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.mobile_no && Obj.customdata.mobile_no !== null) {
          Obj.data.mobile_no = Obj.customdata.mobile_no;
        }
        if (Obj.customdata.email_id && Obj.customdata.email_id !== null) {
          Obj.data.email_id = Obj.customdata.email_id;
        }
        if (Obj.customdata.mobile_no && Obj.customdata.mobile_no !== null) {
          Obj.data.mobile_no = Obj.customdata.mobile_no;
        }
        if (Obj.customdata.address && Obj.customdata.address !== null) {
          Obj.data.address = Obj.customdata.address;
        }
        if (Obj.customdata.branches && Obj.customdata.branches !== null) {
          Obj.data.branches = Obj.customdata.branches;
        }
        if (Obj.customdata.group && Obj.customdata.group !== null) {
          Obj.data.group = Obj.customdata.group;
        }
      }

      if (Obj.PURPOSE === "CREATE") {
        Obj.message = `${boldtxt}New Customer </span>${highlightttxt}${Obj.data.name} </span>added by ${highlightttxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE") {
        Obj.message = `${boldtxt}Customer profile </span>${highlightttxt}${Obj.data.name} </span>edited by ${highlightttxt}${Obj.name}</span>`;
        if (req.session.branch_name && req.session.branch_name !== null && req.session.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${req.session.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "FAVOURITE") {
        Obj.message = `${boldtxt}Customer profile </span>${highlightttxt}${Obj.data.name} </span> has been`;
        if (Obj.customdata.is_favourite && Obj.customdata.is_favourite !== null && Obj.customdata.is_favourite === true) {
          Obj.message += ' added to';
        } else {
          Obj.message += ' removed from';
        }
        Obj.message += ` favorites by ${highlightttxt}${Obj.name}</span>`;
      }
    } else if (Obj.PAGE === "USER") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.role && Obj.customdata.role !== null) {
          Obj.data.role = Obj.customdata.role;
        }
        if (Obj.customdata.email_id && Obj.customdata.email_id !== null) {
          Obj.data.email_id = Obj.customdata.email_id;
        }
        if (Obj.customdata.mobile_no && Obj.customdata.mobile_no !== null) {
          Obj.data.mobile_no = Obj.customdata.mobile_no;
        }
        if (Obj.customdata.type && Obj.customdata.type !== null) {
          Obj.data.type = Obj.customdata.type;
        }
        if (Obj.customdata.branch && Obj.customdata.branch !== null) {
          Obj.data.branch = Obj.customdata.branch;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${normaltxt}New </span>`;
        if (Obj.customdata && Obj.customdata !== null && Obj.customdata.role && Obj.customdata.role !== null && Obj.customdata.role === 1) {
          Obj.message += `${normaltxt}Super Admin </span>`;
        }
        if (Obj.customdata && Obj.customdata !== null && Obj.customdata.role && Obj.customdata.role !== null && Obj.customdata.role === 2) {
          Obj.message += `${normaltxt}Branch Admin </span>`;
        }
        if (Obj.customdata && Obj.customdata !== null && Obj.customdata.role && Obj.customdata.role !== null && Obj.customdata.role > 2) {
          Obj.message += `${normaltxt}Staff </span>`;
        }
        Obj.message += `${normaltxt}User </span>${highlightttxt}${Obj.data.name} </span>created by ${highlightttxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== '') {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${normaltxt}Modified </span>`;
        if (Obj.customdata && Obj.customdata !== null && Obj.customdata.role && Obj.customdata.role !== null && Obj.customdata.role === 1) {
          Obj.message += `${normaltxt}Super Admin </span>`;
        }
        if (Obj.customdata && Obj.customdata !== null && Obj.customdata.role && Obj.customdata.role !== null && Obj.customdata.role === 2) {
          Obj.message += `${normaltxt}Branch Admin </span>`;
        }
        if (Obj.customdata && Obj.customdata !== null && Obj.customdata.role && Obj.customdata.role !== null && Obj.customdata.role > 2) {
          Obj.message += `${normaltxt}Staff </span>`;
        }
        Obj.message += `${normaltxt}User </span>${highlightttxt}${Obj.data.name} </span>by ${highlightttxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "PROFILE UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt + Obj.data.name} </span>${normaltxt}Updated his/her Profile.</span>`;
      } else if (Obj.PURPOSE === "PROFILE PICTURE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt + Obj.data.name} </span>${normaltxt}Updated his/her Profile Picture.</span>`;
      }
    } else if (Obj.PAGE === "BRANCH") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.location && Obj.customdata.location !== null) {
          Obj.data.location = Obj.customdata.location;
        }
        if (Obj.customdata.geolocation && Obj.customdata.geolocation !== null) {
          Obj.data.geolocation = Obj.customdata.geolocation;
        }
        if (Obj.customdata.billing_address && Obj.customdata.billing_address !== null) {
          Obj.data.billing_address = Obj.customdata.billing_address;
        }
        if (Obj.customdata.factory_address && Obj.customdata.factory_address !== null) {
          Obj.data.factory_address = Obj.customdata.factory_address;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Division </span>${highlightboldtxt}${Obj.data.name} </span>was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Division </span>${highlightboldtxt}${Obj.data.name} </span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "BRANCH ACCOUNT") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = Obj.customdata;
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id && Obj.data.division_id &&
        Obj.data.division_id !== null && Obj.data.division_id.name && Obj.data.type) {
        Obj.message = `New Default ${boldtxt}${Obj.data.type}</span> ledger for Division ${boldtxt}${Obj.data.division_id.name}`;
        Obj.message += `</span> was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id && Obj.data.division_id &&
        Obj.data.division_id !== null && Obj.data.division_id.name) {
        Obj.message = `Default ${boldtxt}${Obj.data.type}</span> ledger from Division </span>${boldtxt}${Obj.data.division_id.name}`;
        Obj.message += `</span> was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "BRANCH ACCOUNT PREFIX") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = Obj.customdata;
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id && Obj.data.division_id &&
        Obj.data.division_id !== null && Obj.data.division_id.name) {
        Obj.message = `Account prefix for division ${boldtxt}${Obj.data.division_id.name}</span> `;
        Obj.message += `was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id && Obj.data.division_id &&
        Obj.data.division_id !== null && Obj.data.division_id.name) {
        Obj.message = `Account prefix for division ${boldtxt}${Obj.data.division_id.name}</span> was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "BRAND") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.description && Obj.customdata.description !== null) {
          Obj.data.description = Obj.customdata.description;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Brand </span>${highlightboldtxt}${Obj.data.name} </span>Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Brand </span>${highlightboldtxt}${Obj.data.name} </span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Brand </span>${highlightboldtxt}${Obj.data.name} </span>was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "BRAND PICTURE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Brand ${boldtxt}${Obj.data.name} </span>Picture has been changed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "VENDOR") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.description && Obj.customdata.description !== null) {
          Obj.data.description = Obj.customdata.description;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Vendor </span>${highlightboldtxt}${Obj.data.name} </span>Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Vendor </span>${highlightboldtxt}${Obj.data.name} </span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Vendor </span>${highlightboldtxt}${Obj.data.name} </span>was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "VENDOR PICTURE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Vendor ${boldtxt}${Obj.data.name} </span>Picture has been changed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "CATEGORY") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.level && Obj.customdata.level !== null) {
          Obj.data.level = Obj.customdata.level;
        }
        if (Obj.customdata.code && Obj.customdata.code !== null) {
          Obj.data.code = Obj.customdata.code;
        }
        if (Obj.customdata.serial_no && Obj.customdata.serial_no !== null) {
          Obj.data.serial_no = Obj.customdata.serial_no;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Category </span>${highlightboldtxt}${Obj.data.name} </span>Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Category </span>${highlightboldtxt}${Obj.data.name} </span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Category </span>${highlightboldtxt}${Obj.data.name} </span>was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "STATUS UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Brand ${boldtxt}${Obj.data.name} </span> `;
        if (Obj.data.is_active && Obj.data.is_active === true) {
          Obj.message += 'Enabled ';
        } else {
          Obj.message += 'Disabled ';
        }
        Obj.message += `by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "COMPLAINTS") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.description && Obj.customdata.description !== null) {
          Obj.data.description = Obj.customdata.description;
        }
        if (Obj.customdata.complaint_type && Obj.customdata.complaint_type !== null) {
          Obj.data.complaint_type = Obj.customdata.complaint_type;
        }
        if (Obj.customdata.subcategory_id && Obj.customdata.subcategory_id !== null) {
          Obj.data.subcategory_id = Obj.customdata.subcategory_id;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Complaint Code </span>${highlightboldtxt}${Obj.data.description} </span>`;
        Obj.message += `Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Complaint Code </span>${highlightboldtxt}${Obj.data.description} </span>`;
        Obj.message += `was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Complaint Code </span>${highlightboldtxt}${Obj.data.description} </span>`;
        Obj.message += `was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "STATUS UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Complaint Code ${boldtxt}${Obj.data.description} </span> `;
        if (Obj.data.is_active && Obj.data.is_active === true) {
          Obj.message += 'Enabled ';
        } else {
          Obj.message += 'Disabled ';
        }
        Obj.message += `by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "ITEM GIVEN") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.description && Obj.customdata.description !== null) {
          Obj.data.description = Obj.customdata.description;
        }
        if (Obj.customdata.complaint_type && Obj.customdata.complaint_type !== null) {
          Obj.data.complaint_type = Obj.customdata.complaint_type;
        }
        if (Obj.customdata.subcategory_id && Obj.customdata.subcategory_id !== null) {
          Obj.data.subcategory_id = Obj.customdata.subcategory_id;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Item Given Code </span>${highlightboldtxt}${Obj.data.description} `;
        Obj.message += `</span>Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Item Given Code </span>${highlightboldtxt}${Obj.data.description} `;
        Obj.message += `</span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Item Given Code </span>${highlightboldtxt}${Obj.data.description} </span>`;
        Obj.message += `was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "STATUS UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Item Given Code ${boldtxt}${Obj.data.description} </span> `;
        if (Obj.data.is_active && Obj.data.is_active === true) {
          Obj.message += 'Enabled ';
        } else {
          Obj.message += 'Disabled ';
        }
        Obj.message += `by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "SERVICE") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.subcategory_id && Obj.customdata.subcategory_id !== null) {
          Obj.data.subcategory_id = Obj.customdata.subcategory_id;
        }
        if (Obj.customdata.price && Obj.customdata.price !== null) {
          Obj.data.price = Obj.customdata.price;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Service Code </span>${highlightboldtxt}${Obj.data.name} </span>`;
        Obj.message += `Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Service Code </span>${highlightboldtxt}${Obj.data.name} </span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Service Code </span>${highlightboldtxt}${Obj.data.name} </span>was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "STATUS UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Service Code ${boldtxt}${Obj.data.name} </span> `;
        if (Obj.data.is_active && Obj.data.is_active === true) {
          Obj.message += 'Enabled ';
        } else {
          Obj.message += 'Disabled ';
        }
        Obj.message += `by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "TAX") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.tax_name && Obj.customdata.tax_name !== null) {
          Obj.data.tax_name = Obj.customdata.tax_name;
        }
        if (Obj.customdata.category_id && Obj.customdata.category_id !== null) {
          Obj.data.category_id = Obj.customdata.category_id;
        }
        if (Obj.customdata.commodity_code && Obj.customdata.commodity_code !== null) {
          Obj.data.commodity_code = Obj.customdata.commodity_code;
        }
        if (Obj.customdata.tax_percentage && Obj.customdata.tax_percentage !== null) {
          Obj.data.tax_percentage = Obj.customdata.tax_percentage;
        }
        if (Obj.customdata.type && Obj.customdata.type !== null) {
          Obj.data.type = Obj.customdata.type;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Tax details </span>${highlightboldtxt}${Obj.data.tax_name} </span>`;
        Obj.message += `Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Tax details </span>${highlightboldtxt}${Obj.data.tax_name} </span>was edited by `;
        Obj.message += `${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Tax details </span>${highlightboldtxt}${Obj.data.tax_name} </span>`;
        Obj.message += `was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "STATUS UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Tax details ${boldtxt}${Obj.data.tax_name} </span> `;
        if (Obj.data.is_active && Obj.data.is_active === true) {
          Obj.message += 'Enabled ';
        } else {
          Obj.message += 'Disabled ';
        }
        Obj.message += `by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "ITEM") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.item_name && Obj.customdata.item_name !== null) {
          Obj.data.item_name = Obj.customdata.item_name;
        }
        if (Obj.customdata.item_code && Obj.customdata.item_code !== null) {
          Obj.data.item_code = Obj.customdata.item_code;
        }
        if (Obj.customdata.category_id && Obj.customdata.category_id !== null) {
          Obj.data.category_id = Obj.customdata.category_id;
        }
        if (Obj.customdata.subcategory_id && Obj.customdata.subcategory_id !== null) {
          Obj.data.subcategory_id = Obj.customdata.subcategory_id;
        }
        if (Obj.customdata.brand_id && Obj.customdata.brand_id !== null) {
          Obj.data.brand_id = Obj.customdata.brand_id;
        }
        if (Obj.customdata.minimum_order && Obj.customdata.minimum_order !== null) {
          Obj.data.minimum_order = Obj.customdata.minimum_order;
        }
        if (Obj.customdata.maximum_order && Obj.customdata.maximum_order !== null) {
          Obj.data.maximum_order = Obj.customdata.maximum_order;
        }
        if (Obj.customdata.mrp && Obj.customdata.mrp !== null) {
          Obj.data.mrp = Obj.customdata.mrp;
        }
        if (Obj.customdata.landing_cost && Obj.customdata.landing_cost !== null) {
          Obj.data.landing_cost = Obj.customdata.landing_cost;
        }
        if (Obj.customdata.selling_cost && Obj.customdata.selling_cost !== null) {
          Obj.data.selling_cost = Obj.customdata.selling_cost;
        }
        if (Obj.customdata.isService && Obj.customdata.isService !== null) {
          Obj.data.isService = Obj.customdata.isService;
        }
        if (Obj.customdata.isSales && Obj.customdata.isSales !== null) {
          Obj.data.isSales = Obj.customdata.isSales;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Model </span>${highlightboldtxt}${Obj.data.name} </span>Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Model </span>${highlightboldtxt}${Obj.data.name} </span>was edited by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Model </span>${highlightboldtxt}${Obj.data.name} </span>was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "ITEM PICTURE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Model ${boldtxt}${Obj.data.name} </span>picture has been updated by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "CUSTOMER GROUP") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.default && Obj.customdata.default !== null) {
          Obj.data.default = Obj.customdata.default;
        }
        if (Obj.customdata.is_active && Obj.customdata.is_active !== null) {
          Obj.data.is_active = Obj.customdata.is_active;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}New Customer Group </span>${highlightboldtxt}${Obj.data.name} </span>`;
        Obj.message += `Was Created by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Customer Group </span>${highlightboldtxt}${Obj.data.name} </span>was edited by `;
        Obj.message += `${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `${boldtxt}Customer Group </span>${highlightboldtxt}${Obj.data.name} </span>was removed by `;
        Obj.message += `${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.branch_name && Obj.branch_name !== null && Obj.branch_name !== "") {
          Obj.message += ` at ${boldtxt}${Obj.branch_name}</span>`;
        }
      }
    } else if (Obj.PAGE === "SCRAP STOCK") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata.item_id &&
        Obj.customdata.item_id !== null && Obj.customdata.item_id._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.item_id = Obj.customdata.item_id._id;
        if (Obj.customdata.item_id.name && Obj.customdata.item_id.name !== null) {
          Obj.data.name = Obj.customdata.item_id.name;
        }
        if (Obj.customdata.item_id.item_name && Obj.customdata.item_id.item_name !== null) {
          Obj.data.item_name = Obj.customdata.item_id.item_name;
        }
        if (Obj.customdata.item_id.item_code && Obj.customdata.item_id.item_code !== null) {
          Obj.data.item_code = Obj.customdata.item_id.item_code;
        }
        if (Obj.customdata.units && Obj.customdata.units !== null) {
          Obj.data.units = Obj.customdata.units;
        }
        if (Obj.customdata.quantity && Obj.customdata.quantity !== null) {
          Obj.data.quantity = Obj.customdata.quantity;
        }
        if (Obj.customdata.division_id && Obj.customdata.division_id !== null && Obj.customdata.division_id._id &&
            Obj.customdata.division_id._id !== null) {
          Obj.data.division_id = Obj.customdata.division_id._id;
          Obj.data.branch_name = Obj.customdata.division_id.name;
        }
        if (Obj.customdata.brand_id && Obj.customdata.brand_id !== null) {
          Obj.data.brand_id = Obj.customdata.brand_id;
        }
        if (Obj.customdata.subcategory_id && Obj.customdata.subcategory_id !== null) {
          Obj.data.subcategory_id = Obj.customdata.subcategory_id;
        }
        if (Obj.customdata.category_id && Obj.customdata.category_id !== null) {
          Obj.data.category_id = Obj.customdata.category_id;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `New Scrap Stock ${boldtxt}${Obj.data.name}, ${Obj.data.quantity} ${Obj.data.units}</span> `;
        Obj.message += `added in ${boldtxt}${Obj.data.branch_name}</span> by ${highlightboldtxt}${Obj.name}</span>`;
      }
    } else if (Obj.PAGE === "STOCK") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata.item_id &&
        Obj.customdata.item_id !== null && Obj.customdata.item_id._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.item_id = Obj.customdata.item_id._id;
        if (Obj.customdata.item_id.name && Obj.customdata.item_id.name !== null) {
          Obj.data.name = Obj.customdata.item_id.name;
        }
        if (Obj.customdata.item_id.item_name && Obj.customdata.item_id.item_name !== null) {
          Obj.data.item_name = Obj.customdata.item_id.item_name;
        }
        if (Obj.customdata.item_id.item_code && Obj.customdata.item_id.item_code !== null) {
          Obj.data.item_code = Obj.customdata.item_id.item_code;
        }
        if (Obj.customdata.units && Obj.customdata.units !== null) {
          Obj.data.units = Obj.customdata.units;
        }
        if (Obj.customdata.quantity && Obj.customdata.quantity !== null) {
          Obj.data.quantity = Obj.customdata.quantity;
        }
        if (Obj.customdata.division_id && Obj.customdata.division_id !== null && Obj.customdata.division_id._id &&
            Obj.customdata.division_id._id !== null) {
          Obj.data.division_id = Obj.customdata.division_id._id;
          Obj.data.branch_name = Obj.customdata.division_id.name;
        }
        if (Obj.customdata.brand_id && Obj.customdata.brand_id !== null) {
          Obj.data.brand_id = Obj.customdata.brand_id;
        }
        if (Obj.customdata.subcategory_id && Obj.customdata.subcategory_id !== null) {
          Obj.data.subcategory_id = Obj.customdata.subcategory_id;
        }
        if (Obj.customdata.category_id && Obj.customdata.category_id !== null) {
          Obj.data.category_id = Obj.customdata.category_id;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `New Stock ${boldtxt}${Obj.data.name}, ${Obj.data.quantity} ${Obj.data.units}</span> `;
        Obj.message += `added in ${boldtxt}${Obj.data.branch_name}</span> by ${highlightboldtxt}${Obj.name}</span>`;
      }
    } else if (Obj.PAGE === "GRN") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata.division_id &&
        Obj.customdata.division_id !== null && Obj.customdata.division_id._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id._id;
        Obj.data.branch_name = Obj.customdata.division_id.name;

        if (Obj.customdata.grn_no && Obj.customdata.grn_no !== null) {
          Obj.data.grn_no = Obj.customdata.grn_no;
        }
        if (Obj.customdata.bill_no && Obj.customdata.bill_no !== null) {
          Obj.data.bill_no = Obj.customdata.bill_no;
        }
        if (Obj.customdata.bill_date && Obj.customdata.bill_date !== null) {
          Obj.data.bill_date = Obj.customdata.bill_date;
        }
        if (Obj.customdata.bill_amt && Obj.customdata.bill_amt !== null) {
          Obj.data.bill_amt = Obj.customdata.bill_amt;
        }
        if (Obj.customdata.supplier_name && Obj.customdata.supplier_name !== null) {
          Obj.data.supplier_name = Obj.customdata.supplier_name;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `GRN Stock ${boldtxt}${Obj.data.grn_no}</span> added by ${highlightboldtxt}${Obj.name}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      }
    } else if (Obj.PAGE === "ACCOUNTS CATEGORY") {
      if (Obj.PURPOSE === "UPDATE") {
        Obj.message = `Accounts Category has been updated by ${highlightboldtxt}${Obj.name}</span>`;
      }
    } else if (Obj.PAGE === "ACCOUNTS LEDGER") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata.division_id &&
        Obj.customdata.division_id !== null && Obj.customdata.division_id._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id._id;
        Obj.data.branch_name = Obj.customdata.division_id.name;

        if (Obj.customdata.type && Obj.customdata.type !== null) {
          Obj.data.type = Obj.customdata.type;
        }
        if (Obj.customdata.name && Obj.customdata.name !== null) {
          Obj.data.name = Obj.customdata.name;
        }
        if (Obj.customdata.opening_date && Obj.customdata.opening_date !== null) {
          Obj.data.opening_date = Obj.customdata.opening_date;
        }
        if (Obj.customdata.opening_balance && Obj.customdata.opening_balance !== null) {
          Obj.data.opening_balance = Obj.customdata.opening_balance;
        }
        if (Obj.customdata.current_balance && Obj.customdata.current_balance !== null) {
          Obj.data.current_balance = Obj.customdata.current_balance;
        }
        if (Obj.customdata.default && Obj.customdata.default !== null) {
          Obj.data.default = Obj.customdata.default;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `New Accounts Ledger ${boldtxt}${Obj.data.name} </span>Created for the branch ${boldtxt}${Obj.data.branch_name}`;
        Obj.message += ` </span>by ${highlightboldtxt}${Obj.name}</span>`;
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Accounts Ledger ${boldtxt}${Obj.data.name} </span>${highlightboldtxt}${Obj.data.name} </span>`;
        Obj.message += `was edited by ${highlightboldtxt}${Obj.name}</span>`;
      } else if (Obj.PURPOSE === "FAVOURITE") {
        Obj.message = `Accounts Ledger ${boldtxt}${Obj.data.name} </span> has been`;
        if (Obj.customdata.favourite && Obj.customdata.favourite !== null && Obj.customdata.favourite === true) {
          Obj.message += ' added to';
        } else {
          Obj.message += ' removed from';
        }
        Obj.message += ` favorites by ${highlightttxt}${Obj.name}</span>`;
      }
    } else if (Obj.PAGE === "ACCOUNTS TRANSACTION") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id;
        Obj.data.branch_name = Obj.customdata.branch_name;
        Obj.data.ledger_id = Obj.customdata.ledger_id;
        Obj.data.ledger_name = Obj.customdata.ledger_name;

        if (Obj.customdata.type && Obj.customdata.type !== null) {
          Obj.data.type = Obj.customdata.type;
        }
        if (Obj.customdata.cheque_no && Obj.customdata.cheque_no !== null) {
          Obj.data.cheque_no = Obj.customdata.cheque_no;
        }
        if (Obj.customdata.transaction_date && Obj.customdata.transaction_date !== null) {
          Obj.data.transaction_date = Obj.customdata.transaction_date;
        }
        if (Obj.customdata.transaction_amount && Obj.customdata.transaction_amount !== null) {
          Obj.data.transaction_amount = Obj.customdata.transaction_amount;
        }
        if (Obj.customdata.transaction_type && Obj.customdata.transaction_type !== null) {
          Obj.data.transaction_type = Obj.customdata.transaction_type;
        }
        if (Obj.customdata.category_name && Obj.customdata.category_name !== null) {
          Obj.data.category_name = Obj.customdata.category_name;
        }
        if (Obj.customdata.ledger_balance && Obj.customdata.ledger_balance !== null) {
          Obj.data.ledger_balance = Obj.customdata.ledger_balance;
        }
        if (Obj.customdata.memo && Obj.customdata.memo !== null) {
          Obj.data.memo = Obj.customdata.memo;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        if (Obj.data.transaction_type === "CREDIT") {
          Obj.message = `Amount ${currencytxt}${Obj.data.transaction_amount}</span> Credited to Ledger ${boldtxt}${Obj.data.ledger_name} </span>`;
          Obj.message += `[${Obj.data.branch_name}].<br/>Transaction was Created by ${highlightboldtxt}${Obj.name}</span>`;
        } else if (Obj.data.transaction_type === "DEBIT") {
          Obj.message = `Amount ${currencytxt}${Obj.data.transaction_amount}</span> Debited from Ledger ${boldtxt}${Obj.data.ledger_name} </span>`;
          Obj.message += `[${Obj.data.branch_name}].<br/>Transaction was Created by ${highlightboldtxt}${Obj.name}</span>`;
        }
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        if (Obj.data.transaction_type === "CREDIT") {
          Obj.message = `Amount ${currencytxt}${Obj.data.transaction_amount}</span> Credited to Ledger ${boldtxt}${Obj.data.ledger_name} </span>`;
          Obj.message += `[${Obj.data.branch_name}].<br/>Transaction was edited by ${highlightboldtxt}${Obj.name}</span>`;
        } else if (Obj.data.transaction_type === "DEBIT") {
          Obj.message = `Amount ${currencytxt}${Obj.data.transaction_amount}</span> Debited from Ledger ${boldtxt}${Obj.data.ledger_name} </span>`;
          Obj.message += `[${Obj.data.branch_name}].<br/>Transaction was edited by ${highlightboldtxt}${Obj.name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        if (Obj.data.transaction_type === "CREDIT") {
          Obj.message = `Transaction Amount ${currencytxt}${Obj.data.transaction_amount}</span> Credited to Ledger `;
          Obj.message += `${boldtxt}${Obj.data.ledger_name} </span>[${Obj.data.branch_name}] was removed by ${highlightboldtxt}${Obj.name}</span>`;
        } else if (Obj.data.transaction_type === "DEBIT") {
          Obj.message = `Transaction Amount ${currencytxt}${Obj.data.transaction_amount}</span> Debited from Ledger `;
          Obj.message += `${boldtxt}${Obj.data.ledger_name} </span>[${Obj.data.branch_name}] was removed by ${highlightboldtxt}${Obj.name}</span>`;
        }
      } else if (Obj.PURPOSE === "DELETE BILL TRANSACTION" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Transaction Amount ${currencytxt}${Obj.data.transaction_amount}</span> Credited to Ledger `;
        Obj.message += `${boldtxt}${Obj.data.ledger_name} </span>[${Obj.data.branch_name}] `;
        Obj.message += `allocated for bills was removed by ${highlightboldtxt}${Obj.name}</span>`;
        if (Obj.data.bills && Obj.data.bills !== null && Obj.data.bills.length > 0) {
          Obj.message += `<br/>${boldtxt}Bill Details:  </span>`;
          Obj.data.bills.forEach((bill, index) => {
            if (index !== Obj.data.bills.length - 1) {
              Obj.message += `${bill.invoice_no}, `;
            } else {
              Obj.message += bill.invoice_no;
            }
          });
        }
      }
    } else if (Obj.PAGE === "ACCOUNTS TRANSFER") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata.from && Obj.customdata.to && Obj.customdata.from !== null &&
            Obj.customdata.to !== null && Obj.customdata.from._id && Obj.customdata.to._id) {
        Obj.data = {};
        Obj.data.from_id = Obj.customdata.from._id;
        Obj.data.to_id = Obj.customdata.to._id;
        Obj.data.from_division_id = Obj.customdata.from.division_id;
        Obj.data.from_branch_name = Obj.customdata.from.branch_name;
        Obj.data.to_division_id = Obj.customdata.to.division_id;
        Obj.data.to_branch_name = Obj.customdata.to.branch_name;
        Obj.data.from_ledger_id = Obj.customdata.from.ledger_id;
        Obj.data.from_ledger_name = Obj.customdata.from.ledger_name;
        Obj.data.to_ledger_id = Obj.customdata.to.ledger_id;
        Obj.data.to_ledger_name = Obj.customdata.to.ledger_name;

        if (Obj.customdata.from.cheque_no && Obj.customdata.from.cheque_no !== null) {
          Obj.data.cheque_no = Obj.customdata.from.cheque_no;
        }
        if (Obj.customdata.from.transaction_date && Obj.customdata.from.transaction_date !== null) {
          Obj.data.transaction_date = Obj.customdata.from.transaction_date;
        }
        if (Obj.customdata.from.transaction_amount && Obj.customdata.from.transaction_amount !== null) {
          Obj.data.transaction_amount = Obj.customdata.from.transaction_amount;
        }
        if (Obj.customdata.from.transaction_type && Obj.customdata.from.transaction_type !== null) {
          Obj.data.transaction_type = Obj.customdata.from.transaction_type;
        }
        if (Obj.customdata.from.category_name && Obj.customdata.from.category_name !== null) {
          Obj.data.category_name = Obj.customdata.from.category_name;
        }
        if (Obj.customdata.from.memo && Obj.customdata.from.memo !== null) {
          Obj.data.memo = Obj.customdata.from.memo;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Amount ${currencytxt}${Obj.data.transaction_amount}</span> from Ledger `;
        Obj.message += `${boldtxt}${Obj.data.from_ledger_name} </span>[${Obj.data.from_branch_name}] `;
        Obj.message += `has been transfered to Ledger ${boldtxt}${Obj.data.to_ledger_name} </span>[${Obj.data.to_branch_name}].`;
        Obj.message += `<br/>Transfer was Created by ${highlightboldtxt}${Obj.name}</span>`;
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Transfer Amount ${currencytxt}${Obj.data.transaction_amount}</span> from Ledger `;
        Obj.message += `${boldtxt}${Obj.data.from_ledger_name} </span>[${Obj.data.from_branch_name}] `;
        Obj.message += `to Ledger ${boldtxt}${Obj.data.to_ledger_name} </span>[${Obj.data.to_branch_name}] `;
        Obj.message += `was updated by ${highlightboldtxt}${Obj.name}</span>`;
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Transfer Amount ${currencytxt}${Obj.data.transaction_amount}</span> from Ledger `;
        Obj.message += `${boldtxt}${Obj.data.from_ledger_name} </span>[${Obj.data.from_branch_name}] `;
        Obj.message += `to Ledger ${boldtxt}${Obj.data.to_ledger_name} </span>[${Obj.data.to_branch_name}] `;
        Obj.message += `was removed by ${highlightboldtxt}${Obj.name}</span>`;
      }
    } else if (Obj.PAGE === "ACCOUNTS PAYMENT") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata._id !== null && Obj.customdata._id !== "") {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id;
        Obj.data.branch_name = Obj.customdata.branch_name;
        Obj.data.ledger_id = Obj.customdata.ledger_id;
        Obj.data.ledger_name = Obj.customdata.ledger_name;

        if (Obj.customdata.cheque_no && Obj.customdata.cheque_no !== null) {
          Obj.data.cheque_no = Obj.customdata.cheque_no;
        }
        if (Obj.customdata.transaction_date && Obj.customdata.transaction_date !== null) {
          Obj.data.transaction_date = Obj.customdata.transaction_date;
        }
        if (Obj.customdata.transaction_amount && Obj.customdata.transaction_amount !== null) {
          Obj.data.transaction_amount = Obj.customdata.transaction_amount;
        }
        if (Obj.customdata.transaction_type && Obj.customdata.transaction_type !== null) {
          Obj.data.transaction_type = Obj.customdata.transaction_type;
        }
        if (Obj.customdata.category_name && Obj.customdata.category_name !== null) {
          Obj.data.category_name = Obj.customdata.category_name;
        }
        if (Obj.customdata.memo && Obj.customdata.memo !== null) {
          Obj.data.memo = Obj.customdata.memo;
        }
        if (Obj.customdata.type && Obj.customdata.type !== null) {
          Obj.data.type = Obj.customdata.type;
        }
        if (Obj.customdata.payee_id && Obj.customdata.payee_id !== null) {
          Obj.data.payee_id = Obj.customdata.payee_id;
        }
        if (Obj.customdata.payee_name && Obj.customdata.payee_name !== null) {
          Obj.data.payee_name = Obj.customdata.payee_name;
        }
        if (Obj.customdata.payee_mobileno && Obj.customdata.payee_mobileno !== null) {
          Obj.data.payee_mobileno = Obj.customdata.payee_mobileno;
        }
        if (Obj.customdata.bills && Obj.customdata.bills !== null && Obj.customdata.bills.length > 0) {
          Obj.data.bills = Obj.customdata.bills;
        }
        if (Obj.customdata.ledger_balance && Obj.customdata.ledger_balance !== null) {
          Obj.data.ledger_balance = Obj.customdata.ledger_balance;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Payment ${currencytxt}${Obj.data.transaction_amount}</span> received by ${highlightttxt}${Obj.name} </span>.<br/>`;
        Obj.message += `${highlightboldtxt + Obj.data.payee_name}</span>, ${boldtxt}${Obj.data.payee_mobileno}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      }
    } else if (Obj.PAGE === "INVOICE") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata._id !== null && Obj.customdata._id !== "" &&
        Obj.customdata.division_id && Obj.customdata.division_id !== null && Obj.customdata.division_id._id &&
        Obj.customdata.division_id._id !== null) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id._id;
        Obj.data.branch_name = Obj.customdata.division_id.name;
        Obj.data.ledger_id = Obj.customdata.ledger_id;

        if (Obj.customdata.invoice_date && Obj.customdata.invoice_date !== null) {
          Obj.data.invoice_date = Obj.customdata.invoice_date;
        }
        if (Obj.customdata.invoicedue_date && Obj.customdata.invoicedue_date !== null) {
          Obj.data.invoicedue_date = Obj.customdata.invoicedue_date;
        }
        if (Obj.customdata.invoice_no && Obj.customdata.invoice_no !== null) {
          Obj.data.invoice_no = Obj.customdata.invoice_no;
        }
        if (Obj.customdata.customer_id && Obj.customdata.customer_id !== null) {
          Obj.data.customer_id = Obj.customdata.customer_id;
        }
        if (Obj.customdata.customer_name && Obj.customdata.customer_name !== null) {
          Obj.data.customer_name = Obj.customdata.customer_name;
        }
        if (Obj.customdata.customer_mobile_no && Obj.customdata.customer_mobile_no !== null) {
          Obj.data.customer_mobile_no = Obj.customdata.customer_mobile_no;
        }
        if (Obj.customdata.type && Obj.customdata.type !== null) {
          Obj.data.type = Obj.customdata.type;
        }
        if (Obj.customdata.payment_status && Obj.customdata.payment_status !== null) {
          Obj.data.payment_status = Obj.customdata.payment_status;
        }
        if (Obj.customdata.total && Obj.customdata.total !== null) {
          Obj.data.total = Obj.customdata.total;
        }
        if (Obj.customdata.paid && Obj.customdata.paid !== null) {
          Obj.data.paid = Obj.customdata.paid;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `New Invoice ${boldtxt}${Obj.data.invoice_no}</span> by ${highlightttxt}${Obj.name} </span>.<br/>`;
        Obj.message += `${highlightboldtxt + Obj.data.customer_name}</span>, ${boldtxt}${Obj.data.customer_mobile_no}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      } else if (Obj.PURPOSE === "UPDATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Invoice ${boldtxt}${Obj.data.invoice_no}</span> has been update by ${highlightttxt}${Obj.name} </span>.<br/>`;
        Obj.message += `${highlightboldtxt + Obj.data.customer_name}</span>, ${boldtxt}${Obj.data.customer_mobile_no}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      } else if (Obj.PURPOSE === "DELETE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `Invoice ${boldtxt}${Obj.data.invoice_no}</span> was removed by ${highlightttxt}${Obj.name} </span>.<br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      }
    } else if (Obj.PAGE === "INWARD") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata._id !== null && Obj.customdata._id !== ""
                && Obj.customdata.division_id && Obj.customdata.division_id !== null && Obj.branch_name && Obj.branch_name !== null) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id;
        Obj.data.branch_name = Obj.branch_name;

        if (Obj.customdata.inward_no && Obj.customdata.inward_no !== null) {
          Obj.data.inward_no = Obj.customdata.inward_no;
        }
        if (Obj.customdata.customer_id && Obj.customdata.customer_id !== null) {
          Obj.data.customer_id = Obj.customdata.customer_id;
        }
        if (Obj.customdata.customer_name && Obj.customdata.customer_name !== null) {
          Obj.data.customer_name = Obj.customdata.customer_name;
        }
        if (Obj.customdata.customer_mobile_no && Obj.customdata.customer_mobile_no !== null) {
          Obj.data.customer_mobile_no = Obj.customdata.customer_mobile_no;
        }
        if (Obj.customdata.inward_date && Obj.customdata.inward_date !== null) {
          Obj.data.inward_date = Obj.customdata.inward_date;
        }
        if (Obj.customdata.inward_status && Obj.customdata.inward_status !== null) {
          Obj.data.inward_status = Obj.customdata.inward_status;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `New Inward ${boldtxt}${Obj.data.inward_no}</span> created by ${highlightttxt}${Obj.name} </span>.<br/>`;
        Obj.message += `${highlightboldtxt + Obj.data.customer_name}</span>, ${boldtxt}${Obj.data.customer_mobile_no}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      }
    } else if (Obj.PAGE === "ORDER") {
      if (Obj.customdata && Obj.customdata !== null && Obj.customdata._id && Obj.customdata._id !== null && Obj.customdata._id !== ""
                && Obj.customdata.division_id && Obj.customdata.division_id !== null && Obj.branch_name && Obj.branch_name !== null) {
        Obj.data = {};
        Obj.data._id = Obj.customdata._id;
        Obj.data.division_id = Obj.customdata.division_id;
        Obj.data.branch_name = Obj.branch_name;

        if (Obj.customdata.order_no && Obj.customdata.order_no !== null) {
          Obj.data.order_no = Obj.customdata.order_no;
        }
        if (Obj.customdata.customer_id && Obj.customdata.customer_id !== null) {
          Obj.data.customer_id = Obj.customdata.customer_id;
        }
        if (Obj.customdata.customer_name && Obj.customdata.customer_name !== null) {
          Obj.data.customer_name = Obj.customdata.customer_name;
        }
        if (Obj.customdata.customer_mobile_no && Obj.customdata.customer_mobile_no !== null) {
          Obj.data.customer_mobile_no = Obj.customdata.customer_mobile_no;
        }
        if (Obj.customdata.order_date && Obj.customdata.order_date !== null) {
          Obj.data.order_date = Obj.customdata.order_date;
        }
        if (Obj.customdata.order_status && Obj.customdata.order_status !== null) {
          Obj.data.order_status = Obj.customdata.order_status;
        }
      }

      if (Obj.PURPOSE === "CREATE" && Obj.data && Obj.data !== null && Obj.data._id) {
        Obj.message = `New Order ${boldtxt}${Obj.data.order_no}</span> created by ${highlightttxt}${Obj.name} </span>.<br/>`;
        Obj.message += `${highlightboldtxt + Obj.data.customer_name}</span>, ${boldtxt}${Obj.data.customer_mobile_no}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      } else if (Obj.PURPOSE === "STATUS UPDATE" && Obj.data && Obj.data !== null && Obj.data._id && Obj.data.order_status &&
        Obj.data.order_status !== null && Obj.data.order_status !== "") {
        Obj.message = `Order ${boldtxt}${Obj.data.order_no}</span> status updated to `;
        Obj.message += `${boldtxt}${Obj.data.order_status} </span>, by ${boldtxt}${Obj.name} </span><br/>`;
        Obj.message += `${highlightboldtxt + Obj.data.customer_name}</span>, ${boldtxt}${Obj.data.customer_mobile_no}</span><br/>`;
        Obj.message += `${boldtxt + Obj.data.branch_name}</span>`;
      }
    }

    if (Obj.message && Obj.message !== "") {
      Obj.message += '.';
      const activityModel = new logModel({
        message: Obj.message,
        name: Obj.name,
        user: Obj.user,
        role: Obj.role,
        MENU: Obj.MENU,
        PAGE: Obj.PAGE,
        PURPOSE: Obj.PURPOSE,
      });
      if (Obj.data && Obj.data !== null && Obj.data !== "" && Obj.data._id) {
        activityModel.data = Obj.data;
        activityModel.linkid = Obj.data._id;
      }
      if (Obj.branch && Obj.branch !== null && Obj.branch !== "") {
        activityModel.branch = Obj.branch;
        activityModel.branch_name = Obj.data.branch_name;
      }
      activityModel.save((err, users) => {
        req.io.sockets.emit("updateNotification", users);
      });
    }
  },
};
