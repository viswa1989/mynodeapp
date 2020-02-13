/* global parseFloat */
/* global angular */
angular.module("pendingpaymentCtrl", []).controller("PendingpaymentController", ($scope, $routeParams, DivisionService, CustomerService, 
  DateformatstorageService, DATEFORMATS, Notification, AuthService, commonobjectService, $filter, $q, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.PendingreportData = {};
  $scope.PendingreportData.cusTrans = {};
  $scope.PendingreportData.currency = commonobjectService.getCurrency();
  $scope.PendingreportData.pageLoader = true;
  $scope.PendingreportData.currentDate = new Date();

  $scope.PendingreportData.currentRow = -1;
  $scope.PendingreportData.divisionList = [{_id: "", name: "ALL"}];
  $scope.PendingreportData.selectedDivisionid = "";
  $scope.PendingreportData.selectedDivisionname = "ALL";

  $scope.PendingreportData.activeDay = "TODAY";
  $scope.PendingreportData.pendingpayments = [];

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

  $scope.filterBydivision = function (division) {
    if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
      $scope.PendingreportData.selectedDivisionid = angular.copy(division._id);
      $scope.PendingreportData.selectedDivisionname = angular.copy(division.name);
      $scope.PendingreportData.pageLoader = true;
      $scope.viewData();
    }
  };

  $scope.viewData = function () {
    $scope.PendingreportData.pendingpayments = [];
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.PendingreportData.selectedDivisionid);

    ReportService.getPendingpayment(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.PendingreportData.pendingpayments = angular.copy(result.data);
      }
      $scope.PendingreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PendingreportData.pageLoader = false;
    });
  };

  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Divisiondetail) &&
    result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
      angular.forEach(result.data.Divisiondetail, (division, index) => {
        if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
          if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
          result.data.Currentbranch === division._id) {
            $scope.PendingreportData.selectedDivisionid = angular.copy(division._id);
            $scope.PendingreportData.selectedDivisionname = angular.copy(division.name);
            $scope.PendingreportData.divisionList = [];
          }
          $scope.PendingreportData.divisionList.push(angular.copy(division));
        }
        if (index === result.data.Divisiondetail.length - 1) {
          $scope.viewData();
        }
      });
    }
    $scope.PendingreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.PendingreportData.pageLoader = false;
  });

  $scope.setCurrentrow = function (data) {
    if (data !== null && angular.isDefined(data._id) && data._id !== $scope.PendingreportData.currentRow) {
      $scope.PendingreportData.currentRow = angular.copy(data._id);
    } else {
      $scope.PendingreportData.currentRow = -1;
    }
  };

  $scope.customerTransactions = function (customer) {
    $scope.PendingreportData.cusTrans = {};
    $scope.PendingreportData.cusTansloading = true;
    if (angular.isDefined(customer) && customer !== null && angular.isDefined(customer._id) && customer._id !== null && customer._id !== "") {
      $scope.PendingreportData.cusTrans.customer_name = customer.name;
      $scope.PendingreportData.cusTrans.mobile_no = customer.mobile_no;
      $scope.PendingreportData.cusTrans.pendingDues = 0;
      $scope.PendingreportData.cusTrans.previousbalance = 0;
      $scope.PendingreportData.cusTrans.Billdetails = [];
      $scope.PendingreportData.cusTrans.Transactiondetails = [];
      
      CustomerService.getcustomerTransactions(customer._id, (result) => {
        if (result !== null && angular.isDefined(result.data) && result.data !== null) {
          let dues = 0;
          if (angular.isDefined(result.data.Billdetails) && result.data.Billdetails !== null && result.data.Billdetails.length > 0) {
            
            angular.forEach(result.data.Billdetails, (bills, index) => {
              if (bills !== null && angular.isDefined(bills._id) && angular.isDefined(bills.division_id) && bills.division_id !== null && 
                      angular.isDefined(bills.division_id.name)) {
                let obj = {};
                obj.division = angular.copy(bills.division_id.name);
                obj.invoice_date = angular.copy(bills.invoice_date);
                obj.invoice_no = angular.copy(bills.invoice_no);
                obj.paid = angular.copy(bills.paid);
                obj.payment_status = angular.copy(bills.payment_status);
                obj.total = angular.copy(bills.total);
                obj.type = angular.copy(bills.type);
                obj.balance = parseFloat(bills.total);
                if (parseInt(bills.paid) > 0) {
                  obj.balance = parseFloat(bills.total) - parseFloat(bills.paid);
                }
                dues += obj.balance;

                $scope.PendingreportData.cusTrans.Billdetails.push(obj);
              }
              if (index === result.data.Billdetails.length - 1) {
                $scope.PendingreportData.cusTrans.pendingDues += dues;
              }
            });
          }
          if (angular.isDefined(result.data.Openingbalancedetails) && result.data.Openingbalancedetails !== null && 
                  angular.isDefined(result.data.Openingbalancedetails.opening_balance) && result.data.Openingbalancedetails.opening_balance !== null && 
                  angular.isDefined(result.data.Openingbalancedetails.opening_balance.total_balance) && result.data.Openingbalancedetails.opening_balance.total_balance !== null && 
                        parseFloat(result.data.Openingbalancedetails.opening_balance.total_balance)>0 && 
                        result.data.Openingbalancedetails.opening_balance.pending_balance !== null && 
                        parseFloat(result.data.Openingbalancedetails.opening_balance.pending_balance)>0) {
            $scope.PendingreportData.cusTrans.previousbalance = angular.copy(parseFloat(result.data.Openingbalancedetails.opening_balance.pending_balance));
            $scope.PendingreportData.cusTrans.pendingDues += parseFloat(result.data.Openingbalancedetails.opening_balance.pending_balance);
          }
          if (angular.isDefined(result.data.Transactiondetails) && result.data.Transactiondetails !== null && result.data.Transactiondetails.length > 0) {
            $scope.PendingreportData.cusTrans.Transactiondetails = angular.copy(result.data.Transactiondetails);
          }
        }
        //call responsive
        CustomerNotificationHeight();

        //Show Div
        customerPreviousBillSidePanelOpen();
        $scope.PendingreportData.cusTansloading = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.PendingreportData.cusTansloading = false;
      });
    }
  }
  
  $scope.printThisPayments = function () {
    if (angular.isDefined($scope.PendingreportData.pendingpayments) && $scope.PendingreportData.pendingpayments !== null &&
    $scope.PendingreportData.pendingpayments.length > 0) {
      const templateUrl = $sce.getTrustedResourceUrl("app/views/common/pendingpayment_print.html");
      pendingpaymentsDetail = $scope.PendingreportData.pendingpayments;
      if (angular.isDefined($scope.PendingreportData.fillterByCustomer) && $scope.PendingreportData.fillterByCustomer !== null &&
      $scope.PendingreportData.fillterByCustomer !== "") {
        pendingpaymentsDetail = $filter("filter")($scope.PendingreportData.pendingpayments, $scope.PendingreportData.fillterByCustomer);
      }
      selectedDivision = $scope.PendingreportData.selectedDivisionname;
      currentDate = $scope.PendingreportData.currentDate;
      selectedDivisionId = $scope.PendingreportData.selectedDivisionid;
      currency = $scope.PendingreportData.currency;
      window.open(templateUrl, "_blank");
    }
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.PendingreportData.selectedDivisionid);
    obj.filterData.searchtext = angular.copy($scope.PendingreportData.fillterByCustomer);
    obj.filterData.divisionname = angular.copy($scope.PendingreportData.selectedDivisionname);
    
    ReportService.exportpendingpaystatement(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data !== "") {
            window.open(result.data, "_blank");
          }
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
});
