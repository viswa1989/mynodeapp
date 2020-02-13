const auth = require("app/middlewares/auth");
const Cauth = require("app/controllers/admin/AuthCtrl");
const Ccustomers = require("app/controllers/admin/CustomerCtrl");
const Caccounts = require("app/controllers/admin/accounts/AccountCtrl");
const Cinvoice = require("app/controllers/admin/accounts/InvoiceCtrl");
const Cactivity = require("app/controllers/admin/ActivityCtrl");
const Cinward = require("app/controllers/admin/InwardCtrl");
const Corder = require("app/controllers/admin/order/OrderCtrl");
const Cdelivery = require("app/controllers/admin/order/DeliveryCtrl");
const Cdeliveryreturn = require("app/controllers/admin/order/DeliveryreturnCtrl");
const Ccommon = require("app/controllers/admin/CommonCtrl");

// Contract modules controller
const Coutward = require("app/controllers/admin/contract/OutwardCtrl");
const Ccontractinward = require("app/controllers/admin/contract/InwardCtrl");

// Setup modules controller
const Cvendor = require("app/controllers/admin/setup/VendorCtrl");
const Ccategorys = require("app/controllers/admin/setup/CategoryCtrl");
const Cproduct = require("app/controllers/admin/setup/ProductCtrl");
const Ccustomergroups = require("app/controllers/admin/setup/CustomergroupCtrl");
const Cdivisions = require("app/controllers/admin/setup/DivisionsCtrl");
const Cdivisionaccount = require("app/controllers/admin/setup/DivisionaccountCtrl");
const Cmanageprocess = require("app/controllers/admin/setup/DivisionManageProcessCtrl");
const Cusers = require("app/controllers/admin/setup/UserCtrl");
const Cpurchaseorder = require("app/controllers/admin/setup/PurchaseorderCtrl");
const Cstock = require("app/controllers/admin/setup/StockCtrl");
const Cutilizedstock = require("app/controllers/admin/setup/UtilizedstockCtrl");
const Cgrnstock = require("app/controllers/admin/setup/GrnstockCtrl");
const Cfabrictype = require("app/controllers/admin/setup/FabrictypeCtrl");
const Cfabriccolor = require("app/controllers/admin/setup/FabriccolorCtrl");
const Cfabricmeasurement = require("app/controllers/admin/setup/FabricmeasurementCtrl");
const Cdyeing = require("app/controllers/admin/setup/DyeingCtrl");
const Ccontractor = require("app/controllers/admin/setup/ContractorCtrl");
const Csmsgateway = require("app/controllers/admin/setup/SmsgatewayCtrl");
const Caccountscategory = require("app/controllers/admin/setup/AccountscategoryCtrl");
const Ctax = require("app/controllers/admin/setup/TaxCtrl");
const Cpreference = require("app/controllers/admin/setup/PreferenceCtrl");

// Reports Controller
const Creports = require("app/controllers/admin/reports/JobreportCtrl");
const Caccreports = require("app/controllers/admin/reports/AccountsreportCtrl");

const Ccustomerauth = require("app/controllers/customer/CustomerAuthCtrl");
const Ccustomerprofile = require("app/controllers/customer/ProfileCtrl");
const Ccustomerdashboard = require("app/controllers/customer/DashboardCtrl");

// Mobile Version controller
const CMobileauth = require("app/controllers/mobile/MobileAuthCtrl");
const CMobileInvoice = require("app/controllers/mobile/MobileInvoiceCtrl");
const CMobileOrder = require("app/controllers/mobile/MobileOrderCtrl");
const CMobileCustomer = require("app/controllers/mobile/MobileCustomerCtrl");
const CMobileActivity = require("app/controllers/mobile/MobileNotificationCtrl");

module.exports = function (app) {
  app.use("/api/authenticate", Cauth);
  app.use("/customerapp/authenticate", Ccustomerauth);
  // Mobile Version API List
  app.use("/api/mobile/login", CMobileauth);
  app.use("/api/mobile/user", CMobileauth);

  app.use("/customerapp/profile", auth.verifyClient, Ccustomerprofile);
  app.use("/customerapp/dashboard", auth.verifyClient, Ccustomerdashboard);
  // Mobile Version API List
  app.use("/api/mobile/customer", auth.verifyToken, CMobileCustomer);
  app.use("/api/mobile/invoice", auth.verifyToken, CMobileInvoice);
  app.use("/api/mobile/order", auth.verifyToken, CMobileOrder);
  app.use("/api/mobile/activity", auth.verifyToken, CMobileActivity);

  app.use("/api/customer", auth.verifyToken, Ccustomers);
  app.use("/api/account", auth.verifyToken, Caccounts);
  app.use("/api/invoice", auth.verifyToken, Cinvoice);
  app.use("/api/activity", auth.verifyToken, Cactivity);
  app.use("/api/inward", auth.verifyToken, Cinward);
  app.use("/api/order", auth.verifyToken, Corder);
  app.use("/api/delivery", auth.verifyToken, Cdelivery);
  app.use("/api/deliveryreturn", auth.verifyToken, Cdeliveryreturn);
  app.use("/api/contract/outward", auth.verifyToken, Coutward);
  app.use("/api/contract/inward", auth.verifyToken, Ccontractinward);
  app.use("/api/common", auth.verifyToken, Ccommon);
  app.use("/api/jobreports", auth.verifyToken, Creports);
  app.use("/api/accountreports", auth.verifyToken, Caccreports);

  // Setup module api handler
  app.use("/api/vendor", auth.verifyToken, Cvendor);
  app.use("/api/categorys", auth.verifyToken, Ccategorys);
  app.use("/api/product", auth.verifyToken, Cproduct);
  app.use("/api/customergroup", auth.verifyToken, Ccustomergroups);
  app.use("/api/division", auth.verifyToken, Cdivisions);
  app.use("/api/divisionaccount", auth.verifyToken, Cdivisionaccount);
  app.use("/api/manageprocess", auth.verifyToken, Cmanageprocess);
  app.use("/api/users", auth.verifyToken, Cusers);
  app.use("/api/purchaseorder", auth.verifyToken, Cpurchaseorder);
  app.use("/api/stock", auth.verifyToken, Cstock);
  app.use("/api/utilizedstock", auth.verifyToken, Cutilizedstock);
  app.use("/api/grnstock", auth.verifyToken, Cgrnstock);
  app.use("/api/fabrictype", auth.verifyToken, Cfabrictype);
  app.use("/api/fabriccolor", auth.verifyToken, Cfabriccolor);
  app.use("/api/fabricmeasurement", auth.verifyToken, Cfabricmeasurement);
  app.use("/api/dyeing", auth.verifyToken, Cdyeing);
  app.use("/api/contractor", auth.verifyToken, Ccontractor);
  app.use("/api/smsgateway", auth.verifyToken, Csmsgateway);
  app.use("/api/accountscategory", auth.verifyToken, Caccountscategory);
  app.use("/api/tax", auth.verifyToken, Ctax);
  app.use("/api/preference", auth.verifyToken, Cpreference);
};
