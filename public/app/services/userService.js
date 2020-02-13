/* global angular */
// each function returns a promise object
angular.module("userService", []).factory("UserService", ($http, Upload) => {
  return {
    me(success) {
      $http.get("/api/users/me").success(success);
    },
    currentuser(success) {
      $http.get("/customerapp/profile/me").success(success);
    },
    getUsers(params, success, error) {
      $http.get(`/api/users/userlist/${params}`).success(success).error(error);
    },
    getPrivilegelist(success, error) {
      $http.get("/api/users/privilegelist").success(success).error(error);
    },
    getAdmins(success, error) {
      $http.get("/api/users/adminlist").success(success).error(error);
    },
    getById(Id, success, error) {
      $http.get(`/api/users/view/${Id}`).success(success).error(error);
    },
    create(params, success, error) {
      Upload.upload({
        url: "/api/users/create",
        method: "POST",
        data: params.userForm,
        file: params.profile_picture,
      }).success(success).error(error);
    },
    update(params, success, error) {
      $http.post("/api/users/update", params).success(success).error(error);
    },
    delete(params, success, error) {
      $http.post("/api/users/delete/", params).success(success).error(error);
    },
    updatePicture(params, success, error) {
      Upload.upload({
        url: "/api/users/update_picture",
        method: "POST",
        arrayKey: '',
        data: params.userForm,
        file: params.profile_picture,
      }).success(success).error(error);
    },
    userprofile(success) {
      $http.get("/api/users/userprofile").success(success);
    },
    updateProfile(params, success, error) {
      $http.post("/api/users/updateProfile", params).success(success).error(error);
    },
  };
}).factory("VendorService", ($http, Upload) => {
  return {
    get(success, error) {
      $http.get("/api/vendor/list").success(success).error(error);
    },
    getById(Id, success, error) {
      $http.get(`/api/vendor/view/${Id}`).success(success).error(error);
    },
    create(params, success, error) {
      Upload.upload({
        url: "/api/vendor/create",
        method: "POST",
        data: params.vendorForm,
        file: params.vendor_picture,
      }).success(success).error(error);
    },
    update(params, success, error) {
      $http.post("/api/vendor/update", params).success(success).error(error);
    },
    delete(params, success, error) {
      $http.post("/api/vendor/delete/", params).success(success).error(error);
    },
    updatePicture(params, success, error) {
      Upload.upload({
        url: "/api/vendor/update_picture",
        method: "POST",
        data: params.vendorForm,
        file: params.vendor_picture,
      }).success(success).error(error);
    },
    statusupdate(params, success, error) {
      $http.post("/api/vendor/statusupdate", params).success(success).error(error);
    },
    getVendorautocomplete(params, success, error) {
      $http.get(`/api/vendor/getVendorautocomplete/${params}`).success(success).error(error);
    },
  };
}).factory("CategoryService", ($http) => {
  return {
    get(success, error) {
      $http.get("/api/categorys/list").success(success).error(error);
    },
    getCategory(success, error) {
      $http.get("/api/categorys/getCategory").success(success).error(error);
    },
    getCategorydetailsById(Id, success, error) {
      $http.get(`/api/categorys/getCategorydetailsById/${Id}`).success(success).error(error);
    },
    create(params, success, error) {
      $http.post("/api/categorys/create", params).success(success).error(error);
    },
    update(params, success, error) {
      $http.post("/api/categorys/update", params).success(success).error(error);
    },
    delete(params, success, error) {
      $http.post("/api/categorys/delete/", params).success(success).error(error);
    },
    updatestatus(params, success, error) {
      $http.post("/api/categorys/updatestatus", params).success(success).error(error);
    },
    statusupdate(params, success, error) {
      $http.post("/api/categorys/statusupdate", params).success(success).error(error);
    },
    getCategoryautocomplete(params, success, error) {
      $http.get(`/api/categorys/getCategoryautocomplete/${params}`).success(success).error(error);
    },
  };
})
  .factory("ProductService", ($http, Upload) => {
    return {
      get(success, error) {
        $http.get("/api/product/list").success(success).error(error);
      },
      getById(Id, success, error) {
        $http.get(`/api/product/view/${Id}`).success(success).error(error);
      },
      create(params, success, error) {
        Upload.upload({
          url: "/api/product/create",
          method: "POST",
          data: params.productForm,
          file: params.product_picture,
        }).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/product/update", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/product/delete/", params).success(success).error(error);
      },
      updatePicture(params, success, error) {
        Upload.upload({
          url: "/api/product/update_picture",
          method: "POST",
          data: params.productForm,
          file: params.product_picture,
        }).success(success).error(error);
      },
      statusupdate(params, success, error) {
        $http.post("/api/product/statusupdate", params).success(success).error(error);
      },
      getProductsautocomplete(params, success, error) {
        $http.post("/api/product/getProductsautocomplete", params).success(success).error(error);
      },
    };
  })
  .factory("TaxService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/tax/list").success(success).error(error);
      },
      getById(Id, success, error) {
        $http.get(`/api/tax/view/${Id}`).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/tax/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/tax/update", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/tax/delete/", params).success(success).error(error);
      },
    };
  })
  .factory("DivisionService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/division/list").success(success).error(error);
      },
      getById(Id, success, error) {
        $http.get(`/api/division/view/${Id}`).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/division/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/division/update", params).success(success).error(error);
      },
      getallDivisiondetails(success, error) {
        $http.get("/api/division/getallDivisiondetails").success(success).error(error);
      },
      getStatelist(success, error) {
        $http.get("/api/division/getStatelist").success(success).error(error);
      },
      getDivisions(success, error) {
        $http.get("/api/division/getDivisions").success(success).error(error);
      },
    };
  })
  .factory("manageProcessService", ($http, Upload) => {
    return {
      create(params, success, error) {
        Upload.upload({
          url: "/api/manageprocess/create",
          method: "POST",
          data: params.processForm,
          file: params.process_picture,
        }).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/manageprocess/update", params).success(success).error(error);
      },
      updatePicture(params, success, error) {
        Upload.upload({
          url: "/api/manageprocess/update_picture",
          method: "POST",
          data: params.processForm,
          file: params.process_picture,
        }).success(success).error(error);
      },
      initialize(Id, success, error) {
        $http.get(`/api/manageprocess/initialize/${Id}`).success(success).error(error);
      },
      statusupdate(params, success, error) {
        $http.post("/api/manageprocess/statusupdate", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/manageprocess/delete/", params).success(success).error(error);
      },
    };
  })
  .factory("DivisionAccountService", ($http) => {
    return {
      get(divisionId, success, error) {
        $http.get(`/api/divisionaccount/list/${divisionId}`).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/divisionaccount/create", params).success(success).error(error);
      },
    };
  })
  .factory("StockService", ($http) => {
    return {
      initializedata(division, success, error) {
        $http.get(`/api/stock/initializedata/${division}`).success(success).error(error);
      },
      get(params, success, error) {
        $http.post("/api/stock/list", params).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/stock/create", params).success(success).error(error);
      },
      getsubcategory(params, success, error) {
        $http.get(`/api/categorys/getsubcategory/${params}`).success(success).error(error);
      },
      createopeningstock(params, success, error) {
        $http.post("/api/stock/createopeningstock", params).success(success).error(error);
      },
      updateopeningstock(params, success, error) {
        $http.post("/api/stock/updateopeningstock", params).success(success).error(error);
      },
      getstockbyBranch(success, error) {
        $http.get("/api/stock/listbyBranch").success(success).error(error);
      },
      getStockbydivision(Id, success, error) {
        $http.get(`/api/stock/getStockbydivision/${Id}`).success(success).error(error);
      },
    };
  })
  .factory("UtiliizedstockService", ($http) => {
    return {
      get(params, success, error) {
        $http.post("/api/utilizedstock/list", params).success(success).error(error);
      },
      initializedata(division, success, error) {
        $http.get(`/api/utilizedstock/initializedata/${division}`).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/utilizedstock/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/utilizedstock/update", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/utilizedstock/delete/", params).success(success).error(error);
      },
    };
  })
  .factory("CustomergroupService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/customergroup/list").success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/customergroup/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/customergroup/update", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/customergroup/delete/", params).success(success).error(error);
      },
      updateDiscount(params, success, error) {
        $http.post("/api/customergroup/updateDiscount", params).success(success).error(error);
      },
    };
  })
  .factory("PreferenceService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/preference/list").success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/preference/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/preference/update", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/preference/delete/", params).success(success).error(error);
      },
      updatestatus(params, success, error) {
        $http.post("/api/preference/updatestatus", params).success(success).error(error);
      },
      updatePreferencelist(params, success, error) {
        $http.post("/api/preference/updatePreferencelist", params).success(success).error(error);
      },
      getPendingdues(success, error) {
        $http.get("/api/preference/getPendingdues").success(success).error(error);
      },
      getPendingduelist(success, error) {
        $http.get("/api/preference/getPendingduelist").success(success).error(error);
      },
      getcustomerPendingdues(success, error) {
        $http.get("/customerapp/dashboard/getPendingdues").success(success).error(error);
      },
      getdateFormats(params, success, error) {
        if (params === "customer") {
          $http.get("/customerapp/dashboard/getdateFormats").success(success).error(error);
        } else {
          $http.get("/api/preference/getdateFormats").success(success).error(error);
        }
      },
      getweightDifference(success, error) {
        $http.get("/api/preference/getweightDifference").success(success).error(error);
      },
    };
  })
  .factory("SmsgatewayService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/smsgateway/list").success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/smsgateway/save", params).success(success).error(error);
      },
    };
  })
  .factory("AccountcategoryService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/accountscategory/list").success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/accountscategory/update", params).success(success).error(error);
      },
    };
  })
  .factory("GrnStockService", ($http) => {
    return {
      get(params, success, error) {
        $http.post("/api/grnstock/grnlist", params).success(success).error(error);
      },
      getReturn(params, success, error) {
        $http.post("/api/grnstock/grnreturnlist", params).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/grnstock/create", params).success(success).error(error);
      },
      createreturnStock(params, success, error) {
        $http.post("/api/grnstock/createreturnStock", params).success(success).error(error);
      },
      getsubcategory(params, success, error) {
        $http.get(`/api/categorys/getsubcategory/${params}`).success(success).error(error);
      },
      getgrn(success, error) {
        $http.get("/api/grnstock/getgrn/").success(success).error(error);
      },
      getGrnautocomplete(params, success, error) {
        $http.get(`/api/grnstock/getGrnautocomplete/${params}`).success(success).error(error);
      },
      getGrndetails(params, success, error) {
        $http.get(`/api/grnstock/getGrndetails/${params}`).success(success).error(error);
      },
    };
  })
  .factory("PurchaseService", ($http) => {
    return {
      create(params, success, error) {
        $http.post("/api/purchaseorder/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/purchaseorder/update", params).success(success).error(error);
      },
      get(params, success, error) {
        $http.post("/api/purchaseorder/list", params).success(success).error(error);
      },
      printPodata(params, success, error) {
        $http.get(`/api/purchaseorder/printPodata/${params}`).success(success).error(error);
      },
      deny(params, success, error) {
        $http.get(`/api/purchaseorder/deny/${params._id}`).success(success).error(error);
      },
      cancel(params, success, error) {
        $http.get(`/api/purchaseorder/cancel/${params._id}`).success(success).error(error);
      },
      confirm(params, success, error) {
        $http.get(`/api/purchaseorder/confirm/${params._id}/${params.OTP}`).success(success).error(error);
      },
      getPoautocomplete(params, success, error) {
        $http.get(`/api/purchaseorder/getPoautocomplete/${params}`).success(success).error(error);
      },
      getPurchasebydivision(params, success, error) {
        $http.get(`/api/purchaseorder/getPurchasebydivision/${params}`).success(success).error(error);
      },
    };
  })
  .factory("CustomerService", ($http) => {
    return {
      get(params, success, error) {
        $http.post("/api/customer/list", params).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/customer/create", params).success(success).error(error);
      },
      partialcreate(params, success, error) {
        $http.post("/api/customer/partialcreate", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/customer/update", params).success(success).error(error);
      },
      getFilterdata(success, error) {
        $http.get("/api/customer/getFilterdata").success(success).error(error);
      },
      view(params, success, error) {
        $http.get(`/api/customer/view/${params}`).success(success).error(error);
      },
      viewhistory(success, error) {
        $http.get("/customerapp/profile/viewhistory").success(success).error(error);
      },
      getCustomer(params, success, error) {
        $http.get(`/api/customer/getCustomer/${params.term}/${params.division_id}`).success(success).error(error);
      },
      setFavourite(params, success, error) {
        $http.post("/api/customer/setFavourite/", params).success(success).error(error);
      },
      getcustomerDetails(params, success, error) {
        $http.post("/api/customer/getcustomerDetails", params).success(success).error(error);
      },
      getcustomerbyDivision(params, success, error) {
        $http.post("/api/customer/getcustomerbyDivision", params).success(success).error(error);
      },
      getcustomerTransactions(params, success, error) {
        $http.get(`/api/customer/getcustomerTransactions/${params}`).success(success).error(error);
      },
      updateGroup(params, success, error) {
        $http.post("/api/customer/updateGroup", params).success(success).error(error);
      },
      savegstDetails(params, success, error) {
        $http.post("/api/customer/savegstDetails", params).success(success).error(error);
      },
    };
  })
  .factory("AccountService", ($http) => {
    return {
      initializedata(success, error) {
        $http.get("/api/account/initializedata").success(success).error(error);
      },
      createledger(params, success, error) {
        $http.post("/api/account/createledger", params).success(success).error(error);
      },
      updateledger(params, success, error) {
        $http.post("/api/account/updateledger", params).success(success).error(error);
      },
      getledgerDetails(params, success, error) {
        let prm = `${params._id}/${params.type}`;
        if (angular.isDefined(params.FromDate)) {
          prm += `?FromDate=${params.FromDate}&ToDate=${params.ToDate}`;
        }
        $http.get(`/api/account/getledgerDetails/${prm}`).success(success).error(error);
      },
      getaccountCategoryDetails(success, error) {
        $http.get("/api/account/getaccountCategoryDetails").success(success).error(error);
      },
      saveTransaction(params, success, error) {
        $http.post("/api/account/saveTransaction", params).success(success).error(error);
      },
      saveTransfer(params, success, error) {
        $http.post("/api/account/saveTransfer", params).success(success).error(error);
      },
      updateTransaction(params, success, error) {
        $http.post("/api/account/updateTransaction", params).success(success).error(error);
      },
      updateTransfer(params, success, error) {
        $http.post("/api/account/updateTransfer", params).success(success).error(error);
      },
      getTransaction(params, success, error) {
        $http.get(`/api/account/getTransaction/${params}`).success(success).error(error);
      },
      getcreditnote(params, success, error) {
        $http.post("/api/account/getcreditnote/", params).success(success).error(error);
      },
      deleteTransaction(params, success, error) {
        $http.post("/api/account/deleteTransaction", params).success(success).error(error);
      },
      deleteTransfer(params, success, error) {
        $http.post("/api/account/deleteTransfer", params).success(success).error(error);
      },
      getpendingBills(params, success, error) {
        $http.get(`/api/account/getpendingBills/${params}`).success(success).error(error);
      },
      getcustomerPendingbills(params, success, error) {
        $http.get(`/api/account/getcustomerPendingbills/${params}`).success(success).error(error);
      },
      getpaidBills(params, success, error) {
        $http.post("/api/account/getpaidBills/", params).success(success).error(error);
      },
      deleteInvoicetrans(params, success, error) {
        $http.post("/api/account/deleteInvoicetrans", params).success(success).error(error);
      },
      savePayment(params, success, error) {
        $http.post("/api/account/savePayment", params).success(success).error(error);
      },
      updatePayment(params, success, error) {
        $http.post("/api/account/updatePayment", params).success(success).error(error);
      },
      deletePayment(params, success, error) {
        $http.post("/api/account/deletePayment", params).success(success).error(error);
      },
      saveDebit(params, success, error) {
        $http.post("/api/account/saveDebit", params).success(success).error(error);
      },
      updateDebit(params, success, error) {
        $http.post("/api/account/updateDebit", params).success(success).error(error);
      },
      deleteDebitnote(params, success, error) {
        $http.post("/api/account/deleteDebitnote", params).success(success).error(error);
      },
      saveCredit(params, success, error) {
        $http.post("/api/account/saveCredit", params).success(success).error(error);
      },
      updateCredit(params, success, error) {
        $http.post("/api/account/updateCredit", params).success(success).error(error);
      },
      deleteCreditnote(params, success, error) {
        $http.post("/api/account/deleteCreditnote", params).success(success).error(error);
      },
      setFavourite(params, success, error) {
        $http.post("/api/account/setFavourite/", params).success(success).error(error);
      },
      setFlag(params, success, error) {
        $http.post("/api/account/setFlag/", params).success(success).error(error);
      },
      setdivisionFlag(params, success, error) {
        $http.post("/api/account/setdivisionFlag/", params).success(success).error(error);
      },
      getDebitprefix(params, success, error) {
        $http.get(`/api/account/getDebitprefix/${params.division_id}`).success(success).error(error);
      },
      getCreditprefix(params, success, error) {
        $http.get(`/api/account/getCreditprefix/${params.division_id}`).success(success).error(error);
      },
    };
  })
  .factory("InvoiceService", ($http) => {
    return {
      getInvoicedetails(params, success, error) {
        $http.get(`/api/invoice/getInvoicedetails/${params.division_id}`).success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/invoice/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/invoice/update", params).success(success).error(error);
      },
      getInvoices(params, success, error) {
        if (params.type === "INVOICE") {
          $http.get(`/api/invoice/getInvoices/${params._id}/${params.division_id}/${params.type}`).success(success).error(error);
        } else if (params.type === "SALES") {
          $http.get(`/api/invoice/getInvoices/${params._id}/${params.division_id}/${params.type}`).success(success).error(error);
        }
      },
      printInvoicedata(params, success, error) {
        $http.get(`/api/invoice/printInvoicedata/${params}`).success(success).error(error);
      },
      regenerateInvoice(params, success, error) {
        $http.get(`/api/invoice/regenerateInvoice/${params._id}/${params.division_id}/${params.customer_id}`).success(success).error(error);
      },
      getPendinginvoice(params, success, error) {
        $http.post("/api/invoice/getPendinginvoice/", params).success(success).error(error);
      },
      getcustomerPendinginvoice(params, success, error) {
        $http.post("/customerapp/dashboard/getPendinginvoice/", params).success(success).error(error);
      },
      viewinvoice(params, success, error) {
        $http.get(`/api/invoice/viewinvoice/${params}`).success(success).error(error);
      },
      viewcustomerInvoice(params, success, error) {
        $http.get(`/customerapp/profile/viewinvoice/${params}`).success(success).error(error);
      },
    };
  })
  .factory("ActivityService", ($http) => {
    return {
      getNotification(params, success, error) {
        $http.get(`/api/activity/getNotification/${params.category}/${params.period}/${params.skip}/${params.limit}`).success(success).error(error);
      },
      getJobActivity(params, success, error) {
        $http.get(`/api/activity/getJobActivity/${params}`).success(success).error(error);
      },
      viewActivity(params, success, error) {
        $http.get(`/api/activity/viewActivity/${params}`).success(success).error(error);
      },
      vieworderActivity(params, success, error) {
        $http.get(`/customerapp/dashboard/viewActivity/${params}`).success(success).error(error);
      },
    };
  })
  .factory("TypeService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/fabrictype/list").success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/fabrictype/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/fabrictype/update", params).success(success).error(error);
      },
      statusupdate(params, success, error) {
        $http.post("/api/fabrictype/statusupdate", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/fabrictype/delete/", params).success(success).error(error);
      },
      getfabricDetails(params, success, error) {
        $http.post("/api/fabrictype/getfabricDetails/", params).success(success).error(error);
      },
    };
  })
  .factory("ColorService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/fabriccolor/list/").success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/fabriccolor/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/fabriccolor/update", params).success(success).error(error);
      },
      statusupdate(params, success, error) {
        $http.post("/api/fabriccolor/statusupdate", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/fabriccolor/delete/", params).success(success).error(error);
      },
    };
  })
  .factory("MeasureService", ($http) => {
    return {
      get(success, error) {
        $http.get("/api/fabricmeasurement/list/").success(success).error(error);
      },
      create(params, success, error) {
        $http.post("/api/fabricmeasurement/create", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/fabricmeasurement/update", params).success(success).error(error);
      },
      statusupdate(params, success, error) {
        $http.post("/api/fabricmeasurement/statusupdate", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/fabricmeasurement/delete/", params).success(success).error(error);
      },
    };
  })
  .factory("DyeingDetailService", ($http, Upload) => {
    return {
      get(success, error) {
        $http.get("/api/dyeing/list/").success(success).error(error);
      },
      create(params, success, error) {
        Upload.upload({
          url: "/api/dyeing/create",
          method: "POST",
          data: params,
          file: params.dyeing_picture,
        }).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/dyeing/update", params).success(success).error(error);
      },
      updatePicture(params, success, error) {
        Upload.upload({
          url: "/api/dyeing/updatepicture",
          method: "POST",
          data: params.dyeingForm,
          file: params.dyeing_picture,
        }).success(success).error(error);
      },
      statusupdate(params, success, error) {
        $http.post("/api/dyeing/statusupdate", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/dyeing/delete/", params).success(success).error(error);
      },
      getDyeing(params, success, error) {
        $http.get(`/api/dyeing/getDyeing/${params.term}`).success(success).error(error);
      },
    };
  })
  .factory("ContractorService", ($http, Upload) => {
    return {
      get(success, error) {
        $http.get("/api/contractor/list/").success(success).error(error);
      },
      getById(Id, success, error) {
        $http.get(`/api/contractor/view/${Id}`).success(success).error(error);
      },
      getProcesslist(Id, success, error) {
        $http.get(`/api/contractor/processlist/${Id}`).success(success).error(error);
      },
      create(params, success, error) {
        Upload.upload({
          url: "/api/contractor/create",
          method: "POST",
          data: params.contractorForm,
          file: params.profile_picture,
        }).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/contractor/update", params).success(success).error(error);
      },
      delete(params, success, error) {
        $http.post("/api/contractor/delete/", params).success(success).error(error);
      },
      updatePicture(params, success, error) {
        Upload.upload({
          url: "/api/contractor/update_picture",
          method: "POST",
          data: params.contractorForm,
          file: params.profile_picture,
        }).success(success).error(error);
      },
      getContractor(params, success, error) {
        $http.post("/api/contractor/getContractor", params).success(success).error(error);
      },
      updateProcess(params, success, error) {
        $http.post("/api/contractor/updateProcess", params).success(success).error(error);
      },
      saveOutward(params, success, error) {
        $http.post("/api/contract/outward/save", params).success(success).error(error);
      },
      updateOutward(params, success, error) {
        $http.post("/api/contract/outward/update", params).success(success).error(error);
      },
      saveInward(params, success, error) {
        $http.post("/api/contract/inward/save", params).success(success).error(error);
      },
      updateInward(params, success, error) {
        $http.post("/api/contract/inward/update", params).success(success).error(error);
      },
      getpendingOutwards(params, success, error) {
        $http.get(`/api/contract/outward/getPendingbycontractor/${params}`).success(success).error(error);
      },
      getcontractorOutwardstatbydivision(params, success, error) {
        $http.post("/api/contract/outward/getcontractorOutwardstatbydivision/", params).success(success).error(error);
      },
      getcontractorInwardstatbydivision(params, success, error) {
        $http.post("/api/contract/inward/getcontratorInwardstatbydivision/", params).success(success).error(error);
      },
      getcontractorOutward(params, success, error) {
        $http.post("/api/contract/outward/getcontractOutward/", params).success(success).error(error);
      },
      getcontractorInward(params, success, error) {
        $http.post("/api/contract/inward/getcontractInward/", params).success(success).error(error);
      },
      getcontractorOutwardstat(params, success, error) {
        $http.post("/api/contract/outward/getcontractorOutwardstat/", params).success(success).error(error);
      },
      getcontractInwardstat(params, success, error) {
        $http.post("/api/contract/inward/getcontractInwardstat/", params).success(success).error(error);
      },
      getcontractOutwardbydivision(params, success, error) {
        $http.post("/api/contract/outward/getcontractOutwardbydivision/", params).success(success).error(error);
      },
      getcontractInwardbydivision(params, success, error) {
        $http.post("/api/contract/inward/getcontractInwardbydivision/", params).success(success).error(error);
      },
      updateStatus(params, success, error) {
        $http.post("/api/contract/outward/updateStatus", params).success(success).error(error);
      },
      getOutwardeditview(params, success, error) {
        $http.get(`/api/contract/outward/getOutwardeditview/${params}`).success(success).error(error);
      },
      getInwardeditview(params, success, error) {
        $http.get(`/api/contract/inward/getInwardeditview/${params}`).success(success).error(error);
      },
    };
  })
  .factory("OrderService", ($http) => {
    return {
      initializedata(success, error) {
        $http.get("/api/order/initializedata").success(success).error(error);
      },
      editinitializedata(success, error) {
        $http.get("/api/order/editinitializedata").success(success).error(error);
      },
      initializeInvoice(params, success, error) {
        $http.get(`/api/order/initializeInvoice/${params.order}/${params.division}/${params.customer}`).success(success).error(error);
      },
      save(params, success, error) {
        $http.post("/api/order/save", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/order/update", params).success(success).error(error);
      },
      getOrderview(params, success, error) {
        $http.get(`/api/order/getOrderview/${params}`).success(success).error(error);
      },
      getOrder(params, success, error) {
        $http.post("/api/order/getOrder/", params).success(success).error(error);
      },
      getOrderstatbydivision(params, success, error) {
        $http.post("/api/order/getOrderstatbydivision/", params).success(success).error(error);
      },
      getOrderbydivision(params, success, error) {
        $http.post("/api/order/getOrderbydivision/", params).success(success).error(error);
      },
      getOrderstat(params, success, error) {
        $http.post("/api/order/getOrderstat/", params).success(success).error(error);
      },
      getcustomerOrder(params, success, error) {
        $http.post("/customerapp/dashboard/getOrder/", params).success(success).error(error);
      },
      getcustomerOrderstat(params, success, error) {
        $http.post("/customerapp/dashboard/getOrderstat/", params).success(success).error(error);
      },
      view(params, success, error) {
        $http.get(`/api/order/view/${params}`).success(success).error(error);
      },
      viewCustomerorder(params, success, error) {
        $http.get(`/customerapp/dashboard/viewOrder/${params}`).success(success).error(error);
      },
      viewLabreport(params, success, error) {
        $http.get(`/api/order/viewLabreport/${params}`).success(success).error(error);
      },
      vieworderLabreport(params, success, error) {
        $http.get(`/customerapp/dashboard/viewLabreport/${params}`).success(success).error(error);
      },
      updateStatus(params, success, error) {
        $http.post("/api/order/updateStatus", params).success(success).error(error);
      },
      getcompletedOrders(params, success, error) {
        $http.get(`/api/order/getcompletedOrders/${params}`).success(success).error(error);
      },
      getreturnOrders(params, success, error) {
        $http.get(`/api/order/getreturnOrders/${params}`).success(success).error(error);
      },
      addLabreport(params, success, error) {
        $http.post("/api/order/addLabreport", params).success(success).error(error);
      },
      addLabreportsummary(params, success, error) {
        $http.post("/api/order/addLabreportsummary", params).success(success).error(error);
      },
      updateLabreport(params, success, error) {
        $http.post("/api/order/updateLabreport", params).success(success).error(error);
      },
      updateLabreportsummary(params, success, error) {
        $http.post("/api/order/updateLabreportsummary", params).success(success).error(error);
      },
      deleteLabreport(params, success, error) {
        $http.post("/api/order/deleteLabreport", params).success(success).error(error);
      },
      deleteLabreportsummary(params, success, error) {
        $http.post("/api/order/deleteLabreportsummary", params).success(success).error(error);
      },
      updateSpecialprice(params, success, error) {
        $http.post("/api/order/updateSpecialprice", params).success(success).error(error);
      },
      updateOrderfollowup(params, success, error) {
        $http.post("/api/order/updateOrderfollowup", params).success(success).error(error);
      },
      getcompletedOrdersbycustomer(prm, msg, err) {
        $http.get(`/api/order/getcompletedOrdersbycustomer/${prm.customerID}/${prm.divisionID}/${prm.customerGroup}`).success(msg).error(err);
      },
      getjobDetails(params, success, error) {
        $http.post("/api/order/getjobDetails/", params).success(success).error(error);
      },
    };
  })
  .factory("DeliveryService", ($http) => {
    return {
      save(params, success, error) {
        $http.post("/api/delivery/save", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/delivery/update", params).success(success).error(error);
      },
      getProcessdetail(success, error) {
        $http.get("/api/delivery/getProcess").success(success).error(error);
      },
      getOutward(params, success, error) {
        $http.post("/api/delivery/getOutward/", params).success(success).error(error);
      },
      getOutwardstatbydivision(params, success, error) {
        $http.post("/api/delivery/getOutwardstatbydivision/", params).success(success).error(error);
      },
      getOutwardbydivision(params, success, error) {
        $http.post("/api/delivery/getOutwardbydivision/", params).success(success).error(error);
      },
      getOutwardstat(params, success, error) {
        $http.post("/api/delivery/getOutwardstat/", params).success(success).error(error);
      },
      getcustomerOutward(params, success, error) {
        $http.post("/customerapp/dashboard/getOutward/", params).success(success).error(error);
      },
      getOutwardbycustomerstat(params, success, error) {
        $http.post("/customerapp/dashboard/getOutwardstat/", params).success(success).error(error);
      },
      getOutwardbycustomer(params, success, error) {
        $http.post("/api/delivery/getOutwardbycustomer/", params).success(success).error(error);
      },
      getCompleteddeliverybyId(params, success, error) {
        $http.get(`/api/delivery/getCompleteddeliverybyId/${params._id}/${params.customer_id}`).success(success).error(error);
      },
      getVehicles(params, success, error) {
        $http.get(`/api/common/getVehicles/${params.term}`).success(success).error(error);
      },
      getDriverdata(params, success, error) {
        $http.get(`/api/common/getDriverdata/${params.term}`).success(success).error(error);
      },
      getDeliveryeditview(params, success, error) {
        $http.get(`/api/delivery/getDeliveryeditview/${params}`).success(success).error(error);
      },
    };
  })
  .factory("DeliveryreturnService", ($http) => {
    return {
      save(params, success, error) {
        $http.post("/api/deliveryreturn/save", params).success(success).error(error);
      },
      update(params, success, error) {
        $http.post("/api/deliveryreturn/update", params).success(success).error(error);
      },
      getProcessdetail(success, error) {
        $http.get("/api/deliveryreturn/getProcess").success(success).error(error);
      },
      getOutward(params, success, error) {
        $http.post("/api/deliveryreturn/getOutwardreturn/", params).success(success).error(error);
      },
      getOutwardbydivision(params, success, error) {
        $http.post("/api/deliveryreturn/getOutwardreturnbydivision/", params).success(success).error(error);
      },
      getDeliveryeditview(params, success, error) {
        $http.get(`/api/deliveryreturn/getDeliveryeditview/${params}`).success(success).error(error);
      },
    };
  })
  .factory("ReportService", ($http) => {
    return {
      getPendingpayment(params, success, error) {
        $http.post("/api/accountreports/getPendingpayment", params).success(success).error(error);
      },
      getJobcardstatement(params, success, error) {
        $http.post("/api/jobreports/getJobcardstatement", params).success(success).error(error);
      },
      getPendingdeliverystatement(params, success, error) {
        $http.post("/api/jobreports/getPendingdeliverystatement", params).success(success).error(error);
      },
      getDeliverystatement(params, success, error) {
        $http.post("/api/jobreports/getDeliverystatement", params).success(success).error(error);
      },
      getJobcardprintstatement(params, success, error) {
        $http.post("/api/jobreports/getJobcardprintstatement", params).success(success).error(error);
      },
      getPendingdeliveryprintstatement(params, success, error) {
        $http.post("/api/jobreports/getPendingdeliveryprintstatement", params).success(success).error(error);
      },
      getDeliveryprintstatement(params, success, error) {
        $http.post("/api/jobreports/getDeliveryprintstatement", params).success(success).error(error);
      },
      exportjobcardstatement(params, success, error) {
        $http.post("/api/jobreports/exportjobcardreport", params).success(success).error(error);
      },
      exportpendingdelivery(params, success, error) {
        $http.post("/api/jobreports/exportpendingdelivery", params).success(success).error(error);
      },
      exportdeliverystatement(params, success, error) {
        $http.post("/api/jobreports/exportdeliveryreport", params).success(success).error(error);
      },
      exportpendingpaystatement(params, success, error) {
        $http.post("/api/accountreports/exportpendingpaystatement", params).success(success).error(error);
      },
      getAgeing(params, success, error) {
        $http.post("/api/accountreports/getAgeing", params).success(success).error(error);
      },
      getDivisionaccountstatement(params, success, error) {
        $http.post("/api/accountreports/getDivisionaccountstatement", params).success(success).error(error);
      }
    };
  })
  .factory("InwardService", ($http) => {
    return {
      getInward(params, success, error) {
        $http.get(`/api/inward/getInward/${params}`).success(success).error(error);
      },
      viewInward(params, success, error) {
        $http.get(`/api/inward/viewInward/${params}`).success(success).error(error);
      },
    };
  })
  .factory("payrollHelper", () => {
    const payroll = {};
    payroll.getBillGroup = function () {
      const temp = [];
      // this Line to Hard Coded in This Module
      temp.push({
        groupname: "Alimony Payments",
        groupunique: "ALIMONYPAYMENTS",
        groupIndex: 1,
      }, {
        groupname: "Automobile Expenses",
        groupunique: "AUTOMOBILEEXPENSES",
        groupIndex: 2,
      }, {
        groupname: "Automobile Insurance",
        groupunique: "AUTOMOBILEINSURANCE",
        groupIndex: 3,
      }, {
        groupname: "Bank Charges",
        groupunique: "BANKCHARGES",
        groupIndex: 4,
      }, {
        groupname: "Business",
        groupunique: "BUSINESS",
        groupIndex: 5,
      }, {
        groupname: "Cable Bill",
        groupunique: "CABLEBILL",
        groupIndex: 6,
      }, {
        groupname: "Cash Withdrawal",
        groupunique: "CASHWITHDRAWAL",
        groupIndex: 7,
      }, {
        groupname: "Charitable Donations",
        groupunique: "CHARITABLEDONATIONS",
        groupIndex: 8,
      }, {
        groupname: "Children Expenses",
        groupunique: "CHILDRENEXPENSES",
        groupIndex: 9,
      }, {
        groupname: "Child Support Received",
        groupunique: "CHILDSUPPORTRECEIVED",
        groupIndex: 10,
      }, {
        groupname: "Dining Out",
        groupunique: "DININGOUT",
        groupIndex: 11,
      }, {
        groupname: "Education",
        groupunique: "EDUCATION",
        groupIndex: 12,
      }, {
        groupname: "Employer Matching",
        groupunique: "EMPLOYERMATCHING",
        groupIndex: 13,
      }, {
        groupname: "Entertainment",
        groupunique: "ENTERTAINMENT",
        groupIndex: 14,
      }, {
        groupname: "Federal Taxes",
        groupunique: "FEDERALTAXES",
        groupIndex: 15,
      }, {
        groupname: "Garbage/Recycle Bill",
        groupunique: "GARBAGERECYCLEBILL",
        groupIndex: 16,
      }, {
        groupname: "Gas & Electric Bill",
        groupunique: "GASELECTRICBILL",
        groupIndex: 17,
      }, {
        groupname: "Gifts Received",
        groupunique: "GIFTSRECEIVED",
        groupIndex: 18,
      }, {
        groupname: "Grocery Costs",
        groupunique: "GROCERYCOSTS",
        groupIndex: 19,
      }, {
        groupname: "Home/Rent Insurance",
        groupunique: "HOMERENTINSURANCE",
        groupIndex: 21,
      }, {
        groupname: "Household Expenses",
        groupunique: "HOUSEHOLDEXPENSES",
        groupIndex: 22,
      }, {
        groupname: "Interest & Dividends",
        groupunique: "INTERESTDIVIDENDS",
        groupIndex: 23,
      }, {
        groupname: "IRA/Pension Income",
        groupunique: "IRAPENSIONINCOME",
        groupIndex: 24,
      }, {
        groupname: "Life Insurance",
        groupunique: "LIFEINSURANCE",
        groupIndex: 25,
      }, {
        groupname: "Madicare Taxes",
        groupunique: "MADICARETAXES",
        groupIndex: 26,
      }, {
        groupname: "Medical/Dental Expenses",
        groupunique: "MEDICALDENTALEXPENSES",
        groupIndex: 27,
      }, {
        groupname: "Mortgage Interest",
        groupunique: "MORTGAGEINTEREST",
        groupIndex: 28,
      }, {
        groupname: "Non-Reimb. Job Exp.",
        groupunique: "NONREIMBJOBEXP",
        groupIndex: 29,
      }, {
        groupname: "Other Bills",
        groupunique: "OTHERBILLS",
        groupIndex: 30,
      }, {
        groupname: "Other Expenses",
        groupunique: "OTHEREXPENSES",
        groupIndex: 31,
      }, {
        groupname: "Other Income",
        groupunique: "OTHERINCOME",
        groupIndex: 32,
      }, {
        groupname: "Other Interest",
        groupunique: "OTHERINTEREST",
        groupIndex: 30,
      }, {
        groupname: "Other Tax Payments",
        groupunique: "OTHERTAXPAYMENTS",
        groupIndex: 33,
      }, {
        groupname: "Periodic Income",
        groupunique: "PERIODICINCOME",
        groupIndex: 34,
      }, {
        groupname: "Real Estate Taxes",
        groupunique: "REALESTATETAXES",
        groupIndex: 35,
      }, {
        groupname: "Rent Bill",
        groupunique: "RENTBILL",
        groupIndex: 36,
      }, {
        groupname: "Salary Income",
        groupunique: "SALARYINCOME",
        groupIndex: 37,
      }, {
        groupname: "Social Security Taxes",
        groupunique: "SOCIALSECURITYTAXES",
        groupIndex: 38,
      }, {
        groupname: "State Tax Payments",
        groupunique: "STATETAXPAYMENTS",
        groupIndex: 39,
      }, {
        groupname: "State/Local Tax Refund",
        groupunique: "STATELOCALTAXREFUND",
        groupIndex: 40,
      }, {
        groupname: "Tax-Exempt Income",
        groupunique: "TAXEXEMPTINCOME",
        groupIndex: 41,
      }, {
        groupname: "Telephone Bill",
        groupunique: "TELEPHONEBILL",
        groupIndex: 42,
      }, {
        groupname: "Unemployment Income",
        groupunique: "UNEMPLOYMENTINCOME",
        groupIndex: 43,
      }, {
        groupname: "Water & Sewer Bill",
        groupunique: "WATERSEWERBILL",
        groupIndex: 44,
      }, {
        groupname: "Clothing Expenses",
        groupunique: "CLOTHINGEXPENSES",
        groupIndex: 45,
      }, {
        groupname: "Social Security Income",
        groupunique: "SOCIALSECURITYINCOME",
        groupIndex: 46,
      }, {
        groupname: "Reimb Job.Exp",
        groupunique: "REIMBJOBEXP",
        groupIndex: 47,
      });
      return temp;
    };
    return payroll;
  })
  .service("orderviewService", function () {
    this.order_status = [];
    this.measurement = [];
    this.specialPrice = [];
    this.Users = [];
    this.Orders = {};
    this.Invoice = {};
    this.Customerdetails = {};
    this.contractInward = [];
    this.contractOutward = [];
    this.currentMenu = "";
    this.selectedID = "";
    this.card = "";

    this.getOrderstatus = function () {
      return this.order_status;
    };
    this.setOrderstatus = function (status) {
      this.order_status = status;
    };
    this.getMeasurement = function () {
      return this.measurement;
    };
    this.setMeasurement = function (measure) {
      this.measurement = measure;
    };
    this.getSpecialprice = function () {
      return this.specialPrice;
    };
    this.setSpecialprice = function (price) {
      this.specialPrice = price;
    };
    this.getUsers = function () {
      return this.Users;
    };
    this.setUsers = function (user) {
      this.Users = user;
    };
    this.getOrder = function () {
      return this.Orders;
    };
    this.setOrder = function (order) {
      this.Orders = order;
    };
    this.getInvoice = function () {
      return this.Invoice;
    };
    this.setInvoice = function (invoice) {
      this.Invoice = invoice;
    };
    this.getInwards = function () {
      return this.contractInward;
    };
    this.setInwards = function (inwards) {
      this.contractInward = inwards;
    };
    this.getOutwards = function () {
      return this.contractOutward;
    };
    this.setOutwards = function (outwards) {
      this.contractOutward = outwards;
    };
    this.getCustomer = function () {
      return this.Customerdetails;
    };
    this.setCustomer = function (cusData) {
      this.Customerdetails = cusData;
    };
    this.getMenu = function () {
      return this.currentMenu;
    };
    this.setMenu = function (currentmenu) {
      this.currentMenu = currentmenu;
    };
    this.getSelectedid = function () {
      return this.selectedID;
    };
    this.setSelectedid = function (ID) {
      this.selectedID = ID;
    };
  })
  .service("accountsService", function () {
    this.receivepayments = {};

    this.getPaymentdetail = function () {
      return this.receivepayments;
    };
    this.setPaymentdetail = function (customerData) {
      this.receivepayments = customerData;
    };
  });
