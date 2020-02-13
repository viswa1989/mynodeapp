/* global angular */
var app = angular.module("lotusKnit", ["ngMask", "ngRoute", "ngAnimate", "angularGrid", "angular.filter", "infiniteScroll", "appRouter",
  "ngFileUpload", "ngSanitize", "chart.js", "ui-notification", "geomapLocation", "mainCtrl", "navigationCtrl", "notificationCtrl", "loginCtrl",
  "dashboardCtrl", "profileCtrl", "reportCtrl", "purchaseCtrl", "purchasestockCtrl", "customerprofileCtrl", "customergroupCtrl", "jobcardreportCtrl", 
  "accountmasterCtrl", "smsCtrl", "preferenesCtrl", "orderviewCtrl", "customerCtrl", "accountCtrl", "jobCtrl", "orderCtrl", "categoryCtrl",
  "ageinganalysisCtrl", "productsCtrl", "deliveryCtrl", "returnCtrl", "outwardCtrl", "userService", "authService", "commonService", "ramnathDirective", 
  "ramnathFilter", "dialogs.main", "ui.bootstrap", "ui.select", "ui.event", "ui.autocomplete", "treeGrid", "ui.multiselect", "ngTagsInput", "divisionsCtrl",
  "vendorCtrl", "pendingpaymentCtrl", "manageCtrl", "dyeingCtrl", "contractorCtrl", "adminuserCtrl", "ordereditCtrl", "deliveryeditCtrl", "returneditCtrl", 
  "outwardeditCtrl"]);

app.config(["ChartJsProvider", function (ChartJsProvider) {
  // Configure all charts
  ChartJsProvider.setOptions({
    chartColors: ["#97BBCD", "#DCDCDC", "#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
  });
  // Configure all doughnut charts
  ChartJsProvider.setOptions("doughnut", {
    cutoutPercentage: 50,
  });
}]);

app.constant("USER_ROLE", [{id: 1, name: "Super Admin"}, {id: 2, name: "Division Admin"}, {id: 3, name: "Manager"}, {id: 4, name: "Supervisor"},
  {id: 5, name: "Order followup & payments"}, {id: 6, name: "Accounts"}, {id: 7, name: "Job card"}]);
app.constant("DATEFORMATS", {short_date: "dd-MM-yyyy", short_date_time: "dd-MM-yyyy h:mma", long_date: "EEE, dd-MM-yyyy", long_date_time: "EEE, dd-MM-yyyy h:mma", 
short_month_time: "dd MMM yyyy h:mma"});
app.constant("weightDifference", 10);

app.constant("PAGES", [
  {privilege_id: 1, page: "Setup", pid: 0},
  {privilege_id: 2, page: "Branches", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 3, page: "Division Item Stock", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 4, page: "Branch Scrap Stock", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 5, page: "Branch Staff", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 6, page: "Branch Account", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 7, page: "Branch Pos Terminal", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 8, page: "Category", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 9, page: "Brands", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 10, page: "Items", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 11, page: "Code Complaints", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 12, page: "Code Item Given", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 13, page: "Customer Group", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 14, page: "Admin Users", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 15, page: "Account Categories", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 16, page: "Account Taxes", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 17, page: "SMS", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 18, page: "Preference", pid: 1, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 19, page: "Orders", pid: 0},
  {privilege_id: 20, page: "Job Card", pid: 19, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 21, page: "Invoice", pid: 19, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 22, page: "Activities", pid: 19, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 23, page: "Comments", pid: 19, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 24, page: "Customers", pid: 0},
  {privilege_id: 25, page: "Customer Report", pid: 24, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 26, page: "Accounts", pid: 0},
  {privilege_id: 27, page: "Accounts", pid: 26, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 28, page: "Reports", pid: 0},
  {privilege_id: 29, page: "Store Statements", pid: 28, Read: 0, Modify: 0, Remove: 0},
  {privilege_id: 30, page: "Vendor", pid: 1, Read: 0, Modify: 0, Remove: 0},
]);
