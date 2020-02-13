/* global _ */
/* global angular */
angular.module("dashboardCtrl", []).controller("DashboardController", ($scope, $rootScope, $sce, $uibModal, $log, DivisionService,
  OrderService, InwardService, DeliveryService, DeliveryreturnService, InvoiceService, PreferenceService, StockService, PurchaseService,
  commonobjectService, AuthService, $location, socket, JobsstorageService, DateformatstorageService, Notification, DATEFORMATS, ContractorService) => {
  $rootScope.clientData.selectCard = "";
  $scope.UserPrivilege = AuthService;
  $scope.data = {};
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;
  $scope.data.currency = commonobjectService.getCurrency();
  $scope.data.default_section = "SERVICE";
  $scope.data.skip = 0;
  $scope.data.limit = 25;
  $rootScope.Branchdata = {};
  $scope.cardData = {};
  $scope.cardData.divisiondetails = {};
  $scope.cardData.divisions = [];
  $scope.cardData.pendingDues = [];
  $scope.cardData.pendingInvoices = [];
  $scope.cardData.overallpendingInvoices = [];

  //    $scope.cardData.inwardDivision = "";
  $scope.cardData.outwardDivision = "";
  $scope.cardData.returnDivision = "";

  $scope.cardData.pageLoader = true;
  $scope.cardData.dataLoader = false;
  $scope.cardData.order_status = "ALL";
  $scope.cardData.outward_status = "ALL";
  $scope.cardData.invoiceload = false;
  $scope.cardData.selecteddueDivisionid = "";
  $scope.cardData.selecteddueDivision = "ALL";

  $scope.cardData.oveallDue = 0;

  const defaultDues = [0, 15, 30, 45, 60];
  // Select tab for superadmin card
  $scope.setSelectedTab = function (branchdata, data) {
    const index = $scope.cardData.branchdetails.indexOf(branchdata);
    if (index > -1) {
      $scope.cardData.branchdetails[index].default_section = data;
    }
  };

  const baseConfig = {
    placeholder: "clonedcard",
    change() {
      placeholderHeight();
    },
  };

  $scope.sortableOptions = angular.extend({}, baseConfig, {
    handle: "> .myHandle",
  });
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
    } else {
      PreferenceService.getdateFormats($rootScope.currentapp, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
          result.data !== null && result.data.length > 0) {
          angular.forEach(result.data, (pref, ind) => {
            if (pref.preference === "short_date") {
              $scope.dateformats.short_date = pref.value;
            }
            if (pref.preference === "long_date") {
              $scope.dateformats.long_date = pref.value;
            }
            if (pref.preference === "short_date_time") {
              $scope.dateformats.short_date_time = pref.value;
            }
            if (pref.preference === "long_date_time") {
              $scope.dateformats.long_date_time = pref.value;
            }
            if (pref.preference === "short_month_time") {
              $scope.dateformats.short_month_time = pref.value;
            }
            if (ind === result.data.length - 1) {
              DateformatstorageService.setformat($scope.dateformats);
            }
          });
        }
      }, (error) => {

      });
    }
  });

  // Load initial data to dashboard for superadmin and divisionadmin app
  $scope.getPreferencedetails = function () {
    PreferenceService.getPendingdues((result) => {
      $scope.cardData.pendingDues = defaultDues;
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data._id) {
        if (angular.isDefined(result.data.value) && result.data.value !== "" && result.data.value !== null) {
          const dues = result.data.value.split(",");
          if (dues.length > 0) {
            $scope.cardData.pendingDues = [];
            angular.forEach(dues, (days) => {
              $scope.cardData.pendingDues.push(parseInt(days));
            });
          }
        }
      }
      $scope.getPendinginvoice();
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Load initial data to dashboard for customer app
  $scope.getPreferencedues = function () {
    PreferenceService.getcustomerPendingdues((result) => {
      $scope.cardData.pendingDues = defaultDues;
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
        result.data !== null && result.data._id) {
        if (angular.isDefined(result.data.value) && result.data.value !== "" && result.data.value !== null) {
          const dues = result.data.value.split(",");
          if (dues.length > 0) {
            $scope.cardData.pendingDues = [];
            angular.forEach(dues, (days) => {
              $scope.cardData.pendingDues.push(parseInt(days));
            });
          }
        }
      }
      $scope.getcustomerPendinginvoice();
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Load initial data to dashboard
  $scope.getDivisiondetails = function () {
    $scope.cardData.inwards = [];

    if ($rootScope.currentapp === "divisionadmin" && AuthService.isLogged()) {
      $scope.cardData.pageLoader = true;
      $scope.cardData.divisiondetails = {};
      $scope.cardData.order_status = "";
      $scope.cardData.outward_status = "";
      
      DivisionService.getallDivisiondetails((result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && angular.isDefined(result.data.divisions) && result.data.divisions !== null &&
            result.data.divisions.length > 0) {
          $scope.cardData.divisiondetails = angular.copy(result.data.divisions[0]);

          if ($scope.cardData.divisiondetails !== null && angular.isDefined($scope.cardData.divisiondetails._id)) {
//            $scope.cardData.divisiondetails.orderfilterSelected = "TODAY";
            $scope.cardData.divisiondetails.orderfilterSelected = "ALL";
            $scope.cardData.divisiondetails.immediate_check = false;
            $scope.cardData.divisiondetails.outwardfilterSelected = "ALL";
            $scope.cardData.divisiondetails.contractoroutwardfilterSelected = "ALL";
            $scope.cardData.divisiondetails.contractorinwardfilterSelected = "ALL";
//            $scope.cardData.divisiondetails.outwardfilterSelected = "TODAY";
            $scope.cardData.divisiondetails.orders = [];
            $scope.cardData.divisiondetails.delivery = [];
            $scope.cardData.divisiondetails.outward = [];
            $scope.cardData.divisiondetails.inward = [];
            $scope.cardData.divisiondetails.stocks = [];
            $scope.cardData.divisiondetails.purchaseorder = [];
            getOrderstat($scope.cardData.divisiondetails);
            getOutwardstat($scope.cardData.divisiondetails);
            getcontractOutwardstat($scope.cardData.divisiondetails);
            getcontractInwardstat($scope.cardData.divisiondetails);
          }
        }
        $scope.cardData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.pageLoader = false;
      });
    } else if ($rootScope.currentapp === "superadmin" && AuthService.isLogged()) {
      $scope.cardData.pageLoader = true;
      $scope.cardData.divisions = [];
      let len = "";
      DivisionService.getallDivisiondetails((result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && angular.isDefined(result.data.divisions) && result.data.divisions !== null &&
            result.data.divisions.length > 0) {
            const divlen = result.data.divisions.length;
          angular.forEach(result.data.divisions, (division, ind) => {
            if (angular.isDefined(division) && division !== null && angular.isDefined(division._id)) {
              if (ind === 0) {
                //                                $scope.cardData.inwardDivision = division._id;
                $scope.cardData.outwardDivision = division._id;
                $scope.cardData.returnDivision = division._id;
              }
              division.tabSelected = "Orders";
              division.filterSelected = "ALL";
//              division.filterSelected = "TODAY";
              division.order_status = "";
              division.immediate_check = false;
              division.orders = [];
              division.stocks = [];
              division.purchaseorder = [];
              division.busy = false;
              $scope.cardData.divisions.push(angular.copy(division));
              len = $scope.cardData.divisions.length - 1;
              getOrderstatbydivision($scope.cardData.divisions[len]._id, $scope.cardData.divisions[len]);
            }
            if (ind === divlen -1) {
              let obj = {};
              obj.name = "Outwards";
              obj.selectedDivision = "ALL";
              obj.selectedDivisionid = "";
              obj.filterSelected = "ALL";
              obj.immediate_check = false;
              obj.outwardData = [];
              obj.outwardloadingData = false;
              $scope.cardData.divisions.push(angular.copy(obj));
              len = ind;
              getOutwardstatbydivision("", $scope.cardData.divisions[len+1]);
              
              let obj1 = {};
              obj1.name = "Contractor Outward";
              obj1.selectedDivision = "ALL";
              obj1.selectedDivisionid = "";
              obj1.filterSelected = "ALL";
              obj1.immediate_check = false;
              obj1.outwardData = [];
              obj1.outwardloadingData = false;
              $scope.cardData.divisions.push(angular.copy(obj1));
              setTimeout(function (){
                getcontractorOutwardstatbydivision("", $scope.cardData.divisions[len+2]);
              },200);              
              
              let obj2 = {};
              obj2.name = "Contractor Inward";
              obj2.selectedDivision = "ALL";
              obj2.selectedDivisionid = "";
              obj2.filterSelected = "ALL";
              obj2.immediate_check = false;
              obj2.outwardData = [];
              obj2.outwardloadingData = false;
              $scope.cardData.divisions.push(angular.copy(obj2));
              setTimeout(function (){
                getcontractorInwardstatbydivision("", $scope.cardData.divisions[len+3]);
              },200);
              
            }
          });
        }
        socket.emit("getDivisionuser");
        $scope.cardData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.pageLoader = false;
      });
    } else if ($rootScope.currentapp === "customer" && AuthService.isLogged()) {
      $scope.cardData.order_status = "";
      $scope.cardData.outward_status = "";
//      $scope.cardData.divisiondetails.orderfilterSelected = "TODAY";
      $scope.cardData.divisiondetails.orderfilterSelected = "ALL";
      $scope.cardData.divisiondetails.immediate_check = false;
      $scope.cardData.divisiondetails.outwardfilterSelected = "ALL";
//      $scope.cardData.divisiondetails.outwardfilterSelected = "TODAY";
      $scope.cardData.divisiondetails.orders = [];
      $scope.cardData.divisiondetails.delivery = [];
      getOrderbycustomerstat($scope.cardData.divisiondetails);
      getOutwardbycustomerstat($scope.cardData.divisiondetails);
    }
  };
    
  // Load pending Invoices for superadmin or divisionadmin app
  $scope.getPendinginvoice = function () {
    if (angular.isDefined($scope.cardData.selecteddueDivisionid) && $scope.cardData.selecteddueDivisionid !== null) {
      if (angular.isUndefined($scope.cardData.selectedDue) || $scope.cardData.selectedDue === null) {
        $scope.cardData.selectedDue = 0;
      }

      $scope.cardData.invoiceload = true;
      const obj = {};

      ($scope.cardData.selecteddueDivisionid !== "") ? obj.divisionID = $scope.cardData.selecteddueDivisionid : obj.divisionID = "All";

      if ($scope.cardData.selectedDue === 0) {
        obj.dueFrom = $scope.cardData.selectedDue;
        obj.dueTo = $scope.cardData.selectedDue;
      } else {
        const index = $scope.cardData.pendingDues.indexOf($scope.cardData.selectedDue);
        obj.dueTo = $scope.cardData.selectedDue;
        if (index > 0) {
          obj.dueFrom = $scope.cardData.pendingDues[index - 1];
        } else {
          obj.dueFrom = 0;
        }
      }
      $scope.cardData.pendingInvoices = [];

      InvoiceService.getPendinginvoice(obj, (result) => {
        $scope.cardData.overallpendingInvoices = [];
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.Pendingdue) && result.data.Pendingdue.length > 0) {
            $scope.cardData.pendingInvoices = angular.copy(result.data.Pendingdue);
          }
          if (angular.isDefined(result.data.Totalpending) && result.data.Totalpending.length > 0) {
            $scope.cardData.overallpendingInvoices = angular.copy(result.data.Totalpending);
          }

          $scope.cardData.oveallDue = $scope.getInvoicetotal($scope.cardData.overallpendingInvoices);
        }
        $scope.cardData.invoiceload = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.invoiceload = false;
      });
    }
  };

  // Load pending Invoices for customer app
  $scope.getcustomerPendinginvoice = function () {
    if (angular.isUndefined($scope.cardData.selectedDue) || $scope.cardData.selectedDue === null) {
      $scope.cardData.selectedDue = 0;
    }

    $scope.cardData.invoiceload = true;
    const obj = {};

    if ($scope.cardData.selectedDue === 0) {
      obj.dueFrom = $scope.cardData.selectedDue;
      obj.dueTo = $scope.cardData.selectedDue;
    } else {
      const index = $scope.cardData.pendingDues.indexOf($scope.cardData.selectedDue);
      obj.dueTo = $scope.cardData.selectedDue;
      if (index > 0) {
        obj.dueFrom = $scope.cardData.pendingDues[index - 1];
      } else {
        obj.dueFrom = 0;
      }
    }
    $scope.cardData.pendingInvoices = [];

    InvoiceService.getcustomerPendinginvoice(obj, (result) => {
      $scope.cardData.overallpendingInvoices = [];
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null) {
        if (angular.isDefined(result.data.Pendingdue) && result.data.Pendingdue.length > 0) {
          $scope.cardData.pendingInvoices = angular.copy(result.data.Pendingdue);
        }
        if (angular.isDefined(result.data.Totalpending) && result.data.Totalpending.length > 0) {
          $scope.cardData.overallpendingInvoices = angular.copy(result.data.Totalpending);
        }

        $scope.cardData.oveallDue = $scope.getInvoicetotal($scope.cardData.overallpendingInvoices);
      }
      $scope.cardData.invoiceload = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.cardData.invoiceload = false;
    });
  };

  $scope.getInvoicetotal = function (invoiceDues) {
    let total = 0;
    if (angular.isDefined(invoiceDues) && invoiceDues !== null && invoiceDues.length > 0) {
      let len = 0;
      angular.forEach(invoiceDues, (invoice) => {
        if (angular.isDefined(invoice.total) && angular.isDefined(invoice.paid)) {
          total += (parseFloat(invoice.total) - parseFloat(invoice.paid));
        }
        len += 1;
      });
      if (len === invoiceDues.length) {
        return total;
      }
    } else {
      return total;
    }
  };

  // Load order overview status count by filter
  $scope.getOrderoverview = function (division, filtervalue) {
    if (division !== null && angular.isDefined(division._id) && division._id !== null && filtervalue !== null) {
      division.filterSelected = filtervalue;
      division.orders = [];
      division.skiporders = 0;
      if (division.disableorderscroll) {
        division.disableorderscroll = false;
      } else {
        $scope.getOrder(division._id, division);
      }
      getOrderstatbydivision(division._id, division);
    }
  };

  // Load Order details for superadmin
  $scope.getOrder = function (id, division) {
    if (angular.isDefined(id) && id !== null && id !== "" && angular.isDefined(division) && angular.isDefined(division.orders)) {
      division.busy = true;

      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skiporders)) {
        division.skiporders = 0;
      }
      objs.skip = division.skiporders;
      objs.order_status = division.order_status;
      objs.divisionID = id;
      objs.filterby = division.filterSelected;
      objs.immediate_check = division.immediate_check;

      OrderService.getOrder(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skiporders += result.data.length;
            angular.forEach(result.data, (ord) => {
              if (angular.isDefined(ord) && angular.isDefined(ord.inwards) && ord.inwards !== null && ord.inwards.length > 0) {
                const obj = {};
                obj._id = ord._id;
                obj.customer_name = ord.customer_name;
                obj.order_no = ord.order_no;
                obj.order_date = ord.order_date;
                obj.order_status = ord.order_status;
                if (ord.immediate_job) {
                  obj.immediate_job = ord.immediate_job;
                } else {
                  obj.immediate_job = false;
                }
                obj.inward_id = ord.inwards[0]._id;
                obj.inward_no = ord.inwards[0].inward_no;
                obj.inward_date = ord.inwards[0].inward_date;

                obj.order_reference_no = angular.isDefined(ord.order_reference_no) ? ord.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(ord.customer_dc_no) ? ord.customer_dc_no : "";
                obj.dyeing_name = (angular.isDefined(ord.dyeing) && angular.isDefined(ord.dyeing.dyeing_name)) ? ord.dyeing.dyeing_name : "";
                obj.dyeing_dc_no = angular.isDefined(ord.dyeing_dc_no) ? ord.dyeing_dc_no : "";

                obj.process = [];
                angular.forEach(ord.inwards[0].inward_data, (inw) => {
                  if (angular.isDefined(inw.process) && inw.process !== null && inw.process.length > 0) {
                    angular.forEach(inw.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.orders.push(angular.copy(obj));
              }
            });
          } else {
            division.disableorderscroll = true;
          }
          division.busy = false;
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.busy = false;
      });
    }
  };
  
  // Filter order by status
  $scope.setOrderstatus = function (status, division) {
    if (status !== null) {
      division.order_status = status;
      if (division.order_status == "Completed" || division.order_status == "Invoice and Delivery") {
        division.immediate_check = false;
      }
      division.orders = [];
      division.skiporders = 0;
      if (division.disableorderscroll) {
        division.disableorderscroll = false;
      } else {
        $scope.getOrder(division._id, division);
      }
    }
  };
  
  // Load Order details for superadmin
  function getOrderstatbydivision(id, division) {
    if (angular.isDefined(id) && id !== null && id !== "" && angular.isDefined(division) && angular.isDefined(division.orders)) {
      division.totalorder = 0;
      division.notstarted = 0;
      division.inprogress = 0;
      division.completed = 0;
      division.returnorder = 0;

      const objs = {};
      objs.divisionID = id;
      objs.filterby = division.filterSelected;

      OrderService.getOrderstatbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.orderCounts) && result.data.orderCounts !== null && result.data.orderCounts.length > 0) {
            //                Invoice and Delivery
            angular.forEach(result.data.orderCounts, (ords) => {
              if (angular.isDefined(ords._id) && angular.isDefined(ords.count) && parseInt(ords.count) > 0) {
                if (ords._id === "Completed") {
                  division.completed = ords.count;
                }
                if (ords._id === "In Progress") {
                  division.inprogress = ords.count;
                }
                if (ords._id === "New Order") {
                  division.notstarted = ords.count;
                }
                division.totalorder += ords.count;
              }
            });
          }
          if (angular.isDefined(result.data.returnOrders) && result.data.returnOrders !== null && result.data.returnOrders.length > 0) {
            angular.forEach(result.data.returnOrders, (stat) => {
              if (angular.isDefined(stat._id) && stat._id === division._id) {
                division.returnorder = stat.count;
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }

  $scope.getOrderbydivisionbyfilter = function (division) {
    division.orders = [];
    division.skiporders = 0;
    if (division.disableorderscroll) {
      division.disableorderscroll = false;
    } else {
      $scope.getOrderbydivision(division);
    }
    getOrderstat(division);
  };
  
  $scope.getcontractOutwardbydivisionbyfilter = function (division) {
    division.outward = [];
    division.skipcontractoutward = 0;
    if (division.disablecontractoutwardscroll) {
      division.disablecontractoutwardscroll = false;
    } else {
      $scope.getcontractOutwardbydivision(division);
    }
    getcontractOutwardstat(division);
  };
  
  $scope.getcontractInwardbydivisionbyfilter = function (division) {
    division.inward = [];
    division.skipcontractinward = 0;
    if (division.disablecontractinwardscroll) {
      division.disablecontractinwardscroll = false;
    } else {
      $scope.getcontractInwardbydivision(division);
    }
    getcontractInwardstat(division);
  };

  // Load Order details based on division for superadmin and divisionadmin app
  $scope.getOrderbydivision = function (division) {
    if (angular.isDefined(division)) {
      $scope.cardData.orderLoader = true;

      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skiporders)) {
        division.skiporders = 0;
      }
      objs.skip = division.skiporders;
      objs.order_status = $scope.cardData.order_status;
      objs.filterby = division.orderfilterSelected;
      objs.immediate_check = division.immediate_check;

      OrderService.getOrderbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skiporders += result.data.length;
            angular.forEach(result.data, (ord) => {
              if (angular.isDefined(ord) && angular.isDefined(ord.inwards) && ord.inwards !== null && ord.inwards.length > 0) {
                const obj = {};
                obj._id = ord._id;
                obj.customer_name = ord.customer_name;
                if (ord.immediate_job) {
                  obj.immediate_job = ord.immediate_job;
                } else {
                  obj.immediate_job = false;
                }
                obj.order_no = ord.order_no;
                obj.order_date = ord.order_date;
                obj.order_status = ord.order_status;
                obj.inward_id = ord.inwards[0]._id;
                obj.inward_no = ord.inwards[0].inward_no;
                obj.inward_date = ord.inwards[0].inward_date;

                obj.order_reference_no = angular.isDefined(ord.order_reference_no) ? ord.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(ord.customer_dc_no) ? ord.customer_dc_no : "";
                obj.dyeing_name = (angular.isDefined(ord.dyeing) && angular.isDefined(ord.dyeing.dyeing_name)) ? ord.dyeing.dyeing_name : "";
                obj.dyeing_dc_no = angular.isDefined(ord.dyeing_dc_no) ? ord.dyeing_dc_no : "";

                obj.process = [];
                angular.forEach(ord.inwards[0].inward_data, (inw) => {
                  if (angular.isDefined(inw.process) && inw.process !== null && inw.process.length > 0) {
                    angular.forEach(inw.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.orders.push(angular.copy(obj));
              }
            });
          } else {
            division.disableorderscroll = true;
          }
        }
        $scope.cardData.orderLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.orderLoader = false;
      });
    }
  };
  
  // Load Order details based on division for superadmin and divisionadmin app
  $scope.getcontractOutwardbydivision = function (division) {
    if (angular.isDefined(division)) {
      $scope.cardData.disablecontractoutwardscroll = true;

      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skipcontractoutward)) {
        division.skipcontractoutward = 0;
      }
      objs.skip = division.skipcontractoutward;
      objs.outward_status = $scope.cardData.outward_status;
      objs.filterby = division.contractoroutwardfilterSelected;
//      objs.immediate_check = division.immediate_check;

      ContractorService.getcontractOutwardbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipcontractoutward += result.data.length;
            angular.forEach(result.data, (ord) => {
              if (angular.isDefined(ord) && angular.isDefined(ord.outward_data) && ord.outward_data !== null && ord.outward_data.length > 0) {
                const obj = {};
                obj._id = ord._id;
                obj.customer_name = ord.customer_name;
                obj.order_id = ord.order_id;
                obj.order_no = ord.order_no;
                obj.order_date = ord.order_date;
                obj.order_status = ord.order_status;
                obj.outward_status = ord.outward_status;
                obj.outward_id = ord.outward_id;
                obj.outward_no = ord.outward_no;
                obj.outward_date = ord.outward_date;
                obj.contractor_name = ord.contractor_name;
                obj.order_reference_no = angular.isDefined(ord.order_reference_no) ? ord.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(ord.customer_dc_no) ? ord.customer_dc_no : "";
                obj.process = [];
                
                angular.forEach(ord.outward_data, (inw) => {
                  if (angular.isDefined(inw.process) && inw.process !== null && inw.process.length > 0) {
                    angular.forEach(inw.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.outward.push(angular.copy(obj));
              }
            });
          } else {
            division.disablecontractoutwardscroll = true;
          }
        }
        $scope.cardData.contractoutwardLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.contractoutwardLoader = false;
      });
    }
  };

  function getOrderstat(division) {
    if (angular.isDefined(division)) {
      const objs = {};
      objs.filterby = division.orderfilterSelected;

      division.totalorder = 0;
      division.notstarted = 0;
      division.inprogress = 0;
      division.completed = 0;
      division.returnorder = 0;

      OrderService.getOrderstat(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.orderCounts) && result.data.orderCounts !== null && result.data.orderCounts.length > 0) {
            //                Invoice and Delivery
            angular.forEach(result.data.orderCounts, (ords) => {
              if (angular.isDefined(ords._id) && angular.isDefined(ords.count) && parseInt(ords.count) > 0) {
                if (ords._id === "Completed") {
                  division.completed = ords.count;
                }
                if (ords._id === "In Progress") {
                  division.inprogress = ords.count;
                }
                if (ords._id === "New Order") {
                  division.notstarted = ords.count;
                }
                division.totalorder += ords.count;
              }
            });
          }
          if (angular.isDefined(result.data.returnOrders) && result.data.returnOrders !== null && result.data.returnOrders.length > 0) {
            angular.forEach(result.data.returnOrders, (stat) => {
              if (angular.isDefined(stat._id) && stat._id === division._id) {
                division.returnorder = stat.count;
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }  
  
  function getcontractOutwardstat(division) {
    if (angular.isDefined(division)) {
      const objs = {};
      objs.filterby = division.contractoroutwardfilterSelected;

      division.contractinprogress = 0;
      division.contractcompleted = 0;
      division.totalcontractoutward = 0;

      ContractorService.getcontractorOutwardstat(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.outwardCounts) && result.data.outwardCounts !== null && result.data.outwardCounts.length > 0) {
            //                Invoice and Delivery
            angular.forEach(result.data.outwardCounts, (ords) => {
              if (angular.isDefined(ords._id) && angular.isDefined(ords.count) && parseInt(ords.count) > 0) {
                if (ords._id === "Completed") {
                  division.contractcompleted = ords.count;
                }
                if (ords._id === "In Progress") {
                  division.contractinprogress = ords.count;
                }
                division.totalcontractoutward += ords.count;
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }

  $scope.getOrderbycustomerfilter = function (division) {
    division.orders = [];
    division.skiporders = 0;
    if (division.disableorderscroll) {
      division.disableorderscroll = false;
    } else {
      $scope.getOrderbycustomer(division);
    }
    getOrderbycustomerstat(division);
  };

  // Load Order details for customer app
  $scope.getOrderbycustomer = function (division) {
    if (angular.isDefined(division)) {
      $scope.cardData.orderLoader = true;

      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skiporders)) {
        division.skiporders = 0;
      }
      objs.skip = division.skiporders;
      objs.order_status = $scope.cardData.order_status;
      objs.filterby = division.orderfilterSelected;
      objs.immediate_check = division.immediate_check;

      OrderService.getcustomerOrder(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skiporders += result.data.length;
            angular.forEach(result.data, (ord) => {
              if (angular.isDefined(ord) && angular.isDefined(ord.inwards) && ord.inwards !== null && ord.inwards.length > 0) {
                const obj = {};
                obj._id = ord._id;
                obj.customer_name = ord.customer_name;
                obj.order_no = ord.order_no;
                obj.order_date = ord.order_date;
                obj.order_status = ord.order_status;
                if (ord.immediate_job) {
                  obj.immediate_job = ord.immediate_job;
                } else {
                  obj.immediate_job = false;
                }
                obj.inward_id = ord.inwards[0]._id;
                obj.inward_no = ord.inwards[0].inward_no;
                obj.inward_date = ord.inwards[0].inward_date;
                obj.process = [];
                angular.forEach(ord.inwards[0].inward_data, (inw) => {
                  if (angular.isDefined(inw.process) && inw.process !== null && inw.process.length > 0) {
                    angular.forEach(inw.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                $scope.cardData.divisiondetails.orders.push(angular.copy(obj));
              }
            });
          } else {
            division.disableorderscroll = true;
          }
        }
        $scope.cardData.orderLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.orderLoader = false;
      });
    }
  };

  function getOrderbycustomerstat(division) {
    if (angular.isDefined(division)) {
      const objs = {};
      objs.filterby = division.orderfilterSelected;

      division.totalorder = 0;
      division.notstarted = 0;
      division.inprogress = 0;
      division.completed = 0;
      division.returnorder = 0;

      OrderService.getcustomerOrderstat(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.orderCounts) && result.data.orderCounts !== null && result.data.orderCounts.length > 0) {
            //                Invoice and Delivery
            angular.forEach(result.data.orderCounts, (ords) => {
              if (angular.isDefined(ords._id) && angular.isDefined(ords.count) && parseInt(ords.count) > 0) {
                if (ords._id === "Completed") {
                  division.completed = ords.count;
                }
                if (ords._id === "In Progress") {
                  division.inprogress = ords.count;
                }
                if (ords._id === "New Order") {
                  division.notstarted = ords.count;
                }
                division.totalorder += ords.count;
              }
            });
          }
          if (angular.isDefined(result.data.returnOrders) && result.data.returnOrders !== null && result.data.returnOrders.length > 0) {
            angular.forEach(result.data.returnOrders, (stat) => {
              if (angular.isDefined(stat._id)) {
                division.returnorder = stat.count;
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }

  // Load stock details
  $scope.getStockdata = function (id, division) {
    if (angular.isDefined(id) && id !== null && id !== "" && angular.isDefined(division) && angular.isDefined(division.stocks)) {
      division.busy = true;
      division.stocks = [];

      StockService.getStockbydivision(id, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && result.data.length > 0) {
          division.stocks = angular.copy(result.data);
        }
        division.busy = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.busy = false;
      });
    }
  };

  // Load Purchase order details
  $scope.getPodata = function (id, division) {
    if (angular.isDefined(id) && id !== null && id !== "" && angular.isDefined(division) && angular.isDefined(division.stocks)) {
      division.busy = true;
      division.purchaseorder = [];

      PurchaseService.getPurchasebydivision(id, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && result.data.length > 0) {
          division.purchaseorder = angular.copy(result.data);
        }
        division.busy = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.busy = false;
      });
    }
  };

  $scope.setSelectedtabmenu = function (division, menu) {
    if (angular.isDefined(division) && division !== null && angular.isDefined(division._id)) {
      division.tabSelected = menu;
      division.busy = false;
      if (menu === "Orders") {
        division.filterSelected = division.filterSelected;
        division.orders = [];
        division.skiporders = 0;
        if (division.disableorderscroll) {
          division.disableorderscroll = false;
        } else {
          $scope.getOrder(division._id, division);
        }
      }
      if (menu === "Stocks") {
        $scope.getStockdata(division._id, division);
      }
      if (menu === "Po") {
        $scope.getPodata(division._id, division);
      }
    }
  };

  // Filter order by status
  $scope.getOrderbystatus = function (status, divisionDetails) {
    if (status !== null) {
      $scope.cardData.order_status = status;
      if ($scope.cardData.order_status == "Completed" || $scope.cardData.order_status == "Invoice and Delivery") {
        $scope.cardData.divisiondetails.immediate_check = false;
      }
      divisionDetails.orders = [];
      divisionDetails.skiporders = 0;
      if (divisionDetails.disableorderscroll) {
        divisionDetails.disableorderscroll = false;
      } else if ($rootScope.currentapp === "customer" && AuthService.isLogged()) {
        $scope.getOrderbycustomer(divisionDetails);
      } else {
        $scope.getOrderbydivision(divisionDetails);
      }
    }
  };
  
  // Filter contract outward by status
  $scope.getcontractOutwardbystatus = function (status, division) {
    if (status !== null) {
      $scope.cardData.outward_status = status;
      division.outward = [];
      division.skipcontractoutward = 0;
      if (division.disablecontractoutwardscroll) {
        division.disablecontractoutwardscroll = false;
      } else {
        $scope.getcontractOutwardbydivision(division);
      }
    }
  };

  // Load order overview status count by filter
  $scope.getOutwardoverview = function (division, filtervalue) {
    if (division !== null && angular.isDefined(division.selectedDivisionid) && division.selectedDivisionid !== null && filtervalue !== null) {
      division.filterSelected = filtervalue;
      division.outwardData = [];
      division.skipdelivery = 0;
      if (division.disablescroll) {
        division.disablescroll = false;
      } else {
        $scope.getOutward(division.selectedDivisionid, division);
      }
      getOutwardstatbydivision(division.selectedDivisionid, division);
    }
  };

  // Load Outward details
  $scope.getOutward = function (id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.outwardData)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.divisionID = "All";
      if (id !== "") {
        objs.divisionID = id;
      }
      if (angular.isUndefined(division.skipdelivery)) {
        division.skipdelivery = 0;
      }
      objs.skip = division.skipdelivery;
      objs.filterby = division.filterSelected;

      division.outwardloadingData = true;

      DeliveryService.getOutward(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipdelivery += result.data.length;
            angular.forEach(result.data, (delivery) => {
              if (angular.isDefined(delivery) && angular.isDefined(delivery.order_id) && delivery.order_id !== null &&
                angular.isDefined(delivery.order_id._id) && angular.isDefined(delivery.outward_data) && delivery.outward_data !== null &&
                delivery.outward_data.length > 0) {
                const obj = {};
                obj._id = delivery._id;
                obj.order_id = delivery.order_id._id;

                obj.order_reference_no = angular.isDefined(delivery.order_id.order_reference_no) ? delivery.order_id.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(delivery.order_id.customer_dc_no) ? delivery.order_id.customer_dc_no : "";
                obj.dyeing_dc_no = angular.isDefined(delivery.order_id.dyeing_dc_no) ? delivery.order_id.dyeing_dc_no : "";

                obj.customer_name = delivery.customer_name;
                obj.order_no = delivery.order_no;
                obj.order_date = delivery.order_date;
                obj.order_status = delivery.order_status;
                obj.delivery_no = delivery.delivery_no;
                obj.delivery_date = delivery.delivery_date;
                obj.is_return = delivery.is_return;
                obj.process = [];
                angular.forEach(delivery.outward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.outwardData.push(angular.copy(obj));
              }
            });
          } else {
            division.disablescroll = true;
          }
        }
        division.outwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.outwardloadingData = false;
      });
    }
  };

  function getOutwardstatbydivision(id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.outwardData)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.divisionID = "All";
      if (id !== "") {
        objs.divisionID = id;
      }
      objs.filterby = division.filterSelected;
      division.deliveredCount = 0;
      division.returneddCount = 0;

      DeliveryService.getOutwardstatbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            angular.forEach(result.data, (outwardcnt) => {
              if (angular.isDefined(outwardcnt.division_id) && angular.isDefined(outwardcnt.is_return) &&
                          angular.isDefined(outwardcnt.count) && parseInt(outwardcnt.count) > 0) {
                if (outwardcnt.is_return) {
                  division.returneddCount += parseInt(outwardcnt.count);
                } else {
                  division.deliveredCount += parseInt(outwardcnt.count);
                }
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }
  
  // Load contract ouwrad overview status count by filter
  $scope.getcontractorOutwardoverview = function (division, filtervalue) {
    if (division !== null && angular.isDefined(division.selectedDivisionid) && division.selectedDivisionid !== null && filtervalue !== null) {
      division.filterSelected = filtervalue;
      division.outwardData = [];
      division.skipdelivery = 0;
      if (division.disablescroll) {
        division.disablescroll = false;
      } else {
        $scope.getcontractorOutward(division.selectedDivisionid, division);
      }
      getcontractorOutwardstatbydivision(division.selectedDivisionid, division);
    }
  };

  // Load Outward details
  $scope.getcontractorOutward = function (id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.outwardData)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.divisionID = "All";
      if (id !== "") {
        objs.divisionID = id;
      }
      if (angular.isUndefined(division.skipdelivery)) {
        division.skipdelivery = 0;
      }
      objs.skip = division.skipdelivery;
      objs.filterby = division.filterSelected;

      division.outwardloadingData = true;

      ContractorService.getcontractorOutward(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipdelivery += result.data.length;
            angular.forEach(result.data, (delivery) => {
              if (angular.isDefined(delivery) && angular.isDefined(delivery.order_id) && delivery.order_id !== null &&
                angular.isDefined(delivery.outward_data) && delivery.outward_data !== null && delivery.outward_data.length > 0) {
                const obj = {};
                obj._id = delivery._id;
                obj.order_id = delivery.order_id;
                obj.order_reference_no = angular.isDefined(delivery.order_reference_no) ? delivery.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(delivery.customer_dc_no) ? delivery.customer_dc_no : "";
                obj.customer_name = delivery.customer_name;
                obj.contractor_name = delivery.contractor_name;
                obj.order_no = delivery.order_no;
                obj.order_date = delivery.order_date;
                obj.outward_status = delivery.outward_status;
                obj.outward_no = delivery.outward_no;
                obj.outward_date = delivery.outward_date;
                obj.process = [];
                
                angular.forEach(delivery.outward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.outwardData.push(angular.copy(obj));
              }
            });
          } else {
            division.disablescroll = true;
          }
        }
        division.outwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.outwardloadingData = false;
      });
    }
  };
  
  function getcontractorOutwardstatbydivision(id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.outwardData)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.divisionID = "All";
      if (id !== "") {
        objs.divisionID = id;
      }
      objs.filterby = division.filterSelected;
      division.deliveredCount = 0;
//      division.returneddCount = 0;

      ContractorService.getcontractorOutwardstatbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            angular.forEach(result.data, (outwardcnt) => {
              if (angular.isDefined(outwardcnt.division_id) && angular.isDefined(outwardcnt.count) && parseInt(outwardcnt.count) > 0) {
                division.deliveredCount += parseInt(outwardcnt.count);
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }
  
  // Load contract Inward overview status count by filter
  $scope.getcontractorInwardoverview = function (division, filtervalue) {
    if (division !== null && angular.isDefined(division.selectedDivisionid) && division.selectedDivisionid !== null && filtervalue !== null) {
      division.filterSelected = filtervalue;
      division.outwardData = [];
      division.skipdelivery = 0;
      if (division.disablescroll) {
        division.disablescroll = false;
      } else {
        $scope.getcontractorInward(division.selectedDivisionid, division);
      }
      getcontractorInwardstatbydivision(division.selectedDivisionid, division);
    }
  };

  // Load Outward details
  $scope.getcontractorInward = function (id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.outwardData)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.divisionID = "All";
      if (id !== "") {
        objs.divisionID = id;
      }
      if (angular.isUndefined(division.skipdelivery)) {
        division.skipdelivery = 0;
      }
      objs.skip = division.skipdelivery;
      objs.filterby = division.filterSelected;

      division.outwardloadingData = true;

      ContractorService.getcontractorInward(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipdelivery += result.data.length;
            angular.forEach(result.data, (delivery) => {
              if (angular.isDefined(delivery) && angular.isDefined(delivery.order_id) && delivery.order_id !== null &&
                angular.isDefined(delivery.inward_data) && delivery.inward_data !== null && delivery.inward_data.length > 0) {
                const obj = {};
                obj._id = delivery._id;
                obj.order_id = delivery.order_id;
                obj.order_reference_no = angular.isDefined(delivery.order_reference_no) ? delivery.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(delivery.customer_dc_no) ? delivery.customer_dc_no : "";
                obj.customer_name = delivery.customer_name;
                obj.contractor_name = delivery.contractor_name;
                obj.order_no = delivery.order_no;
                obj.order_date = delivery.order_date;
                obj.outward_status = delivery.outward_status;
                obj.outward_no = delivery.outward_no;
                obj.outward_date = delivery.outward_date;
                obj.outward_id = delivery.outward_id;
                obj.inward_no = delivery.inward_no;
                obj.inward_date = delivery.inward_date;
                obj.process = [];
                
                angular.forEach(delivery.inward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.outwardData.push(angular.copy(obj));
              }
            });
          } else {
            division.disablescroll = true;
          }
        }
        division.outwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.outwardloadingData = false;
      });
    }
  };
  
  function getcontractorInwardstatbydivision(id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.outwardData)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.divisionID = "All";
      if (id !== "") {
        objs.divisionID = id;
      }
      objs.filterby = division.filterSelected;
      division.returneddCount = 0;

      ContractorService.getcontractorInwardstatbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            angular.forEach(result.data, (outwardcnt) => {
              if (angular.isDefined(outwardcnt.division_id) && angular.isDefined(outwardcnt.count) && parseInt(outwardcnt.count) > 0) {
                division.returneddCount += parseInt(outwardcnt.count);
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }

  $scope.getOutwardbydivisionbyfilter = function (division) {
    division.outwardData = [];
    division.skipdelivery = 0;
    if (division.disablescroll) {
      division.disablescroll = false;
    } else {
      $scope.getOutwardbydivision(division);
    }
    getOutwardstat(division);
  };

  // get outwards by division for superadmin and divisionadmin app
  $scope.getOutwardbydivision = function (division) {
    if (angular.isDefined(division) && angular.isDefined(division.delivery)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skipdelivery)) {
        division.skipdelivery = 0;
      }
      objs.skip = division.skipdelivery;
      objs.filterby = division.outwardfilterSelected;

      division.outwardloadingData = true;
      if (angular.isUndefined(division.outwardData)) {
        division.outwardData = [];
      }

      DeliveryService.getOutwardbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipdelivery += result.data.length;
            angular.forEach(result.data, (delivery) => {
              if (angular.isDefined(delivery) && angular.isDefined(delivery.order_id) && delivery.order_id !== null &&
                angular.isDefined(delivery.order_id._id) && angular.isDefined(delivery.outward_data) && delivery.outward_data !== null &&
                delivery.outward_data.length > 0) {
                const obj = {};
                obj._id = delivery._id;

                obj.order_reference_no = angular.isDefined(delivery.order_id.order_reference_no) ? delivery.order_id.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(delivery.order_id.customer_dc_no) ? delivery.order_id.customer_dc_no : "";
                // obj.dyeing_name = (angular.isDefined(delivery.order_id.dyeing) && angular.isDefined(delivery.order_id.dyeing.dyeing_name)) ?
                // delivery.order_id.dyeing.dyeing_name : "";
                obj.dyeing_dc_no = angular.isDefined(delivery.order_id.dyeing_dc_no) ? delivery.order_id.dyeing_dc_no : "";

                obj.order_id = delivery.order_id._id;
                obj.customer_name = delivery.customer_name;
                obj.order_no = delivery.order_no;
                obj.order_date = delivery.order_date;
                obj.order_status = delivery.order_status;
                obj.delivery_no = delivery.delivery_no;
                obj.delivery_date = delivery.delivery_date;
                obj.is_return = delivery.is_return;
                obj.process = [];
                angular.forEach(delivery.outward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.outwardData.push(angular.copy(obj));
              }
            });
          } else {
            division.disablescroll = true;
          }
        }
        division.outwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.outwardloadingData = false;
      });
    }
  };
  
  // get inwards by division for superadmin and divisionadmin app
  $scope.getcontractInwardbydivision = function (division) {
    if (angular.isDefined(division) && angular.isDefined(division.inward)) {
      $scope.cardData.disablecontractinwardscroll = true;
      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skipcontractinward)) {
        division.skipcontractinward = 0;
      }
      objs.skip = division.skipcontractinward;
      objs.filterby = division.contractorinwardfilterSelected;

      division.contractinwardloadingData = true;

      ContractorService.getcontractInwardbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipcontractinward += result.data.length;
            angular.forEach(result.data, (delivery) => {
              if (angular.isDefined(delivery) && angular.isDefined(delivery.order_id) && delivery.order_id !== null && 
                angular.isDefined(delivery.inward_data) && delivery.inward_data !== null && delivery.inward_data.length > 0) {
                const obj = {};
                obj._id = delivery._id;
                obj.order_reference_no = angular.isDefined(delivery.order_reference_no) ? delivery.order_reference_no : "";
                obj.customer_dc_no = angular.isDefined(delivery.customer_dc_no) ? delivery.customer_dc_no : "";
                obj.order_id = delivery.order_id;
                obj.contractor_name = delivery.contractor_name;
                obj.customer_name = delivery.customer_name;
                obj.order_no = delivery.order_no;
                obj.order_date = delivery.order_date;
                obj.outward_no = delivery.outward_no;
                obj.outward_date = delivery.outward_date;
                obj.outward_id = delivery.outward_id;
                obj.inward_no = delivery.inward_no;
                obj.inward_date = delivery.inward_date;
                obj.process = [];
                
                angular.forEach(delivery.inward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.inward.push(angular.copy(obj));
              }
            });
            division.disablecontractinwardscroll = false;
          } else {
            division.disablecontractinwardscroll = true;
          }
        }
        division.contractinwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.contractinwardloadingData = false;
      });
    }
  };

  // get outwards by division for superadmin and divisionadmin app
  function getOutwardstat(division) {
    if (angular.isDefined(division) && angular.isDefined(division.delivery)) {
      const objs = {};
      objs.filterby = division.outwardfilterSelected;

      division.deliveredCount = 0;
      division.returneddCount = 0;

      DeliveryService.getOutwardstat(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            angular.forEach(result.data, (outwardcnt) => {
              if (angular.isDefined(outwardcnt.division_id) && angular.isDefined(outwardcnt.is_return) &&
                          angular.isDefined(outwardcnt.count) && parseInt(outwardcnt.count) > 0) {
                if (outwardcnt.is_return) {
                  division.returneddCount = parseInt(outwardcnt.count);
                } else {
                  division.deliveredCount = parseInt(outwardcnt.count);
                }
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }  
  
  // get contract Inwards by division for superadmin and divisionadmin app
  function getcontractInwardstat(division) {
    if (angular.isDefined(division) && angular.isDefined(division.inward)) {
      const objs = {};
      objs.filterby = division.contractorinwardfilterSelected;

      division.totalinwardCount = 0;

      ContractorService.getcontractInwardstat(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            angular.forEach(result.data, (outwardcnt) => {
              if (angular.isDefined(outwardcnt.division_id) && angular.isDefined(outwardcnt.count) && parseInt(outwardcnt.count) > 0) {
                division.totalinwardCount = parseInt(outwardcnt.count);
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  }

  $scope.getOutwardbycustomerfilter = function (division) {
    division.outwardData = [];
    division.skipdelivery = 0;
    if (division.disablescroll) {
      division.disablescroll = false;
    } else {
      $scope.getOutwardbycustomer(division);
    }
    getOutwardbycustomerstat(division);
  };

  // get outwards for customer app
  $scope.getOutwardbycustomer = function (division) {
    if (angular.isDefined(division) && angular.isDefined(division.delivery)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      if (angular.isUndefined(division.skipdelivery)) {
        division.skipdelivery = 0;
      }
      objs.skip = division.skipdelivery;
      objs.filterby = division.outwardfilterSelected;
      if (angular.isUndefined(division.outwardData)) {
        division.outwardData = [];
      }
      division.outwardloadingData = true;

      DeliveryService.getcustomerOutward(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            division.skipdelivery += result.data.length;
            angular.forEach(result.data, (delivery) => {
              if (angular.isDefined(delivery) && angular.isDefined(delivery.outward_data) && delivery.outward_data !== null &&
                delivery.outward_data.length > 0) {
                const obj = {};
                obj._id = delivery._id;
                obj.order_id = delivery.order_id;
                obj.customer_name = delivery.customer_name;
                obj.order_no = delivery.order_no;
                obj.order_date = delivery.order_date;
                obj.order_status = delivery.order_status;
                obj.delivery_no = delivery.delivery_no;
                obj.delivery_date = delivery.delivery_date;
                obj.is_return = delivery.is_return;
                obj.process = [];
                angular.forEach(delivery.outward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });
                division.outwardData.push(angular.copy(obj));
              }
            });
          } else {
            division.disablescroll = true;
          }
        }
        division.outwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.outwardloadingData = false;
      });
    }
  };

  // get outwards for customer app
  function getOutwardbycustomerstat(division) {
    if (angular.isDefined(division) && angular.isDefined(division.delivery)) {
      const objs = {};
      objs.limit = $scope.data.limit;
      objs.filterby = division.outwardfilterSelected;

      division.deliveredCount = 0;
      division.returneddCount = 0;

      DeliveryService.getOutwardbycustomerstat(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null) {
          if (result.data.length > 0) {
            angular.forEach(result.data, (outwardcnt) => {
              if (angular.isDefined(outwardcnt.is_return) && angular.isDefined(outwardcnt.count) && parseInt(outwardcnt.count) > 0) {
                if (outwardcnt.is_return) {
                  division.returneddCount = parseInt(outwardcnt.count);
                } else {
                  division.deliveredCount = parseInt(outwardcnt.count);
                }
              }
            });
          }
        }
        division.outwardloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.outwardloadingData = false;
      });
    }
  }

  // Load Return details
  $scope.getOutwardreturn = function (id, division) {
    if (angular.isDefined(id) && id !== null && angular.isDefined(division) && angular.isDefined(division.returnData)) {
      if (division.returnloadingData) { return; }

      if (angular.isUndefined(division.skipdeliveryreturn)) { division.skipdeliveryreturn = []; }

      if (division.skipdeliveryreturn.length <= 4 && division.skipdeliveryreturn.length > 0) { return; }

      const objs = {};
      objs.limit = $scope.data.limit;
      objs.skip = division.skipdeliveryreturn;
      objs.divisionID = "All";
      if (id !== "") { objs.divisionID = id; }

      division.returnloadingData = true;

      DeliveryreturnService.getOutward(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && result.data.length > 0) {
          angular.forEach(result.data, (delivery) => {
            if (angular.isDefined(delivery) && angular.isDefined(delivery.outward_data) && delivery.outward_data !== null &&
                delivery.outward_data.length > 0) {
              const obj = {};
              obj._id = delivery._id;

              division.skipdeliveryreturn.push(angular.copy(obj._id));

              obj.order_id = delivery.order_id;
              obj.customer_name = delivery.customer_name;
              obj.order_no = delivery.order_no;
              obj.order_date = delivery.order_date;
              obj.order_status = delivery.order_status;
              obj.delivery_no = delivery.delivery_no;
              obj.delivery_date = delivery.delivery_date;
              obj.is_return = delivery.is_return;
              obj.process = [];
              angular.forEach(delivery.outward_data, (owd) => {
                if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                  angular.forEach(owd.process, (pro) => {
                    if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                      obj.process.push(pro);
                    }
                  });
                }
              });
              division.returnData.push(angular.copy(obj));
            }
          });
        }
        division.returnloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.returnloadingData = false;
      });
    }
  };

  // get return by division
  $scope.getOutwardreturnbydivision = function (division) {
    if (angular.isDefined(division) && angular.isDefined(division.deliveryreturn)) {
      if (division.returnloadingData) { return; }

      if (angular.isUndefined(division.skipdeliveryreturn)) { division.skipdeliveryreturn = []; }

      if (division.skipdeliveryreturn.length <= 4 && division.skipdeliveryreturn.length > 0) { return; }

      const objs = {};
      objs.limit = $scope.data.limit;
      objs.skip = division.skipdeliveryreturn;

      division.returnloadingData = true;

      DeliveryreturnService.getOutwardbydivision(objs, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && result.data.length > 0) {
          angular.forEach(result.data, (delivery) => {
            if (angular.isDefined(delivery) && angular.isDefined(delivery.outward_data) && delivery.outward_data !== null &&
                delivery.outward_data.length > 0) {
              const obj = {};
              obj._id = delivery._id;

              division.skipdeliveryreturn.push(angular.copy(obj._id));

              obj.order_id = delivery.order_id;
              obj.customer_name = delivery.customer_name;
              obj.order_no = delivery.order_no;
              obj.order_date = delivery.order_date;
              obj.order_status = delivery.order_status;
              obj.delivery_no = delivery.delivery_no;
              obj.delivery_date = delivery.delivery_date;
              obj.is_return = delivery.is_return;
              obj.process = [];
              angular.forEach(delivery.outward_data, (owd) => {
                if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                  angular.forEach(owd.process, (pro) => {
                    if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                      obj.process.push(pro);
                    }
                  });
                }
              });
              division.deliveryreturn.push(angular.copy(obj));
            }
          });
        }
        division.returnloadingData = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        division.returnloadingData = false;
      });
    }
  };

  // select division
  $scope.getDivisiondata = function (division, filterDivision, category) {
    if (angular.isDefined(division) && division !== null && angular.isDefined(filterDivision) && filterDivision !== null &&
                (division.name === "Outwards" || division.name === "Return")) {
      if (category === "Division" && angular.isDefined(filterDivision._id) && angular.isDefined(filterDivision.name) &&
        filterDivision._id !== division.selectedDivisionid) {
        division.selectedDivisionid = filterDivision._id;
        division.selectedDivision = filterDivision.name;
      } else {
        division.selectedDivisionid = "";
        division.selectedDivision = "ALL";
      }
      division.outwardData = [];
      division.skipdelivery = 0;
      if (division.disablescroll) {
        division.disablescroll = false;
      } else {
        $scope.getOutward(division.selectedDivisionid, division);
      }
    }
  };
  
  
  // select division
  $scope.getcontractorDivisiondata = function (division, filterDivision, category) {
    if (angular.isDefined(division) && division !== null && angular.isDefined(filterDivision) && filterDivision !== null &&
                (division.name === "Contractor Outward" || division.name === "Contractor Inward")) {
      if (category === "Division" && angular.isDefined(filterDivision._id) && angular.isDefined(filterDivision.name) &&
        filterDivision._id !== division.selectedDivisionid) {
        division.selectedDivisionid = filterDivision._id;
        division.selectedDivision = filterDivision.name;
      } else {
        division.selectedDivisionid = "";
        division.selectedDivision = "ALL";
      }
      division.outwardData = [];
      division.skipdelivery = 0;
      if (division.disablescroll) {
        division.disablescroll = false;
      } else {
        if (division.name === "Contractor Outward") {
          $scope.getcontractorOutward(division.selectedDivisionid, division);
        } else {
          $scope.getcontractorInward(division.selectedDivisionid, division);
        }
      }
    }
  };
  
  // select division filter pending dues
  $scope.setDivision = function (division, filterDivision) {
    if (angular.isDefined(filterDivision) && filterDivision !== null) {
      if (angular.isDefined(filterDivision._id) && angular.isDefined(filterDivision.name) && filterDivision._id !== division.selectedDivisionid) {
        division.selecteddueDivisionid = filterDivision._id;
        division.selecteddueDivision = filterDivision.name;
      } else {
        division.selecteddueDivisionid = "";
        division.selecteddueDivision = "ALL";
      }
      $scope.getPendinginvoice();
    }
  };

  // Filter pending invoice vy due days
  $scope.selectDuedays = function (dues) {
    if (angular.isDefined(dues) && dues !== null) {
      $scope.cardData.selectedDue = dues;
      if ($rootScope.currentapp === "customer") {
        $scope.getcustomerPendinginvoice();
      } else {
        $scope.getPendinginvoice();
      }
    }
  };

  // Load inward details
  $scope.getInward = function (id) {
    if (angular.isDefined(id) && id !== null && id !== "") {
      InwardService.getInward(id, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && result.data.length > 0) {
          angular.forEach(result.data, (ord) => {
            if (angular.isDefined(ord) && angular.isDefined(ord._id)) {
              const obj = {};
              obj._id = ord._id;
              obj.customer_name = ord.customer_name;
              obj.inward_date = ord.inward_date;
              obj.inward_status = ord.inward_status;
              obj.inward_no = ord.inward_no;

              $scope.cardData.inwards.push(angular.copy(obj));
            }
          });
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  // Load delivery details to dashboard
  $scope.getDelivery = function () {
    if ($rootScope.currentapp === "divisionadmin" && AuthService.isLogged()) {
      $scope.cardData.pageLoader = true;
      $scope.cardData.divisiondetails = {};

      DivisionService.getallDivisiondetails((result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.divisions) && result.data.divisions !== null && result.data.divisions.length > 0) {
          $scope.cardData.divisiondetails = angular.copy(result.data.divisions[0]);
        }
        $scope.cardData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.pageLoader = false;
      });
    } else if ($rootScope.currentapp === "superadmin" && AuthService.isLogged()) {
      $scope.cardData.pageLoader = true;
      $scope.cardData.divisions = [];

      DivisionService.getallDivisiondetails((result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.divisions) && result.data.divisions !== null && result.data.divisions.length > 0) {
          $scope.cardData.divisions = angular.copy(result.data.divisions);
        }
        $scope.cardData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.cardData.pageLoader = false;
      });
    }
  };

  $scope.selectOrder = function (page) {
    if (page !== null && (page === "newjob" || page === "inward" || page === "delivery" || page === "return")) {
      $location.path(`/divisionadmin/order/${page}`);
    }
  };
  
  $scope.selectContractorder = function (page) {
    if (page !== null && (page === "inward" || page === "outward")) {
      $location.path(`/divisionadmin/contract/${page}`);
    }
  };
  
  if ($rootScope.currentapp === "customer") {
    $scope.getPreferencedues();
    $scope.getDivisiondetails();
  } else {
    $scope.getPreferencedetails();
    $scope.getDivisiondetails();
  }

  socket.on("DivisionUser", (userlist) => {
    if (angular.isDefined(userlist) && userlist !== null && userlist.length > 0) {
      const divisionuser = userlist;
      angular.forEach($scope.cardData.divisions, (division) => {
        if (angular.isDefined(division) && division !== null && angular.isDefined(division._id) && divisionuser.indexOf(division._id) > -1) {
          $rootScope.$apply(() => {
            division.status = "Online";
          });
        } else {
          $rootScope.$apply(() => {
            division.status = "Offline";
          });
        }
      });
    } else {
      angular.forEach($scope.cardData.divisions, (division) => {
        if (angular.isDefined(division) && division !== null && angular.isDefined(division._id)) {
          $rootScope.$apply(() => {
            division.status = "Offline";
          });
        }
      });
    }
  });
  socket.on("Stockdetails", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result.division) && angular.isDefined(result.stock) &&
        result.stock !== null && result.stock.length > 0) {
      angular.forEach(result.stock, (stockData) => {
        if (angular.isDefined(stockData._id)) {
          angular.forEach($scope.cardData.divisions, (division, index) => {
            if (division !== null && angular.isDefined(division._id) && result.division === division._id) {
              const found = _.some(division.stocks, (el, ind) => {
                if (el._id === stockData._id) {
                  if (angular.isDefined(stockData.quantity)) {
                    $rootScope.$apply(() => {
                      $scope.cardData.divisions[index].stocks[ind].quantity = stockData.quantity;
                    });
                  }
                }
                return el._id === stockData._id;
              });
              if (!found) {
                $rootScope.$apply(() => {
                  $scope.cardData.divisions[index].stocks.push(angular.copy(stockData));
                });
              }
            }
          });
        }
      });
    }
  });

  setTimeout(() => {
    socket.emit("getDivisionuser");
  }, 5000);
});
