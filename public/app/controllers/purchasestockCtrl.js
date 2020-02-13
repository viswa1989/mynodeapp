/* global parseFloat */
/* global _ */
/* global angular */
angular.module("purchasestockCtrl", []).controller("PurchasestockController", ($scope, $routeParams, DivisionService, PurchaseService,
  VendorService, ProductService, GrnStockService, StockService, UtiliizedstockService, $rootScope, Notification, DateformatstorageService,
  DATEFORMATS, $log, AuthService, commonobjectService, $filter, $q, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.id = $routeParams.id;
  $scope.error = "";
  $scope.PoData = {};
  $scope.PoData.pageLoader = true;
  $scope.PoData.currentDate = new Date();
  $scope.PoData.pageaction = "View";
  $scope.PoData.mainMenu = "Purchase Order";
  $scope.PoData.currentpage = "purchase_order";
  $scope.PoData.currentRow = -1;
  $scope.PoData.divisionList = [{_id: "", name: "ALL"}];
  $scope.PoData.selectedDivisionid = "";
  $scope.PoData.selectedDivisionname = "ALL";
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.PoData.limit = 50;
  $scope.PoData.skip = 0;
  $scope.PoData.activeDay = "TODAY";

  $scope.commonobjectService = commonobjectService;

  DateformatstorageService.getformat().then((dateformats) => {
    if (angular.isDefined(dateformats) && dateformats !== null && dateformats !== "") {
      if (angular.isDefined(dateformats.short_date) && dateformats.short_date !== null && dateformats.short_date !== "") {
        $scope.dateformats.short_date = dateformats.short_date;
      }
      if (angular.isDefined(dateformats.long_date) && dateformats.long_date !== null && dateformats.long_date !== "") {
        $scope.dateformats.long_date = dateformats.long_date;
      }
      if (angular.isDefined(dateformats.short_date_time) && dateformats.short_date_time !== null && dateformats.short_date_time !== "") {
        $scope.dateformats.short_date_time = dateformats.short_date_time;
      }
      if (angular.isDefined(dateformats.long_date_time) && dateformats.long_date_time !== null && dateformats.long_date_time !== "") {
        $scope.dateformats.long_date_time = dateformats.long_date_time;
      }
      if (angular.isDefined(dateformats.short_month_time) && dateformats.short_month_time !== null && dateformats.short_month_time !== "") {
        $scope.dateformats.short_month_time = dateformats.short_month_time;
      }
    }
  });

  // Get all purchase order
  $scope.getPurchaseorders = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PoData.limit);
    obj.filterData.skip = angular.copy($scope.PoData.skip);
    obj.filterData.division = angular.copy($scope.PoData.selectedDivisionid);

    $scope.PoData.disablescroll = true;

    PurchaseService.get(obj, (result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, (purchase) => {
          if (angular.isDefined(purchase) && angular.isDefined(purchase._id)) {
            $scope.PoData.purchaseOrder.push(angular.copy(purchase));
          }
        });
        $scope.PoData.skip += result.data.length;
        $scope.PoData.disablescroll = false;
      }
      $scope.PoData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PoData.pageLoader = false;
    });
  };

  // Get all GRN Detail
  $scope.getGrnlist = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PoData.limit);
    obj.filterData.skip = angular.copy($scope.PoData.skip);
    obj.filterData.division = angular.copy($scope.PoData.selectedDivisionid);

    GrnStockService.get(obj, (result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, (grn) => {
          if (angular.isDefined(grn) && angular.isDefined(grn._id)) {
            $scope.PoData.grn.push(angular.copy(grn));
          }
        });
        $scope.PoData.skip += result.data.length;
        $scope.PoData.disablescroll = false;
      }
      $scope.PoData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PoData.pageLoader = false;
    });
  };

  // Get all GRN Return detail
  $scope.getGrnreturnlist = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PoData.limit);
    obj.filterData.skip = angular.copy($scope.PoData.skip);
    obj.filterData.division = angular.copy($scope.PoData.selectedDivisionid);

    GrnStockService.getReturn(obj, (result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, (grn) => {
          if (angular.isDefined(grn) && angular.isDefined(grn._id)) {
            $scope.PoData.purchaseReturn.push(angular.copy(grn));
          }
        });
        $scope.PoData.skip += result.data.length;
        $scope.PoData.disablescroll = false;
      }
      $scope.PoData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PoData.pageLoader = false;
    });
  };

  // Get all available stock details
  $scope.getitemstock = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PoData.limit);
    obj.filterData.skip = angular.copy($scope.PoData.skip);
    obj.filterData.division = angular.copy($scope.PoData.selectedDivisionid);

    StockService.get(obj, (result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, (stocks) => {
          if (angular.isDefined(stocks.product_id) && stocks.product_id !== null && angular.isDefined(stocks.product_id._id)) {
            $scope.PoData.availableStock.push(angular.copy(stocks));
          }
        });
        $scope.PoData.skip += result.data.length;
        $scope.PoData.disablescroll = false;
      }
      $scope.PoData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PoData.pageLoader = false;
    });
  };

  // Get all utilized stock details
  $scope.getutilizeditemstock = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PoData.limit);
    obj.filterData.skip = angular.copy($scope.PoData.skip);
    if ($scope.PoData.selectedDivisionid === "") {
      obj.filterData.division = "ALL";
    } else {
      obj.filterData.division = angular.copy($scope.PoData.selectedDivisionid);
    }
    obj.filterData.FromDate = angular.copy($scope.PoData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.PoData.ToDate);

    UtiliizedstockService.get(obj, (result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, (stocks) => {
          if (angular.isDefined(stocks.product_id) && stocks.product_id !== null && angular.isDefined(stocks.product_id._id) &&
                            angular.isDefined(stocks.division_id) && stocks.division_id !== null && angular.isDefined(stocks.division_id._id)) {
            stocks.division_name = angular.copy(stocks.division_id.name);
            stocks.division_id = angular.copy(stocks.division_id._id);
            $scope.PoData.utilizedStock.push(angular.copy(stocks));
          }
        });
        $scope.PoData.skip += result.data.length;
        $scope.PoData.disablescroll = false;
      }
      $scope.PoData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PoData.pageLoader = false;
    });
  };

  $scope.filterUtilizedstock = function (data) {
    $scope.PoData.skip = 0;
    $scope.PoData.activeDay = data;
    const Dateformat = new Date();
    if (data === "TODAY") {
      const curDate = $filter("date")(Dateformat, "dd/MM/yyyy");
      $scope.callDateRangePicker(curDate, curDate);
    }

    if (data === "YDAY") {
      const dt = new Date(Dateformat);
      const yesterDay = dt.setDate(dt.getDate() - 1);

      const currentDate = $filter("date")(new Date(yesterDay), "dd/MM/yyyy");
      $scope.callDateRangePicker(currentDate, currentDate);
    }

    if (data === "7DAY") {
      const dt1 = new Date();
      const be47Day = dt1.setDate(dt1.getDate() - 7);
      const currentDate_format = $filter("date")(new Date(), "dd/MM/yyyy");
      const be4_7day_format = $filter("date")(new Date(be47Day), "dd/MM/yyyy");

      $scope.callDateRangePicker(be4_7day_format, currentDate_format);
    }

    if (data === "THIS_MONTH") {
      const year = $filter("date")(Dateformat, "yyyy");
      let month = $filter("date")(Dateformat, "MM");

      const startDate = `${year}-${strPad(month, 2, 0)}-01`;
      month = parseFloat(month) + parseFloat(1);
      const lastDay = new Date(year, parseInt(month) - 1, 0);

      const currentDate1 = $filter("date")(new Date(startDate), "dd/MM/yyyy");
      const nextMonthStart = $filter("date")(new Date(lastDay), "dd/MM/yyyy");
      $scope.callDateRangePicker(currentDate1, nextMonthStart);
    }

    if (data === "LAST_MONTH") {
      let year1 = $filter("date")(Dateformat, "yyyy");
      const month1 = $filter("date")(Dateformat, "MM");
      if (month1 === 1 || month1 === "1") {
        year1 = parseInt(year1) - 1;
      }
      const startDate1 = Dateformat;
      startDate1.setDate(1);
      startDate1.setMonth(startDate1.getMonth() - 1);

      const lastDay1 = new Date(year1, parseInt(month1) - 1, 0);

      const currentDate2 = $filter("date")(new Date(lastDay1), "dd/MM/yyyy");
      const be4_month = $filter("date")(new Date(startDate1), "dd/MM/yyyy");
      $scope.callDateRangePicker(be4_month, currentDate2);
    }
    $scope.PoData.utilizedStock = [];
  };

  function strPad(input, length, string) {
    string = string || "0";
    input = `${input}`;
    return input.length >= length ? input : new Array(length - (input.length + 1)).join(string) + input;
  }

  // Get all utilized stock details
  $scope.Initializeutilizedstock = function () {
    if ($rootScope.currentapp === "superadmin") {
      $scope.PoData.pageLoader = false;

      setTimeout(() => {
        $scope.filterUtilizedstock($scope.PoData.activeDay);
      }, 500);
    } else {
      $scope.PoData.stocklist = [];
      $scope.PoData.categorylist = [];
      $scope.PoData.productData = [];

      UtiliizedstockService.initializedata($scope.PoData.selectedDivisionid, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.stock) && result.data.stock !== null && result.data.stock.length > 0) {
            angular.forEach(result.data.stock, (stocks) => {
              if (angular.isDefined(stocks.product_id) && stocks.product_id !== null && angular.isDefined(stocks.product_id)) {
                $scope.PoData.stocklist.push(angular.copy(stocks));
                if (angular.isDefined(result.data.product) && result.data.product !== null && result.data.product.length > 0) {
                  angular.forEach(result.data.product, (products) => {
                    if (angular.isDefined(products) && products !== null && angular.isDefined(products._id) && products._id === stocks.product_id) {
                      $scope.PoData.productData.push(angular.copy(products));
                    }
                  });
                }
              }
            });
          }
          if (angular.isDefined(result.data.category) && result.data.category !== null && result.data.category.length > 0) {
            $scope.PoData.categorylist = angular.copy(result.data.category);
          }
        }

        setTimeout(() => {
          $scope.filterUtilizedstock($scope.PoData.activeDay);
        }, 500);
        $scope.PoData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        setTimeout(() => {
          $scope.filterUtilizedstock($scope.PoData.activeDay);
        }, 500);
        $scope.PoData.pageLoader = false;
      });
    }
  };

  $scope.getgrnreturnDetails = function (id) {
    GrnStockService.getGrndetails(id, (result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.message) &&
            angular.isDefined(result.message.Grnstock) && angular.isDefined(result.message.Grnstock._id) &&
            result.message.Grnstock._id !== "" && angular.isDefined(result.message.Grnstock.stock_details) &&
            result.message.Grnstock.stock_details !== null && result.message.Grnstock.stock_details.length > 0) {
        $scope.grnreturnstockForm = angular.copy(result.message.Grnstock);
        $scope.grnreturnstockForm.grn_id = angular.copy(result.message.Grnstock._id);
        angular.forEach($scope.grnreturnstockForm.stock_details, (stock) => {
          if (angular.isDefined(stock.item_id)) {
            stock.return_quantity = 0;
          }
        });
        delete $scope.grnreturnstockForm._id;
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Call Date Range Picker
  $scope.callDateRangePicker = function (startDate, endDate) {
    $scope.PoData.FromDate = startDate;
    $scope.PoData.ToDate = endDate;
    $(".rangeDate").daterangepicker({
      locale: {format: "DD-MM-YYYY"},
      startDate,
      endDate,
      //            minDate : $scope.clientdata.filter.fromDate,
      //            maxDate : $scope.clientdata.filter.ToDate
    });

    $(".rangeDate").on("apply.daterangepicker", (ev, picker) => {
      const ang_startDate = picker.startDate.format("YYYY-MM-DD");
      const ang_endDate = picker.endDate.format("YYYY-MM-DD");
      $scope.PoData.FromDate = ang_startDate;
      $scope.PoData.ToDate = ang_endDate;
      $scope.getutilizeditemstock();
    });
    $scope.getutilizeditemstock();
  };

  $scope.grnstockInitialize = function () {
    $scope.grnstockForm = {};
    $scope.grnstockForm.stock_details = [];

    GrnStockService.getgrn((data) => {
      if (data !== null && angular.isDefined(data.grn) && data.grn !== null && angular.isDefined(data.grn.prefix) &&
            data.grn.prefix !== "" && angular.isDefined(data.grn.serial_no) && data.grn.serial_no !== "") {
        $scope.grnstockForm.grn_no = `${data.grn.prefix}_${data.grn.serial_no}`;
      } else {
        Notification.error("GRN No not found please try again later!");
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.viewData = function (field) {
    $scope.PoData.pageaction = "View";
    $scope.PoData.limit = 20;
    $scope.PoData.skip = 0;
    $scope.PoData.purchaseOrder = [];
    $scope.PoData.grn = [];
    $scope.PoData.purchaseReturn = [];
    $scope.PoData.availableStock = [];
    $scope.PoData.utilizedStock = [];
    setTimeout(() => {
      purchasestockresize();
    }, 200);
    if (field === "Purchase Order") {
      $scope.getPurchaseorders();
    }
    if (field === "GRN") {
      $scope.getGrnlist();
    }
    if (field === "Purchase Return") {
      $scope.getGrnreturnlist();
    }
    if (field === "Available Stock") {
      $scope.getitemstock();
    }
    if (field === "Utilized Stock") {
      $scope.Initializeutilizedstock();
    }
  };

  $scope.selectPomenu = function (menu) {
    if (menu !== $scope.PoData.mainMenu) {
      $scope.PoData.mainMenu = menu;
      setInitialmenu($scope.PoData.mainMenu);
      $scope.PoData.pageLoader = true;
      $scope.viewData($scope.PoData.mainMenu);
    }
  };

  // Show purchase order generation form
  $scope.addPurchaseorder = function () {
    $scope.PoData.pageaction = "Create";
    $scope.purchaseform = {};
    $scope.PurchaseData = {};
    $scope.PoData.vendordetails = "";
    $scope.purchaseform.purchase_details = [];
    setTimeout(() => {
      purchasestockresize();
    }, 200);
  };

  // Show grn generation form
  $scope.addGRN = function () {
    $scope.PoData.pageaction = "Create";
    $scope.grnstockForm = {};
    $scope.grnstockForm.stock_details = [];
    $scope.grnstockInitialize();
    setTimeout(() => {
      purchasestockresize();
    }, 200);
  };

  // Show grn generation form
  $scope.addGRNreturn = function () {
    $scope.PoData.pageaction = "Create";
    $scope.grnreturnstockForm = {};
    setTimeout(() => {
      purchasestockresize();
    }, 200);
  };

  $scope.filterBydivision = function (division) {
    if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
      $scope.PoData.selectedDivisionid = angular.copy(division._id);
      $scope.PoData.selectedDivisionname = angular.copy(division.name);
      $scope.PoData.pageLoader = true;
      $scope.PoData.skip = 0;
      $scope.viewData($scope.PoData.mainMenu);
    }
  };

  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Divisiondetail) &&
        result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
      angular.forEach(result.data.Divisiondetail, (division, index) => {
        if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
          if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
          result.data.Currentbranch === division._id) {
            $scope.PoData.selectedDivisionid = angular.copy(division._id);
            $scope.PoData.selectedDivisionname = angular.copy(division.name);
            $scope.PoData.divisionList = [];
          }
          $scope.PoData.divisionList.push(angular.copy(division));
        }
        if (index === result.data.Divisiondetail.length - 1) {
          $scope.viewData($scope.PoData.mainMenu);
        }
      });
    }
    $scope.PoData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.PoData.pageLoader = false;
  });

  function setInitialmenu(field) {
    switch (true) {
      case field === "Purchase Order":
        $scope.PoData.currentpage = "purchase_order";
        $scope.PoData.loadPage = `app/views/${$rootScope.currentapp}/${$scope.PoData.currentpage}.html`;
        break;
      case field === "GRN":
        $scope.PoData.currentpage = "grn";
        $scope.PoData.loadPage = `app/views/${$rootScope.currentapp}/${$scope.PoData.currentpage}.html`;
        break;
      case field === "Purchase Return":
        $scope.PoData.currentpage = "purchase_return";
        $scope.PoData.loadPage = `app/views/${$rootScope.currentapp}/${$scope.PoData.currentpage}.html`;
        break;
      case field === "Available Stock":
        $scope.PoData.currentpage = "available_stock";
        $scope.PoData.loadPage = `app/views/${$rootScope.currentapp}/${$scope.PoData.currentpage}.html`;
        break;
      case field === "Utilized Stock":
        $scope.PoData.editRow = -1;
        $scope.PoData.currentpage = "utilized_stock";
        $scope.PoData.loadPage = `app/views/${$rootScope.currentapp}/${$scope.PoData.currentpage}.html`;
        break;
      default:
        $scope.PoData.currentpage = "purchase_order";
        $scope.PoData.mainMenu = "Purchase Order";
        $scope.PoData.loadPage = `app/views/${$rootScope.currentapp}/${$scope.PoData.currentpage}.html`;
        break;
    }
  }

  if (angular.isDefined($routeParams.action) && ($routeParams.action === "purchase_order" || $routeParams.action === "grn" ||
        $routeParams.action === "purchase_return" || $routeParams.action === "available_stock" || $routeParams.action === "utilized_stock")) {
    $scope.PoData.currentpage = $routeParams.action;
  }

  $scope.setCurrentrow = function (data) {
    if (data !== null && angular.isDefined(data._id) && data._id !== $scope.PoData.currentRow) {
      $scope.PoData.currentRow = angular.copy(data._id);
    } else {
      $scope.PoData.currentRow = -1;
    }
  };

  // Autocomplete to fetch vendor
  $scope.vendorOption = {
    options: {
      html: true,
      minLength: 1,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          VendorService.getVendorautocomplete(angular.copy(request.term), (result) => {
            if (angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (vendordetail) => {
                const obj = {};
                obj.label = vendordetail.name;
                obj.value = vendordetail._id;
                data.push(obj);
              });
            }
            return response(data);
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();
        $scope.PoData.vendordetails = "";
        $scope.purchaseform.vendor = "";
        if (angular.isUndefined($scope.purchaseform.purchase_details)) {
          $scope.purchaseform.purchase_details = [];
        }
        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.PoData.vendordetails = ui.item.label;
          $scope.purchaseform.vendor = ui.item.value;
        }
      },
    },
  };

  // Autocomplete to fetch item
  $scope.itemOption = {
    options: {
      html: true,
      minLength: 1,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const obj = {};
          obj.term = request.term;
          ProductService.getProductsautocomplete(angular.copy(obj), (result) => {
            if (angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (items) => {
                if (angular.isDefined(items._id) && angular.isDefined(items.product_name) && items.product_name !== null &&
                    items.product_name !== "" && angular.isDefined(items.category_id) && items.category_id !== "" && items.category_id !== null) {
                  const objs = {};
                  if (angular.isDefined($scope.purchaseform.purchase_details) && $scope.purchaseform.purchase_details.length > 1) {
                    if (!_.any($scope.purchaseform.purchase_details, _.matches({product_id: items._id}))) {
                      objs.label = items.product_name;
                      objs.value = items._id;
                      objs.category_id = items.category_id;
                      data.push(objs);
                    }
                  } else {
                    objs.label = items.product_name;
                    objs.value = items._id;
                    objs.category_id = items.category_id;
                    data.push(objs);
                  }
                }
              });
            }
            return response(data);
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();
        $scope.PurchaseData.product_name = "";
        $scope.PurchaseData.product_id = "";
        $scope.PurchaseData.category_id = "";

        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.PurchaseData.product_name = ui.item.label;
          $scope.PurchaseData.product_id = ui.item.value;
          $scope.PurchaseData.category_id = ui.item.category_id;
        }
      },
    },
  };

  // Autocomplete to fetch Purchase no
  $scope.purchaseorderOption = {
    options: {
      html: true,
      minLength: 1,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          PurchaseService.getPoautocomplete(angular.copy(request.term), (result) => {
            if (angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (purchase) => {
                if (angular.isDefined(purchase.po_no) && purchase.po_no !== null && angular.isDefined(purchase.po_no) &&
                    purchase.purchase_details !== null && purchase.purchase_details !== "" && purchase.purchase_details.length > 0) {
                  const obj = {};
                  obj.label = purchase.po_no;
                  obj.value = purchase._id;
                  obj.purchase_details = [];

                  if (angular.isDefined(purchase.vendor) && angular.isDefined(purchase.vendor._id)) {
                    obj.vendor_id = angular.copy(purchase.vendor._id);
                    obj.vendor_name = angular.copy(purchase.vendor.name);
                  }

                  angular.forEach(purchase.purchase_details, (purchaseitems, indx) => {
                    if (angular.isDefined(purchaseitems.product_id) && angular.isDefined(purchaseitems.product_id._id) &&
                        angular.isDefined(purchaseitems.category_id) && purchaseitems.category_id !== null) {
                      purchase.purchase_details[indx].product_name = angular.copy(purchaseitems.product_id.product_name);

                      purchase.purchase_details[indx].product_id = angular.copy(purchaseitems.product_id._id);

                      purchase.purchase_details[indx].category_id = angular.copy(purchaseitems.category_id);
                      purchase.purchase_details[indx].order_quantity = angular.copy(purchaseitems.quantity);
                      purchase.purchase_details[indx].order_total = angular.copy(purchaseitems.total);
                      purchase.purchase_details[indx].total = 0;
                      obj.purchase_details.push(angular.copy(purchase.purchase_details[indx]));
                    }
                    if (indx === purchase.purchase_details.length - 1) {
                      data.push(obj);
                    }
                  });
                }
              });
            }
            return response(data);
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();
        $scope.grnstockForm.po_id = "";
        $scope.grnstockForm.po_no = "";
        $scope.grnstockForm.vendor_id = "";
        $scope.grnstockForm.vendor_name = "";
        $scope.grnstockForm.total_amt = 0;

        $scope.grnstockForm.stock_details = [];
        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          angular.forEach(ui.item.purchase_details, (purchase) => {
            if (angular.isDefined(purchase._id)) {
              $scope.grnstockForm.stock_details.push(angular.copy(purchase));
            }
          });

          $scope.grnstockForm.po_no = ui.item.label;
          $scope.grnstockForm.po_id = ui.item.value;

          $scope.grnstockForm.vendor_id = ui.item.vendor_id;
          $scope.grnstockForm.vendor_name = ui.item.vendor_name;
          $scope.grnstockForm.total_amt = 0;
        }
      },
    },
  };

  $scope.myOption = {
    options: {
      html: true,
      minLength: 1,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          GrnStockService.getGrnautocomplete(angular.copy(request.term), (result) => {
            if (angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (grndetail) => {
                const obj = {};
                obj.label = grndetail.grn_no;
                obj.value = grndetail._id;
                data.push(obj);
              });
            }
            return response(data);
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();
        $scope.grnreturnstockForm = {};
        $scope.grnreturnstockForm.stock_details = [];
        $scope.grnreturnstockForm.grn_no = "";
        $scope.grnreturnstockForm.grn_id = "";
        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.getgrnreturnDetails(ui.item.value);
        }
      },
    },
  };

  // Add row to add items
  $scope.addpurchaseItems = function () {
    if (angular.isDefined($scope.PurchaseData) && $scope.PurchaseData !== null) {
      if (angular.isUndefined($scope.PurchaseData.product_name) || $scope.PurchaseData.product_name === null ||
      $scope.PurchaseData.product_name === "") {
        Notification.error("Please select product");
        return false;
      }
      if (angular.isUndefined($scope.PurchaseData.product_id) || $scope.PurchaseData.product_id === null || $scope.PurchaseData.product_id === "") {
        Notification.error("Please select product");
        return false;
      }
      if (angular.isUndefined($scope.PurchaseData.quantity) || $scope.PurchaseData.quantity === null || $scope.PurchaseData.quantity === "") {
        Notification.error("Please enter quantity");
        return false;
      }
      if (angular.isUndefined($scope.PurchaseData.price) || $scope.PurchaseData.price === null || $scope.PurchaseData.price === "") {
        Notification.error("Please enter price");
        return false;
      }
      if (parseFloat($scope.PurchaseData.quantity) <= 0) {
        Notification.error("Please enter the valid quantity.");
        return false;
      }
      if (parseFloat($scope.PurchaseData.price) <= 0) {
        Notification.error("Please enter the valid price for the item");
        return false;
      }
      const total = parseFloat($scope.PurchaseData.quantity) * parseFloat($scope.PurchaseData.price);
      $scope.PurchaseData.total = angular.copy(total);
      if (angular.isUndefined($scope.purchaseform.total)) {
        $scope.purchaseform.total = 0;
      }
      $scope.purchaseform.total = parseFloat($scope.purchaseform.total) + parseFloat(total);
      $scope.purchaseform.purchase_details.push(angular.copy($scope.PurchaseData));
      $scope.PurchaseData = {};
      $scope.PoData.currentItems = -1;
    }
  };

  // Update row to add items
  $scope.updatepurchaseItems = function () {
    if (angular.isDefined($scope.PurchaseData) && $scope.PurchaseData !== null && angular.isDefined($scope.PoData.currentItems) &&
    $scope.PoData.currentItems > -1) {
      const curitem = $scope.PoData.currentItems;
      if (angular.isUndefined($scope.PurchaseData.product_name) || $scope.PurchaseData.product_name === null ||
      $scope.PurchaseData.product_name === "") {
        Notification.error("Please select product");
        return false;
      }
      if (angular.isUndefined($scope.PurchaseData.product_id) || $scope.PurchaseData.product_id === null || $scope.PurchaseData.product_id === "") {
        Notification.error("Please select product");
        return false;
      }
      if (angular.isUndefined($scope.PurchaseData.quantity) || $scope.PurchaseData.quantity === null || $scope.PurchaseData.quantity === "") {
        Notification.error("Please enter quantity");
        return false;
      }
      if (angular.isUndefined($scope.PurchaseData.price) || $scope.PurchaseData.price === null || $scope.PurchaseData.price === "") {
        Notification.error("Please enter price");
        return false;
      }
      if (parseFloat($scope.PurchaseData.quantity) <= 0) {
        Notification.error("Please enter the valid quantity.");
        return false;
      }
      if (parseFloat($scope.PurchaseData.price) <= 0) {
        Notification.error("Please enter the valid price for the item");
        return false;
      }
      const total = parseFloat($scope.PurchaseData.quantity) * parseFloat($scope.PurchaseData.price);
      $scope.PurchaseData.total = angular.copy(total);
      if (angular.isUndefined($scope.purchaseform.total)) {
        $scope.purchaseform.total = 0;
      }
      $scope.purchaseform.total = parseFloat($scope.purchaseform.total) + parseFloat(total);
      $scope.purchaseform.total = parseFloat($scope.purchaseform.total) - parseFloat($scope.purchaseform.purchase_details[curitem].total);

      $scope.purchaseform.purchase_details[curitem] = angular.copy($scope.PurchaseData);
      $scope.PurchaseData = {};
      $scope.PoData.currentItems = -1;
    }
  };

  $scope.editItem = function (item) {
    $scope.PoData.currentItems = -1;
    if (angular.isDefined(item) && item !== null && angular.isDefined($scope.purchaseform.purchase_details) &&
        $scope.purchaseform.purchase_details.length > 0 && $scope.purchaseform.purchase_details.indexOf(item) > -1) {
      $scope.PoData.currentItems = $scope.purchaseform.purchase_details.indexOf(item);
      $scope.PurchaseData = angular.copy(item);
    }
  };

  $scope.cancelpurchaseItems = function () {
    $scope.PurchaseData = {};
    $scope.PoData.currentItems = -1;
  };

  $scope.getitemtota1 = function (item) {
    item.total = 0;
    if (angular.isDefined(item.quantity) && angular.isDefined(item.price) && item.quantity !== null && item.price !== null &&
    item.quantity !== "" && item.price !== "") {
      item.total = parseFloat(item.quantity) * parseFloat(item.price);
    }
  };

  // Show purchase order to edit/update
  $scope.editPurchaseorder = function (purchaseOrder) {
    if (angular.isDefined(purchaseOrder) && angular.isDefined(purchaseOrder._id) && angular.isDefined(purchaseOrder.status)) {
      if (purchaseOrder.status === "WAITING" || purchaseOrder.status === "DENIED") {
        $scope.PoData.pageaction = "Create";
        $scope.PoData.currentRow = -1;
        $scope.purchaseform = angular.copy(purchaseOrder);
        $scope.PoData.vendordetails = angular.copy(purchaseOrder.vendor.name);
        $scope.PurchaseData = {};
        setTimeout(() => {
          purchasestockresize();
        }, 200);
      } else {
        Notification.error("This order is not in Waiting / Deny status. So you can't edit this order.");
        return false;
      }
    }
  };

  // Save Purchase Order
  $scope.createPurchaseorder = function () {
    if (angular.isDefined($scope.purchaseform)) {
      if (angular.isUndefined($scope.purchaseform.vendor) || $scope.purchaseform.vendor === null || $scope.purchaseform.vendor === "") {
        Notification.error("Please select the vendor to create purchase order");
        return false;
      }
      if (angular.isUndefined($scope.purchaseform.purchase_details) || $scope.purchaseform.purchase_details === null ||
      $scope.purchaseform.purchase_details === "") {
        Notification.error("Please add items to create purchase order");
        return false;
      }
      if (angular.isDefined($scope.purchaseform.purchase_details) && $scope.purchaseform.purchase_details.length < 1) {
        Notification.error("Please add items to create purchase order");
        return false;
      }

      if (angular.isDefined($scope.purchaseform.total) && $scope.purchaseform.total !== null && parseFloat($scope.purchaseform.total) > 0) {
        const obj = {};
        obj.purchaseOrder = angular.copy($scope.purchaseform);
        obj.purchaseOrder.division_id = angular.copy($scope.PoData.selectedDivisionid);

        $scope.PoData.purchaseorderformsubmission = true;

        $scope.PoData.pageLoader = true;

        PurchaseService.create(obj, (result) => {
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              Notification.success(result.message);
              $scope.purchaseform = {};
              $scope.purchaseform.purchase_details = [];
              $scope.PurchaseData = {};
              $scope.viewData($scope.PoData.mainMenu);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.PoData.pageLoader = false;
          $scope.PoData.purchaseorderformsubmission = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.PoData.purchaseorderformsubmission = false;
          $scope.PoData.pageLoader = false;
        });
      }
    }
  };

  // Update Purchase Order
  $scope.updatePurchaseorder = function () {
    if (angular.isDefined($scope.purchaseform) && angular.isDefined($scope.purchaseform._id)) {
      if (angular.isUndefined($scope.purchaseform.vendor) || $scope.purchaseform.vendor === null || $scope.purchaseform.vendor === "") {
        Notification.error("Please select the vendor to create purchase order");
        return false;
      }
      if (angular.isUndefined($scope.purchaseform.purchase_details) || $scope.purchaseform.purchase_details === null ||
      $scope.purchaseform.purchase_details === "" ||
                    $scope.purchaseform.purchase_details.length.length <= 0) {
        Notification.error("Please add items to create purchase order");
        return false;
      }

      if (angular.isDefined($scope.purchaseform.total) && $scope.purchaseform.total !== null && parseFloat($scope.purchaseform.total) > 0) {
        const obj = angular.copy($scope.purchaseform);
        $scope.PoData.purchaseorderformsubmission = true;
        $scope.PoData.pageLoader = true;

        PurchaseService.update(obj, (result) => {
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              $scope.purchaseform = {};
              $scope.purchaseform.purchase_details = [];
              $scope.PurchaseData = {};

              $scope.viewData($scope.PoData.mainMenu);
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.PoData.pageLoader = false;
          $scope.PoData.purchaseorderformsubmission = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.PoData.pageLoader = false;
          $scope.PoData.purchaseorderformsubmission = false;
        });
      }
    }
  };

  // Deny purchase order
  $scope.denyPurchaseorder = function (purchaseOrder) {
    if (angular.isDefined(purchaseOrder) && angular.isDefined(purchaseOrder._id) && angular.isDefined(purchaseOrder.status)) {
      if (purchaseOrder.status !== "WAITING") {
        Notification.error("This order is not in Waiting status. So you can't deny this order.");
        return false;
      }
      const obj = {};
      obj._id = angular.copy(purchaseOrder._id);

      purchaseOrder.requestsent = true;

      PurchaseService.deny(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            purchaseOrder.status = "DENIED";
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        purchaseOrder.requestsent = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        purchaseOrder.requestsent = false;
      });
    }
  };

  // Cancel purchase order
  $scope.cancelPurchaseorder = function (purchaseOrder) {
    if (angular.isDefined(purchaseOrder) && angular.isDefined(purchaseOrder._id) && angular.isDefined(purchaseOrder.status)) {
      if (purchaseOrder.status !== "WAITING") {
        Notification.error("This order is not in Waiting / Deny status. So you can't cancel this order.");
        return false;
      }
      const obj = {};
      obj._id = angular.copy(purchaseOrder._id);

      purchaseOrder.requestsent = true;

      PurchaseService.cancel(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            purchaseOrder.status = "CANCELLED";
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        purchaseOrder.requestsent = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        purchaseOrder.requestsent = false;
      });
    }
  };
  function validateOtp(purchase) {
    const deferred = $q.defer();

    let valid = true;
    if ($rootScope.currentapp === "divisionadmin") {
      if (angular.isUndefined(purchase.OTPPASSWORD) || (angular.isDefined(purchase.OTPPASSWORD) &&
      (purchase.OTPPASSWORD === null || purchase.OTPPASSWORD === ""))) {
        Notification.error("Please enter your 6 digits OTP Password to confirm the purchase order");
        valid = false;
      }
      if (angular.isDefined(purchase.OTPPASSWORD) && purchase.OTPPASSWORD.length < 6 && valid) {
        Notification.error("Your OTP must be 6 digits");
        valid = false;
      }
      if ((angular.isUndefined(purchase.OTP) || (angular.isDefined(purchase.OTP) && (purchase.OTP === null || purchase.OTP === ""))) && valid) {
        Notification.error("OTP is not generated for this order. Please contact your Administrator or try again Later");
        valid = false;
      }
      if (angular.isDefined(purchase.OTP) && angular.isDefined(purchase.OTPPASSWORD) && purchase.OTP !== purchase.OTPPASSWORD && valid) {
        Notification.error("Your One Time Passworrd is wrong please re-enter the OTP and try again..");
        valid = false;
      }
    }

    deferred.resolve(valid);

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  // Confrim purchase order
  $scope.confirmPurchaseorder = function (purchaseOrder) {
    if (angular.isDefined(purchaseOrder) && angular.isDefined(purchaseOrder._id) && angular.isDefined(purchaseOrder.status) &&
        (angular.isUndefined(purchaseOrder.requestsent) || (angular.isDefined(purchaseOrder.requestsent) && !purchaseOrder.requestsent))) {
      if (purchaseOrder.status !== "WAITING") {
        Notification.error("This order has been already confirmed, Reload the app and try again!");
        return false;
      }
      if (angular.isUndefined(purchaseOrder.OTP) || (angular.isDefined(purchaseOrder.OTP) && (purchaseOrder.OTP === null ||
        purchaseOrder.OTP === ""))) {
        Notification.error("OTP is not generated for this order. Please contact your Administrator or try again Later");
        return false;
      }

      validateOtp().then((data) => {
        if (data !== null && data) {
          const obj = {};
          obj._id = angular.copy(purchaseOrder._id);
          obj.OTP = angular.copy(purchaseOrder.OTP);

          purchaseOrder.requestsent = true;

          PurchaseService.confirm(obj, (result) => {
            if (result !== null && angular.isDefined(result.success)) {
              if (result.success) {
                purchaseOrder.status = "APPROVED";
                Notification.success(result.message);
              } else {
                Notification.error(result.message);
              }
            }
            purchaseOrder.requestsent = false;
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            purchaseOrder.requestsent = false;
          });
        }
      });
    }
  };

  // Remove items from purchase order
  $scope.removePoitem = function (items) {
    const index = $scope.purchaseform.purchase_details.indexOf(items);
    if (index > -1) {
      $scope.purchaseform.total = parseFloat($scope.purchaseform.total) - parseFloat($scope.purchaseform.purchase_details[index].total);
      $scope.purchaseform.purchase_details.splice(index, 1);
    }
  };

  // GRN Total amount calculation
  $scope.calculateGrnTotal = function () {
    let total = 0;
    angular.forEach($scope.grnstockForm.stock_details, (items, index) => {
      $scope.grnstockForm.stock_details[index].landing_cost = 0;
      if (angular.isDefined(items.product_id) && angular.isDefined(items.quantity) && angular.isDefined(items.total) &&
            items.total !== null && items.total !== null && items.quantity !== "" && items.total !== "" &&
            parseFloat(items.quantity) > 0 && parseFloat(items.total) > 0) {
        if (angular.isDefined(items.order_quantity) && items.order_quantity !== "" && items.order_quantity !== null &&
            parseFloat(items.order_quantity) > 0 && parseFloat(items.quantity) <= parseFloat(items.order_quantity)) {
          const unitprice = parseFloat(items.total) / parseFloat(items.quantity);
          $scope.grnstockForm.stock_details[index].landing_cost = angular.copy(parseFloat(unitprice).toFixed(2));
          total += parseFloat($scope.grnstockForm.stock_details[index].total);
        } else {
          Notification.error("Received quantity must be lesser or equal to the order quantity");
          $scope.grnstockForm.stock_details[index].quantity = "0";
        }
      }
      if (index === $scope.grnstockForm.stock_details.length - 1) {
        $scope.grnstockForm.total_amt = angular.copy(parseFloat(total).toFixed(2));
      }
    });
  };

  //    Function to to validate and return GRN stock details
  function getStockdetails() {
    const deferred = $q.defer();

    angular.forEach($scope.grnstockForm.stock_details, (items, indx) => {
      if (angular.isDefined(items.product_id) && angular.isDefined(items.quantity) && items.quantity !== null &&
      items.quantity !== "" && parseFloat(items.quantity) > 0) {
        if (angular.isDefined(items.landing_cost) && items.landing_cost !== null && items.landing_cost !== "" && parseFloat(items.landing_cost) > 0 &&
                        angular.isDefined(items.total) && items.total !== null && items.total !== "" && parseFloat(items.total) > 0) {
          items.total = parseFloat(items.total);
          items.landing_cost = parseFloat(items.landing_cost);
          items.quantity = parseFloat(items.quantity);
          $scope.tempstockdetails.push(angular.copy(items));
        } else {
          $scope.priceempty = true;
        }
      }
      if (indx === $scope.grnstockForm.stock_details.length - 1) {
        deferred.resolve($scope.tempstockdetails);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  // Add stock/scrap stock for branch
  $scope.createStock = function () {
    if (angular.isUndefined($scope.grnstockForm.grn_date) || $scope.grnstockForm.grn_date === null || $scope.grnstockForm.grn_date === "") {
      Notification.error("Select grn date!..");
      return false;
    }
    if (angular.isUndefined($scope.grnstockForm.grn_no) || $scope.grnstockForm.grn_no === null || $scope.grnstockForm.grn_no === "") {
      Notification.error("Grn no not available please reload and try again..");
      return false;
    }
    if (angular.isUndefined($scope.grnstockForm.po_no) || $scope.grnstockForm.po_no === null || $scope.grnstockForm.po_no === "") {
      Notification.error("Select PO Number");
      return false;
    }
    if (angular.isUndefined($scope.grnstockForm.invoice_no) || $scope.grnstockForm.invoice_no === null || $scope.grnstockForm.invoice_no === "") {
      Notification.error("Please enter invoice number");
      return false;
    }
    if (angular.isUndefined($scope.grnstockForm.total_amt) || $scope.grnstockForm.total_amt === null || $scope.grnstockForm.total_amt === "") {
      Notification.error("Please enter the price details for received quantity.");
      return false;
    }
    if (angular.isDefined($scope.grnstockForm.total_amt) && parseFloat($scope.grnstockForm.total_amt) <= 0) {
      Notification.error("Please enter the received quantity details to save GRN");
      return false;
    }
    if (angular.isUndefined($scope.grnstockForm.vendor_name) || $scope.grnstockForm.vendor_name === null || $scope.grnstockForm.vendor_name === "") {
      Notification.error("Vendor name not available for this PO please reload and try again..");
      return false;
    }
    if (angular.isUndefined($scope.grnstockForm.stock_details) || $scope.grnstockForm.stock_details === null ||
    $scope.grnstockForm.stock_details === "" || $scope.grnstockForm.stock_details.length === 0) {
      Notification.error("Purchase order items not found");
      return false;
    }
    $scope.priceempty = false;
    $scope.tempstockdetails = [];
    if (angular.isDefined($scope.grnstockForm.stock_details) && $scope.grnstockForm.stock_details.length > 0) {
      getStockdetails().then(() => {
        if ($scope.priceempty) {
          Notification.error("Please enter the received price for the received items");
          return false;
        }

        if (angular.isDefined($scope.tempstockdetails) && $scope.tempstockdetails !== null && $scope.tempstockdetails.length > 0 &&
        !$scope.priceempty) {
          const obj = {};
          obj.grnstockForm = angular.copy($scope.grnstockForm);
          obj.grnstockForm.stock_details = angular.copy($scope.tempstockdetails);
          $scope.PoData.pageLoader = true;

          GrnStockService.create(obj, (result) => {
            $scope.priceempty = false;
            $scope.tempstockdetails = [];
            if (result !== null && angular.isDefined(result.success)) {
              if (result.success) {
                $scope.purchaseform = {};
                $scope.purchaseform.purchase_details = [];
                $scope.PurchaseData = {};

                $scope.viewData($scope.PoData.mainMenu);
                Notification.success(result.message);
              } else {
                Notification.error(result.message);
              }
            }
            $scope.PoData.pageLoader = false;
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            $scope.PoData.pageLoader = false;
          });
        }
      });
    }
  };

  // GRN Return Total amount calculation
  $scope.calculateGrnreturnTotal = function () {
    let total = 0;
    angular.forEach($scope.grnreturnstockForm.stock_details, (items, index) => {
      $scope.grnreturnstockForm.stock_details[index].return_total = 0;
      if (angular.isDefined(items.product_id) && angular.isDefined(items.return_quantity) && angular.isDefined(items.landing_cost) &&
            items.landing_cost !== null && items.landing_cost !== "" && parseFloat(items.landing_cost) > 0 && items.quantity !== null &&
            items.return_quantity !== "" && parseFloat(items.return_quantity) > 0) {
        if (angular.isDefined(items.quantity) && items.quantity !== "" && items.quantity !== null && parseFloat(items.quantity) > 0 &&
                        parseFloat(items.return_quantity) <= parseFloat(items.quantity)) {
          $scope.grnreturnstockForm.stock_details[index].return_total = parseFloat(items.return_quantity) * parseFloat(items.landing_cost);
          total += $scope.grnreturnstockForm.stock_details[index].return_total;
        } else {
          Notification.error("Return quantity must be lesser or equal to the Received quantity");
          $scope.grnreturnstockForm.stock_details[index].return_quantity = "0";
        }
      }
      if (index === $scope.grnreturnstockForm.stock_details.length - 1) {
        $scope.grnreturnstockForm.return_amt = angular.copy(parseFloat(total).toFixed(2));
      }
    });
  };

  //    Function to to validate and return GRN stock details
  function getreturnStockdetails() {
    const deferred = $q.defer();
    angular.forEach($scope.grnreturnstockForm.stock_details, (retStock, index) => {
      if (angular.isDefined(retStock.product_id) && retStock.product_id !== null && retStock.product_id !== "" &&
            angular.isDefined(retStock.quantity) && retStock.quantity !== null && retStock.quantity !== "" && retStock.quantity > 0 &&
            angular.isDefined(retStock.return_total) && retStock.return_total !== null && retStock.return_total !== "" &&
            parseFloat(retStock.return_total) > 0 && angular.isDefined(retStock.return_quantity) && retStock.return_quantity !== null &&
            retStock.return_quantity !== "" && parseFloat(retStock.return_quantity) > 0) {
        if (angular.isUndefined(retStock.reason) || (angular.isDefined(retStock.reason) && (retStock.reason === null && retStock.reason === ""))) {
          $scope.returnreason = true;
        }
        if (retStock.return_quantity > retStock.quantity) {
          $scope.returnqtyexceed += 1;
        } else {
          retStock.return_quantity = parseFloat(retStock.return_quantity);
          $scope.returnstockdetails.push(angular.copy(retStock));
        }
      }
      if (index === $scope.grnreturnstockForm.stock_details.length - 1) {
        deferred.resolve($scope.returnstockdetails);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  // Add return stock for branch
  $scope.createreturnStock = function () {
    if (angular.isUndefined($scope.grnreturnstockForm.grn_id) || $scope.grnreturnstockForm.grn_id === null ||
    $scope.grnreturnstockForm.grn_id === "") {
      Notification.error("Select GRN Number");
      return false;
    }
    if (angular.isUndefined($scope.grnreturnstockForm.po_id) || $scope.grnreturnstockForm.po_id === null || $scope.grnreturnstockForm.po_id === "") {
      Notification.error("Purchase order no not available please reload and try again..");
      return false;
    }
    if (angular.isUndefined($scope.grnreturnstockForm.total_amt) || $scope.grnreturnstockForm.total_amt === null ||
    $scope.grnreturnstockForm.total_amt === "") {
      Notification.error("Please eneter the received quantity details to save GRN");
      return false;
    }
    if (angular.isDefined($scope.grnreturnstockForm.total_amt) && parseFloat($scope.grnreturnstockForm.total_amt) <= 0) {
      Notification.error("Please eneter the received quantity details to save GRN");
      return false;
    }
    if (angular.isUndefined($scope.grnreturnstockForm.vendor_name) || $scope.grnreturnstockForm.vendor_name === null ||
    $scope.grnreturnstockForm.vendor_name === "") {
      Notification.error("Vendor name not available for this GRN please reload and try again..");
      return false;
    }
    if (angular.isUndefined($scope.grnreturnstockForm.stock_details) || $scope.grnreturnstockForm.stock_details === null ||
    $scope.grnreturnstockForm.stock_details === "" || $scope.grnreturnstockForm.stock_details.length === 0) {
      Notification.error("GRN items not found");
      return false;
    }

    if (angular.isDefined($scope.grnreturnstockForm) && angular.isDefined($scope.grnreturnstockForm.grn_id) &&
    $scope.grnreturnstockForm.grn_id !== "") {
      if (!angular.isDefined($scope.grnreturnstockForm.stock_details) || (angular.isDefined($scope.grnreturnstockForm.stock_details) &&
                    $scope.grnreturnstockForm.stock_details.length <= 0)) {
        Notification.error("No stock details to update!..");
        return false;
      }
      $scope.returnqtyexceed = 0;
      $scope.returnreason = false;
      $scope.returnstockdetails = [];

      getreturnStockdetails().then(() => {
        if ($scope.returnqtyexceed > 0) {
          Notification.error("Return stock quantity must be less than received quantity!..");
          return false;
        }
        if ($scope.returnstockdetails.length === 0) {
          Notification.error("Enter the return stock quantity for atleast one item to update.");
          return false;
        }
        if ($scope.returnreason) {
          Notification.error("Reason for returning item must not be empty.");
          return false;
        }
        const obj = {};
        obj.grnreturnstockForm = angular.copy($scope.grnreturnstockForm);
        obj.grnreturnstockForm.stock_details = angular.copy($scope.returnstockdetails);
        $scope.PoData.pageLoader = true;

        GrnStockService.createreturnStock(obj, (result) => {
          $scope.returnqtyexceed = 0;
          $scope.returnreason = false;
          $scope.returnstockdetails = [];
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              $scope.purchaseform = {};
              $scope.purchaseform.purchase_details = [];
              $scope.PurchaseData = {};
              $scope.viewData($scope.PoData.mainMenu);
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.PoData.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.PoData.pageLoader = false;
        });
      });
    }
  };

  $scope.addNewutilizedstock = function () {
    const obj = {};
    obj.division_id = angular.copy($scope.PoData.selectedDivisionid);
    $scope.PoData.utilizedStock.push(obj);
    $scope.PoData.productlist = [];
    $scope.PoData.editRow = $scope.PoData.utilizedStock.length - 1;
  };

  $scope.editUtilizedstock = function (stock) {
    const ind = $scope.PoData.utilizedStock.indexOf(stock);
    if (ind > -1) {
      $scope.PoData.editRow = ind;
      if (angular.isDefined(stock.category_id) && stock.category_id !== null && angular.isDefined(stock.category_id._id)) {
        if ($scope.PoData.productData.length > 0) {
          $scope.PoData.productlist = angular.copy($filter("filter")($scope.PoData.productData, {
            category_id: stock.category_id._id,
          }));
        } else {
          $scope.PoData.productlist = [];
        }
      }
    }
  };

  $scope.setCategory = function (stocks) {
    stocks.product_id = {};
    stocks.availableStock = 0;
    $scope.PoData.productlist = [];

    if (angular.isDefined(stocks.category_id) && stocks.category_id !== null && angular.isDefined(stocks.category_id._id)) {
      if ($scope.PoData.productData.length > 0) {
        $scope.PoData.productlist = angular.copy($filter("filter")($scope.PoData.productData, {
          category_id: stocks.category_id._id,
        }));
      } else {
        $scope.PoData.productlist = [];
      }
    }
  };

  $scope.setProduct = function (stocks) {
    if (angular.isDefined(stocks.product_id) && stocks.product_id !== null && angular.isDefined(stocks.product_id._id)) {
      angular.forEach($scope.PoData.stocklist, (items) => {
        if (angular.isDefined(items) && items !== null && angular.isDefined(items._id) && angular.isDefined(items.product_id) &&
        stocks.product_id !== null && angular.isDefined(stocks.product_id._id) &&
                        angular.isDefined(items.quantity) && items.product_id === stocks.product_id._id) {
          stocks.availableStock = parseFloat(items.quantity);
        }
      });
    }
  };

  $scope.saveUtilizedstock = function (stocks) {
    if (angular.isDefined($scope.PoData.selectedDivisionid) && $scope.PoData.selectedDivisionid !== null && $scope.PoData.selectedDivisionid !== "") {
      if (angular.isDefined(stocks) && stocks !== null) {
        if (angular.isUndefined(stocks.category_id) || stocks.category_id === null || angular.isUndefined(stocks.category_id._id)) {
          Notification.error("Please select the category");
          return false;
        }
        if (angular.isUndefined(stocks.product_id) || stocks.product_id === null || angular.isUndefined(stocks.product_id._id)) {
          Notification.error("Please select the product");
          return false;
        }
        if (angular.isUndefined(stocks.availableStock) || stocks.availableStock === null || stocks.availableStock === "" ||
        parseFloat(stocks.availableStock) <= 0) {
          Notification.error("Product stock not found");
          return false;
        }
        if (angular.isUndefined(stocks.quantity) || stocks.quantity === null || stocks.quantity === "" || parseFloat(stocks.quantity) <= 0) {
          Notification.error("Please enter the utilized stock quantity");
          return false;
        }
        if (parseFloat(stocks.quantity) > parseFloat(stocks.availableStock)) {
          Notification.error("Stock quantity exceed the availble stock");
          return false;
        }
        if (angular.isUndefined(stocks.usedBy) || stocks.usedBy === null || stocks.usedBy === "") {
          Notification.error("Please enter the name of the stock utilized user");
          return false;
        }
        const obj = {};
        obj.stockForm = angular.copy(stocks);
        obj.stockForm.product_name = angular.copy(stocks.product_id.product_name);
        obj.stockForm.division_id = angular.copy(stocks.division_id);
        if (angular.isDefined(stocks._id)) {
          UtiliizedstockService.update(obj, (result) => {
            if (result !== null && angular.isDefined(result.success)) {
              if (result.success) {
                $scope.PoData.editRow = -1;
                Notification.success(result.message);
              } else {
                Notification.error(result.message);
              }
            }
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
          });
        } else {
          UtiliizedstockService.create(obj, (result) => {
            if (result !== null && angular.isDefined(result.success)) {
              if (result.success) {
                if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
                  stocks._id = result.data._id;
                }
                $scope.PoData.editRow = -1;
                Notification.success(result.message);
              } else {
                Notification.error(result.message);
              }
            }
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
          });
        }
      }
    }
  };

  $scope.deleteUtilizedstock = function (stocks) {
    if (angular.isDefined(stocks) && stocks !== null && $scope.PoData.utilizedStock.indexOf(stocks) > -1) {
      const index = $scope.PoData.utilizedStock.indexOf(stocks);
      if (angular.isDefined(stocks._id)) {
        if (angular.isUndefined(stocks.category_id) || stocks.category_id === null || angular.isUndefined(stocks.category_id._id)) {
          Notification.error("Please select the category");
          return false;
        }
        if (angular.isUndefined(stocks.product_id) || stocks.product_id === null || angular.isUndefined(stocks.product_id._id)) {
          Notification.error("Please select the product");
          return false;
        }

        const obj = {};
        obj.stockForm = angular.copy(stocks);
        obj.stockForm.product_name = angular.copy(stocks.product_id.product_name);
        obj.stockForm.division_id = angular.copy(stocks.division_id);

        UtiliizedstockService.delete(obj, (result) => {
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              $scope.PoData.utilizedStock.splice(index);
              $scope.PoData.editRow = -1;
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
        });
      } else {
        $scope.PoData.utilizedStock.splice(index);
      }
    }
  };

  $scope.printThispo = function (purchase) {
    if (angular.isDefined(purchase) && purchase !== null && angular.isDefined(purchase._id)) {
      PurchaseService.printPodata(purchase._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
        angular.isDefined(result.data.Purchaseorder) && result.data.Purchaseorder !== null &&
        angular.isDefined(result.data.Purchaseorder._id)) {
          const templateUrl = $sce.getTrustedResourceUrl("app/views/common/purchaseorder_print.html");
          poDetail = result.data;
          window.open(templateUrl, "_blank");
        } else {
          Notification.error("Purchase order not found.");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  setInitialmenu($scope.PoData.mainMenu);
});
