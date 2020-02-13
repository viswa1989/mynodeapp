/* global parseFloat */
/* global _ */
/* global angular */
angular.module("accountCtrl", []).controller("AccountController", ($scope, $rootScope, $anchorScroll, $sce, Notification, AccountService,
  InvoiceService, commonobjectService, CustomerService, OrderService, DeliveryService, accountsService, DateformatstorageService, DATEFORMATS, $filter,
  $timeout, socket, validateField, $q) => {
  $scope.data = {};
  $scope.accountdata = {};
  $scope.ledgerData = {};
  $scope.transactionData = {};
  $scope.selectedBranch = {};
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;
  $scope.accountdata.activeDay = "TODAY";
  
  $scope.filterData = {};
  $scope.accountdata.sortColumn = 'transaction_date';
  
  $scope.accountdata.optionsdata = [{id: 1, name: "sample1"}, {id: 2, name: "sample2"}, {id: 3, name: "sample3"}];
  $scope.accountdata.accountEdit = "DEBIT";
  $scope.transactionData.transaction_type = angular.copy($scope.accountdata.accountEdit);

  $scope.accountdata.formsubmission = false;
  $scope.accountdata.pageLoader = true;
  $scope.accountdata.eventLoader = false;

  $scope.accountdata.branchDetail = [];
  $scope.accountdata.ledgerDetail = [];
  $scope.accountdata.fromledgerDetail = [];
  $scope.accountdata.toledgerDetail = [];
  $scope.accountdata.currencytype = [];
  $scope.accountdata.categories = [];
  $scope.accountdata.accountsTransaction = [];
  $scope.accountdata.invoiceForm = {};
  $scope.accountdata.pendingBills = [];
  $scope.accountdata.pageLoad = false;
  $scope.accountdata.tempselectedledger = {};

  $scope.accountdata.morebranchfilters = false;
  $scope.accountdata.branchfiltersLimit = 6;
  $scope.accountdata.moreledgerfilters = false;
  $scope.accountdata.ledgerfiltersLimit = 3;
  $scope.accountdata.morefavledgerfilters = false;
  $scope.accountdata.favledgerfiltersLimit = 2;

  $scope.filterData.selectedBranch = "";
  $scope.filterData.selectedLedger = "";

  $scope.data.paymentcardToggle = false;

  $scope.accountdata.currentPage = "Dashboard";

  $scope.commonobjectService = commonobjectService;
  $scope.accountdata.currencytype = commonobjectService.getCurrencyName();
  $scope.accountdata.currency = commonobjectService.getCurrency();

  $scope.resetTransaction = function () {
    $scope.transactionData = {};
    $scope.accountdata.category = "";
    $scope.accountdata.fromledger = "";
    $scope.accountdata.toledger = "";
    $scope.transactionData.transaction_type = angular.copy($scope.accountdata.accountEdit);
    $scope.transactionData.transaction_date = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
    $scope.transactionData.toledger_id = "";
    $scope.transactionData.fromledger_id = "";
    $scope.accountdata.eventLoader = false;
  };

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

  function setLedgertotal(ledger) {
    const deferred = $q.defer();
    let index = 0;
    ledger.current_balance = 0;
    if (angular.isDefined(ledger) && ledger !== null && angular.isDefined(ledger._id) && angular.isDefined(ledger.type)) {
      if (angular.isDefined(ledger.opening_balance) && parseFloat(ledger.opening_balance)>0) {
        ledger.current_balance = parseFloat(ledger.current_balance) + parseFloat(ledger.opening_balance);
      }
      if ($scope.accountdata.ledgerTotal.length > 0 && ledger.type !== "INVOICE") {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led.total) && angular.isDefined(led._id) &&
              led._id !== null && angular.isDefined(led._id.ledger_id) && angular.isDefined(led._id.transaction_type) &&
              led._id.transaction_type !== "" && led._id.ledger_id === ledger._id) {
            if (led._id.transaction_type === "CREDIT") {
              ledger.current_balance = parseFloat(ledger.current_balance) + parseFloat(led.total);
            } else {
              ledger.current_balance = parseFloat(ledger.current_balance) - parseFloat(led.total);
            }
          }
          index += 1;

          if (index === $scope.accountdata.ledgerTotal.length) {
            deferred.resolve(true);
          }
        });
      } else if ($scope.accountdata.invoiceledgerTotal.length > 0 && ledger.type === "INVOICE") {
        angular.forEach($scope.accountdata.invoiceledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led.total) && angular.isDefined(led._id) &&
              led._id !== null && angular.isDefined(led._id.ledger_id) && led._id.ledger_id === ledger._id) {
            ledger.current_balance += parseFloat(led.total);
          }
          index += 1;

          if (index === $scope.accountdata.invoiceledgerTotal.length) {
            deferred.resolve(true);
          }
        });
      } else {
        deferred.resolve(true);
      }
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  $scope.receivePaymentbycustomer = function() {
    let receivePaymentdata = angular.copy(accountsService.getPaymentdetail());

    if (receivePaymentdata !== null && angular.isDefined(receivePaymentdata.division_id) && angular.isDefined(receivePaymentdata.customer_id)) {
      accountsService.setPaymentdetail({});
      $scope.filterData.selectedBranch = receivePaymentdata.division_id;
      $scope.accountdata.pendingBills = [];
      $scope.accountdata.customerPayment = {};
      $scope.accountdata.paymentledgers = [];
      
      $scope.getPaymentdetails(receivePaymentdata.customer_id);
    }
  }
  // Initialize accounts data
  $scope.initializeData = function () {
    $scope.accountdata.branchDetail = [];
    $scope.accountdata.ledgerDetail = [];
    $scope.accountdata.ledgerTotal = [];
    $scope.accountdata.invoiceledgerTotal = [];
    $scope.accountdata.fromledgerDetail = [];
    $scope.accountdata.toledgerDetail = [];
    $scope.filterData.selectedBranch = "";
    $scope.filterData.selectedLedger = "";
    $scope.accountdata.pageLoader = true;
    $scope.accountdata.eventLoader = false;
    $scope.accountdata.pageLoad = false;

    AccountService.initializedata((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.message) && angular.isDefined(result.message.Branchdetail) && result.message.Branchdetail.length > 0) {
            angular.forEach(result.message.Branchdetail, (branch, index) => {
              if (index === 0) {
                $scope.filterData.selectedBranch = branch._id;
                $scope.selectedBranch = angular.copy(branch);
              }
              $scope.accountdata.branchDetail.push(angular.copy(branch));
            });
          }

          $scope.accountdata.ledgerTotal = (angular.isDefined(result.message.ledgerTotal) && result.message.ledgerTotal !== null &&
          result.message.ledgerTotal.length > 0) ? angular.copy(result.message.ledgerTotal) : [];

          $scope.accountdata.invoiceledgerTotal = (angular.isDefined(result.message.billTotal) && result.message.billTotal !== null &&
          result.message.billTotal.length > 0) ? angular.copy(result.message.billTotal) : [];

          if (angular.isDefined(result.message) && angular.isDefined(result.message.Ledgerdetail) && result.message.Ledgerdetail.length > 0) {
            angular.forEach(result.message.Ledgerdetail, (ledger, index) => {
              setLedgertotal(ledger).then((res) => {
                if (res) {
                  $scope.accountdata.ledgerDetail.push(angular.copy(ledger));
                  if (angular.isDefined(ledger.division_id) && ledger.division_id === $scope.filterData.selectedBranch) {
                    $scope.accountdata.fromledgerDetail.push(angular.copy(ledger));
                  }
                  if (index === result.message.Ledgerdetail.length - 1) {
                    $scope.accountdata.toledgerDetail = angular.copy($scope.accountdata.ledgerDetail);
                  }
                }
              });
            });
          }

          if (angular.isDefined(result.message) && angular.isDefined(result.message.Currentbranch) && result.message.Currentbranch !== "") {
            $scope.filterData.selectedBranch = angular.copy(result.message.Currentbranch);
          }

          angular.forEach(result.message.Branchdetail, (branch) => {
            if (angular.isDefined(branch._id) && branch._id === $scope.filterData.selectedBranch) {
              $scope.selectedBranch = angular.copy(branch);
            }
          });
          $scope.receivePaymentbycustomer();
        } else {
          Notification.error(result.message);
        }
      }
      $scope.accountdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.accountdata.pageLoader = false;
    });
  };

  $scope.setaccountFavourite = function (ledger) {
    if (angular.isDefined(ledger) && ledger !== null && ledger !== "" && angular.isDefined(ledger._id)) {
      const obj = {};
      obj._id = angular.copy(ledger._id);
      obj.favourite = false;
      if (angular.isDefined(ledger.favourite) && ledger.favourite !== null) {
        obj.favourite = !ledger.favourite;
      } else if (angular.isUndefined(ledger.favourite)) {
        obj.favourite = true;
      }

      AccountService.setFavourite(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.accountdata.ledgerDetail, (led) => {
              if (angular.isDefined(led._id) && led._id === ledger._id) {
                led.favourite = angular.copy(obj.favourite);
              }
            });
            if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null &&
                                angular.isDefined($scope.ledgerData._id) && $scope.ledgerData._id === ledger._id) {
              $scope.ledgerData.favourite = angular.copy(obj.favourite);
            }
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
  };

  // Set current selected branch details
  $scope.setBranch = function (branch) {
    $scope.filterData.selectedLedger = "";
    if (branch !== null && angular.isDefined(branch._id) && branch._id !== "") {
      $scope.selectedBranch = angular.copy(branch);
      $scope.filterData.selectedBranch = angular.copy(branch._id);
    } else {
      $scope.selectedBranch = {};
    }
  };
  
  $scope.callDateRangePicker = function(minDate, maxDate) {
    let startDate = $filter('date')(new Date(), 'yyyy')+ '-01-01';
    let endDate = $filter('date')(new Date(), 'yyyy')+ '-12-31';
    if (angular.isDefined(minDate) && minDate != '' && minDate.length) {
        startDate = minDate;
    }
    if (angular.isDefined(maxDate) && maxDate != '' && maxDate.length) {
        endDate = maxDate;
    }
    $scope.accountdata.FromDate = minDate;
    $scope.accountdata.ToDate = maxDate;
    
    const curDate = moment(new Date()).format("DD/MM/YYYY");

    $('.rangeDate').daterangepicker({
      locale : {
        format : 'DD-MM-YYYY',
        applyLabel: 'Apply'
      },
      "opens": "center",
      startDate : startDate,
      endDate : endDate,
      maxDate : curDate
    });
    $('.rangeDate').on('apply.daterangepicker',function(ev, picker) {
      const ang_startDate = picker.startDate.format('YYYY-MM-DD');
      const ang_endDate = picker.endDate.format('YYYY-MM-DD');
      $scope.accountdata.FromDate = ang_startDate;
      $scope.accountdata.ToDate = ang_endDate;
      $scope.ledgerTransactionview();
    });
    $scope.ledgerTransactionview();
  }
  
  $scope.changeCurrentSelectedRange = function(range) {
    $scope.filterData.selectedLedger = "";
    $scope.accountdata.accountsTransaction = [];
    const Dateformat = new Date();
    switch (true) {
      case range == 'TODAY':
        const curdt =  $filter("date")(Dateformat, "dd/MM/yyyy");
        $scope.callDateRangePicker(curdt, curdt);
        $scope.accountdata.activeDay = range;
        break;
      case range == '4DAY':
        let tempdt1 = new Date(Dateformat);
        tempdt1 = new Date(tempdt1); // COnvert To date
        tempdt1 = tempdt1.setDate(tempdt1.getDate() - 4); // Les 4
        const startdt1 = $filter('date')(new Date(tempdt1), 'dd/MM/yyyy'); // COnvert
        const enddt1 =  $filter("date")(Dateformat, "dd/MM/yyyy");
        $scope.callDateRangePicker(startdt1, enddt1);
        $scope.accountdata.activeDay = range;
        break;
      case range == '7DAY':
        let tempdt2 = new Date(Dateformat);
        tempdt2 = new Date(tempdt2); // COnvert To date
        tempdt2 = tempdt2.setDate(tempdt2.getDate() - 7); // Les 4
        const startdt2 = $filter('date')(new Date(tempdt2), 'dd/MM/yyyy'); // COnvert
        const enddt2 =  $filter("date")(Dateformat, "dd/MM/yyyy");
        $scope.callDateRangePicker(startdt2, enddt2);
        $scope.accountdata.activeDay = range;
        break;
      case range == 'THIS_MONTH':
        const date1 = new Date();
        const firstDt = new Date(date1.getFullYear(), date1.getMonth(), 1);
        const lastDt = new Date(date1.getFullYear(), date1.getMonth() + 1, 0);
        const startdt3 = $filter('date')(new Date(firstDt),'dd/MM/yyyy');
//        const enddt3 = $filter('date')(new Date(lastDt),'dd/MM/yyyy');
        const enddt3 = $filter('date')(new Date(),'dd/MM/yyyy');
        $scope.callDateRangePicker(startdt3, enddt3);
        $scope.accountdata.activeDay = range;
        break;
      case range == 'LAST_3_MONTH':
        const datedt = new Date();
        const firstDay = new Date(datedt.getFullYear(), datedt.getMonth() - 2, 1);
        const lastDay = new Date(datedt.getFullYear(), datedt.getMonth() + 1, 0);
        const start = $filter('date')(new Date(firstDay),'dd/MM/yyyy');
        const end = $filter('date')(new Date(lastDay),'dd/MM/yyyy');
        $scope.callDateRangePicker(start, end);
        $scope.accountdata.activeDay = range;
        break;
      default:
        let tempdt = new Date(Dateformat);
        tempdt = new Date(tempdt); // COnvert To date
        tempdt = tempdt.setDate(tempdt.getDate() - 7); // Les 4
        const startdt = $filter('date')(new Date(tempdt), 'dd/MM/yyyy'); // COnvert
        const enddt =  $filter("date")(Dateformat, "dd/MM/yyyy");
        $scope.callDateRangePicker(startdt, enddt);
        $scope.accountdata.activeDay = "7DAY";
        break;
    }
    $('.c_report_date_show').hide();
    return true;
  }
  
  // Set current selected ledger details
  $scope.setLedger = function (ledger) {
    $scope.filterData.selectedLedger = "";
    $scope.accountdata.accountsTransaction = [];
    $scope.getaccountCategories();
    if (angular.isDefined(ledger._id) && ledger._id !== "" && angular.isDefined(ledger.type) && ledger.type !== "") {
      if (angular.isDefined($scope.accountdata.branchDetail) && $scope.accountdata.branchDetail.length > 0) {
        let exist = false;
        angular.forEach($scope.accountdata.branchDetail, (branch) => {
          if (angular.isDefined(ledger.division_id) && ledger.division_id === branch._id && !exist) {
            exist = true;
            $scope.setBranch(branch);
            $scope.accountdata.currentPage = "Ledgerdetail";
            $scope.accountdata.tempselectedledger._id = angular.copy(ledger._id);
            $scope.accountdata.tempselectedledger.type = angular.copy(ledger.type);
            if (angular.isDefined(ledger.current_balance) && ledger.current_balance !== null && ledger.current_balance !== "") {
              $scope.accountdata.tempselectedledger.current_balance = angular.copy(ledger.current_balance);
            }
            $timeout(() => {
              $scope.changeCurrentSelectedRange("7DAY");
            }, 500);
          }
        });
      }
    } else {
      $scope.accountdata.currentPage = "Dashboard";
    }
  };
  
  $scope.getaccountCategories = function() {
    AccountService.getaccountCategoryDetails((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
            $scope.accountdata.categories = angular.copy(result.data);
          }
        } else {
          Notification.error(result.message);
        }
      }
      return false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      return false;
    });
  }
  
  $scope.ledgerTransactionview = function(){
    const obj = {};
    obj._id = angular.copy($scope.accountdata.tempselectedledger._id);
    obj.type = angular.copy($scope.accountdata.tempselectedledger.type);
    obj.FromDate = angular.copy($scope.accountdata.FromDate);
    obj.ToDate = angular.copy($scope.accountdata.ToDate);
    
    if ($scope.accountdata.tempselectedledger.type === "INVOICE") {
      $scope.accountdata.sortColumn = "invoice_date";
    } else {
      $scope.accountdata.sortColumn = "transaction_date";
    }
    $scope.accountdata.ledgerGridFillter = "";
    AccountService.getledgerDetails(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data.Categorydetail) && result.data.Categorydetail.length > 0) {
            $scope.accountdata.categories = angular.copy(result.data.Categorydetail);
          }

          if (angular.isDefined(result.data) && angular.isDefined(result.data.Ledgerdetail) &&
                                    angular.isDefined(result.data.Ledgerdetail._id) && result.data.Ledgerdetail._id !== "") {
            
            $scope.filterData.selectedLedger = angular.copy(result.data.Ledgerdetail._id);
            $scope.ledgerData = angular.copy(result.data.Ledgerdetail);
            if (angular.isDefined($scope.accountdata.tempselectedledger.current_balance) && 
                    $scope.accountdata.tempselectedledger.current_balance !== null && 
                    $scope.accountdata.tempselectedledger.current_balance !== "") {
              $scope.ledgerData.current_balance = angular.copy($scope.accountdata.tempselectedledger.current_balance);
            } else {
              $scope.ledgerData.current_balance = angular.copy(result.data.Ledgerdetail.opening_balance);
            }
            if (angular.isDefined(result.data.Transactiondetail) && result.data.Transactiondetail.length > 0) {
              $scope.accountdata.accountsTransaction = angular.copy(result.data.Transactiondetail);
            } else {
              Notification.warning("No Ledger entry is available!");
            }

            $timeout(() => {
              tableInitialize();
            }, 500);
          }
        } else {
          Notification.error(result.message);
        }
      }
      return false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      return false;
    });
  }

  // Set cateory type to transaction entry
  $scope.setCategory = function (category) {
    if (category !== null && angular.isDefined(category._id) && category._id !== "" && angular.isDefined(category.category_name) &&
        category.category_name !== "") {
      $scope.transactionData.category_id = angular.copy(category._id);
      $scope.transactionData.category_name = angular.copy(category.category_name);
    }
  };

  $scope.setTransfer = function (ledger, type) {
    const temp = [];
    let length = 0;

    if (angular.isDefined(ledger._id) && ledger._id !== "" && angular.isDefined(ledger.name) && ledger.name !== "" &&
        (type === "FROM" || type === "TO")) {
      if (type === "FROM") {
        $scope.transactionData.fromledger_id = angular.copy(ledger._id);
        $scope.transactionData.fromledger_name = angular.copy(ledger.name);
        $scope.accountdata.toledgerDetail = [];

        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led._id) && led._id !== ledger._id) {
            temp.push(led);
          }
          length += 1;
        });

        if (length === $scope.accountdata.ledgerDetail.length) {
          $scope.accountdata.toledgerDetail = angular.copy(temp);
          $scope.accountdata.toledger = angular.copy($scope.transactionData.toledger_id);
        }
      } else {
        $scope.transactionData.toledger_id = angular.copy(ledger._id);
        $scope.transactionData.toledger_name = angular.copy(ledger.name);
        $scope.accountdata.fromledgerDetail = [];

        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led._id) && led._id !== ledger._id && led.division_id === $scope.filterData.selectedBranch) {
            temp.push(led);
          }
          length += 1;
        });

        if (length === $scope.accountdata.ledgerDetail.length) {
          $scope.accountdata.fromledgerDetail = temp;
          $scope.accountdata.fromledger = angular.copy($scope.transactionData.fromledger_id);
        }
      }
    }
  };

  // Select Transaction Type menu
  $scope.selectTransaction = function (data) {
    $scope.accountdata.accountEdit = data;
    $scope.resetTransaction();
  };

  // Save Transaction
  $scope.saveTransaction = function (data) {
    const Obj = {};
    if (angular.isDefined(data) && (data === "DEBIT" || data === "CREDIT" || data === "TRANSFER") && $scope.checkValidtransaction(data)) {
      if (data === "DEBIT" || data === "CREDIT") {
        $scope.transactionData.type = "REGULAR";
        $scope.transactionData.division_id = angular.isDefined($scope.selectedBranch._id) ? angular.copy($scope.selectedBranch._id) : "";
        $scope.transactionData.branch_name = angular.isDefined($scope.selectedBranch.name) ? angular.copy($scope.selectedBranch.name) : "";
        $scope.transactionData.ledger_id = angular.isDefined($scope.ledgerData._id) ? angular.copy($scope.ledgerData._id) : "";
        $scope.transactionData.ledger_name = angular.isDefined($scope.ledgerData.name) ? angular.copy($scope.ledgerData.name) : "";
        if (data !== "TRANSFER" && ($scope.transactionData.ledger_id === "" || $scope.transactionData.name === "")) {
          Notification.error("Please select the ledger before save the transaction");
          return false;
        }

        Obj.transactionForm = angular.copy($scope.transactionData);
        $scope.accountdata.eventLoader = true;

        AccountService.saveTransaction(Obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
//                if (angular.isDefined($scope.ledgerData._id) && angular.isDefined(result.data.ledger_id) &&
//                    $scope.ledgerData._id === result.data.ledger_id) {
//                  $scope.accountdata.accountsTransaction.push(angular.copy(result.data));
//                }
                Notification.success(result.message);
                $scope.resetTransaction();
              }
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      } else {
        $scope.transactionData.type = "TRANSFER";
        if (data === "TRANSFER" && ($scope.transactionData.ledger_id === "" || $scope.transactionData.name === "")) {
          Notification.error("Please select the ledger before save the transaction");
          return false;
        }

        const fromledger = {};
        fromledger.ledger_id = $scope.transactionData.fromledger_id;
        fromledger.ledger_name = $scope.transactionData.fromledger_name;
        fromledger.memo = $scope.transactionData.memo;
        fromledger.transaction_amount = $scope.transactionData.transaction_amount;
        fromledger.transaction_date = $scope.transactionData.transaction_date;
        fromledger.transaction_type = "DEBIT";
        fromledger.type = $scope.transactionData.type;
        fromledger.division_id = angular.isDefined($scope.selectedBranch._id) ? angular.copy($scope.selectedBranch._id) : "";
        fromledger.branch_name = angular.isDefined($scope.selectedBranch.name) ? angular.copy($scope.selectedBranch.name) : "";

        if (angular.isDefined($scope.transactionData.cheque_no) && $scope.transactionData.cheque_no !== "") {
          fromledger.cheque_no = $scope.transactionData.cheque_no;
        }

        const toledger = {};
        toledger.ledger_id = $scope.transactionData.toledger_id;
        toledger.ledger_name = $scope.transactionData.toledger_name;
        toledger.memo = $scope.transactionData.memo;
        toledger.transaction_amount = $scope.transactionData.transaction_amount;
        toledger.transaction_date = $scope.transactionData.transaction_date;
        toledger.transaction_type = "CREDIT";
        toledger.type = $scope.transactionData.type;
        toledger.division_id = angular.isDefined($scope.selectedBranch._id) ? angular.copy($scope.selectedBranch._id) : "";
        toledger.branch_name = angular.isDefined($scope.selectedBranch.name) ? angular.copy($scope.selectedBranch.name) : "";

        if (angular.isDefined($scope.transactionData.cheque_no) && $scope.transactionData.cheque_no !== "") {
          toledger.cheque_no = $scope.transactionData.cheque_no;
        }

        Obj.fromledger = angular.copy(fromledger);
        Obj.toledger = angular.copy(toledger);

        $scope.accountdata.eventLoader = true;

        AccountService.saveTransfer(Obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
//                if (angular.isDefined($scope.ledgerData._id) && angular.isDefined(result.data.ledger_id) &&
//                    $scope.ledgerData._id === result.data.ledger_id) {
//                  $scope.accountdata.accountsTransaction.push(angular.copy(result.data));
//                }
                Notification.success(result.message);
                $scope.resetTransaction();
              }
            } else {
              Notification.error(result.message);
            }
          }
          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      }
    }
  };

  // Update transaction details
  $scope.updateTransaction = function (data) {
    if (angular.isDefined(data) && (data === "DEBIT" || data === "CREDIT" || data === "TRANSFER") && $scope.checkValidtransaction(data)) {
      if (data === "DEBIT" || data === "CREDIT") {
        if (data !== "TRANSFER" && ($scope.transactionData.ledger_id === "" || $scope.transactionData.name === "")) {
          Notification.error("Please select the ledger before update the transaction");
          return false;
        }
        const Obj = {};
        Obj.transactionForm = angular.copy($scope.transactionData);
        $scope.accountdata.eventLoader = true;

        AccountService.updateTransaction(Obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
                if (angular.isDefined($scope.ledgerData._id) && angular.isDefined(result.data.ledger_id) &&
                    $scope.ledgerData._id === result.data.ledger_id) {
//                  angular.forEach($scope.accountdata.accountsTransaction, function (trans) {
//                     if (angular.isDefined(trans._id) && trans._id === result.data._id) {
//                         if (angular.isDefined(result.data.category_id)) {
//                           trans.category_id = angular.copy(result.data.category_id);
//                         }
//                         if (angular.isDefined(result.data.category_name)) {
//                           trans.category_name = angular.copy(result.data.category_name);
//                         }
//                         if (angular.isDefined(result.data.cheque_no)) {
//                           trans.cheque_no = angular.copy(result.data.cheque_no);
//                         }
//                         if (angular.isDefined(result.data.ledger_balance)) {
//                           trans.ledger_balance = angular.copy(result.data.ledger_balance);
//                         }
//                         if (angular.isDefined(result.data.ledger_id)) {
//                           trans.ledger_id = angular.copy(result.data.ledger_id);
//                         }
//                         if (angular.isDefined(result.data.ledger_name)) {
//                           trans.ledger_name = angular.copy(result.data.ledger_name);
//                         }
//                         if (angular.isDefined(result.data.memo)) {
//                           trans.memo = angular.copy(result.data.memo);
//                         }
//                         if (angular.isDefined(result.data.payee_name)) {
//                           trans.payee_name = angular.copy(result.data.payee_name);
//                         }
//                         if (angular.isDefined(result.data.transaction_amount)) {
//                           trans.transaction_amount = angular.copy(result.data.transaction_amount);
//                         }
//                         
//                     }
//                  });
                }
                Notification.success(result.message);
                $scope.resetTransaction();
              }
            } else {
              Notification.error(result.message);
            }
          }
          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      } else {
        $scope.transactionData.type = "TRANSFER";
        if (data === "TRANSFER" && ($scope.transactionData.ledger_id === "" || $scope.transactionData.name === "")) {
          Notification.error("Please select the ledger before update the transaction");
          return false;
        }

        const fromledger = {};
        const toledger = {};
        const Obj = {};

        fromledger._id = $scope.transactionData.from;
        fromledger.ledger_id = $scope.transactionData.fromledger_id;
        fromledger.ledger_name = $scope.transactionData.fromledger_name;
        fromledger.memo = $scope.transactionData.memo;
        fromledger.transaction_amount = $scope.transactionData.transaction_amount;
        fromledger.transaction_date = $scope.transactionData.transaction_date;
        if (angular.isDefined($scope.transactionData.cheque_no) && $scope.transactionData.cheque_no !== "") {
          fromledger.cheque_no = $scope.transactionData.cheque_no;
        }

        toledger._id = $scope.transactionData.to;
        toledger.ledger_id = $scope.transactionData.toledger_id;
        toledger.ledger_name = $scope.transactionData.toledger_name;
        toledger.memo = $scope.transactionData.memo;
        toledger.transaction_amount = $scope.transactionData.transaction_amount;
        toledger.transaction_date = $scope.transactionData.transaction_date;
        if (angular.isDefined($scope.transactionData.cheque_no) && $scope.transactionData.cheque_no !== "") {
          toledger.cheque_no = $scope.transactionData.cheque_no;
        }

        Obj.fromledger = angular.copy(fromledger);
        Obj.toledger = angular.copy(toledger);

        $scope.accountdata.eventLoader = true;

        AccountService.updateTransfer(Obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
                if (angular.isDefined($scope.ledgerData._id) && angular.isDefined(result.data.ledger_id) &&
                    $scope.ledgerData._id === result.data.ledger_id) {
//                  $scope.accountdata.accountsTransaction.push(angular.copy(result.data));
                }
                Notification.success(result.message);
                $scope.resetTransaction();
              }
            } else {
              Notification.error(result.message);
            }
          }
          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      }
    }
  };

  // Fetch transaction details to view or edit
  $scope.getTransaction = function (Transaction) {
    if (angular.isUndefined(Transaction)) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isUndefined(Transaction._id) || (angular.isDefined(Transaction._id) && Transaction._id === "")) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isUndefined(Transaction.type) || (angular.isDefined(Transaction.type) && Transaction.type === "")) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }

    if (angular.isDefined(Transaction.category_name) && Transaction.category_name === "Payment for Invoices and Bill" &&
        angular.isUndefined(Transaction.category_id)) {
      if (angular.isDefined(Transaction.payee_id) && Transaction.payee_id !== null && Transaction.payee_id !== "") {
        if ((angular.isDefined(Transaction.bills) && Transaction.bills !== null && Transaction.bills.length > 0) || 
                (angular.isDefined(Transaction.customer_openingbalance) && Transaction.customer_openingbalance !== null && 
                angular.isDefined(Transaction.customer_openingbalance.amount_allocated) && parseFloat(Transaction.customer_openingbalance.amount_allocated)>0)) {
          $scope.accountdata.eventLoader = true;
          $scope.transactionData = {};
          $scope.accountdata.category = "";
          $scope.accountdata.fromledger = "";
          $scope.accountdata.toledger = "";
          $scope.transactionData.transaction_type = angular.copy($scope.accountdata.accountEdit);
          $scope.transactionData.transaction_date = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
          $scope.transactionData.toledger_id = "";
          $scope.transactionData.fromledger_id = "";

          const obj = {};
          if (angular.isDefined(Transaction.bills) && Transaction.bills !== null && Transaction.bills.length > 0) {
            obj.bills = _.pluck(Transaction.bills, "bill_id");
          }
          if (angular.isDefined(Transaction.customer_openingbalance) && Transaction.customer_openingbalance !== null && 
                angular.isDefined(Transaction.customer_openingbalance.amount_allocated) && parseFloat(Transaction.customer_openingbalance.amount_allocated)>0) {
            obj.openingbal = Transaction.customer_openingbalance.balance_id;
          }
          obj.customer_id = Transaction.payee_id;

          $scope.accountdata.pendingBills = [];
          $scope.accountdata.customerPayment = {};
          $scope.accountdata.paymentledgers = [];
          $scope.accountdata.pageLoader = true;

          AccountService.getpaidBills(obj, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
              if (result.success) {
                if (angular.isDefined(result.data) && result.data !== null && ((angular.isDefined(result.data.bills) && 
                        result.data.bills !== null && result.data.bills.length > 0) || (angular.isDefined(result.data.customerbalance) && 
                        result.data.customerbalance !== null && angular.isDefined(result.data.customerbalance._id)))) {
                  $scope.accountdata.customerPayment = angular.copy(Transaction);
                  const trnsamt = parseFloat($scope.accountdata.customerPayment.transaction_amount).toFixed(2);
                  $scope.accountdata.customerPayment.transaction_amount = trnsamt;
                  $scope.accountdata.customerPayment.balance = 0;
                  $scope.accountdata.customerPayment.pendingbills = [];
                  if(angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance) && $scope.accountdata.customerPayment.customer_openingbalance !== null && 
                          angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.balance_id) && angular.isDefined(result.data.customerbalance) && 
                        result.data.customerbalance !== null && angular.isDefined(result.data.customerbalance._id)) {
                    const allocated = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                    const pendingpay = parseFloat(result.data.customerbalance.pending_balance);
                    const pendingallocated = pendingpay + allocated;
                    $scope.accountdata.customerPayment.customer_openingbalance.pending_balance = pendingallocated;
                    $scope.accountdata.customerPayment.customer_openingbalance.balance_due = pendingpay;
                  }
                  angular.forEach($scope.accountdata.ledgerDetail, (ledger) => {
                    if (angular.isDefined(ledger._id) && ledger._id !== "" && angular.isDefined(ledger.type) && ledger.type !== "INVOICE") {
                      const lobj = {};
                      lobj._id = angular.copy(ledger._id);
                      lobj.division_id = angular.copy(ledger.division_id);
                      lobj.name = angular.copy(ledger.name);

                      if (angular.isDefined($scope.accountdata.customerPayment.ledger_id) && $scope.accountdata.customerPayment.ledger_id !== null &&
                                                    $scope.accountdata.customerPayment.ledger_id === ledger._id) {
                        $scope.accountdata.customerPayment.selectedledgers = angular.copy(lobj);
                      }
                      $scope.accountdata.paymentledgers.push(lobj);
                    }
                  });
                  
                  if (angular.isDefined(result.data.bills) && result.data.bills !== null && result.data.bills.length > 0) {
                    formatPendingbills(result.data.bills).then((invoice) => {
                      if (angular.isDefined(invoice) && invoice !== null && $scope.accountdata.customerPayment.pendingbills.length > 0) {
                        formatExistbills($scope.accountdata.customerPayment.bills).then((existInvoice) => {
                          if (angular.isDefined(existInvoice) && existInvoice && $scope.accountdata.customerPayment.pendingbills) {
                            $scope.accountdata.currentPage = "Payment";
                          } else {
                            Notification.error("Something went wrong. Please try again later.");
                          }
                        });
                      }
                    });
                  } else {
                    if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance)) {
                      $scope.accountdata.currentPage = "Payment";
                    } else {
                      Notification.error("Something went wrong. Please try again later.");
                    }
                  }
                } else {
                  Notification.error("Invoice not found");
                }
              } else {
                Notification.error(result.message);
              }
            }

            $scope.accountdata.pageLoader = false;
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
          });
        } else {
          Notification.error("No Bills has been found for this payment");
          return false;
        }
      } else {
        Notification.error("Customer details not found");
        return false;
      }
    } else {
      $scope.accountdata.eventLoader = true;

      $scope.transactionData = {};
      $scope.accountdata.category = "";
      $scope.accountdata.fromledger = "";
      $scope.accountdata.toledger = "";
      $scope.transactionData.transaction_type = angular.copy($scope.accountdata.accountEdit);
      $scope.transactionData.transaction_date = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
      $scope.transactionData.toledger_id = "";
      $scope.transactionData.fromledger_id = "";

      AccountService.getTransaction(Transaction._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (Transaction.type === "TRANSFER" && angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (trans) => {
                if (trans.transaction_type === "DEBIT") {
                  $scope.transactionData.fromledger_id = angular.copy(trans.ledger_id);
                  $scope.transactionData.fromledger_name = angular.copy(trans.ledger_name);
                  $scope.accountdata.fromledger = angular.copy(trans.ledger_id);
                  $scope.transactionData.from = angular.copy(trans._id);
                }
                if (trans.transaction_type === "CREDIT") {
                  $scope.transactionData.toledger_id = angular.copy(trans.ledger_id);
                  $scope.transactionData.toledger_name = angular.copy(trans.ledger_name);
                  $scope.accountdata.toledger = angular.copy(trans.ledger_id);
                  $scope.transactionData.to = angular.copy(trans._id);
                }
                const transData = ["memo", "transaction_amount", "transaction_date", "type"];

                // loop through all possible names
                for (let i = 0; i < transData.length; i += 1) {
                  if (validateField.checkDefined(trans, transData[i]) && validateField.checkRmpty(trans, transData[i])) {
                    $scope.transactionData[transData[i]] = trans[transData[i]];
                  }
                }
              });
              $scope.accountdata.accountEdit = Transaction.type;
            } else if (Transaction.type !== "TRANSFER" && angular.isDefined(result.data) && angular.isDefined(result.data._id) &&
                result.data._id !== "") {
              $scope.accountdata.accountEdit = angular.copy(result.data.transaction_type);
              $scope.accountdata.category = angular.copy(result.data.category_id);
              $scope.transactionData = angular.copy(result.data);
            }
          } else {
            Notification.error(result.message);
          }
        }

        $scope.accountdata.eventLoader = false;
        return false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountdata.eventLoader = false;
        return false;
      });
    }
  };
  
   // Fetch Debit Note transaction details to view or edit
  function getdebitTransaction (Transaction) {
    if (angular.isUndefined(Transaction)) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isUndefined(Transaction._id) || (angular.isDefined(Transaction._id) && Transaction._id === "")) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isUndefined(Transaction.type) || (angular.isDefined(Transaction.type) && Transaction.type === "")) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isDefined(Transaction.payee_id) && Transaction.payee_id !== null && Transaction.payee_id !== "") {
      if (angular.isDefined(Transaction.bills) && Transaction.bills !== null && Transaction.bills.length > 0) {
        $scope.accountdata.eventLoader = true;
        $scope.transactionData = {};
        $scope.accountdata.category = "";
        $scope.accountdata.fromledger = "";
        $scope.accountdata.toledger = "";
        $scope.transactionData.transaction_type = angular.copy($scope.accountdata.accountEdit);
        $scope.transactionData.transaction_date = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
        $scope.transactionData.toledger_id = "";
        $scope.transactionData.fromledger_id = "";

        const obj = {};
        if (angular.isDefined(Transaction.bills) && Transaction.bills !== null && Transaction.bills.length > 0) {
          obj.bills = _.pluck(Transaction.bills, "bill_id");
        }
        
        obj.customer_id = Transaction.payee_id;

        $scope.accountdata.pendingBills = [];
        $scope.accountdata.debitForm = {};
        $scope.accountdata.pageLoader = true;

        AccountService.getpaidBills(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.bills) && 
                      result.data.bills !== null && result.data.bills.length > 0) {
                $scope.accountdata.debitForm = angular.copy(Transaction);
                const trnsamt = parseFloat($scope.accountdata.debitForm.transaction_amount).toFixed(2);
                $scope.accountdata.debitForm.transaction_amount = trnsamt;
                $scope.accountdata.debitForm.balance = 0;
                $scope.accountdata.debitForm.pendingbills = [];
                $scope.accountdata.currentPage = "DebitLedgerdetail";
                formatPendingbills(result.data.bills).then((invoice) => {
                  if (angular.isDefined(invoice) && invoice !== null && $scope.accountdata.debitForm.pendingbills.length > 0) {
                    formatdebitExistbills($scope.accountdata.debitForm.bills).then((existInvoice) => {
                      if (angular.isDefined(existInvoice) && existInvoice && $scope.accountdata.debitForm.pendingbills) {
                        $scope.accountdata.currentPage = "DebitLedgerdetail";
                      } else {
                        Notification.error("Something went wrong. Please try again later.");
                      }
                    });
                  }
                });
              } else {
                Notification.error("Invoice not found");
              }
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
        });
      } else {
        Notification.error("No Bills has been found for this debit note entry");
        return false;
      }
    } else {
      Notification.error("Customer details not found");
      return false;
    }    
  }
  
   // Fetch Credit Note transaction details to view or edit
  function getcreditTransaction (Transaction) {
    if (angular.isUndefined(Transaction)) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isUndefined(Transaction._id) || (angular.isDefined(Transaction._id) && Transaction._id === "")) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isUndefined(Transaction.type) || (angular.isDefined(Transaction.type) && Transaction.type === "")) {
      Notification.error("Oops! Something happened please try again later!.");
      return false;
    }
    if (angular.isDefined(Transaction.payee_id) && Transaction.payee_id !== null && Transaction.payee_id !== "") {
//      if (angular.isDefined(Transaction.bills) && Transaction.bills !== null && Transaction.bills.length > 0) {
        $scope.accountdata.eventLoader = true;
        $scope.transactionData = {};
        $scope.accountdata.category = "";
        $scope.accountdata.fromledger = "";
        $scope.accountdata.toledger = "";
        $scope.transactionData.transaction_type = angular.copy($scope.accountdata.accountEdit);
        $scope.transactionData.transaction_date = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
        $scope.transactionData.toledger_id = "";
        $scope.transactionData.fromledger_id = "";

        const obj = {};
//        if (angular.isDefined(Transaction.bills) && Transaction.bills !== null && Transaction.bills.length > 0) {
//          obj.bills = _.pluck(Transaction.bills, "bill_id");
//        }
        
        obj._id = Transaction._id;

        $scope.accountdata.creditForm = {};
        $scope.accountdata.pageLoader = true;

        AccountService.getcreditnote(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
                $scope.accountdata.creditForm = angular.copy(result.data);
                $scope.accountdata.currentPage = "CreditLedgerdetail";
              } else {
                Notification.error("Invoice not found");
              }
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
        });
//      } else {
//        Notification.error("No Bills has been found for this debit note entry");
//        return false;
//      }
    } else {
      Notification.error("Customer details not found");
      return false;
    }    
  }
  
  $scope.getdebitcreditnotetrans = function (trans) {
    if (angular.isDefined(trans.type) && trans.type !== null && trans.type !== "" && (trans.type === "CREDIT NOTE" || trans.type === "DEBIT NOTE")) {
      if (trans.type === "CREDIT NOTE") {
          getcreditTransaction(trans);
      } else {
          getdebitTransaction(trans);
      }
    }
  }
  
  // Validate Transaction Details
  $scope.checkValidtransaction = function (data) {
    if (data === "DEBIT" || data === "CREDIT") {
      if (angular.isUndefined($scope.transactionData.payee_name) || (angular.isDefined($scope.transactionData.payee_name) &&
                    $scope.transactionData.payee_name === "")) {
        Notification.error("Please enter details for Pay to field to proceed further");
        return false;
      } else if (angular.isUndefined($scope.transactionData.category_id) || angular.isUndefined($scope.transactionData.category_name) ||
                    (angular.isDefined($scope.transactionData.category_id) && $scope.transactionData.category_id === "") ||
                    (angular.isDefined($scope.transactionData.category_name) && $scope.transactionData.category_name === "")) {
        Notification.error("Please select category");
        return false;
      } else if (angular.isUndefined($scope.transactionData.memo) || (angular.isDefined($scope.transactionData.memo) &&
        $scope.transactionData.memo === "")) {
        Notification.error("Please enter memo description");
        return false;
      } else if (angular.isUndefined($scope.transactionData.transaction_date) || (angular.isDefined($scope.transactionData.transaction_date) &&
                    $scope.transactionData.transaction_date === "")) {
        Notification.error("Please select the transaciom date");
        return false;
      } else if (angular.isUndefined($scope.transactionData.transaction_amount) || (angular.isDefined($scope.transactionData.transaction_amount) &&
                    $scope.transactionData.transaction_amount === "")) {
        Notification.error("Please enter the transaction amount");
        return false;
      } else if (angular.isDefined($scope.transactionData.transaction_amount) && parseFloat($scope.transactionData.transaction_amount) <= 0) {
        Notification.error("Your transaction amount must be greater than zero.");
        return false;
      }
      return true;
    } else if (data === "TRANSFER") {
      if (angular.isUndefined($scope.transactionData.fromledger_id) || angular.isUndefined($scope.transactionData.fromledger_name) ||
                    (angular.isDefined($scope.transactionData.fromledger_id) && $scope.transactionData.fromledger_id === "") ||
                    (angular.isDefined($scope.transactionData.fromledger_name) && $scope.transactionData.fromledger_name === "")) {
        Notification.error("Please select the ledger from which the amount is going to transfer.");
        return false;
      } else if (angular.isUndefined($scope.transactionData.toledger_id) || angular.isUndefined($scope.transactionData.toledger_name) ||
                    (angular.isDefined($scope.transactionData.toledger_id) && $scope.transactionData.toledger_id === "") ||
                    (angular.isDefined($scope.transactionData.toledger_name) && $scope.transactionData.fromledger_name === "")) {
        Notification.error("Please select the ledger from which the transfered amount is going to received.");
        return false;
      } else if (angular.isUndefined($scope.transactionData.memo) || (angular.isDefined($scope.transactionData.memo) &&
        $scope.transactionData.memo === "")) {
        Notification.error("Please enter memo description");
        return false;
      } else if (angular.isUndefined($scope.transactionData.transaction_date) || (angular.isDefined($scope.transactionData.transaction_date) &&
                    $scope.transactionData.transaction_date === "")) {
        Notification.error("Please select the transaciom date");
        return false;
      } else if (angular.isUndefined($scope.transactionData.transaction_amount) || (angular.isDefined($scope.transactionData.transaction_amount) &&
                    $scope.transactionData.transaction_amount === "")) {
        Notification.error("Please enter the transaction amount");
        return false;
      } else if (angular.isDefined($scope.transactionData.transaction_amount) && parseFloat($scope.transactionData.transaction_amount) <= 0) {
        Notification.error("Your transaction amount must be greater than zero.");
        return false;
      }
      return true;
    }
  };

  // Delete Transaction
  $scope.deleteTransaction = function (trx) {
    const indx = $scope.accountdata.accountsTransaction.indexOf(trx);
    if (angular.isDefined(trx) && angular.isDefined(trx.type) && angular.isDefined(trx._id) && trx._id !== "" && indx > -1) {
      $scope.accountdata.eventLoader = true;
      if (trx.type === "TRANSFER") {
        AccountService.deleteTransfer(trx, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
                angular.forEach($scope.accountdata.accountsTransaction, (trans, index) => {
                  if (angular.isDefined(trans._id) && trans._id === result.data._id) {
                    $scope.accountdata.accountsTransaction.splice(index, 1);
                  }
                });
                Notification.success(result.message);
              }
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      } else if (angular.isDefined(trx.category_name) && trx.category_name === "Payment for Invoices and Bill" &&
        angular.isUndefined(trx.category_id)) {
        AccountService.deletePayment(trx, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
                angular.forEach($scope.accountdata.accountsTransaction, (trans, index) => {
                  if (angular.isDefined(trans._id) && trans._id === result.data._id) {
                    $scope.accountdata.accountsTransaction.splice(index, 1);
                  }
                });
                Notification.success(result.message);
              }
            } else {
              Notification.error(result.message);
            }
          }
          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      } else {
        AccountService.deleteTransaction(trx, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
                angular.forEach($scope.accountdata.accountsTransaction, (trans, index) => {
                  if (angular.isDefined(trans._id) && trans._id === result.data._id) {
                    $scope.accountdata.accountsTransaction.splice(index, 1);
                  }
                });
                Notification.success(result.message);
              }
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      }
    }
  };
  
  // Delete Debit Note
  $scope.deleteDebitnote = function (trx) {
    const indx = $scope.accountdata.accountsTransaction.indexOf(trx);
    if (angular.isDefined(trx) && angular.isDefined(trx.type) && angular.isDefined(trx._id) && trx._id !== "" && indx > -1) {
      AccountService.deleteDebitnote(trx, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
              angular.forEach($scope.accountdata.accountsTransaction, (trans, index) => {
                if (angular.isDefined(trans._id) && trans._id === result.data._id) {
                  $scope.accountdata.accountsTransaction.splice(index, 1);
                }
              });
              Notification.success(result.message);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.accountdata.eventLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountdata.eventLoader = false;
      });
    }
  }
  
  // Delete Invoice
  $scope.deleteInvoicetrans = function (trx) {
    if (angular.isDefined(trx) && angular.isDefined(trx._id) && trx._id !== "") {
      $scope.accountdata.eventLoader = true;

      AccountService.deleteInvoicetrans(trx, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
              angular.forEach($scope.accountdata.accountsTransaction, (trans, index) => {
                if (angular.isDefined(trans._id) && trans._id === result.data._id) {
                  $scope.accountdata.accountsTransaction.splice(index, 1);
                }
              });
              Notification.success(result.message);
            }
          } else {
            Notification.error(result.message);
          }
        }

        $scope.accountdata.eventLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountdata.eventLoader = false;
      });
    }
  };

  // Add new ledger
  $scope.addNewaccount = function () {
    $scope.accountdata.currentPage = "Ledgeradd";
    $scope.accountdata.formsubmission = false;
    $scope.ledgerData = {};
  };

  // Edit existing ledger
  $scope.editExistingaccount = function () {
    if (angular.isDefined($scope.ledgerData._id) && $scope.ledgerData._id !== "") {
      $scope.accountdata.currentPage = "Ledgeredit";
      $scope.accountdata.formsubmission = false;
    } else {
      Notification.error("Oops! Ledger not found, Please try again later!.");
      return false;
    }
  };

  // Create / Update Ledger Details
  $scope.updateLedgerDetails = function (ledgerDetail) {
    if (angular.isUndefined($scope.filterData.selectedBranch) || $scope.filterData.selectedBranch === "") {
      Notification.error("Select the branch to which you are going to create ledger");
      return false;
    }

    if (ledgerDetail) {
      $scope.ledgerData.division_id = angular.copy($scope.filterData.selectedBranch);
      const obj = {};
      obj.ledgerForm = angular.copy($scope.ledgerData);

      if (angular.isDefined($scope.ledgerData) && angular.isDefined($scope.ledgerData._id) && $scope.ledgerData._id !== "") {
        $scope.accountdata.eventLoader = true;

        AccountService.updateledger(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              $scope.accountdata.currentPage = "Dashboard";
              $scope.setLedger(angular.copy($scope.ledgerData));
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      } else {
        $scope.accountdata.eventLoader = true;

        AccountService.createledger(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              $scope.accountdata.currentPage = "Dashboard";
              $scope.initializeData();
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.accountdata.eventLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.eventLoader = false;
        });
      }
    }
  };

  $scope.closeLedgerview = function () {
    $scope.accountdata.currentPage = "Dashboard";
    $scope.accountdata.formsubmission = false;
    $scope.ledgerData = {};
  };

  $scope.newInvoice = function () {
    $scope.accountdata.invoiceForm = {};
    $scope.accountdata.invoiceItems = {};
    $scope.accountdata.invoiceForm.items = [];
    $scope.accountdata.spares = [];
    $scope.accountdata.taxes = [];
    $scope.accountdata.Statelistdetails = [];
    $scope.accountdata.Gsttreatmentdetails = [];
    $scope.accountdata.Processdetails = [];
    $scope.accountdata.Processtax = [];
    $scope.accountdata.currentitems = {};
    $scope.accountdata.itemlist = {};
    $scope.accountdata.Joblist = [];
    $scope.accountdata.selectedIndex = -1;
    $scope.accountdata.showadditems = false;

    if (angular.isDefined($scope.accountdata.jobselected)) {
      $scope.accountdata.jobselected = undefined;
    }

    $scope.accountdata.pageLoader = true;

    InvoiceService.getInvoicedetails($scope.ledgerData, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null) {
            if (angular.isDefined(result.data.Invoice) && angular.isDefined(result.data.Invoice.invoice) &&
                angular.isDefined(result.data.Invoice.invoice.prefix) && angular.isDefined(result.data.Invoice.invoice.serial_no) &&
                result.data.Invoice.invoice.prefix !== "" && result.data.Invoice.invoice.serial_no !== "") {
              if (angular.isDefined(result.data.Invoiceledger) && angular.isDefined(result.data.Invoiceledger._id) &&
                result.data.Invoiceledger._id !== "") {
                $scope.accountdata.invoiceForm.division_id = angular.copy($scope.filterData.selectedBranch);
                $scope.accountdata.invoiceForm.ledger_id = angular.copy(result.data.Invoiceledger._id);
                $scope.accountdata.invoiceForm.serial_no = angular.copy(result.data.Invoice.invoice.serial_no);
                $scope.accountdata.invoiceForm.prefix = angular.copy(result.data.Invoice.invoice.prefix);
                $scope.accountdata.invoiceForm.invoice_no = `${$scope.accountdata.invoiceForm.prefix}_${$scope.accountdata.invoiceForm.serial_no}`;

                $scope.accountdata.currentPage = "InvoiceLedgerdetail";
              } else {
                Notification.error("Invoice Receivable ledger not found");
              }
            }

            $scope.accountdata.Statelistdetails = (angular.isDefined(result.data.Statelistdetails) &&
            result.data.Statelistdetails !== null && result.data.Statelistdetails.length > 0) ?
              angular.copy(result.data.Statelistdetails) : [];

            $scope.accountdata.Gsttreatmentdetails = (angular.isDefined(result.data.Gsttreatmentdetails) &&
            result.data.Gsttreatmentdetails !== null && result.data.Gsttreatmentdetails.length > 0) ?
              angular.copy(result.data.Gsttreatmentdetails) : [];

            if (angular.isDefined(result.data.Process) && result.data.Process !== null && result.data.Process !== "" &&
                result.data.Process.length > 0) {
              angular.forEach(result.data.Process, (process) => {
                if (process !== null && angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                  angular.forEach(process.measurement, (units) => {
                    const objs = {};
                    objs.division_id = process.division_id;
                    objs.process_id = process._id;
                    if (angular.isDefined(process.invoice_option)) {
                      objs.invoice_option = process.invoice_option;
                    }
                    objs.cost = units.cost;
                    objs.measurement_id = units.measurement_id;
                    objs.qty = units.qty;
                    $scope.accountdata.Processdetails.push(objs);
                  });
                  const tx = {};
                  tx.process_id = process._id;
                  if (angular.isDefined(process.invoice_option)) {
                    tx.invoice_option = process.invoice_option;
                  }
                  tx.division_id = process.division_id;
                  tx.inter_tax_class = process.inter_tax_class;
                  tx.tax_class = process.tax_class;
                  $scope.accountdata.Processtax.push(tx);
                }
              });
            }

            if (angular.isDefined(result.data.Tax) && result.data.Tax !== null && result.data.Tax !== "" && result.data.Tax.length > 0) {
              angular.forEach(result.data.Tax, (taxes) => {
                if (angular.isDefined(taxes._id) && angular.isDefined(taxes.tax_name) && angular.isDefined(taxes.tax_percentage) &&
                    taxes.tax_percentage > 0) {
                  const spobj = {};
                  spobj._id = taxes._id;
                  spobj.tax_name = taxes.tax_name;
                  spobj.display_name = `${parseFloat(taxes.tax_percentage)}% ${taxes.tax_name}`;
                  spobj.tax_percentage = parseFloat(taxes.tax_percentage);
                  $scope.accountdata.taxes.push(spobj);
                }
              });
            }
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.accountdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.accountdata.pageLoader = false;
    });
  };
  
  $scope.newDebit = function () {
    $scope.accountdata.debitForm = {};
    $scope.accountdata.pageLoader = true;

    AccountService.getDebitprefix($scope.ledgerData, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null) {
            if (angular.isDefined(result.data.debit_note) && angular.isDefined(result.data.debit_note.prefix) && 
                    angular.isDefined(result.data.debit_note.serial_no) && result.data.debit_note.prefix !== "" && result.data.debit_note.serial_no !== "") {
              
              $scope.accountdata.debitForm.ledger_id = angular.copy($scope.filterData.selectedLedger);
              $scope.accountdata.debitForm.ledger_name = angular.copy($scope.ledgerData.name);
              $scope.accountdata.debitForm.serial_no = `${result.data.debit_note.prefix}_${result.data.debit_note.serial_no}`;
              
              if (angular.isDefined($scope.selectedBranch) && angular.isDefined($scope.selectedBranch._id) && $scope.selectedBranch._id !== "") {
                $scope.accountdata.debitForm.division_id = angular.copy($scope.selectedBranch._id);
                $scope.accountdata.debitForm.branch_name = angular.copy($scope.selectedBranch.name);
              }
              
              $scope.accountdata.debitForm.type = "DEBIT NOTE";
              $scope.accountdata.debitForm.category_name = "Debit Entry";
              $scope.accountdata.debitForm.transaction_type = "CREDIT";
              $scope.accountdata.debitForm.transaction_date = new Date();
              $scope.accountdata.debitForm.balance = 0;
    
              $scope.accountdata.currentPage = "DebitLedgerdetail";
            }
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.accountdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.accountdata.pageLoader = false;
    });
  };
  
  $scope.newCredit = function () {
    $scope.accountdata.creditForm = {};
    $scope.accountdata.pageLoader = true;

    AccountService.getCreditprefix($scope.ledgerData, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null) {
            if (angular.isDefined(result.data.credit_note) && angular.isDefined(result.data.credit_note.prefix) && 
                    angular.isDefined(result.data.credit_note.serial_no) && result.data.credit_note.prefix !== "" && result.data.credit_note.serial_no !== "") {
              
              $scope.accountdata.creditForm.ledger_id = angular.copy($scope.filterData.selectedLedger);
              $scope.accountdata.creditForm.ledger_name = angular.copy($scope.ledgerData.name);
              $scope.accountdata.creditForm.serial_no = `${result.data.credit_note.prefix}_${result.data.credit_note.serial_no}`;
              
              if (angular.isDefined($scope.selectedBranch) && angular.isDefined($scope.selectedBranch._id) && $scope.selectedBranch._id !== "") {
                $scope.accountdata.creditForm.division_id = angular.copy($scope.selectedBranch._id);
                $scope.accountdata.creditForm.branch_name = angular.copy($scope.selectedBranch.name);
              }
              
              $scope.accountdata.creditForm.type = "CREDIT NOTE";
              $scope.accountdata.creditForm.user_type = "CUSTOMER";
              $scope.accountdata.creditForm.category_name = "Credit Entry";
              $scope.accountdata.creditForm.transaction_type = "CREDIT";
              $scope.accountdata.creditForm.transaction_date = new Date();
              $scope.accountdata.creditForm.balance = 0;
    
              $scope.accountdata.currentPage = "CreditLedgerdetail";
            }
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.accountdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.accountdata.pageLoader = false;
    });
  };

  $scope.addItems = function (items) {
    $scope.accountdata.currentitems = {};
    if (angular.isDefined(items) && angular.isDefined(items._id) && items._id !== null && items._id !== "" &&
        angular.isDefined(items.price) && items.price !== "" && parseFloat(items.price) > 0 && angular.isDefined(items.type) &&
        items.type !== "" && items.type !== null) {
      angular.forEach($scope.accountdata.taxes, (taxes) => {
        if (angular.isDefined(taxes._id) && angular.isDefined(taxes.category_id) && angular.isDefined(items.subcategory_id) &&
            taxes.category_id === items.subcategory_id) {
          $scope.accountdata.currentitems = angular.copy(items);
          $scope.accountdata.currentitems.unit = 1;
          $scope.accountdata.currentitems.total = $scope.accountdata.currentitems.price * $scope.accountdata.currentitems.unit;
          $scope.accountdata.currentitems.status = "added";
          $scope.accountdata.currentitems.tax_percentage = taxes.tax_percentage;
        }
      });
    }
  };

  $scope.loadTags = function ($query) {
    return $scope.accountdata.makeUpTaxClass.filter((tax) => {
      return tax.display_name.toLowerCase().indexOf($query.toLowerCase()) !== -1;
    });
  };

  $scope.saveItems = function () {
    if (angular.isDefined($scope.accountdata.currentitems) && angular.isDefined($scope.accountdata.currentitems._id) &&
        $scope.accountdata.currentitems._id !== null && $scope.accountdata.currentitems._id !== "" &&
        angular.isDefined($scope.accountdata.currentitems.price) && $scope.accountdata.currentitems.price !== "" &&
        parseFloat($scope.accountdata.currentitems.price) > 0 && angular.isDefined($scope.accountdata.currentitems.unit) &&
        $scope.accountdata.currentitems.unit !== "" && parseInt($scope.accountdata.currentitems.unit) > 0 &&
        parseInt($scope.accountdata.currentitems.unit) > 0 && angular.isDefined($scope.accountdata.currentitems.from) &&
        $scope.accountdata.currentitems.from === "invoice") {
      $scope.calculateInvoicetotal("addItem", -1);
    }
  };

  $scope.updatenewitem = function () {
    if (angular.isDefined($scope.accountdata.currentitems) && angular.isDefined($scope.accountdata.currentitems._id) &&
        $scope.accountdata.currentitems._id !== null && $scope.accountdata.currentitems._id !== "" &&
        angular.isDefined($scope.accountdata.currentitems.price) && $scope.accountdata.currentitems.price !== "" &&
        parseFloat($scope.accountdata.currentitems.price) > 0 && angular.isDefined($scope.accountdata.currentitems.unit) &&
        $scope.accountdata.currentitems.unit !== "" && parseInt($scope.accountdata.currentitems.unit) > 0 &&
        parseInt($scope.accountdata.currentitems.unit) > 0) {
      $scope.accountdata.currentitems.total = $scope.accountdata.currentitems.price * $scope.accountdata.currentitems.unit;
    } else {
      $scope.accountdata.currentitems.total = 0;
    }
  };

  $scope.calculateInvoicetotal = function (type, indexval) {
    if (type === "addItem") {
      if (angular.isDefined($scope.accountdata.currentitems) && angular.isDefined($scope.accountdata.currentitems._id) &&
        $scope.accountdata.currentitems._id !== null && $scope.accountdata.currentitems._id !== "" &&
        angular.isDefined($scope.accountdata.currentitems.price) && $scope.accountdata.currentitems.price !== "" &&
        parseFloat($scope.accountdata.currentitems.price) > 0 && angular.isDefined($scope.accountdata.currentitems.unit) &&
        $scope.accountdata.currentitems.unit !== "" && parseInt($scope.accountdata.currentitems.unit) > 0 &&
        parseInt($scope.accountdata.currentitems.unit) > 0 && angular.isDefined($scope.accountdata.currentitems.from) &&
        $scope.accountdata.currentitems.from === "invoice") {
        if (angular.isDefined($scope.accountdata.currentitems.tax_percentage) && $scope.accountdata.currentitems.tax_percentage !== null &&
            $scope.accountdata.currentitems.tax_percentage !== "" && parseFloat($scope.accountdata.currentitems.tax_percentage) > 0 &&
            angular.isDefined($scope.accountdata.currentitems.total) && $scope.accountdata.currentitems.total !== null &&
            $scope.accountdata.currentitems.total !== "" && parseFloat($scope.accountdata.currentitems.total) > 0 &&
            angular.isDefined($scope.accountdata.currentitems.type) && $scope.accountdata.currentitems.type === "spare") {
          const percentage = (parseFloat($scope.accountdata.currentitems.tax_percentage) / 100) + 1;
          const tax = parseFloat($scope.accountdata.currentitems.total) / parseFloat(percentage);
          const saltax = parseFloat($scope.accountdata.currentitems.total) - parseFloat(tax);

          $scope.accountdata.currentitems.original_cost = parseFloat(tax);
          if (angular.isDefined($scope.accountdata.invoiceForm.salestax_total) && $scope.accountdata.invoiceForm.salestax_total !== "" &&
                            $scope.accountdata.invoiceForm.salestax_total !== null && parseFloat($scope.accountdata.invoiceForm.salestax_total)) {
            $scope.accountdata.invoiceForm.salestax_total = parseFloat($scope.accountdata.invoiceForm.salestax_total) + parseFloat(saltax);
          } else {
            $scope.accountdata.invoiceForm.salestax_total = parseFloat(saltax);
          }
          $scope.accountdata.invoiceForm.salestax_total = parseFloat($scope.accountdata.invoiceForm.salestax_total).toFixed(2);
        }
        $scope.accountdata.invoiceForm.items.push(angular.copy($scope.accountdata.currentitems));
        $scope.getInvoicecalc();
        $scope.accountdata.currentitems = {};
        $scope.accountdata.itemlist = {};
      }
    }
    if (type === "removeItem" && indexval > -1) {
      angular.forEach($scope.accountdata.invoiceForm.items, (items, ind) => {
        if (ind === indexval) {
          if (items.type === "spare") {
            const percentage = (parseFloat($scope.accountdata.invoiceForm.tax_percentage) / 100) + 1;
            const tax = parseFloat(items.total) / parseFloat(percentage);
            const saltax = parseFloat(items.total) - parseFloat(tax);
            $scope.accountdata.invoiceForm.salestax_total = parseFloat($scope.accountdata.invoiceForm.salestax_total) - parseFloat(saltax);
            $scope.accountdata.invoiceForm.salestax_total = parseFloat($scope.accountdata.invoiceForm.salestax_total).toFixed(2);
          }
        }
        if (ind === $scope.accountdata.invoiceForm.items.length - 1) {
          $scope.accountdata.invoiceForm.items.splice(indexval, 1);
          $scope.getInvoicecalc();
        }
      });
    }
  };

  $scope.clearItems = function () {
    $scope.accountdata.currentitems = {};
    $scope.accountdata.itemlist = {};
  };

  $scope.getInvoicecalc = function () {
    let subtotal = 0;
    if (angular.isDefined($scope.accountdata.invoiceForm.items) && $scope.accountdata.invoiceForm.items !== null &&
        $scope.accountdata.invoiceForm.items !== "" && $scope.accountdata.invoiceForm.items.length > 0) {
      angular.forEach($scope.accountdata.invoiceForm.items, (items, ind) => {
        if (angular.isDefined(items.original_cost) && items.original_cost !== null && items.original_cost !== "" &&
        parseFloat(items.original_cost) > 0) {
          subtotal = parseFloat(subtotal) + parseFloat(items.total);
        }

        if (ind === $scope.accountdata.invoiceForm.items.length - 1) {
          $scope.accountdata.invoiceForm.subtotal = parseFloat(subtotal).toFixed(2);
          const roundtotal = Math.round(subtotal);
          const rounddiff = parseFloat(roundtotal) - parseFloat($scope.accountdata.invoiceForm.subtotal);
          $scope.accountdata.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

          $scope.accountdata.invoiceForm.total = parseFloat(roundtotal).toFixed(2);
        }
      });
    } else {
      $scope.accountdata.invoiceForm.subtotal = 0;
      $scope.accountdata.invoiceForm.roundoff = "0.00";
      $scope.accountdata.invoiceForm.total = 0;
    }
  };

  $scope.removeItems = function (items) {
    if (angular.isUndefined($scope.accountdata.invoiceForm._id) || $scope.accountdata.invoiceForm._id !== null ||
        $scope.accountdata.invoiceForm._id !== "") {
      const index = $scope.accountdata.invoiceForm.items.indexOf(items);
      if (index > -1) {
        $scope.calculateInvoicetotal("removeItem", index);
      }
    }
  };

  $scope.getInvoice = function (invoice) {
    $scope.accountdata.invoiceItems = {};
    $scope.accountdata.taxes = [];
    $scope.accountdata.Processtax = [];
    $scope.accountdata.Processdetails = [];
    $scope.accountdata.prevOrder = [];
    $scope.accountdata.jobselected = [];
    $scope.accountdata.regenerate = false;
    $scope.accountdata.selectedIndex = -1;
    $scope.accountdata.showadditems = false;
    
    if (angular.isDefined(invoice) && angular.isDefined(invoice._id) && invoice._id !== null && invoice._id !== "") {
      $scope.accountdata.invoiceForm = {};
      $scope.accountdata.pageLoader = true;
      $scope.accountdata.Joblist = [];

      InvoiceService.getInvoices(invoice, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data && result.data !== null)) {
              if (angular.isDefined(result.data.Invoice) && angular.isDefined(result.data.Invoice._id) &&
                result.data.Invoice._id !== null && result.data.Invoice._id !== "") {
                $scope.accountdata.invoiceForm = angular.copy(result.data.Invoice);

                if (angular.isDefined($scope.accountdata.invoiceForm.items) && $scope.accountdata.invoiceForm.items !== null &&
                    $scope.accountdata.invoiceForm.items.length > 0) {
                  angular.forEach($scope.accountdata.invoiceForm.items, (ord) => {
                    if (angular.isDefined(ord.order_id) && angular.isDefined(ord.order_no)) {
                      if (!_.any($scope.accountdata.invoiceForm.items, _.matches({_id: ord.order_id}))) {
                        const prv = {};
                        prv._id = angular.copy(ord.order_id);
                        prv.status = "Invoice and Delivery";
                        prv.original_status = "Invoice and Delivery";

                        $scope.accountdata.prevOrder.push(angular.copy(prv));
                        
                        if (!_.contains($scope.accountdata.jobselected, ord.order_id)) {
                          $scope.accountdata.jobselected.push(angular.copy(ord.order_id));
                        }
                        
                        const obj = {};
                        obj._id = angular.copy(ord.order_id);
                        obj.order_no = angular.copy(ord.order_no);
                        obj.order_date = angular.copy(ord.order_date);
                        obj.order_reference_no = angular.copy(ord.order_reference_no);
                        obj.followupPerson = angular.isDefined(ord.followupPerson) ? angular.copy(ord.followupPerson) : {};
                        obj.contactperson = angular.copy(ord.contactperson);
                        obj.customer_dc_no = angular.copy(ord.customer_dc_no);
                        obj.customer_dc_date = angular.copy(ord.customer_dc_date);
                        obj.dyeing = angular.copy(ord.dyeing);
                        obj.dyeing_dc_no = angular.copy(ord.dyeing_dc_no);
                        obj.dyeing_dc_date = angular.copy(ord.dyeing_dc_date);

                        $scope.accountdata.Joblist.push(angular.copy(obj));
                      }
                    }
                  });
                }

                $scope.accountdata.currentPage = "InvoiceLedgerdetail";
                if (angular.isDefined(result.data.Process) && result.data.Process !== null && result.data.Process !== "" &&
                    result.data.Process.length > 0) {
                  angular.forEach(result.data.Process, (process) => {
                    if (process !== null && angular.isDefined(process.measurement) && process.measurement !== null &&
                        process.measurement.length > 0) {
                      angular.forEach(process.measurement, (units) => {
                        const objs = {};
                        objs.division_id = process.division_id;
                        objs.process_id = process._id;
                        if (angular.isDefined(process.invoice_option)) {
                          objs.invoice_option = process.invoice_option;
                        }
                        objs.cost = units.cost;
                        objs.measurement_id = units.measurement_id;
                        objs.qty = units.qty;
                        $scope.accountdata.Processdetails.push(objs);
                      });
                      const tx = {};
                      tx.process_id = process._id;
                      if (angular.isDefined(process.invoice_option)) {
                        tx.invoice_option = process.invoice_option;
                      }
                      tx.division_id = process.division_id;
                      tx.inter_tax_class = process.inter_tax_class;
                      tx.tax_class = process.tax_class;
                      $scope.accountdata.Processtax.push(tx);
                    }
                  });
                }

                $scope.accountdata.Statelistdetails = (angular.isDefined(result.data.Statelistdetails) &&
                result.data.Statelistdetails !== null && result.data.Statelistdetails.length > 0) ?
                  angular.copy(result.data.Statelistdetails) : [];

                $scope.accountdata.Gsttreatmentdetails = (angular.isDefined(result.data.Gsttreatmentdetails) &&
                result.data.Gsttreatmentdetails !== null && result.data.Gsttreatmentdetails.length > 0) ?
                  angular.copy(result.data.Gsttreatmentdetails) : [];

                if (angular.isDefined(result.data.Tax) && result.data.Tax !== null && result.data.Tax !== "" && result.data.Tax.length > 0) {
                  angular.forEach(result.data.Tax, (taxes) => {
                    if (angular.isDefined(taxes._id) && angular.isDefined(taxes.tax_name) && angular.isDefined(taxes.tax_percentage) &&
                        taxes.tax_percentage > 0) {
                      const spobj = {};
                      spobj._id = taxes._id;
                      spobj.tax_name = taxes.tax_name;
                      spobj.display_name = `${parseFloat(taxes.tax_percentage)}% ${taxes.tax_name}`;
                      spobj.tax_percentage = parseFloat(taxes.tax_percentage);
                      $scope.accountdata.taxes.push(spobj);
                    }
                  });
                }

                if (angular.isDefined(result.data.Customerdetails) && result.data.Customerdetails !== null && result.data.Customerdetails._id) {
                  $scope.accountdata.invoiceForm.customer_name = angular.copy(result.data.Customerdetails.name);
                  $scope.accountdata.invoiceForm.gstTreatment = angular.copy(result.data.Customerdetails.gstTreatment);
                  $scope.accountdata.invoiceForm.gstin = angular.copy(result.data.Customerdetails.gstin);
                  $scope.accountdata.invoiceForm.placeofSupply = angular.copy(result.data.Customerdetails.placeofSupply);
                  if (angular.isDefined(result.data.Customerdetails.group) && result.data.Customerdetails.group !== null &&
                    angular.isDefined(result.data.Customerdetails.group.group_discount) &&
                    result.data.Customerdetails.group.group_discount !== null &&
                    result.data.Customerdetails.group.group_discount.length > 0) {
                    $scope.accountdata.invoiceForm.customerGroup = angular.copy(result.data.Customerdetails.group._id);
                    $scope.accountdata.customerDiscount = angular.copy(result.data.Customerdetails.group.group_discount);
                  }
                  if (angular.isDefined(result.data.Customerdetails.mobile_no) && result.data.Customerdetails.mobile_no !== null &&
                    result.data.Customerdetails.mobile_no !== "") {
                    $scope.accountdata.invoiceForm.customer_mobile_no = angular.copy(result.data.Customerdetails.mobile_no);
                  }

                  if (angular.isDefined(result.data.Customerdetails.address) && result.data.Customerdetails.address !== null &&
                    result.data.Customerdetails.address.length > 0) {
                    angular.forEach(result.data.Customerdetails.address, (addr) => {
                      if (angular.isDefined(addr._id)) {
                        const objs = {};
                        objs._id = angular.copy(addr._id);
                        if (angular.isDefined(addr.is_default)) {
                          objs.is_default = angular.copy(addr.is_default);
                        }
                        if (angular.isDefined(addr.latitude)) {
                          objs.latitude = angular.copy(addr.latitude);
                        }
                        if (angular.isDefined(addr.longitude)) {
                          objs.longitude = angular.copy(addr.longitude);
                        }
                        if (angular.isDefined(addr.address_line)) {
                          objs.billing_address_line = angular.copy(addr.address_line);
                        }
                        if (angular.isDefined(addr.area)) {
                          objs.billing_area = angular.copy(addr.area);
                        }
                        if (angular.isDefined(addr.city)) {
                          objs.billing_city = angular.copy(addr.city);
                        }
                        if (angular.isDefined(addr.state)) {
                          objs.billing_state = angular.copy(addr.state);
                        }
                        if (angular.isDefined(addr.pincode)) {
                          objs.billing_pincode = angular.copy(addr.pincode);
                        }
                        if (angular.isDefined(addr.landmark)) {
                          objs.billing_landmark = angular.copy(addr.landmark);
                        }
                        if (angular.isDefined(addr.contact_no)) {
                          objs.billing_contact_no = angular.copy(addr.contact_no);
                        }
                        if (angular.isDefined(objs.is_default) && objs.is_default) {
                          $scope.accountdata.invoiceForm.billing_address = angular.copy(objs);
                        }
                        $scope.accountdata.customeraddress.push(angular.copy(objs));
                      }
                    });
                  }
                }
              } else {
                Notification.error("Invoice not found");
              }
            }
          } else {
            Notification.error(result.message);
          }
        }

        $scope.accountdata.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountdata.pageLoader = false;
      });
    }
  };
  
  $scope.togglesuperadminflag = function (trans) {
    if (angular.isDefined(trans) && trans !== null && angular.isDefined(trans._id)) {
      const obj = {};
      if (angular.isDefined(trans.bill_type)) {
        obj.type = "Invoice";
      } else {
        obj.type = "Transaction";
      }
      obj.transactionId = trans._id;
      obj.superadmin_flag = true;
     
      if (angular.isDefined(trans.superadmin_flag)) {
        obj.superadmin_flag = !trans.superadmin_flag;
      }
      
      AccountService.setFlag(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            angular.forEach($scope.accountdata.accountsTransaction, (led) => {
              if (angular.isDefined(led._id) && led._id === result.data._id) {
                led.superadmin_flag = angular.copy(result.data.superadmin_flag);
                led.superadmin_flag_added_by = angular.copy(result.data.superadmin_flag_added_by);
              }
            });
          }
          if (angular.isDefined(result.message)) {
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
  
  $scope.toggledivisionadminflag = function (trans) {
    if (angular.isDefined(trans) && trans !== null && angular.isDefined(trans._id)) {
      const obj = {};
      if (angular.isDefined(trans.bill_type)) {
        obj.type = "Invoice";
      } else {
        obj.type = "Transaction";
      }
      obj.transactionId = trans._id;
      obj.divisionadmin_flag = true;
     
      if (angular.isDefined(trans.divisionadmin_flag)) {
        obj.divisionadmin_flag = !trans.divisionadmin_flag;
      }
      
      AccountService.setdivisionFlag(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            angular.forEach($scope.accountdata.accountsTransaction, (led) => {
              if (angular.isDefined(led._id) && led._id === result.data._id) {
                led.divisionadmin_flag = angular.copy(result.data.divisionadmin_flag);
                led.divisionadmin_flag_added_by = angular.copy(result.data.divisionadmin_flag_added_by);
              }
            });
          }
          if (angular.isDefined(result.message)) {
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
  
  $scope.RegenerateInvoice = function () {
    if (angular.isDefined($scope.accountdata.invoiceForm) && angular.isDefined($scope.accountdata.invoiceForm._id) &&
        $scope.accountdata.invoiceForm._id !== null && $scope.accountdata.invoiceForm._id !== "") {
      $scope.accountdata.pageLoader = true;
      $scope.accountdata.customeraddress = [];

      InvoiceService.regenerateInvoice($scope.accountdata.invoiceForm, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null) {
              $scope.accountdata.Statelistdetails = (angular.isDefined(result.data.Statelistdetails) &&
                result.data.Statelistdetails !== null && result.data.Statelistdetails.length > 0) ?
                angular.copy(result.data.Statelistdetails) : [];

              $scope.accountdata.Gsttreatmentdetails = (angular.isDefined(result.data.Gsttreatmentdetails) &&
                result.data.Gsttreatmentdetails !== null && result.data.Gsttreatmentdetails.length > 0) ?
                angular.copy(result.data.Gsttreatmentdetails) : [];

              if (angular.isDefined(result.data.Customerdetails) && result.data.Customerdetails !== null && result.data.Customerdetails._id) {
                $scope.accountdata.invoiceForm.customer_name = angular.copy(result.data.Customerdetails.name);
                $scope.accountdata.invoiceForm.gstTreatment = angular.copy(result.data.Customerdetails.gstTreatment);
                $scope.accountdata.invoiceForm.gstin = angular.copy(result.data.Customerdetails.gstin);
                $scope.accountdata.invoiceForm.placeofSupply = angular.copy(result.data.Customerdetails.placeofSupply);
                if (angular.isDefined(result.data.Customerdetails.group) && result.data.Customerdetails.group !== null &&
                    angular.isDefined(result.data.Customerdetails.group.group_discount) &&
                    result.data.Customerdetails.group.group_discount !== null &&
                    result.data.Customerdetails.group.group_discount.length > 0) {
                  $scope.accountdata.invoiceForm.customerGroup = angular.copy(result.data.Customerdetails.group._id);
                  $scope.accountdata.customerDiscount = angular.copy(result.data.Customerdetails.group.group_discount);
                }
                if (angular.isDefined(result.data.Customerdetails.mobile_no) && result.data.Customerdetails.mobile_no !== null &&
                    result.data.Customerdetails.mobile_no !== "") {
                  $scope.accountdata.invoiceForm.customer_mobile_no = angular.copy(result.data.Customerdetails.mobile_no);
                }
                if (angular.isDefined(result.data.Customerdetails.address) && result.data.Customerdetails.address !== null &&
                    result.data.Customerdetails.address.length > 0) {
                  angular.forEach(result.data.Customerdetails.address, (addr) => {
                    if (angular.isDefined(addr._id)) {
                      const objs = {};
                      objs._id = angular.copy(addr._id);
                      if (angular.isDefined(addr.is_default)) {
                        objs.is_default = angular.copy(addr.is_default);
                      }
                      if (angular.isDefined(addr.latitude)) {
                        objs.latitude = angular.copy(addr.latitude);
                      }
                      if (angular.isDefined(addr.longitude)) {
                        objs.longitude = angular.copy(addr.longitude);
                      }
                      if (angular.isDefined(addr.address_line)) {
                        objs.billing_address_line = angular.copy(addr.address_line);
                      }
                      if (angular.isDefined(addr.area)) {
                        objs.billing_area = angular.copy(addr.area);
                      }
                      if (angular.isDefined(addr.city)) {
                        objs.billing_city = angular.copy(addr.city);
                      }
                      if (angular.isDefined(addr.state)) {
                        objs.billing_state = angular.copy(addr.state);
                      }
                      if (angular.isDefined(addr.pincode)) {
                        objs.billing_pincode = angular.copy(addr.pincode);
                      }
                      if (angular.isDefined(addr.landmark)) {
                        objs.billing_landmark = angular.copy(addr.landmark);
                      }
                      if (angular.isDefined(addr.contact_no)) {
                        objs.billing_contact_no = angular.copy(addr.contact_no);
                      }
                      if (angular.isDefined(objs.is_default) && objs.is_default) {
                        $scope.accountdata.invoiceForm.billing_address = angular.copy(objs);
                      }
                      $scope.accountdata.customeraddress.push(angular.copy(objs));
                    }
                  });
                }
              }

              if (angular.isDefined(result.data.Orderdetails) && result.data.Orderdetails !== null && result.data.Orderdetails.length > 0) {
                angular.forEach(result.data.Orderdetails, (ord) => {
                  if (angular.isDefined(ord._id) && angular.isDefined(ord.order_no) && angular.isDefined(ord.outward_delivery) &&
                    ord.outward_delivery !== null && ord.outward_delivery.length > 0) {
                    const obj = {};
                    obj._id = angular.copy(ord._id);
                    obj.order_no = angular.copy(ord.order_no);
                    obj.order_date = angular.copy(ord.order_date);
                    obj.order_reference_no = angular.copy(ord.order_reference_no);
                    obj.followupPerson = angular.isDefined(ord.followupPerson) ? angular.copy(ord.followupPerson) : {};
                    obj.contactperson = angular.copy(ord.contactperson);
                    obj.customer_dc_no = angular.copy(ord.customer_dc_no);
                    obj.customer_dc_date = angular.copy(ord.customer_dc_date);
                    obj.dyeing = angular.copy(ord.dyeing);
                    obj.dyeing_dc_no = angular.copy(ord.dyeing_dc_no);
                    obj.dyeing_dc_date = angular.copy(ord.dyeing_dc_date);

                    $scope.accountdata.Joblist.push(angular.copy(obj));
                  }
                });
              }
            }
          } else {
            Notification.error(result.message);
          }
        }

        $timeout(() => {
          calculateInvoicetotal().then((invoicetotal) => {
            if (invoicetotal !== null && invoicetotal) {
              calculateOtheritem().then(() => {
              });
            }
          });
        }, 200);
        $scope.accountdata.regenerate = true;
        $scope.accountdata.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountdata.pageLoader = false;
      });
    }
  };

  function setDelivery(Deliverydetails, items) {
    const deferred = $q.defer();
    let index = 0;
    const delivery = angular.copy($filter("filter")(Deliverydetails, {is_return: false }));
    
    angular.forEach(delivery, (ord) => {
      if (angular.isDefined(ord) && angular.isDefined(ord.outward_data) && ord.outward_data !== null && ord.outward_data.length > 0) {
        angular.forEach(ord.outward_data, (outdata) => {
          const processlist = _.flatten(_.pluck(outdata.process, "process_name"));
          outdata.process = angular.copy(outdata.process);
          outdata.processes = processlist.join(", ");
          outdata.order_id = ord.order_id;
          outdata.division_id = ord.division_id;
          outdata.delivery_no = ord.delivery_no;
          outdata.delivery_date = ord.delivery_date;
          outdata.order_no = ord.order_no;
          outdata.order_date = angular.copy(items.order_date);
          outdata.inward_id = angular.copy(outdata.inward_id);
          outdata.inward_date = angular.copy(outdata.inward_date);
          outdata.order_reference_no = angular.copy(items.order_reference_no);
          outdata.followupPerson = angular.isDefined(items.followupPerson) ? angular.copy(items.followupPerson) : {};
          outdata.contactperson = angular.copy(items.contactperson);
          outdata.customer_dc_no = angular.copy(items.customer_dc_no);
          outdata.customer_dc_date = angular.copy(items.customer_dc_date);
          outdata.dyeing = angular.copy(items.dyeing);
          outdata.dyeing_dc_no = angular.copy(items.dyeing_dc_no);
          outdata.dyeing_dc_date = angular.copy(items.dyeing_dc_date);
          outdata.measurement = angular.copy(outdata.measurement);
          if (angular.isUndefined(outdata.inward_weight)) {
            outdata.inward_weight = outdata.weight;
          }
          angular.forEach(outdata.process, (pro, prindex) => {
            pro.price = 0;
            pro.specialprice = 0;
            pro.discountprice = 0;
            pro.baseprice = 0;
            pro.subtotal = 0;
            pro.total = 0;
            if (prindex === outdata.process.length - 1) {
              $scope.accountdata.invoiceForm.items.push(angular.copy(outdata));
              index += 1;
            }
          });
          if (angular.isDefined($scope.accountdata.prevOrder)) {
            const prev = {};
            prev._id = angular.copy(ord.order_id);
            prev.status = "Invoice and Delivery";
            $scope.accountdata.prevOrder.push(angular.copy(prev));
          }

          if (index === ord.outward_data.length) {
            deferred.resolve($scope.accountdata.invoiceForm.items);
          }
        });
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setReturn(Returndetails, items) {
    const deferred = $q.defer();
    
    let returneddata = angular.copy($filter("filter")(Returndetails, {is_return: true }));
    const returnedList = _.flatten(_.pluck(returneddata, "outward_data"));
    
    if (angular.isDefined(returnedList) && returnedList !== null && returnedList.length > 0) {
      angular.forEach($scope.accountdata.invoiceForm.items, (outdata, outindex) => {      
        if (angular.isUndefined(outdata.inward_weight)) {
            outdata.inward_weight = outdata.weight;
        }
        angular.forEach(returnedList, (rdata, index) => {            
          if (angular.isDefined(rdata.inward_id) && angular.isDefined(rdata.inward_data_id) && angular.isDefined(outdata.inward_id) && 
                  angular.isDefined(outdata.inward_data_id) && rdata.inward_id === outdata.inward_id && 
                  rdata.inward_data_id === outdata.inward_data_id && outdata.weight) {            
            outdata.inward_weight -= parseFloat(rdata.delivery_weight);
          }

          if (index === returnedList.length-1 && outindex === returnedList.length-1) {
            deferred.resolve($scope.accountdata.invoiceForm.items);
          }
        });
      });
    } else {
      deferred.resolve($scope.accountdata.invoiceForm.items);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setInvoiceoption() {
    const deferred = $q.defer();
    let index = 0;
    angular.forEach($scope.accountdata.invoiceForm.items, (items) => {
      angular.forEach(items.process, (pro, proindex) => {
        pro.invoice_option = "Delivery Weight";
        angular.forEach($scope.accountdata.Processtax, (pr, prindex) => {
          if (angular.isDefined(pr.process_id) && pr.process_id === pro.process_id && angular.isDefined(pr.invoice_option) && 
                  pr.invoice_option !== "") {
              pro.invoice_option = pr.invoice_option;
          }
          if (proindex === items.process.length - 1 && prindex === $scope.accountdata.Processtax.length - 1) {
            index += 1;
          }
        });
      });
      if (index === $scope.accountdata.invoiceForm.items.length) {
        deferred.resolve($scope.accountdata.invoiceForm.items);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setInwardweight() {
     const deferred = $q.defer();
    let indexcnt = 0;
    angular.forEach($scope.accountdata.invoiceForm.items, (items, indx) => {      
      angular.forEach(items.process, (pro, proindex) => {
        if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
          let procexist = false;
          let totaldelivered = parseFloat(items.inward_weight);
          let prcnt = 0;
          angular.forEach($scope.accountdata.invoiceForm.items, (pritems, index) => {
            if (angular.isDefined(pritems.inward_data_id) && angular.isDefined(pritems.inward_id) && 
                    pritems.inward_data_id === items.inward_data_id && pritems.inward_id === items.inward_id) {
                angular.forEach(pritems.process, (prodata, prsind) => {
                  if (prodata.process_id === pro.process_id) {
                    if (index > indx) {
                      procexist = true;
                    }
                    if (index < indx) {
                      totaldelivered -= parseFloat(pritems.delivery_weight);
                    }
                  }
                  if (prsind === pritems.process.length-1){
                    prcnt += 1;
                    if (procexist) {
                      items.received_weight = parseFloat(items.delivery_weight);
                    } else {
                      items.received_weight = parseFloat(totaldelivered);
                    }
                    if (proindex === items.process.length-1 && prcnt === $scope.accountdata.invoiceForm.items.length) {
                      indexcnt += 1;
                    }
                  }
                });
            } else {
              prcnt += 1;
              if (prcnt === $scope.accountdata.invoiceForm.items.length) {
                indexcnt += 1;
              }
            }
          });
        } else {
          if (proindex === items.process.length-1) {
            indexcnt += 1;
          }
        }
      });
      if (indexcnt === $scope.accountdata.invoiceForm.items.length) {
        deferred.resolve($scope.accountdata.invoiceForm.items);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setSpecialprice() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.accountdata.specialprice) && angular.isDefined($scope.accountdata.invoiceForm.items) &&
        $scope.accountdata.specialprice.length > 0 && $scope.accountdata.invoiceForm.items.length > 0) {
      let index = 0;
      angular.forEach($scope.accountdata.invoiceForm.items, (items) => {
        angular.forEach(items.process, (pro, proindex) => {
          angular.forEach($scope.accountdata.specialprice, (spl, splindex) => {
            if (angular.isDefined(spl.division_id) && angular.isDefined(spl.measurement_id) && angular.isDefined(spl.order_id) &&
                angular.isDefined(spl.price) && parseFloat(spl.price) > 0 && angular.isDefined(spl.process_id) &&
                spl.division_id === items.division_id && spl.measurement_id === items.measurement._id &&
                spl.process_id === pro.process_id && spl.order_id === items.order_id) {
              if (angular.isDefined(spl.price)) {
                pro.specialprice = (angular.isDefined(spl.qty) && parseFloat(spl.qty) > 0) ? parseFloat(spl.price) / parseFloat(spl.qty) : 0;
              } else {
                pro.specialprice = 0;
              }
              pro.price = parseFloat(pro.specialprice).toFixed(2);
              if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
                pro.subtotal = parseFloat(pro.price) * parseFloat(items.received_weight);
              } else {
                pro.subtotal = parseFloat(pro.price) * parseFloat(items.delivery_weight);
              }
            }
            if (proindex === items.process.length - 1 && splindex === $scope.accountdata.specialprice.length - 1) {
              index += 1;
            }
          });
        });
        if (index === $scope.accountdata.invoiceForm.items.length) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function setDiscountprice() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.accountdata.customerDiscount) && angular.isDefined($scope.accountdata.invoiceForm.items) &&
        $scope.accountdata.customerDiscount.length > 0 && $scope.accountdata.invoiceForm.items.length > 0) {
      let index = 0;
      angular.forEach($scope.accountdata.invoiceForm.items, (items) => {
        angular.forEach(items.process, (pro, proindex) => {
          angular.forEach($scope.accountdata.customerDiscount, (grp, grpindex) => {
            if (angular.isDefined(grp.division_id) && angular.isDefined(grp.measurement_id) && angular.isDefined(grp.discount_price) &&
                parseFloat(grp.discount_price) > 0 && angular.isDefined(grp.process_id) && grp.division_id === items.division_id &&
                grp.measurement_id === items.measurement._id && grp.process_id === pro.process_id) {
              if (parseFloat(pro.price) === 0) {
                pro.price = parseFloat(grp.discount_price).toFixed(2);
                if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
                  pro.subtotal = parseFloat(grp.discount_price) * parseFloat(items.received_weight);
                } else {
                  pro.subtotal = parseFloat(grp.discount_price) * parseFloat(items.delivery_weight);
                }
              }
              pro.discountprice = parseFloat(grp.discount_price);
            }
            if (proindex === items.process.length - 1 && grpindex === $scope.accountdata.customerDiscount.length - 1) {
              index += 1;
            }
          });
        });
        if (index === $scope.accountdata.invoiceForm.items.length) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function setBaseprice() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.accountdata.Processdetails) && angular.isDefined($scope.accountdata.invoiceForm.items) &&
        $scope.accountdata.Processdetails.length > 0 && $scope.accountdata.invoiceForm.items.length > 0) {
      let index = 0;
      angular.forEach($scope.accountdata.invoiceForm.items, (items) => {
        angular.forEach(items.process, (pro, proindex) => {
          angular.forEach($scope.accountdata.Processdetails, (pr, prindex) => {
            if (angular.isDefined(pr.division_id) && angular.isDefined(pr.measurement_id) && angular.isDefined(pr.cost) &&
                parseFloat(pr.cost) > 0 && angular.isDefined(pr.process_id) && pr.division_id === items.division_id &&
                pr.measurement_id === items.measurement._id && pr.process_id === pro.process_id) {
              pro.baseprice = angular.isDefined(pr.cost) ? parseFloat(pr.cost) : 0;
              if (parseFloat(pro.price) === 0) {
                pro.price = parseFloat(pro.baseprice).toFixed(2);
                if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
                  pro.subtotal = parseFloat(pro.baseprice) * parseFloat(items.received_weight);
                } else {
                  pro.subtotal = parseFloat(pro.baseprice) * parseFloat(items.delivery_weight);
                }
              }
            }
            if (proindex === items.process.length - 1 && prindex === $scope.accountdata.Processdetails.length - 1) {
              index += 1;
            }
          });
        });
        if (index === $scope.accountdata.invoiceForm.items.length) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function calculateInvoicetotal() {
    $scope.accountdata.invoiceForm.tax_data = [];
    $scope.accountdata.invoiceForm.subtotal = 0;
    $scope.accountdata.invoiceForm.total = 0;
    $scope.accountdata.invoiceForm.roundoff = "0.00";
    let totinv = 0;
    const deferred = $q.defer();
    if ($scope.accountdata.invoiceForm.items.length === 0) {
      deferred.resolve(true);
    }

    if (angular.isDefined($scope.selectedBranch.placeofSupply) && angular.isDefined($scope.accountdata.invoiceForm.placeofSupply) &&
        $scope.accountdata.invoiceForm.items.length > 0) {
      let index = 0;
      if ($scope.accountdata.invoiceForm.placeofSupply === $scope.selectedBranch.placeofSupply) { // intra state tax calculation
        angular.forEach($scope.accountdata.invoiceForm.items, (items) => {
          angular.forEach(items.process, (pro, proindex) => {
            pro.totaltax = 0;
            pro.total = angular.copy(pro.subtotal);
            pro.tax_class = [];
            $scope.accountdata.invoiceForm.subtotal = parseFloat($scope.accountdata.invoiceForm.subtotal) + parseFloat(pro.subtotal);

            totinv = parseFloat(totinv) + parseFloat(pro.subtotal);

            if (angular.isDefined($scope.accountdata.Processtax) && $scope.accountdata.Processtax.length > 0) {
              angular.forEach($scope.accountdata.Processtax, (pr, prindex) => {
                if (angular.isDefined(pr.division_id) && angular.isDefined(pr.process_id) && pr.division_id === items.division_id &&
                    pr.process_id === pro.process_id && angular.isDefined(pr.tax_class) && pr.tax_class.length > 0) {
                  angular.forEach(pr.tax_class, (tax, txind) => {
                    if (angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage) && parseFloat(tax.tax_percentage) > 0) {
                      const tx = angular.copy(tax);
                      tx.taxamount = (parseFloat(pro.subtotal) / 100) * parseFloat(tax.tax_percentage);
                      totinv = parseFloat(totinv) + parseFloat(tx.taxamount);

                      if ($scope.accountdata.invoiceForm.tax_data.length > 0) {
                        let exist = false;
                        _.each($scope.accountdata.invoiceForm.tax_data, (key, ind) => {
                          if ($scope.accountdata.invoiceForm.tax_data[ind]._id === tax._id && !exist) {
                            exist = true;
                            const amtx = parseFloat($scope.accountdata.invoiceForm.tax_data[ind].taxamount) + tx.taxamount;
                            $scope.accountdata.invoiceForm.tax_data[ind].taxamount = amtx;
                          }
                          if (ind === $scope.accountdata.invoiceForm.tax_data.length - 1 && !exist) {
                            $scope.accountdata.invoiceForm.tax_data.push(angular.copy(tx));
                          }
                        });
                      } else {
                        $scope.accountdata.invoiceForm.tax_data.push(angular.copy(tx));
                      }
                      pro.totaltax = parseFloat(pro.totaltax) + parseFloat(tx.taxamount);
                      pro.total = parseFloat(pro.total) + parseFloat(pro.totaltax);
                      pro.tax_class.push(angular.copy(tx));
                    }
                    if (proindex === items.process.length - 1 && prindex === $scope.accountdata.Processtax.length - 1 &&
                        txind === pr.tax_class.length - 1) {
                      index += 1;
                    }
                  });
                } else if (proindex === items.process.length - 1 && prindex === $scope.accountdata.Processtax.length - 1) {
                  index += 1;
                }
              });
            } else if (proindex === items.process.length - 1) {
              index += 1;
            }
          });
          if (index === $scope.accountdata.invoiceForm.items.length) {
            const roundtotal = Math.round(totinv);
            const rounddiff = parseFloat(roundtotal) - parseFloat(totinv);
            $scope.accountdata.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

            $scope.accountdata.invoiceForm.total = parseFloat(roundtotal).toFixed(2);

            deferred.resolve(true);
          }
        });
      } else { // inter state tax calculation
        angular.forEach($scope.accountdata.invoiceForm.items, (items) => {
          angular.forEach(items.process, (pro, proindex) => {
            pro.totaltax = 0;
            pro.total = angular.copy(pro.subtotal);
            pro.tax_class = [];
            $scope.accountdata.invoiceForm.subtotal = parseFloat($scope.accountdata.invoiceForm.subtotal) + parseFloat(pro.subtotal);

            totinv = parseFloat(totinv) + parseFloat(pro.subtotal);
            if (angular.isDefined($scope.accountdata.Processtax) && $scope.accountdata.Processtax.length > 0) {
              angular.forEach($scope.accountdata.Processtax, (pr, prindex) => {
                if (angular.isDefined(pr.division_id) && angular.isDefined(pr.process_id) && pr.division_id === items.division_id &&
                    pr.process_id === pro.process_id && angular.isDefined(pr.inter_tax_class) && pr.inter_tax_class.length > 0) {
                  angular.forEach(pr.inter_tax_class, (tax, txind) => {
                    if (angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage) && parseFloat(tax.tax_percentage) > 0) {
                      const tx = angular.copy(tax);
                      tx.taxamount = (parseFloat(pro.subtotal) / 100) * parseFloat(tax.tax_percentage);

                      totinv = parseFloat(totinv) + parseFloat(tx.taxamount);
                      if ($scope.accountdata.invoiceForm.tax_data.length > 0) {
                        let exist = false;
                        _.each($scope.accountdata.invoiceForm.tax_data, (key, ind) => {
                          if ($scope.accountdata.invoiceForm.tax_data[ind]._id === tax._id && !exist) {
                            exist = true;
                            const tamt = parseFloat($scope.accountdata.invoiceForm.tax_data[ind].taxamount) + tx.taxamount;
                            $scope.accountdata.invoiceForm.tax_data[ind].taxamount = tamt;
                          }
                          if (ind === $scope.accountdata.invoiceForm.tax_data.length - 1 && !exist) {
                            $scope.accountdata.invoiceForm.tax_data.push(angular.copy(tx));
                          }
                        });
                      } else {
                        $scope.accountdata.invoiceForm.tax_data.push(angular.copy(tx));
                      }
                      pro.totaltax = parseFloat(pro.totaltax) + parseFloat(tx.taxamount);
                      pro.total = parseFloat(pro.total) + parseFloat(tx.taxamount);
                      pro.tax_class.push(angular.copy(tx));
                    }
                    if (proindex === items.process.length - 1 && prindex === $scope.accountdata.Processtax.length - 1 &&
                        txind === pr.inter_tax_class.length - 1) {
                      index += 1;
                    }
                  });
                } else if (proindex === items.process.length - 1 && prindex === $scope.accountdata.Processtax.length - 1) {
                  index += 1;
                }
              });
            } else if (proindex === items.process.length - 1) {
              index += 1;
            }
          });
          if (index === $scope.accountdata.invoiceForm.items.length) {
            const roundtotal = Math.round(totinv);
            const rounddiff = parseFloat(roundtotal) - parseFloat(totinv);
            $scope.accountdata.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

            $scope.accountdata.invoiceForm.total = parseFloat(roundtotal).toFixed(2);
            deferred.resolve(true);
          }
        });
      }
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function calculateOtheritem() {
    const deferred = $q.defer();
    let index = 0;
    let totinv = 0;
    if (angular.isUndefined($scope.accountdata.invoiceForm.tax_data)) {
      $scope.accountdata.invoiceForm.tax_data = [];
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.subtotal)) {
      $scope.accountdata.invoiceForm.subtotal = 0;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.total)) {
      $scope.accountdata.invoiceForm.total = 0;
      $scope.accountdata.invoiceForm.roundoff = "0.00";
    } else {
      totinv = parseFloat($scope.accountdata.invoiceForm.total);
      if (angular.isDefined($scope.accountdata.invoiceForm.roundoff)) {
        totinv = parseFloat(totinv) + parseFloat($scope.accountdata.invoiceForm.roundoff);
      }
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.otheritems) || $scope.accountdata.invoiceForm.otheritems.length === 0) {
      deferred.resolve(true);
    }

    angular.forEach($scope.accountdata.invoiceForm.otheritems, (items) => {
      $scope.accountdata.invoiceForm.subtotal = parseFloat($scope.accountdata.invoiceForm.subtotal) + parseFloat(items.pretotal);

      totinv = parseFloat(totinv) + parseFloat(items.pretotal);
      if (angular.isDefined(items.tax_class) && items.tax_class.length > 0) {
        angular.forEach(items.tax_class, (tax, txind) => {
          if (angular.isDefined(tax.display_name) && angular.isDefined(tax.tax_percentage) && parseFloat(tax.tax_percentage) > 0 &&
            angular.isDefined(tax.taxamount) && parseFloat(tax.taxamount) > 0) {
            const tx = angular.copy(tax);
            tx.taxamount = parseFloat(tax.taxamount);

            totinv = parseFloat(totinv) + parseFloat(tx.taxamount);
            if ($scope.accountdata.invoiceForm.tax_data.length > 0) {
              let exist = false;
              _.each($scope.accountdata.invoiceForm.tax_data, (key, ind) => {
                if ($scope.accountdata.invoiceForm.tax_data[ind]._id === tax._id && !exist) {
                  exist = true;
                  const txat = parseFloat($scope.accountdata.invoiceForm.tax_data[ind].taxamount) + tx.taxamount;
                  $scope.accountdata.invoiceForm.tax_data[ind].taxamount = txat;
                }
                if (ind === $scope.accountdata.invoiceForm.tax_data.length - 1 && !exist) {
                  $scope.accountdata.invoiceForm.tax_data.push(angular.copy(tx));
                }
              });
            } else {
              $scope.accountdata.invoiceForm.tax_data.push(angular.copy(tx));
            }
          }
          if (txind === items.tax_class.length - 1) {
            index += 1;
          }
        });
      } else {
        index += 1;
      }
      if (index === $scope.accountdata.invoiceForm.otheritems.length) {
        const roundtotal = Math.round(totinv);
        const rounddiff = parseFloat(roundtotal) - parseFloat(totinv);
        $scope.accountdata.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

        $scope.accountdata.invoiceForm.total = parseFloat(roundtotal).toFixed(2);

        deferred.resolve(true);
      }
    });
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  $scope.addJobs = function (items) {
    if (angular.isUndefined($scope.accountdata.invoiceForm.items)) {
      $scope.accountdata.invoiceForm.items = [];
    }
    if (angular.isDefined(items) && items !== null && angular.isDefined(items._id) && items._id !== "" &&
        angular.isDefined(items.order_no) && items.order_no !== "") {
      if (angular.isDefined($scope.accountdata.invoiceForm.customer_id) && $scope.accountdata.invoiceForm.customer_id !== null) {
        const ord = {};
        ord._id = items._id;
        ord.customer_id = $scope.accountdata.invoiceForm.customer_id;
        $scope.accountdata.pageLoader = true;
        $scope.accountdata.deliveredList = [];
        
        DeliveryService.getCompleteddeliverybyId(ord, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Delivery) &&
                result.data.Delivery !== null && result.data.Delivery.length > 0) {
                if (angular.isDefined(result.data.Specialprice) && result.data.Specialprice !== null && result.data.Specialprice.length > 0) {
                  angular.forEach(result.data.Specialprice, (splprice) => {
                    if (splprice !== null && angular.isDefined(splprice._id)) {
                      $scope.accountdata.specialprice.push(angular.copy(splprice));
                    }
                  });
                }
                $scope.accountdata.deliveredList = result.data.Delivery;
                
                setDelivery($scope.accountdata.deliveredList, items).then((data) => {
                  if (angular.isDefined(data) && data.length > 0) {
                    setReturn($scope.accountdata.deliveredList, items).then((retdata) => {
                      if (angular.isDefined(retdata) && retdata.length > 0) {
                        setInvoiceoption().then((invdata) => {
                          if (angular.isDefined(invdata) && invdata.length > 0) {
                            setInwardweight().then((inwdt) => {
                              if (angular.isDefined(inwdt) && inwdt.length > 0) { 
                                setSpecialprice().then((splprice) => {
                                  if (splprice !== null && splprice) {
                                    setDiscountprice().then((discprice) => {
                                      if (discprice !== null && discprice) {
                                        setBaseprice().then((baseprice) => {
                                          if (baseprice !== null && baseprice) {
                                            calculateInvoicetotal().then((invoicetotal) => {
                                              if (invoicetotal !== null && invoicetotal) {
                                                calculateOtheritem().then((otheritemtotal) => {
                                                  if (otheritemtotal !== null && otheritemtotal) {
                                                    $scope.accountdata.pageLoader = false;
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                Notification.warning("No job cards found.");
              }
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.pageLoader = false;
        });
      }
    }
  };

  $scope.getItemtotal = function () {
    $scope.accountdata.invoiceItems.total = 0;
    $scope.accountdata.invoiceItems.subtotal = 0;
    $scope.accountdata.invoiceItems.pretotal = 0;

    if (angular.isDefined($scope.accountdata.invoiceItems.price) && angular.isDefined($scope.accountdata.invoiceItems.qty) &&
        parseFloat($scope.accountdata.invoiceItems.qty) > 0 && parseFloat($scope.accountdata.invoiceItems.price) > 0) {
      $scope.accountdata.invoiceItems.subtotal = parseFloat($scope.accountdata.invoiceItems.price) * parseFloat($scope.accountdata.invoiceItems.qty);
      $scope.accountdata.invoiceItems.pretotal = parseFloat($scope.accountdata.invoiceItems.price) * parseFloat($scope.accountdata.invoiceItems.qty);
      $scope.accountdata.invoiceItems.total = parseFloat($scope.accountdata.invoiceItems.price) * parseFloat($scope.accountdata.invoiceItems.qty);

      if (angular.isDefined($scope.accountdata.invoiceItems.discountby) && $scope.accountdata.invoiceItems.discountby !== null &&
        $scope.accountdata.invoiceItems.discountby !== "" && angular.isDefined($scope.accountdata.invoiceItems.discount) &&
        $scope.accountdata.invoiceItems.discount !== null && parseFloat($scope.accountdata.invoiceItems.discount) > 0) {
        if ($scope.accountdata.invoiceItems.discountby === "percentage") {
          const discnt = (parseFloat($scope.accountdata.invoiceItems.subtotal) / 100);
          $scope.accountdata.invoiceItems.discountamount = discnt * parseFloat($scope.accountdata.invoiceItems.discount);
        } else {
          $scope.accountdata.invoiceItems.discountamount = parseFloat($scope.accountdata.invoiceItems.discount);
        }
        const pretot = parseFloat($scope.accountdata.invoiceItems.pretotal) - parseFloat($scope.accountdata.invoiceItems.discountamount);
        $scope.accountdata.invoiceItems.pretotal = pretot;
        $scope.accountdata.invoiceItems.total = parseFloat($scope.accountdata.invoiceItems.pretotal);
      }

      if (angular.isDefined($scope.accountdata.invoiceItems.tax_class) && $scope.accountdata.invoiceItems.tax_class !== null &&
        $scope.accountdata.invoiceItems.tax_class.length > 0) {
        let pretotal = angular.copy($scope.accountdata.invoiceItems.pretotal);
        angular.forEach($scope.accountdata.invoiceItems.tax_class, (tx, ind) => {
          if (angular.isDefined(tx.tax_percentage) && tx.tax_percentage !== null && parseFloat(tx.tax_percentage) > 0) {
            const itmpr = parseFloat($scope.accountdata.invoiceItems.price) / 100;
            tx.taxamount = (itmpr * parseFloat(tx.tax_percentage)) * parseFloat($scope.accountdata.invoiceItems.qty);
            pretotal = parseFloat($scope.accountdata.invoiceItems.pretotal) + parseFloat(tx.taxamount);
          }
          if (ind === $scope.accountdata.invoiceItems.tax_class.length - 1) {
            $scope.accountdata.invoiceItems.total = parseFloat(pretotal);
          }
        });
      }
    }
  };

  $scope.newItemCalc = function () {
    $scope.accountdata.invoiceItems.tax_class = angular.copy($scope.accountdata.makeUpTaxClass_selected);
    $scope.getItemtotal();
  };

  $scope.calculateSumInvoice = function (process, item) {
    if (process !== null && angular.isDefined(process.price) && process.price !== null && process.price !== "" &&
        angular.isDefined(item.delivery_weight) && item.delivery_weight !== null && item.delivery_weight !== "") {
      if (angular.isDefined(process.invoice_option) && process.invoice_option === "Received Weight") {
        process.subtotal = parseFloat(process.price) * parseFloat(item.received_weight);
      } else {
        process.subtotal = parseFloat(process.price) * parseFloat(item.delivery_weight);
      }
      
      calculateInvoicetotal().then((invoicetotal) => {
        if (invoicetotal !== null && invoicetotal) {
          calculateOtheritem().then((otheritemtotal) => {

          });
        }
      });
    }
  };

  $scope.invoice_newItemInsert = function () {
    if (angular.isUndefined($scope.accountdata.invoiceItems.itemname) || $scope.accountdata.invoiceItems.itemname === null ||
        $scope.accountdata.invoiceItems.itemname === "") {
      Notification.error("Please enter the item details.");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceItems.qty) || $scope.accountdata.invoiceItems.qty === null ||
        $scope.accountdata.invoiceItems.qty === "" || parseFloat($scope.accountdata.invoiceItems.qty) === 0) {
      Notification.error("Please enter the quantity details.");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceItems.price) || $scope.accountdata.invoiceItems.price === null ||
        $scope.accountdata.invoiceItems.price === "" || parseFloat($scope.accountdata.invoiceItems.price) === 0) {
      Notification.error("Please enter the price.");
      return false;
    }
    if (angular.isDefined($scope.accountdata.invoiceItems.subtotal) && parseFloat($scope.accountdata.invoiceItems.subtotal) > 0) {
      if (angular.isUndefined($scope.accountdata.invoiceForm.otheritems)) {
        $scope.accountdata.invoiceForm.otheritems = [];
      }
      $scope.accountdata.invoiceForm.otheritems.push(angular.copy($scope.accountdata.invoiceItems));

      calculateInvoicetotal().then((invoicetotal) => {
        if (invoicetotal !== null && invoicetotal) {
          $scope.accountdata.invoiceItems = {};
          $scope.accountdata.selectedIndex = -1;
          $scope.accountdata.makeUpTaxClass_selected = {};
          calculateOtheritem().then((otheritemtotal) => {

          });
        }
      });
    }
  };

  $scope.invoice_updateItemInsert = function () {
    if (angular.isDefined($scope.accountdata.selectedIndex) && $scope.accountdata.selectedIndex > -1) {
      if (angular.isUndefined($scope.accountdata.invoiceItems.itemname) || $scope.accountdata.invoiceItems.itemname === null ||
        $scope.accountdata.invoiceItems.itemname === "") {
        Notification.error("Please enter the item details.");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceItems.qty) || $scope.accountdata.invoiceItems.qty === null ||
        $scope.accountdata.invoiceItems.qty === "" || parseFloat($scope.accountdata.invoiceItems.qty) === 0) {
        Notification.error("Please enter the quantity details.");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceItems.price) || $scope.accountdata.invoiceItems.price === null ||
        $scope.accountdata.invoiceItems.price === "" || parseFloat($scope.accountdata.invoiceItems.price) === 0) {
        Notification.error("Please enter the price.");
        return false;
      }
      if (angular.isDefined($scope.accountdata.invoiceItems.subtotal) && parseFloat($scope.accountdata.invoiceItems.subtotal) > 0) {
        if (angular.isUndefined($scope.accountdata.invoiceForm.otheritems)) {
          $scope.accountdata.invoiceForm.otheritems = [];
        }

        $scope.accountdata.invoiceForm.otheritems[$scope.accountdata.selectedIndex] = angular.copy($scope.accountdata.invoiceItems);
        calculateInvoicetotal().then((invoicetotal) => {
          if (invoicetotal !== null && invoicetotal) {
            calculateOtheritem().then((otheritemtotal) => {
              if (otheritemtotal !== null && otheritemtotal) {
                $scope.accountdata.invoiceItems = {};
                $scope.accountdata.selectedIndex = -1;
                $scope.accountdata.makeUpTaxClass_selected = [];
              }
            });
          }
        });
      }
    }
  };

  $scope.editItem = function (item) {
    const ind = $scope.accountdata.invoiceForm.otheritems.indexOf(item);
    if (ind > -1) {
      if (angular.isDefined(item.tax_class)) {
        $scope.accountdata.makeUpTaxClass_selected = angular.copy(item.tax_class);
      }
      $scope.accountdata.invoiceItems = angular.copy(item);
      $scope.accountdata.selectedIndex = ind;
      $scope.accountdata.showadditems = true;
    }
  };

  $scope.invoice_Cancel = function () {
    $scope.accountdata.selectedIndex = -1;
    $scope.accountdata.invoiceItems = {};
    $scope.accountdata.makeUpTaxClass_selected = [];
    $scope.accountdata.showTaxselection = false;
  };

  $scope.removeJobs = function (items) {
    $scope.accountdata.pageLoader = true;
    if (angular.isDefined(items) && items !== null && angular.isDefined(items._id) && items._id !== "") {
      $scope.accountdata.invoiceForm.items = $scope.accountdata.invoiceForm.items.filter((val) => {
        return (val.order_id !== items._id);
      });
      angular.forEach($scope.accountdata.prevOrder, (prevorder) => {
        if (angular.isDefined(prevorder._id) && prevorder._id === items._id) {
          prevorder.status = "Completed";
        }
      });

      calculateInvoicetotal().then((invoicetotal) => {
        if (invoicetotal !== null && invoicetotal) {
          $scope.accountdata.pageLoader = false;
        }
      });
    }
  };

  $scope.cancelInvoice = function () {
    $scope.accountdata.invoiceForm = {};
    $scope.setLedger(angular.copy($scope.ledgerData));
  };

  $scope.printThisinvoice = function (invoice) {
    if (angular.isDefined(invoice) && invoice !== null && angular.isDefined(invoice._id)) {
      InvoiceService.printInvoicedata(invoice._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.Invoicedata) && result.data.Invoicedata !== null &&
            angular.isDefined(result.data.Invoicedata._id)) {
          const templateUrl = $sce.getTrustedResourceUrl("app/views/common/invoice_print.html");
          invoiceDetail = result.data;
          if (angular.isDefined(result.data.Invoicedata) && result.data.Invoicedata !== null && angular.isDefined(result.data.Invoicedata.roundoff)) {
            invoiceDetail.roundoff = parseFloat(result.data.Invoicedata.roundoff);
          }
          currency = $scope.accountdata.currency;
          window.open(templateUrl, "_blank");
        } else {
          Notification.error("Invoice not found.");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  function getOrderlist() {
    const deferred = $q.defer();
    const orderlist = _.uniq(_.flatten(_.pluck($scope.accountdata.invoiceForm.items, "order_id")));
    deferred.resolve(orderlist);
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function getOrderliststatus(orders) {
    const deferred = $q.defer();
    if (orders !== null && orders.length > 0 && $scope.accountdata.prevOrder !== null && $scope.accountdata.prevOrder.length > 0) {
      let orderlen = 0;
      angular.forEach($scope.accountdata.prevOrder, (prevorder) => {
        let exist = false;
        angular.forEach(orders, (ord, ind) => {
          if (angular.isDefined(prevorder._id) && prevorder._id === ord.order_id && !exist) {
            exist = !exist;
            prevorder.status = "Invoice and Delivery";
          }
          if (ind === orders.length - 1) {
            orderlen += 1;
            if (!exist) {
              prevorder.status = "Completed";
            }
          }
        });
        if (orderlen === $scope.accountdata.prevOrder.length) {
          deferred.resolve($scope.accountdata.prevOrder);
        }
      });
    } else {
      deferred.resolve(null);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  $scope.saveInvoice = function () {
    if (angular.isDefined($scope.accountdata.invoiceForm._id) && angular.isDefined($scope.accountdata.invoiceForm.job_id)) {
      Notification.error("Cant update jobcard invoice");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.items) || (angular.isDefined($scope.accountdata.invoiceForm.items) &&
        $scope.accountdata.invoiceForm.items.length === 0)) {
      Notification.error("Please add items to create / update invoice");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.customer_id) || (angular.isDefined($scope.accountdata.invoiceForm.customer_id) &&
        ($scope.accountdata.invoiceForm.customer_id === "" || $scope.accountdata.invoiceForm.customer_id === null))) {
      Notification.error("Please select customer");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.billing_address) || $scope.accountdata.invoiceForm.billing_address === null ||
        $scope.accountdata.invoiceForm.billing_address === "") {
      Notification.error("Please select address of the customer");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.billing_address.billing_address_line) ||
        (angular.isDefined($scope.accountdata.invoiceForm.billing_address.billing_address_line) &&
        ($scope.accountdata.invoiceForm.billing_address.billing_address_line === "" ||
        $scope.accountdata.invoiceForm.billing_address.billing_address_line === null))) {
      Notification.error("Please select address of the customer");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.ledger_id) || (angular.isDefined($scope.accountdata.invoiceForm.ledger_id) &&
                ($scope.accountdata.invoiceForm.ledger_id === "" || $scope.accountdata.invoiceForm.ledger_id === null))) {
      Notification.error("Please select the ledger");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.division_id) || (angular.isDefined($scope.accountdata.invoiceForm.division_id) &&
                ($scope.accountdata.invoiceForm.division_id === "" || $scope.accountdata.invoiceForm.division_id === null))) {
      Notification.error("Please select the branch");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.customer_name) || (angular.isDefined($scope.accountdata.invoiceForm.customer_name) &&
                ($scope.accountdata.invoiceForm.customer_name === "" || $scope.accountdata.invoiceForm.customer_name === null))) {
      Notification.error("Please select the customer");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.total) || (angular.isDefined($scope.accountdata.invoiceForm.total) &&
        ($scope.accountdata.invoiceForm.total === "" || $scope.accountdata.invoiceForm.total === null ||
        parseFloat($scope.accountdata.invoiceForm.total) <= 0))) {
      Notification.error("Invalid invoice total amount");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.invoiceForm.gstTreatment) || (angular.isDefined($scope.accountdata.invoiceForm.gstTreatment) &&
                ($scope.accountdata.invoiceForm.gstTreatment === "" || $scope.accountdata.invoiceForm.gstTreatment === null))) {
      Notification.error("Please add the gst treatment for this customer.");
      return false;
    }

    const obj = {};
    obj.invoiceForm = angular.copy($scope.accountdata.invoiceForm);
    obj.invoiceForm.type = "INVOICE";
    obj.invoiceForm.bill_type = "Manual";
    getOrderlist().then((orders) => {
      if (angular.isDefined(orders) && orders !== null && orders.length > 0) {
        obj.orderList = orders;

        InvoiceService.create(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
                $scope.accountdata.invoiceForm = angular.copy(result.data);
                Notification.success("Invoice successfully saved");
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
  };

  $scope.updateInvoice = function () {
    if (angular.isDefined($scope.accountdata.invoiceForm._id)) {
      if (angular.isUndefined($scope.accountdata.invoiceForm.items) || (angular.isDefined($scope.accountdata.invoiceForm.items) &&
        $scope.accountdata.invoiceForm.items.length === 0)) {
        Notification.error("Please add items to create / update invoice");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.customer_id) || (angular.isDefined($scope.accountdata.invoiceForm.customer_id) &&
        ($scope.accountdata.invoiceForm.customer_id === "" || $scope.accountdata.invoiceForm.customer_id === null))) {
        Notification.error("Please select customer");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.billing_address) || $scope.accountdata.invoiceForm.billing_address === null ||
        $scope.accountdata.invoiceForm.billing_address === "") {
        Notification.error("Please select address of the customer");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.billing_address.billing_address_line) ||
        (angular.isDefined($scope.accountdata.invoiceForm.billing_address.billing_address_line) &&
        ($scope.accountdata.invoiceForm.billing_address.billing_address_line === "" ||
        $scope.accountdata.invoiceForm.billing_address.billing_address_line === null))) {
        Notification.error("Please select address of the customer");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.ledger_id) || (angular.isDefined($scope.accountdata.invoiceForm.ledger_id) &&
                    ($scope.accountdata.invoiceForm.ledger_id === "" || $scope.accountdata.invoiceForm.ledger_id === null))) {
        Notification.error("Please select the ledger");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.division_id) || (angular.isDefined($scope.accountdata.invoiceForm.division_id) &&
                    ($scope.accountdata.invoiceForm.division_id === "" || $scope.accountdata.invoiceForm.division_id === null))) {
        Notification.error("Please select the branch");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.customer_name) || (angular.isDefined($scope.accountdata.invoiceForm.customer_name) &&
                    ($scope.accountdata.invoiceForm.customer_name === "" || $scope.accountdata.invoiceForm.customer_name === null))) {
        Notification.error("Please select the customer");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.total) || (angular.isDefined($scope.accountdata.invoiceForm.total) &&
        ($scope.accountdata.invoiceForm.total === "" || $scope.accountdata.invoiceForm.total === null ||
        parseFloat($scope.accountdata.invoiceForm.total) <= 0))) {
        Notification.error("Invalid invoice total amount");
        return false;
      }
      if (angular.isUndefined($scope.accountdata.invoiceForm.gstTreatment) || (angular.isDefined($scope.accountdata.invoiceForm.gstTreatment) &&
                    ($scope.accountdata.invoiceForm.gstTreatment === "" || $scope.accountdata.invoiceForm.gstTreatment === null))) {
        Notification.error("Please add the gst treatment for this customer.");
        return false;
      }

      const obj = {};
      obj.invoiceForm = angular.copy($scope.accountdata.invoiceForm);
      obj.invoiceForm.type = "INVOICE";
      obj.invoiceForm.bill_type = "Manual";

      getOrderlist().then((orders) => {
        if (angular.isDefined(orders) && orders !== null && orders.length > 0) {
          getOrderliststatus(orders).then((orderListing) => {
            if (angular.isDefined(orderListing) && orderListing !== null && orderListing.length > 0) {
              obj.orderList = orderListing;

              InvoiceService.update(obj, (result) => {
                if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
                  if (result.success) {
                    if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
                      $scope.accountdata.invoiceForm = angular.copy(result.data);
                      Notification.success("Invoice successfully saved");
                      $scope.accountdata.regenerate = false;
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
        }
      });
    }
  };

  function formatExistbills(invoices) {
    const deferred = $q.defer();
    if (angular.isUndefined(invoices) || invoices === null || invoices === "" || invoices.length === 0) {
      deferred.resolve(false);
    } else {
      angular.forEach(invoices, (bills, index) => {
        let exist = false;
        if (angular.isDefined(bills) && bills !== null && angular.isDefined(bills.bill_id)) {
          angular.forEach($scope.accountdata.customerPayment.pendingbills, (billloop, loopind) => {
            if (angular.isDefined(billloop) && billloop !== null && angular.isDefined(billloop.bill_id)) {
              if (bills.bill_id === billloop.bill_id) {
                exist = true;
                billloop.amount_allocated = parseFloat(bills.amount_allocated);
                billloop.pending_balance = parseFloat(billloop.pending_balance) + billloop.amount_allocated;
              }
            }
            if (loopind === $scope.accountdata.customerPayment.pendingbills.length - 1) {
              if (exist) {
                if (index === invoices.length - 1) {
                  deferred.resolve(true);
                }
              } else {
                deferred.resolve(false);
              }
            }
          });
        } else {
          deferred.resolve(false);
        }
      });
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function formatdebitExistbills(invoices) {
    const deferred = $q.defer();
    if (angular.isUndefined(invoices) || invoices === null || invoices === "" || invoices.length === 0) {
      deferred.resolve(false);
    } else {
      angular.forEach(invoices, (bills, index) => {
        let exist = false;
        if (angular.isDefined(bills) && bills !== null && angular.isDefined(bills.bill_id)) {
          angular.forEach($scope.accountdata.debitForm.pendingbills, (billloop, loopind) => {
            if (angular.isDefined(billloop) && billloop !== null && angular.isDefined(billloop.bill_id)) {
              if (bills.bill_id === billloop.bill_id) {
                exist = true;
                billloop.amount_allocated = parseFloat(bills.amount_allocated);
                billloop.pending_balance = parseFloat(billloop.pending_balance) + billloop.amount_allocated;
              }
            }
            if (loopind === $scope.accountdata.debitForm.pendingbills.length - 1) {
              if (exist) {
                if (index === invoices.length - 1) {
                  deferred.resolve(true);
                }
              } else {
                deferred.resolve(false);
              }
            }
          });
        } else {
          deferred.resolve(false);
        }
      });
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function formatPendingbills(invoices) {
    const deferred = $q.defer();
    if (angular.isUndefined(invoices) || invoices === null || invoices === "" || invoices.length === 0) {
      deferred.resolve(invoices);
    } else {
      angular.forEach(invoices, (bills, index) => {
        if (angular.isDefined(bills) && angular.isDefined(bills._id)) {
          const obj = {};
          obj.bill_id = bills._id;
          obj.type = bills.type;
          obj.bill_no = bills.invoice_no;
          obj.due_date = bills.invoicedue_date;
          obj.amount = bills.total;
          obj.pending_balance = bills.total - bills.paid;
          obj.balance_due = bills.total - bills.paid;
          if ($scope.accountdata.currentPage == 'DebitLedgerdetail') {
            $scope.accountdata.debitForm.pendingbills.push(obj);
          } else {
            $scope.accountdata.customerPayment.pendingbills.push(obj);
          }
        }
        if (index === invoices.length - 1) {
          if ($scope.accountdata.currentPage == 'DebitLedgerdetail') {
            deferred.resolve($scope.accountdata.debitForm.pendingbills);
          } else {
            deferred.resolve($scope.accountdata.customerPayment.pendingbills);
          }
        }
      });
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  $scope.getPaymentdetails = function (id) {
    $scope.accountdata.pageLoader = true;
    AccountService.getpendingBills(id, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && result.data !== "" && angular.isDefined(result.data.bills) && 
                  angular.isDefined(result.data.customerbalance) && (result.data.bills.length > 0 || 
                  angular.isDefined(result.data.customerbalance._id)) && angular.isDefined(result.data.customerDetails) && 
                  result.data.customerDetails !== null && angular.isDefined(result.data.customerDetails._id)) {
            $scope.accountdata.customerPayment.pendingbills = [];

            if (result.data.bills.length) {
              formatPendingbills(result.data.bills).then((invoice) => {
                if (invoice && $scope.accountdata.customerPayment.pendingbills.length > 0) {
                  $scope.accountdata.customerPayment.payee_id = angular.copy(result.data.customerDetails._id);
                  $scope.accountdata.customerPayment.payee_name = angular.copy(result.data.customerDetails.name);
                  $scope.accountdata.customerPayment.payee_mobileno = angular.copy(result.data.customerDetails.mobile_no);
                }
              });
            }
            if (angular.isDefined(result.data.customerbalance._id) && angular.isDefined(result.data.customerbalance.pending_balance) && 
                    result.data.customerbalance.pending_balance !== null && parseFloat(result.data.customerbalance.pending_balance) !== 0) {

              if (parseFloat(result.data.customerbalance.pending_balance) > 0) {
                $scope.accountdata.customerPayment.customer_openingbalance = {};
                $scope.accountdata.customerPayment.customer_openingbalance.balance_id = angular.copy(result.data.customerbalance._id);
                $scope.accountdata.customerPayment.customer_openingbalance.pending_balance = angular.copy(result.data.customerbalance.pending_balance);
                $scope.accountdata.customerPayment.customer_openingbalance.total_allocated = angular.copy(result.data.customerbalance.total_allocated);
                $scope.accountdata.customerPayment.customer_openingbalance.total_balance = angular.copy(result.data.customerbalance.total_balance);
                $scope.accountdata.customerPayment.customer_openingbalance.balance_due = angular.copy(result.data.customerbalance.pending_balance);
                $scope.accountdata.customerPayment.payee_id = angular.copy(result.data.customerDetails._id);
                $scope.accountdata.customerPayment.payee_name = angular.copy(result.data.customerDetails.name);
                $scope.accountdata.customerPayment.payee_mobileno = angular.copy(result.data.customerDetails.mobile_no);
              } else if (parseFloat(result.data.customerbalance.pending_balance) < 0) {
                $scope.accountdata.customerPayment.previous_owe = -1 * parseFloat(result.data.customerbalance.pending_balance);
              }
            }
            if ($scope.accountdata.currentPage !== "Payment Receipt") {
              $scope.accountdata.currentPage = "Payment";
            }
          } else {
            Notification.warning("No Invoices has pending dues");
          }
        }
      }

      $scope.accountdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  }
  
  $scope.getPendingbills = function (id) {
    $scope.accountdata.pageLoader = true;
    AccountService.getcustomerPendingbills(id, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && result.data !== "" && result.data.length > 0) {
              
            $scope.accountdata.debitForm.pendingbills = [];

            if (result.data.length) {
              formatPendingbills(result.data).then((invoice) => {});
            }
            
          } else {
            Notification.warning("No Invoices has pending dues");
          }
        }
      }

      $scope.accountdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  }
  
  $scope.paymentInitialize = function () {
    angular.forEach($scope.accountdata.ledgerDetail, (ledger) => {
      if (angular.isDefined(ledger._id) && ledger._id !== "" && angular.isDefined(ledger.type) && ledger.type !== "INVOICE") {
        const lobj = {};
        lobj._id = angular.copy(ledger._id);
        lobj.division_id = angular.copy(ledger.division_id);
        lobj.name = angular.copy(ledger.name);
        $scope.accountdata.paymentledgers.push(lobj);
      }
    });
    if (angular.isDefined($scope.selectedBranch) && angular.isDefined($scope.selectedBranch._id) && $scope.selectedBranch._id !== "") {
      $scope.accountdata.customerPayment.division_id = angular.copy($scope.selectedBranch._id);
      $scope.accountdata.customerPayment.branch_name = angular.copy($scope.selectedBranch.name);
    }
    $scope.accountdata.customerPayment.type = "REGULAR";
    $scope.accountdata.customerPayment.category_name = "Payment for Invoices and Bill";
    $scope.accountdata.customerPayment.transaction_type = "CREDIT";
    $scope.accountdata.customerPayment.balance = 0;
  }
  
  $scope.PaymentReceipt = function () {
    $scope.accountdata.pendingBills = [];
    $scope.accountdata.customerPayment = {};
    $scope.accountdata.paymentledgers = [];
    $scope.paymentInitialize();
    $scope.accountdata.currentPage = "Payment Receipt";
  };

  $scope.ReceivePayment = function () {
    $scope.accountdata.pendingBills = [];
    $scope.accountdata.customerPayment = {};
    $scope.accountdata.paymentledgers = [];
    if (angular.isDefined($scope.accountdata.invoiceForm) && angular.isDefined($scope.accountdata.invoiceForm._id) &&
        $scope.accountdata.invoiceForm._id !== null && $scope.accountdata.invoiceForm._id !== "" &&
        angular.isDefined($scope.accountdata.invoiceForm.customer_id) && $scope.accountdata.invoiceForm.customer_id !== null &&
        $scope.accountdata.invoiceForm.customer_id !== "") {
      $scope.paymentInitialize();
      $scope.getPaymentdetails($scope.accountdata.invoiceForm.customer_id)
    }
  };

  $scope.savePayment = function () {
    if (angular.isUndefined($scope.accountdata.customerPayment.division_id) || (angular.isDefined($scope.accountdata.customerPayment.division_id) &&
        $scope.accountdata.customerPayment.division_id === "")) {
      Notification.error("Select division to save the payment");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.category_name) ||
        (angular.isDefined($scope.accountdata.customerPayment.category_name) && $scope.accountdata.customerPayment.category_name === "")) {
      Notification.error("Select category to save the payment");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.memo) || (angular.isDefined($scope.accountdata.customerPayment.memo) &&
                $scope.accountdata.customerPayment.memo === "")) {
      Notification.error("Memo field should not be empty");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.payee_id) || (angular.isDefined($scope.accountdata.customerPayment.payee_id) &&
                $scope.accountdata.customerPayment.payee_id === "")) {
      Notification.error("Please select customer to complete the payment");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.selectedledgers) ||
        angular.isUndefined($scope.accountdata.customerPayment.selectedledgers._id) ||
        (angular.isDefined($scope.accountdata.customerPayment.selectedledgers._id) &&
        $scope.accountdata.customerPayment.selectedledgers._id === "")) {
      Notification.error("Please select ledger to complete the payment");
      return false;
    }

    $scope.accountdata.customerPayment.ledger_id = angular.copy($scope.accountdata.customerPayment.selectedledgers._id);
    $scope.accountdata.customerPayment.ledger_name = angular.copy($scope.accountdata.customerPayment.selectedledgers.name);

    if (angular.isUndefined($scope.accountdata.customerPayment.transaction_amount) ||
        (angular.isDefined($scope.accountdata.customerPayment.transaction_amount) && ($scope.accountdata.customerPayment.transaction_amount === "" ||
        parseFloat($scope.accountdata.customerPayment.transaction_amount) <= 0))) {
      Notification.error("Payment amount must be greater than zero");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.pendingbills) || (angular.isDefined($scope.accountdata.customerPayment.pendingbills) &&
        $scope.accountdata.customerPayment.pendingbills.length === 0)) {
      Notification.error("There is no pending bills to save this payment");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.balance) || $scope.accountdata.customerPayment.balance === null ||
        $scope.accountdata.customerPayment.balance === "" || parseFloat($scope.accountdata.customerPayment.balance) > 0) {
      Notification.error("Payment amount should be allocated to bills without any pendings");
      return false;
    }
    if (parseFloat($scope.accountdata.customerPayment.balance) < 0) {
      Notification.error("Total allocated amount should be equal to the payment amount");
      return false;
    }

    if ($scope.checkpaymentBillallocation()) {
      const obj = {};
      obj.payment = angular.copy($scope.accountdata.customerPayment);
      delete obj.payment.pendingbills;
      AccountService.savePayment(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
              Notification.success(result.message);
              $scope.setLedger(angular.copy($scope.ledgerData));
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
  };

  $scope.updatePayment = function () {
    if (angular.isUndefined($scope.accountdata.customerPayment._id) || $scope.accountdata.customerPayment.division_id === null ||
                $scope.accountdata.customerPayment.division_id === "") {
      Notification.error("Division details not found for this transaction");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.division_id) || $scope.accountdata.customerPayment.division_id === null ||
                $scope.accountdata.customerPayment.division_id === "") {
      Notification.error("Division details not found for this transaction");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.memo) || $scope.accountdata.customerPayment.memo === null ||
        $scope.accountdata.customerPayment.memo === "") {
      Notification.error("Memo field should not be empty");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.payee_id) || $scope.accountdata.customerPayment.payee_id === null ||
        $scope.accountdata.customerPayment.payee_id === "") {
      Notification.error("Customer details not found for this payment");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.selectedledgers) || $scope.accountdata.customerPayment.selectedledgers === null ||
        angular.isUndefined($scope.accountdata.customerPayment.selectedledgers._id) ||
        $scope.accountdata.customerPayment.selectedledgers._id === null || $scope.accountdata.customerPayment.selectedledgers._id === "") {
      Notification.error("Ledger details not found for this payment");
      return false;
    }

    $scope.accountdata.customerPayment.ledger_id = angular.copy($scope.accountdata.customerPayment.selectedledgers._id);
    $scope.accountdata.customerPayment.ledger_name = angular.copy($scope.accountdata.customerPayment.selectedledgers.name);

    if (angular.isUndefined($scope.accountdata.customerPayment.transaction_amount) || $scope.accountdata.customerPayment.transaction_amount === "" ||
        $scope.accountdata.customerPayment.transaction_amount === null || parseFloat($scope.accountdata.customerPayment.transaction_amount) <= 0) {
      Notification.error("Payment amount must be greater than zero");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.pendingbills) || $scope.accountdata.customerPayment.pendingbills === null ||
                $scope.accountdata.customerPayment.pendingbills.length === 0) {
      Notification.error("There is no pending bills to update this payment");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.customerPayment.balance) || $scope.accountdata.customerPayment.balance === null ||
        $scope.accountdata.customerPayment.balance === "" || parseFloat($scope.accountdata.customerPayment.balance) > 0) {
      Notification.error("Payment amount should be allocated to bills without any pendings");
      return false;
    }
    if (parseFloat($scope.accountdata.customerPayment.balance) < 0) {
      Notification.error("Total allocated amount should be equal to the payment amount");
      return false;
    }

    if ($scope.checkpaymentBillallocation()) {
      const obj = {};
      obj.payment = angular.copy($scope.accountdata.customerPayment);
      delete obj.payment.pendingbills;
      AccountService.updatePayment(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
              Notification.success(result.message);
              $scope.setLedger(angular.copy($scope.ledgerData));
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
  }; 

  $scope.saveDebitnote = function () {
    if (angular.isUndefined($scope.accountdata.debitForm.division_id) || (angular.isDefined($scope.accountdata.debitForm.division_id) &&
        $scope.accountdata.debitForm.division_id === "")) {
      Notification.error("Select division to save this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.category_name) ||
        (angular.isDefined($scope.accountdata.debitForm.category_name) && $scope.accountdata.debitForm.category_name === "")) {
      Notification.error("Select category to save this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.memo) || (angular.isDefined($scope.accountdata.debitForm.memo) &&
                $scope.accountdata.debitForm.memo === "")) {
      Notification.error("Memo field should not be empty");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.payee_id) || (angular.isDefined($scope.accountdata.debitForm.payee_id) &&
                $scope.accountdata.debitForm.payee_id === "")) {
      Notification.error("Please select customer to complete this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.ledger_id) ||
        (angular.isDefined($scope.accountdata.debitForm.ledger_id) &&
        $scope.accountdata.debitForm.ledger_id === "")) {
      Notification.error("Please select ledger to complete this debit note entry");
      return false;
    }

    if (angular.isUndefined($scope.accountdata.debitForm.transaction_amount) ||
        (angular.isDefined($scope.accountdata.debitForm.transaction_amount) && ($scope.accountdata.debitForm.transaction_amount === "" ||
        parseFloat($scope.accountdata.debitForm.transaction_amount) <= 0))) {
      Notification.error("Debit amount must be greater than zero");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.pendingbills) || (angular.isDefined($scope.accountdata.debitForm.pendingbills) &&
        $scope.accountdata.debitForm.pendingbills.length === 0)) {
      Notification.error("There is no pending bills to save this debit entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.balance) || $scope.accountdata.debitForm.balance === null ||
        $scope.accountdata.debitForm.balance === "" || parseFloat($scope.accountdata.debitForm.balance) > 0) {
      Notification.error("Debit amount should be allocated to bills without any pendings");
      return false;
    }
    if (parseFloat($scope.accountdata.debitForm.balance) < 0) {
      Notification.error("Total allocated amount should be equal to the debit amount");
      return false;
    }

    if ($scope.checkDebitallocation()) {
      const obj = {};
      obj.payment = angular.copy($scope.accountdata.debitForm);
      delete obj.payment.pendingbills;
      
      AccountService.saveDebit(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
              Notification.success(result.message);
              $scope.setLedger(angular.copy($scope.ledgerData));
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
  };
   
  $scope.updateDebitnote = function () {
    if (angular.isUndefined($scope.accountdata.debitForm._id) || $scope.accountdata.debitForm.division_id === null ||
                $scope.accountdata.debitForm.division_id === "") {
      Notification.error("Division details not found for this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.division_id) || $scope.accountdata.debitForm.division_id === null ||
                $scope.accountdata.debitForm.division_id === "") {
      Notification.error("Division details not found for this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.memo) || $scope.accountdata.debitForm.memo === null ||
        $scope.accountdata.debitForm.memo === "") {
      Notification.error("Memo field should not be empty");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.payee_id) || $scope.accountdata.debitForm.payee_id === null ||
        $scope.accountdata.debitForm.payee_id === "") {
      Notification.error("Customer details not found for this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.ledger_id) || $scope.accountdata.debitForm.ledger_id === null || 
            $scope.accountdata.debitForm.ledger_id === "") {
      Notification.error("Ledger details not found for this debit note entry");
      return false;
    }

    if (angular.isUndefined($scope.accountdata.debitForm.transaction_amount) || $scope.accountdata.debitForm.transaction_amount === "" ||
        $scope.accountdata.debitForm.transaction_amount === null || parseFloat($scope.accountdata.debitForm.transaction_amount) <= 0) {
      Notification.error("Debit amount must be greater than zero");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.pendingbills) || $scope.accountdata.debitForm.pendingbills === null ||
                $scope.accountdata.debitForm.pendingbills.length === 0) {
      Notification.error("There is no pending bills to update this debit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.debitForm.balance) || $scope.accountdata.debitForm.balance === null ||
        $scope.accountdata.debitForm.balance === "" || parseFloat($scope.accountdata.debitForm.balance) > 0) {
      Notification.error("Debit amount should be allocated to bills without any pendings");
      return false;
    }
    if (parseFloat($scope.accountdata.debitForm.balance) < 0) {
      Notification.error("Total allocated amount should be equal to the debit amount");
      return false;
    }

    if ($scope.checkDebitallocation()) {
      const obj = {};
      obj.payment = angular.copy($scope.accountdata.debitForm);
      delete obj.payment.pendingbills;
      AccountService.updateDebit(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
              Notification.success(result.message);
              $scope.setLedger(angular.copy($scope.ledgerData));
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
  };
 
  $scope.saveCreditnote = function () {
    if (angular.isUndefined($scope.accountdata.creditForm.division_id) || (angular.isDefined($scope.accountdata.creditForm.division_id) &&
        $scope.accountdata.creditForm.division_id === "")) {
      Notification.error("Select division to save this credit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.category_name) ||
        (angular.isDefined($scope.accountdata.creditForm.category_name) && $scope.accountdata.creditForm.category_name === "")) {
      Notification.error("Select category to save this credit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.memo) || (angular.isDefined($scope.accountdata.creditForm.memo) &&
                $scope.accountdata.creditForm.memo === "")) {
      Notification.error("Memo field should not be empty");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.payee_id) || (angular.isDefined($scope.accountdata.creditForm.payee_id) &&
                $scope.accountdata.creditForm.payee_id === "")) {
      Notification.error("Please select customer to complete this credit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.ledger_id) || (angular.isDefined($scope.accountdata.creditForm.ledger_id) &&
        $scope.accountdata.creditForm.ledger_id === "")) {
      Notification.error("Please select ledger to complete this credit note entry");
      return false;
    }

    if (angular.isUndefined($scope.accountdata.creditForm.transaction_amount) ||
        (angular.isDefined($scope.accountdata.creditForm.transaction_amount) && ($scope.accountdata.creditForm.transaction_amount === "" ||
        parseFloat($scope.accountdata.creditForm.transaction_amount) <= 0))) {
      Notification.error("Credit amount must be greater than zero");
      return false;
    }
    
    const obj = {};
    obj.payment = angular.copy($scope.accountdata.creditForm);

    AccountService.saveCredit(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
            Notification.success(result.message);
            $scope.setLedger(angular.copy($scope.ledgerData));
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
  }; 
  
  $scope.updateCreditnote = function () {
    
    if (angular.isUndefined($scope.accountdata.creditForm.division_id) || (angular.isDefined($scope.accountdata.creditForm.division_id) &&
        $scope.accountdata.creditForm.division_id === "")) {
      Notification.error("Select division to save this credit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.category_name) ||
        (angular.isDefined($scope.accountdata.creditForm.category_name) && $scope.accountdata.creditForm.category_name === "")) {
      Notification.error("Select category to save this credit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.memo) || (angular.isDefined($scope.accountdata.creditForm.memo) &&
                $scope.accountdata.creditForm.memo === "")) {
      Notification.error("Memo field should not be empty");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.payee_id) || (angular.isDefined($scope.accountdata.creditForm.payee_id) &&
                $scope.accountdata.creditForm.payee_id === "")) {
      Notification.error("Please select customer to complete this credit note entry");
      return false;
    }
    if (angular.isUndefined($scope.accountdata.creditForm.ledger_id) || (angular.isDefined($scope.accountdata.creditForm.ledger_id) &&
        $scope.accountdata.creditForm.ledger_id === "")) {
      Notification.error("Please select ledger to complete this credit note entry");
      return false;
    }

    if (angular.isUndefined($scope.accountdata.creditForm.transaction_amount) ||
        (angular.isDefined($scope.accountdata.creditForm.transaction_amount) && ($scope.accountdata.creditForm.transaction_amount === "" ||
        parseFloat($scope.accountdata.creditForm.transaction_amount) <= 0))) {
      Notification.error("Credit amount must be greater than zero");
      return false;
    }

    const obj = {};
    obj.payment = angular.copy($scope.accountdata.creditForm);
    AccountService.updateCredit(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
            Notification.success(result.message);
            $scope.setLedger(angular.copy($scope.ledgerData));
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
  };
  
  $scope.checkpaymentBillallocation = function () {
    let allocated = false;
    let looplength = 0;
    $scope.accountdata.customerPayment.bills = [];
    if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance) && $scope.accountdata.customerPayment.customer_openingbalance !== null && 
            angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated) && 
            $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated !== "" && 
            parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated) > 0) {
      allocated = true;
    }
    angular.forEach($scope.accountdata.customerPayment.pendingbills, (bills, ind) => {
      if (angular.isDefined(bills.bill_id) && bills.bill_id !== "" && angular.isDefined(bills.amount_allocated) && bills.amount_allocated !== "" &&
                    parseFloat(bills.amount_allocated) > 0) {
        $scope.accountdata.customerPayment.bills.push(angular.copy(bills));
        allocated = true;
      }
      if (ind === $scope.accountdata.customerPayment.pendingbills.length - 1 && !allocated) {
        Notification.error("Allocate the transaction amount to bills to completed the payment transaction");
        return false;
      }

      looplength += 1;
    });
    if (looplength === $scope.accountdata.customerPayment.pendingbills.length && allocated) {
      return true;
    }
  };
  
  $scope.checkDebitallocation = function () {
    let allocated = false;
    let looplength = 0;
    $scope.accountdata.debitForm.bills = [];
    
    angular.forEach($scope.accountdata.debitForm.pendingbills, (bills, ind) => {
      if (angular.isDefined(bills.bill_id) && bills.bill_id !== "" && angular.isDefined(bills.amount_allocated) && bills.amount_allocated !== "" &&
                    parseFloat(bills.amount_allocated) > 0) {
        $scope.accountdata.debitForm.bills.push(angular.copy(bills));
        allocated = true;
      }
      if (ind === $scope.accountdata.debitForm.pendingbills.length - 1 && !allocated) {
        Notification.error("Allocate the debit amount to bills to completed this debit entry");
        return false;
      }

      looplength += 1;
    });
    if (looplength === $scope.accountdata.debitForm.pendingbills.length && allocated) {
      return true;
    }
  };

  function resetAllocatedamount() {
      if ($scope.accountdata.currentPage == 'DebitLedgerdetail') {
        angular.forEach($scope.accountdata.debitForm.pendingbills, (bill) => {
          if (angular.isDefined(bill.bill_id)) {
            if (angular.isDefined(bill.amount_allocated) && bill.amount_allocated !== "" && parseFloat(bill.amount_allocated) > 0) {
              const bal = angular.copy(bill.amount_allocated);
              if (angular.isDefined(bill.pending_balance) && bill.pending_balance !== "" && parseFloat(bill.pending_balance) > 0) {
                const balancedue = parseFloat(bill.balance_due) + parseFloat(bal);
                bill.balance_due = parseFloat(balancedue).toFixed(2);
              } else {
                bill.pending_balance = parseFloat(bal).toFixed(2);
                bill.balance_due = parseFloat(bill.pending_balance).toFixed(2);
              }
            }
            bill.amount_allocated = 0;
            bill.amount_allocated = parseFloat(bill.amount_allocated).toFixed(2);
          }
        });  
      } else {
        angular.forEach($scope.accountdata.customerPayment.pendingbills, (bill) => {
          if (angular.isDefined(bill.bill_id)) {
            if (angular.isDefined(bill.amount_allocated) && bill.amount_allocated !== "" && parseFloat(bill.amount_allocated) > 0) {
              const bal = angular.copy(bill.amount_allocated);
              if (angular.isDefined(bill.pending_balance) && bill.pending_balance !== "" && parseFloat(bill.pending_balance) > 0) {
                const balancedue = parseFloat(bill.balance_due) + parseFloat(bal);
                bill.balance_due = parseFloat(balancedue).toFixed(2);
              } else {
                bill.pending_balance = parseFloat(bal).toFixed(2);
                bill.balance_due = parseFloat(bill.pending_balance).toFixed(2);
              }
            }
            bill.amount_allocated = 0;
            bill.amount_allocated = parseFloat(bill.amount_allocated).toFixed(2);
          }
        });
        if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance) && $scope.accountdata.customerPayment.customer_openingbalance !== null && 
                angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.balance_id)) {
          if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated) && 
                  $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated !== "" && 
                  parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated) > 0) {
            const balc = angular.copy($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
            if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) && 
                    $scope.accountdata.customerPayment.customer_openingbalance.pending_balance !== "" && 
                    parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) > 0) {
              const balanceDue = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.balance_due) + parseFloat(balc);
              $scope.accountdata.customerPayment.customer_openingbalance.balance_due = parseFloat(balanceDue).toFixed(2);
            } else {
              $scope.accountdata.customerPayment.customer_openingbalance.pending_balance = parseFloat(balc).toFixed(2);
              $scope.accountdata.customerPayment.customer_openingbalance.balance_due = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance).toFixed(2);
            }
          } 
          $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = 0;
          $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated).toFixed(2);
        }
    }
  }

  $scope.allocatePayment = function () {
    if (angular.isDefined($scope.accountdata.customerPayment.transaction_amount) && $scope.accountdata.customerPayment.transaction_amount !== null &&
        $scope.accountdata.customerPayment.transaction_amount !== "" && parseFloat($scope.accountdata.customerPayment.transaction_amount) >= 0) {
      let transamount = parseFloat($scope.accountdata.customerPayment.transaction_amount) > 0 ?
        angular.copy(parseFloat($scope.accountdata.customerPayment.transaction_amount)) : 0;
      if (angular.isDefined($scope.accountdata.customerPayment.previous_owe) && $scope.accountdata.customerPayment.previous_owe !== null && 
              parseFloat($scope.accountdata.customerPayment.previous_owe)>0){
        transamount += parseFloat($scope.accountdata.customerPayment.previous_owe);
      }
      resetAllocatedamount();
      if (angular.isDefined($scope.accountdata.customerPayment.pendingbills) && $scope.accountdata.customerPayment.pendingbills.length>0) {
        angular.forEach($scope.accountdata.customerPayment.pendingbills, (bill, ind) => {
          if (angular.isDefined(bill.bill_id) && angular.isDefined(bill.pending_balance) && parseFloat(bill.pending_balance) > 0) {
            if (transamount >= parseFloat(bill.pending_balance)) {
              bill.amount_allocated = parseFloat(bill.pending_balance).toFixed(2);
              bill.balance_due = 0;

              transamount = parseFloat(transamount) - parseFloat(bill.amount_allocated);
              transamount = parseFloat(transamount).toFixed(2);
            } else {
              bill.amount_allocated = parseFloat(transamount).toFixed(2);
              bill.balance_due = parseFloat(bill.pending_balance) - parseFloat(bill.amount_allocated);
              transamount = parseFloat(transamount) - parseFloat(bill.amount_allocated);
              transamount = parseFloat(transamount).toFixed(2);
            }
          }

          if (ind === $scope.accountdata.customerPayment.pendingbills.length - 1) {
            if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance) && 
                    angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.balance_id) && 
                    angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) && 
                    parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) > 0) {
              if (transamount >= parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance)) {
                $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance).toFixed(2);
                $scope.accountdata.customerPayment.customer_openingbalance.balance_due = 0;

                transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                transamount = parseFloat(transamount).toFixed(2);
              } else {
                $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat(transamount).toFixed(2);
                $scope.accountdata.customerPayment.customer_openingbalance.balance_due = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                transamount = parseFloat(transamount).toFixed(2);
              }
            }
//          setTimeout(() => {
            $scope.accountdata.customerPayment.balance = parseFloat(transamount);
//          }, 500);
          }
        });
      } else {
        if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance) && 
                angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.balance_id) && 
                angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) && 
                parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) > 0) {
          if (transamount >= parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance)) {
            $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance).toFixed(2);
            $scope.accountdata.customerPayment.customer_openingbalance.balance_due = 0;

            transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
            transamount = parseFloat(transamount).toFixed(2);
          } else {
            $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat(transamount).toFixed(2);
            $scope.accountdata.customerPayment.customer_openingbalance.balance_due = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
            transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
            transamount = parseFloat(transamount).toFixed(2);
          }
          $scope.accountdata.customerPayment.balance = parseFloat(transamount);
        }
      }
    }
  };
  
  
  $scope.allocatebebitPayment = function () {
    if (angular.isDefined($scope.accountdata.debitForm.transaction_amount) && $scope.accountdata.debitForm.transaction_amount !== null &&
        $scope.accountdata.debitForm.transaction_amount !== "" && parseFloat($scope.accountdata.debitForm.transaction_amount) >= 0) {
      let transamount = parseFloat($scope.accountdata.debitForm.transaction_amount) > 0 ?
        angular.copy(parseFloat($scope.accountdata.debitForm.transaction_amount)) : 0;
        
      resetAllocatedamount();
      if (angular.isDefined($scope.accountdata.debitForm.pendingbills) && $scope.accountdata.debitForm.pendingbills.length>0) {
        angular.forEach($scope.accountdata.debitForm.pendingbills, (bill, ind) => {
          if (angular.isDefined(bill.bill_id) && angular.isDefined(bill.pending_balance) && parseFloat(bill.pending_balance) > 0) {
            if (transamount >= parseFloat(bill.pending_balance)) {
              bill.amount_allocated = parseFloat(bill.pending_balance).toFixed(2);
              bill.balance_due = 0;

              transamount = parseFloat(transamount) - parseFloat(bill.amount_allocated);
              transamount = parseFloat(transamount).toFixed(2);
            } else {
              bill.amount_allocated = parseFloat(transamount).toFixed(2);
              bill.balance_due = parseFloat(bill.pending_balance) - parseFloat(bill.amount_allocated);
              transamount = parseFloat(transamount) - parseFloat(bill.amount_allocated);
              transamount = parseFloat(transamount).toFixed(2);
            }
          }

          if (ind === $scope.accountdata.debitForm.pendingbills.length - 1) {
            $scope.accountdata.debitForm.balance = parseFloat(transamount);
          }
        });
      }
    }
  };

  $scope.PaymentAllocation = function (billloop) {
    if (angular.isDefined($scope.accountdata.customerPayment.transaction_amount) &&
        $scope.accountdata.customerPayment.transaction_amount !== null && $scope.accountdata.customerPayment.transaction_amount !== "" &&
        parseFloat($scope.accountdata.customerPayment.transaction_amount) > 0 && angular.isDefined(billloop) &&
        angular.isDefined(billloop.bill_id) && billloop.bill_id !== "") {
      let transamount = angular.copy(parseFloat($scope.accountdata.customerPayment.transaction_amount));
      if (angular.isDefined($scope.accountdata.customerPayment.previous_owe) && $scope.accountdata.customerPayment.previous_owe !== null && 
              parseFloat($scope.accountdata.customerPayment.previous_owe)>0){
        transamount += parseFloat($scope.accountdata.customerPayment.previous_owe);
      }
      if (angular.isDefined(billloop.amount_allocated) && parseFloat(billloop.amount_allocated) > 0) {
        if (parseFloat(billloop.amount_allocated) > parseFloat(billloop.pending_balance)) {
          billloop.amount_allocated = angular.copy(parseFloat(billloop.pending_balance).toFixed(2));
        }

        if (parseFloat(billloop.amount_allocated) > transamount) {
          billloop.amount_allocated = parseFloat(transamount).toFixed(2);
        }
      }
      if ($scope.accountdata.customerPayment.pendingbills && $scope.accountdata.customerPayment.pendingbills.length>0) {
        angular.forEach($scope.accountdata.customerPayment.pendingbills, (bill, ind) => {
          if (angular.isDefined(bill.bill_id) && angular.isDefined(bill.pending_balance) && bill.pending_balance !== "" &&
              parseFloat(bill.pending_balance) > 0 && parseFloat(transamount)>0) {
            if (angular.isUndefined(bill.amount_allocated) || bill.amount_allocated === "" || bill.amount_allocated === null) {
              bill.amount_allocated = 0;
            }
            bill.balance_due = parseFloat(bill.pending_balance) - parseFloat(bill.amount_allocated);
            transamount -= parseFloat(bill.amount_allocated);
          } else {
            bill.amount_allocated = 0;
            bill.balance_due = parseFloat(bill.pending_balance);
          }
          if (ind === $scope.accountdata.customerPayment.pendingbills.length - 1) {
            if (angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance) && 
                angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.balance_id) && 
                angular.isDefined($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) && 
                parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) > 0) {
              if (transamount >= parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance)) {
                $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance).toFixed(2);
                $scope.accountdata.customerPayment.customer_openingbalance.balance_due = 0;

                transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                transamount = parseFloat(transamount).toFixed(2);
              } else {
                $scope.accountdata.customerPayment.customer_openingbalance.amount_allocated = parseFloat(transamount).toFixed(2);
                $scope.accountdata.customerPayment.customer_openingbalance.balance_due = parseFloat($scope.accountdata.customerPayment.customer_openingbalance.pending_balance) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
                transamount = parseFloat(transamount).toFixed(2);
              }
            }
            $scope.accountdata.customerPayment.balance = parseFloat(transamount);
          }
        });
      }
    }
  };
  
  $scope.debitPaymentAllocation = function (billloop) {
    if (angular.isDefined($scope.accountdata.debitForm.transaction_amount) &&
        $scope.accountdata.debitForm.transaction_amount !== null && $scope.accountdata.debitForm.transaction_amount !== "" &&
        parseFloat($scope.accountdata.debitForm.transaction_amount) > 0 && angular.isDefined(billloop) &&
        angular.isDefined(billloop.bill_id) && billloop.bill_id !== "") {
      let transamount = angular.copy(parseFloat($scope.accountdata.debitForm.transaction_amount));
      
      if (angular.isDefined(billloop.amount_allocated) && parseFloat(billloop.amount_allocated) > 0) {
        if (parseFloat(billloop.amount_allocated) > parseFloat(billloop.pending_balance)) {
          billloop.amount_allocated = angular.copy(parseFloat(billloop.pending_balance).toFixed(2));
        }

        if (parseFloat(billloop.amount_allocated) > transamount) {
          billloop.amount_allocated = parseFloat(transamount).toFixed(2);
        }
      }
      if ($scope.accountdata.debitForm.pendingbills && $scope.accountdata.debitForm.pendingbills.length>0) {
        angular.forEach($scope.accountdata.debitForm.pendingbills, (bill, ind) => {
          if (angular.isDefined(bill.bill_id) && angular.isDefined(bill.pending_balance) && bill.pending_balance !== "" &&
              parseFloat(bill.pending_balance) > 0 && parseFloat(transamount)>0) {
            if (angular.isUndefined(bill.amount_allocated) || bill.amount_allocated === "" || bill.amount_allocated === null) {
              bill.amount_allocated = 0;
            }
            bill.balance_due = parseFloat(bill.pending_balance) - parseFloat(bill.amount_allocated);
            transamount -= parseFloat(bill.amount_allocated);
          } else {
            bill.amount_allocated = 0;
            bill.balance_due = parseFloat(bill.pending_balance);
          }
          if (ind === $scope.accountdata.debitForm.pendingbills.length - 1) {
            $scope.accountdata.debitForm.balance = parseFloat(transamount);
          }
        });
      }
    }
  };
  
  $scope.PaymentAllocationOpeningbal = function (billloop) {
    if (angular.isDefined($scope.accountdata.customerPayment.transaction_amount) &&
        $scope.accountdata.customerPayment.transaction_amount !== null && $scope.accountdata.customerPayment.transaction_amount !== "" &&
        parseFloat($scope.accountdata.customerPayment.transaction_amount) > 0 && angular.isDefined(billloop) &&
        angular.isDefined(billloop.balance_id) && billloop.balance_id !== "") {
      let transamount = angular.copy(parseFloat($scope.accountdata.customerPayment.transaction_amount));
      if (angular.isDefined($scope.accountdata.customerPayment.previous_owe) && $scope.accountdata.customerPayment.previous_owe !== null && 
              parseFloat($scope.accountdata.customerPayment.previous_owe)>0){
        transamount += parseFloat($scope.accountdata.customerPayment.previous_owe);
      }
      
      if (angular.isDefined(billloop.amount_allocated) && parseFloat(billloop.amount_allocated) > 0) {
        if (parseFloat(billloop.amount_allocated) > parseFloat(billloop.pending_balance)) {
          billloop.amount_allocated = angular.copy(parseFloat(billloop.pending_balance).toFixed(2));
        }

        if (parseFloat(billloop.amount_allocated) > transamount) {
          billloop.amount_allocated = parseFloat(transamount).toFixed(2);
        }
        transamount = parseFloat(transamount) - parseFloat($scope.accountdata.customerPayment.customer_openingbalance.amount_allocated);
        transamount = parseFloat(transamount).toFixed(2);
      }
      if ($scope.accountdata.customerPayment.pendingbills && $scope.accountdata.customerPayment.pendingbills.length>0) {
        angular.forEach($scope.accountdata.customerPayment.pendingbills, (bill, ind) => {
          if (angular.isDefined(bill.bill_id) && angular.isDefined(bill.pending_balance) && bill.pending_balance !== "" &&
              parseFloat(bill.pending_balance) > 0 && parseFloat(transamount)>0) {
            if (angular.isUndefined(bill.amount_allocated) || bill.amount_allocated === "" || bill.amount_allocated === null) {
              bill.amount_allocated = 0;
            }
            bill.balance_due = parseFloat(bill.pending_balance) - parseFloat(bill.amount_allocated);
            transamount -= parseFloat(bill.amount_allocated);
          }
          if (ind === $scope.accountdata.customerPayment.pendingbills.length - 1) {
            $scope.accountdata.customerPayment.balance = parseFloat(transamount);
          }
        });
      }
    }
  };
  
  // Save customer GST Treatment details
  $scope.saveCustomerGstinDetails = function () {
    if (angular.isUndefined($scope.accountdata.invoiceForm.gstTreatmentcopy) || $scope.accountdata.invoiceForm.gstTreatmentcopy === null ||
        angular.isUndefined($scope.accountdata.invoiceForm.gstTreatmentcopy._id) ||
        angular.isUndefined($scope.accountdata.invoiceForm.gstTreatmentcopy.name)) {
      Notification.warning("Please select GST Treatment.");
      return false;
    }

    if ($scope.accountdata.invoiceForm.gstTreatmentcopy.name === "Overseas" || $scope.accountdata.invoiceForm.gstTreatmentcopy.name === "Consumer" ||
                $scope.accountdata.invoiceForm.gstTreatmentcopy.name === "Unregistered Business") {
      $scope.accountdata.invoiceForm.gstin = "";
    }
    if ($scope.accountdata.invoiceForm.gstTreatmentcopy.name === "Overseas") {
      $scope.accountdata.invoiceForm.stateCopy = {};
    }
    if ($scope.accountdata.invoiceForm.gstTreatmentcopy.name !== "Overseas" && $scope.accountdata.invoiceForm.gstTreatmentcopy.name !== "Consumer" &&
        $scope.accountdata.invoiceForm.gstTreatmentcopy.name !== "Unregistered Business" &&
        (angular.isUndefined($scope.accountdata.invoiceForm.gstin) || $scope.accountdata.invoiceForm.gstin === null ||
        $scope.accountdata.invoiceForm.gstin === "")) {
      Notification.warning("GSTIN number is invalid.");
      return false;
    }

    if ($scope.accountdata.invoiceForm.gstTreatmentcopy.name !== "Overseas" && (angular.isUndefined($scope.accountdata.invoiceForm.stateCopy) ||
        $scope.accountdata.invoiceForm.stateCopy === null || $scope.accountdata.invoiceForm.stateCopy === "" ||
        angular.isUndefined($scope.accountdata.invoiceForm.stateCopy._id) || $scope.accountdata.invoiceForm.stateCopy._id === null ||
        $scope.accountdata.invoiceForm.stateCopy._id === "")) {
      Notification.warning("Please select place of supply.");
      return false;
    }

    if ($scope.accountdata.invoiceForm.savegstDetails) {
      if (angular.isDefined($scope.accountdata.invoiceForm.customer_id) && $scope.accountdata.invoiceForm.customer_id !== null) {
        const obj = {};
        obj._id = $scope.accountdata.invoiceForm.customer_id;
        obj.gstTreatment = $scope.accountdata.invoiceForm.gstTreatmentcopy._id;
        obj.gstin = angular.isDefined($scope.accountdata.invoiceForm.gstin) ? $scope.accountdata.invoiceForm.gstin : "";
        obj.placeofSupply = (angular.isDefined($scope.accountdata.invoiceForm.stateCopy) &&
            angular.isDefined($scope.accountdata.invoiceForm.stateCopy._id)) ? angular.copy($scope.accountdata.invoiceForm.stateCopy._id) : "";
        $scope.accountdata.pageLoader = true;

        CustomerService.savegstDetails(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              Notification.success(result.message);
              $scope.accountdata.invoiceForm.placeofSupply = "";
              $scope.accountdata.invoiceForm.gstTreatment = $scope.accountdata.invoiceForm.gstTreatmentcopy._id;
              $scope.accountdata.invoiceForm.placeofSupply = (angular.isDefined($scope.accountdata.invoiceForm.stateCopy) &&
                angular.isDefined($scope.accountdata.invoiceForm.stateCopy._id)) ? angular.copy($scope.accountdata.invoiceForm.stateCopy._id) : "";
            } else {
              Notification.error(result.message);
            }
          }

          $scope.accountdata.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountdata.pageLoader = false;
        });
      }
    } else {
      $scope.accountdata.invoiceForm.placeofSupply = "";
      $scope.accountdata.invoiceForm.gstTreatment = $scope.accountdata.invoiceForm.gstTreatmentcopy._id;
      $scope.accountdata.invoiceForm.placeofSupply = (angular.isDefined($scope.accountdata.invoiceForm.stateCopy) &&
        angular.isDefined($scope.accountdata.invoiceForm.stateCopy._id)) ? angular.copy($scope.accountdata.invoiceForm.stateCopy._id) : "";
    }
  };

  $scope.assignCustomergsttreatment = function (customer) {
    if (angular.isDefined(customer.gstTreatmentcopy) && customer.gstTreatmentcopy !== null &&
        angular.isDefined(customer.gstTreatmentcopy._id) && customer.gstTreatmentcopy._id !== null) {
      if (customer.gstTreatmentcopy.name === "Overseas" || customer.gstTreatmentcopy.name === "Consumer" ||
        customer.gstTreatmentcopy.name === "Unregistered Business") {
        customer.gstin = "";
      }
      if (customer.gstTreatmentcopy.name === "Overseas") {
        customer.stateCopy = {};
      }
    }
  };

  $scope.getCompletedorders = function () {
    if (angular.isDefined($scope.accountdata.invoiceForm.customer_id) && $scope.accountdata.invoiceForm.customer_id !== null) {
      if (angular.isUndefined($scope.filterData.selectedBranch) || $scope.filterData.selectedBranch === null ||
        $scope.filterData.selectedBranch === "") {
        Notification.warning("Please select the division.");
        return false;
      }
      $scope.accountdata.pageLoader = true;
      const objs = {};
      objs.customerID = $scope.accountdata.invoiceForm.customer_id;
      objs.customerGroup = $scope.accountdata.invoiceForm.customerGroup;
      objs.divisionID = angular.copy($scope.filterData.selectedBranch);

      OrderService.getcompletedOrdersbycustomer(objs, (result) => {
        if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Orders) &&
            result.data.Orders !== null && result.data.Orders.length > 0) {
          angular.forEach(result.data.Orders, (ord) => {
            if (angular.isDefined(ord._id) && angular.isDefined(ord.order_no) && angular.isDefined(ord.outward_delivery) &&
                ord.outward_delivery !== null && ord.outward_delivery.length > 0) {
              const obj = {};
              obj._id = angular.copy(ord._id);
              obj.order_no = angular.copy(ord.order_no);
              obj.order_date = angular.copy(ord.order_date);
              obj.order_reference_no = angular.copy(ord.order_reference_no);
              obj.followupPerson = angular.isDefined(ord.followupPerson) ? angular.copy(ord.followupPerson) : {};
              obj.contactperson = angular.copy(ord.contactperson);
              obj.customer_dc_no = angular.copy(ord.customer_dc_no);
              obj.customer_dc_date = angular.copy(ord.customer_dc_date);
              obj.dyeing = angular.copy(ord.dyeing);
              obj.dyeing_dc_no = angular.copy(ord.dyeing_dc_no);
              obj.dyeing_dc_date = angular.copy(ord.dyeing_dc_date);

              $scope.accountdata.Joblist.push(angular.copy(obj));
            }
          });

          if (angular.isDefined(result.data.Group) && result.data.Group !== null && angular.isDefined(result.data.Group.group_discount) &&
                            result.data.Group.group_discount !== null && result.data.Group.group_discount.length > 0) {
            $scope.accountdata.customerDiscount = angular.copy(result.data.Group.group_discount);
          }
        } else {
          Notification.warning("No job cards found.");
        }
        $scope.accountdata.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountdata.pageLoader = false;
      });
    }
  };

  $scope.changeClass = function (options) {
    const widget = options.methods.widget();
    // remove default class, use bootstrap style
    widget.removeClass("ui-menu ui-corner-all ui-widget-content").addClass("dropdown-menu dropnew_style");
  };

  $scope.customerOption = {
    options: {
      html: true,
      minLength: 2,
      onlySelectValid: true,
      outHeight: 50,
      source: function (request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const objt = {};
          objt.term = angular.copy(request.term);
          objt.division_id = angular.copy($scope.filterData.selectedBranch);

          CustomerService.getCustomer(objt, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
                angular.isDefined(result.data) && result.data.length > 0) {
              if (angular.isDefined($scope.accountdata.jobselected)) {
                $scope.accountdata.jobselected = undefined;
                $scope.accountdata.invoiceForm.jobs = [];
                $scope.accountdata.invoiceForm.items = [];
                $scope.accountdata.invoiceForm.salestax_total = 0;
                $scope.accountdata.invoiceForm.servicetax_total = 0;
                $scope.accountdata.invoiceForm.subtotal = 0;
                $scope.accountdata.invoiceForm.roundoff = "0.00";
                $scope.accountdata.invoiceForm.total = 0;
              }
              angular.forEach(result.data, (customer, ind) => {
                const obj = {};
                obj.label = customer.name;
                obj.value = customer._id;
                obj.mobile_no = customer.mobile_no;
                obj.address = [];
                obj.gstTreatment = angular.isDefined(customer.gstTreatment) ? angular.copy(customer.gstTreatment) : "";
                obj.gstin = angular.isDefined(customer.gstin) ? angular.copy(customer.gstin) : "";
                obj.placeofSupply = angular.isDefined(customer.placeofSupply) ? angular.copy(customer.placeofSupply) : "";
                obj.customerGroup = angular.isDefined(customer.group) ? angular.copy(customer.group) : "";
                if (customer.address.length > 0) {
                  angular.forEach(customer.address, (addr, indx) => {
                    if (angular.isDefined(addr._id) && ((angular.isDefined(addr.is_default) && addr.is_default) ||
                    (angular.isDefined(addr.is_invoice) && addr.is_invoice))) {
                      const objs = {};
                      objs._id = angular.copy(addr._id);
                      if (angular.isDefined(addr.is_default)) {
                        objs.is_default = angular.copy(addr.is_default);
                      }
                      if (angular.isDefined(addr.is_invoice)) {
                        objs.is_invoice = angular.copy(addr.is_invoice);
                      }
                      if (angular.isDefined(addr.latitude)) {
                        objs.latitude = angular.copy(addr.latitude);
                      }
                      if (angular.isDefined(addr.longitude)) {
                        objs.longitude = angular.copy(addr.longitude);
                      }
                      if (angular.isDefined(addr.address_line)) {
                        objs.billing_address_line = angular.copy(addr.address_line);
                      }
                      if (angular.isDefined(addr.area)) {
                        objs.billing_area = angular.copy(addr.area);
                      }
                      if (angular.isDefined(addr.city)) {
                        objs.billing_city = angular.copy(addr.city);
                      }
                      if (angular.isDefined(addr.state)) {
                        objs.billing_state = angular.copy(addr.state);
                      }
                      if (angular.isDefined(addr.pincode)) {
                        objs.billing_pincode = angular.copy(addr.pincode);
                      }
                      if (angular.isDefined(addr.landmark)) {
                        objs.billing_landmark = angular.copy(addr.landmark);
                      }
                      if (angular.isDefined(addr.contact_no)) {
                        objs.billing_contact_no = angular.copy(addr.contact_no);
                      }
                      if (angular.isDefined(addr.company_name)) {
                        objs.billing_company_name = angular.copy(addr.company_name);
                      }
                      if (angular.isDefined(addr.gstin)) {
                        objs.billing_gstin = angular.copy(addr.gstin);
                      }
                      obj.address.push(objs);
                    }
                    if (indx === customer.address.length - 1) {
                      data.push(obj);
                    }
                  });
                } else {
                  data.push(obj);
                }
                if (ind === result.data.length - 1) {
                  return response(data);
                }
              });
            } else {
              return response(data);
            }
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus: function (event) {
        event.preventDefault();
        return false;
      },
      change: function (event) {
        event.preventDefault();
        return false;
      },
      select: function (event, ui) {
        event.preventDefault();
        $scope.accountdata.invoiceForm.customer_id = "";
        $scope.accountdata.invoiceForm.customer_name = "";
        $scope.accountdata.invoiceForm.customer_mobile_no = "";
        $scope.accountdata.customeraddress = [];
        $scope.accountdata.invoiceForm.billing_address = {};
        $scope.accountdata.invoiceForm.default_address = {};
        $scope.accountdata.invoiceForm.gstTreatment = "";
        $scope.accountdata.invoiceForm.gstin = "";
        $scope.accountdata.invoiceForm.placeofSupply = "";
        $scope.accountdata.invoiceForm.customerGroup = "";

        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.accountdata.invoiceForm.customer_id = angular.copy(ui.item.value);
          $scope.accountdata.invoiceForm.customer_name = angular.copy(ui.item.label);
          $scope.accountdata.invoiceForm.gstTreatment = angular.copy(ui.item.gstTreatment);
          $scope.accountdata.invoiceForm.gstin = angular.copy(ui.item.gstin);
          $scope.accountdata.invoiceForm.placeofSupply = angular.copy(ui.item.placeofSupply);
          $scope.accountdata.invoiceForm.customerGroup = angular.copy(ui.item.customerGroup);

          if (angular.isDefined(ui.item.mobile_no) && ui.item.mobile_no !== null && ui.item.mobile_no !== "") {
            $scope.accountdata.invoiceForm.customer_mobile_no = angular.copy(ui.item.mobile_no);
          }

          if (angular.isDefined(ui.item.address) && ui.item.address !== null && ui.item.address.length > 0) {
            angular.forEach(ui.item.address, (adr, adind) => {
              if (angular.isDefined(adr.is_invoice) && adr.is_invoice) {
                $scope.accountdata.invoiceForm.billing_address = angular.copy(adr);
              }
              if (angular.isDefined(adr.is_default) && adr.is_default) {
                $scope.accountdata.invoiceForm.default_address = angular.copy(adr);
              }
              if (adind === ui.item.address.length - 1 && angular.isUndefined($scope.accountdata.invoiceForm.billing_address.billing_address_line)) {
                $scope.accountdata.invoiceForm.billing_address = angular.copy($scope.accountdata.invoiceForm.default_address);
              }
              $scope.accountdata.customeraddress.push(angular.copy(adr));
            });
          }
          $scope.accountdata.invoiceForm.items = [];
          $scope.accountdata.specialprice = [];
          $scope.accountdata.customerDiscount = [];
          $scope.accountdata.Joblist = [];
          $scope.getCompletedorders();
        }
      },
    },
  };
  
  $scope.paycustomerOption = {
    options: {
      html: true,
      minLength: 2,
      onlySelectValid: true,
      outHeight: 50,
      source: function (request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const objt = {};
          objt.term = angular.copy(request.term);
          objt.division_id = angular.copy($scope.filterData.selectedBranch);

          CustomerService.getCustomer(objt, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
                angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (customer, ind) => {
                const obj = {};
                obj.label = customer.name;
                obj.value = customer._id;
                obj.mobile_no = customer.mobile_no;
                
                data.push(obj);
                if (ind === result.data.length - 1) {
                  return response(data);
                }
              });
            } else {
              return response(data);
            }
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus: function (event) {
        event.preventDefault();
        return false;
      },
      change: function (event) {
        event.preventDefault();
        return false;
      },
      select: function (event, ui) {
        event.preventDefault();
        $scope.accountdata.customerPayment.customer_name = "";
        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.accountdata.customerPayment.payee_id = angular.copy(ui.item.value);
          $scope.accountdata.customerPayment.payee_name = angular.copy(ui.item.label);
          $scope.accountdata.customerPayment.customer_name = angular.copy(ui.item.label);
          
          if (angular.isDefined(ui.item.mobile_no) && ui.item.mobile_no !== null && ui.item.mobile_no !== "") {
            $scope.accountdata.customerPayment.payee_mobileno = angular.copy(ui.item.mobile_no);
          }
          $scope.accountdata.customerPayment.pendingbills = [];
          $scope.accountdata.customerPayment.customer_openingbalance = null;
          $scope.accountdata.customerPayment.previous_owe = null;
          $scope.getPaymentdetails($scope.accountdata.customerPayment.payee_id);
        }
      },
    },
  };
  
  $scope.debitcustomerOption = {
    options: {
      html: true,
      minLength: 2,
      onlySelectValid: true,
      outHeight: 50,
      source: function (request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const objt = {};
          objt.term = angular.copy(request.term);
          objt.division_id = angular.copy($scope.filterData.selectedBranch);

          CustomerService.getCustomer(objt, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
                angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (customer, ind) => {
                const obj = {};
                obj.label = customer.name;
                obj.value = customer._id;
                obj.mobile_no = customer.mobile_no;
                
                data.push(obj);
                if (ind === result.data.length - 1) {
                  return response(data);
                }
              });
            } else {
              return response(data);
            }
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus: function (event) {
        event.preventDefault();
        return false;
      },
      change: function (event) {
        event.preventDefault();
        return false;
      },
      select: function (event, ui) {
        event.preventDefault();
        $scope.accountdata.debitForm.customer_name = "";
        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.accountdata.debitForm.payee_id = angular.copy(ui.item.value);
          $scope.accountdata.debitForm.payee_name = angular.copy(ui.item.label);
          $scope.accountdata.debitForm.customer_name = angular.copy(ui.item.label);
          
          if (angular.isDefined(ui.item.mobile_no) && ui.item.mobile_no !== null && ui.item.mobile_no !== "") {
            $scope.accountdata.debitForm.payee_mobileno = angular.copy(ui.item.mobile_no);
          }
          $scope.accountdata.debitForm.pendingbills = [];
          $scope.getPendingbills($scope.accountdata.debitForm.payee_id);
        }
      },
    },
  };
    
  $scope.creditcustomerOption = {
    options: {
      html: true,
      minLength: 2,
      onlySelectValid: true,
      outHeight: 50,
      source: function (request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const objt = {};
          objt.term = angular.copy(request.term);
          objt.division_id = angular.copy($scope.filterData.selectedBranch);

          CustomerService.getCustomer(objt, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
                angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (customer, ind) => {
                const obj = {};
                obj.label = customer.name;
                obj.value = customer._id;
                obj.mobile_no = customer.mobile_no;
                obj.user_type = customer.user_type;
                
                data.push(obj);
                if (ind === result.data.length - 1) {
                  return response(data);
                }
              });
            } else {
              return response(data);
            }
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus: function (event) {
        event.preventDefault();
        return false;
      },
      change: function (event) {
        event.preventDefault();
        return false;
      },
      select: function (event, ui) {
        event.preventDefault();
        $scope.accountdata.creditForm.customer_name = "";
        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          $scope.accountdata.creditForm.payee_id = angular.copy(ui.item.value);
          $scope.accountdata.creditForm.payee_name = angular.copy(ui.item.label);
//          $scope.accountdata.creditForm.user_type = angular.copy(ui.item.user_type);
          $scope.accountdata.creditForm.customer_name = angular.copy(ui.item.label);
          
          if (angular.isDefined(ui.item.mobile_no) && ui.item.mobile_no !== null && ui.item.mobile_no !== "") {
            $scope.accountdata.creditForm.payee_mobileno = angular.copy(ui.item.mobile_no);
          }
        }
      },
    },
  };

  // Invoice Address Change
  $scope.invoiceSelectaddress = function (addr) {
    if (angular.isDefined(addr._id) && addr._id) {
      $scope.accountdata.invoiceForm.billing_address_line = angular.isDefined(addr.billing_address_line) ?
        angular.copy(addr.billing_address_line) : "";

      $scope.accountdata.invoiceForm.billing_area = angular.isDefined(addr.billing_area) ? angular.copy(addr.billing_area) : "";

      $scope.accountdata.invoiceForm.billing_city = angular.isDefined(addr.billing_city) ? angular.copy(addr.billing_city) : "";

      $scope.accountdata.invoiceForm.billing_state = angular.isDefined(addr.billing_state) ? angular.copy(addr.billing_state) : "";

      $scope.accountdata.invoiceForm.billing_pincode = angular.isDefined(addr.billing_pincode) ? angular.copy(addr.billing_pincode) : "";

      $scope.accountdata.invoiceForm.billing_landmark = angular.isDefined(addr.billing_landmark) ? angular.copy(addr.billing_landmark) : "";

      $scope.accountdata.invoiceForm.billing_contact_no = angular.isDefined(addr.billing_contact_no) ? angular.copy(addr.billing_contact_no) : "";
    }
  };

  $scope.initializeData();
  
  socket.on("ledgerdetails", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result._id) && angular.isDefined(result.opening_balance)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result._id) {
            led.current_balance = parseFloat(led.current_balance) + parseFloat(result.opening_balance);
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result._id) {
            led.current_balance = parseFloat(led.current_balance) + parseFloat(result.opening_balance);
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result._id) {
          $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.opening_balance);
        }
    }
  });
  
  socket.on("newledgertrans", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result._id) && angular.isDefined(result.transaction_amount)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            }
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            }
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result.ledger_id) {
          if (result.transaction_type === "DEBIT") {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.transaction_amount);
          } else {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.transaction_amount);
          }
          $scope.accountdata.accountsTransaction.push(angular.copy(result));
        }
    }
  });
    
  socket.on("newcreditdebittrans", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result._id) && angular.isDefined(result.transaction_amount)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            }
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            }
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result.ledger_id) {
          if (result.transaction_type === "DEBIT") {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.transaction_amount);
          } else {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.transaction_amount);
          }
        }
    }
  });
   
  socket.on("updateledgertrans", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result.newtrans) && angular.isDefined(result.oldtrans) && 
            angular.isDefined(result.newtrans._id) && angular.isDefined(result.newtrans.transaction_amount)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result.newtrans.ledger_id) {
            if (result.newtrans.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.oldtrans.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.oldtrans.transaction_amount);
            }
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result.newtrans.ledger_id) {
            if (result.newtrans.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.oldtrans.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.oldtrans.transaction_amount);
            }
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result.newtrans.ledger_id) {
          if (result.newtrans.transaction_type === "DEBIT") {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.newtrans.transaction_amount);
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.oldtrans.transaction_amount);
          } else {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.newtrans.transaction_amount);
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.oldtrans.transaction_amount);
          }
          angular.forEach($scope.accountdata.accountsTransaction, function (trans) {
            if (angular.isDefined(trans) && trans !== null && angular.isDefined(trans._id) && trans._id === result.newtrans._id) {
                if (angular.isDefined(result.newtrans.category_id)) {
                  trans.category_id = angular.copy(result.newtrans.category_id);
                }
                if (angular.isDefined(result.newtrans.category_name)) {
                  trans.category_name = angular.copy(result.newtrans.category_name);
                }
                if (angular.isDefined(result.newtrans.cheque_no)) {
                  trans.cheque_no = angular.copy(result.newtrans.cheque_no);
                }
                if (angular.isDefined(result.newtrans.ledger_balance)) {
                  trans.ledger_balance = angular.copy(result.newtrans.ledger_balance);
                }
                if (angular.isDefined(result.newtrans.ledger_id)) {
                  trans.ledger_id = angular.copy(result.newtrans.ledger_id);
                }
                if (angular.isDefined(result.newtrans.ledger_name)) {
                  trans.ledger_name = angular.copy(result.newtrans.ledger_name);
                }
                if (angular.isDefined(result.newtrans.memo)) {
                  trans.memo = angular.copy(result.newtrans.memo);
                }
                if (angular.isDefined(result.newtrans.payee_name)) {
                  trans.payee_name = angular.copy(result.newtrans.payee_name);
                }
                if (angular.isDefined(result.newtrans.transaction_amount)) {
                  trans.transaction_amount = angular.copy(result.newtrans.transaction_amount);
                }
            }
          });
        }
    }
  });
  
  socket.on("updatedebitcredittrans", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result.newtrans) && angular.isDefined(result.oldtrans) && 
            angular.isDefined(result.newtrans._id) && angular.isDefined(result.newtrans.transaction_amount)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result.newtrans.ledger_id) {
            if (result.newtrans.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.oldtrans.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.oldtrans.transaction_amount);
            }
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result.newtrans.ledger_id) {
            if (result.newtrans.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.oldtrans.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.newtrans.transaction_amount);
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.oldtrans.transaction_amount);
            }
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result.newtrans.ledger_id) {
          if (result.newtrans.transaction_type === "DEBIT") {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.newtrans.transaction_amount);
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.oldtrans.transaction_amount);
          } else {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.newtrans.transaction_amount);
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.oldtrans.transaction_amount);
          }
        }
    }
  }); 
  
  socket.on("deletetrans", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result._id) && angular.isDefined(result.transaction_amount)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            }
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            }
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result.ledger_id) {
          if (result.transaction_type === "DEBIT") {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.transaction_amount);
          } else {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.transaction_amount);
          }
        }
    }
  });
      
  socket.on("deletecreditdebittrans", (result) => {
    if (angular.isDefined(result) && result !== null && angular.isDefined(result._id) && angular.isDefined(result.transaction_amount)) {        
        angular.forEach($scope.accountdata.ledgerTotal, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && angular.isDefined(led.current_balance) && 
                  angular.isDefined(led._id.ledger_id) && led._id.ledger_id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            }
          }
        });
        angular.forEach($scope.accountdata.ledgerDetail, (led) => {
          if (angular.isDefined(led) && led !== null && angular.isDefined(led._id) && led._id !== null && 
                  angular.isDefined(led.current_balance) && led._id === result.ledger_id) {
            if (result.transaction_type === "DEBIT") {
              led.current_balance = parseFloat(led.current_balance) + parseFloat(result.transaction_amount);
            } else {
              led.current_balance = parseFloat(led.current_balance) - parseFloat(result.transaction_amount);
            }
          }
        });
        if (angular.isDefined($scope.ledgerData) && $scope.ledgerData !== null && angular.isDefined($scope.ledgerData._id) && 
                angular.isDefined($scope.ledgerData.current_balance) && $scope.ledgerData._id === result.ledger_id) {
          if (result.transaction_type === "DEBIT") {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) + parseFloat(result.transaction_amount);
          } else {
            $scope.ledgerData.current_balance = parseFloat($scope.ledgerData.current_balance) - parseFloat(result.transaction_amount);
          }
        }
    }
  });
});
