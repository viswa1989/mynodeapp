/* global angular */
angular.module("divisionsCtrl", []).controller("DivisionsController", ($scope, $routeParams, DivisionService, $rootScope, Notification,
  $uibModal, $log, manageProcessService, DivisionAccountService, GrnStockService, PurchaseService, CategoryService, ProductService,
  StockService, VendorService, UserService, USER_ROLE, UtiliizedstockService, socket, DateformatstorageService, DATEFORMATS,
  $filter, commonobjectService, $q) => { // Setup preferences ctrl
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.error = "";
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  // Codes scope variables
  $scope.divisionData = {};
  $scope.divisionForm = {};
  $scope.divisionaccountForm = {};

  $scope.divisionData.divisions = [];
  $scope.divisionData.pageLoad = true;
  $scope.divisionData.contentLoad = false;
  $scope.divisionData.eventLoad = false;
  $scope.divisionData.loadedfile = "";
  $scope.divisionData.process = "";
  $scope.divisionData.statelist = [];
  $scope.divisionData.formsubmission = false;
  $scope.divisionData.divisionView = false;
  $scope.divisionData.menuheader = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/divisions_menu.html`;

  // Division User scope variables
  $scope.userForm = {};
  $scope.userData = {};
  $scope.stockData = {};
  $scope.inputType = "password";
  $scope.showadminuserform = false;
  $scope.userData.roles = [];
  $scope.userData.privileges = [];
  $scope.profile_imageloc = "Uploads/profile_picture/";
  $scope.files = [];

  $scope.commonobjectService = commonobjectService;

  angular.forEach(USER_ROLE, (data) => {
    if (data.id !== 1) {
      $scope.userData.roles.push(data);
    }
  });

  $scope.userData.imagesrc = false;
  $scope.userData.loadedfile = "";
  $scope.userData.userlist = [];
  $scope.userData.process = "";
  $scope.userData.formsubmission = false;

  // Manage process begins..
  $scope.processForm = {};
  $scope.processData = {};
  $scope.imageloc = "Uploads/process_picture/";
  $scope.processData.tax_details = [];
  $scope.processData.process_list = [];
  $scope.processData.measurement_details = [];

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

  $scope.getPrivileges = function () {
    UserService.getPrivilegelist((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
        angular.isDefined(result.data) && result.data.length > 0) {
        $scope.userData.privileges = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.changeChildPage = function (fields) {
    if ((angular.isUndefined($scope.divisionForm) || angular.isUndefined($scope.divisionForm._id) ||
        $scope.divisionForm._id === "") && fields !== "Location") {
      Notification.error("Please save division details to proceed");
      return false;
    }

    $scope.divisionData.divisionView = true;
    $scope.divisionData.eventLoad = false;
    $scope.test = "1";
    switch (true) {
      case fields === "Location":
        $rootScope.clientData.divisionchildpage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/divisions_location.html`;
        $rootScope.clientData.divisionchildpageName = "LOCATION";
        $rootScope.clientData.setupdivisionchildpage = "Location";
        break;

      case fields === "Manageprocess":
        $rootScope.clientData.divisionchildpage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/divisions_manageprocess.html`;
        $rootScope.clientData.divisionchildpageName = "MANAGE_PROCESS";
        $rootScope.clientData.setupdivisionchildpage = "Manage Process";
        $scope.get_process_data();
        break;

      case fields === "Accounts":
        $rootScope.clientData.divisionchildpage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/divisions_account.html`;
        $rootScope.clientData.divisionchildpageName = "ACCOUNTS";
        $rootScope.clientData.setupdivisionchildpage = "Accounts";
        $scope.divisionaccountForm = {};
        $scope.divisionaccountview();
        break;

      case fields === "Stocks":
        $rootScope.clientData.divisionchildpage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/division_stocks.html`;
        $rootScope.clientData.divisionchildpageName = "STOCKS";
        $rootScope.clientData.setupdivisionchildpage = "Stocks";
        $scope.getavailablestock();
        break;

      case fields === "Users":
        $rootScope.clientData.divisionchildpage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/divisions_users.html`;
        $rootScope.clientData.divisionchildpageName = "USERS";
        $rootScope.clientData.setupdivisionchildpage = "Staffs";
        $scope.userview();
        $scope.getPrivileges();
        break;
    }

    setTimeout(() => {
      setupSection();
    }, 1000);
  };

  $scope.divisionData.instock = "AVAILABLESTOCK";

  $scope.getStatelist = function () {
    $scope.divisionData.eventLoad = true;
    $scope.divisionData.tempstatelist = [];
    DivisionService.getStatelist((result) => {
      if (result !== null && angular.isDefined(result) && result !== "" && result.length > 0) {
        angular.forEach(result, (state) => {
          if (state !== null && angular.isDefined(state._id)) {
            const obj = {};
            obj._id = angular.copy(state._id);
            obj.name = angular.copy(state.name);
            $scope.divisionData.tempstatelist.push(obj);
          }
        });
      }
      $scope.divisionData.eventLoad = true;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.divisionData.eventLoad = true;
    });
  };

  // Preferences Action --->List
  $scope.list = function () {
    DivisionService.get((result) => {
      $scope.divisionData.divisions = [];
      if (result !== null && angular.isDefined(result.success) && angular.isDefined(result.data) && result.data !== null) {
        angular.forEach(result.data, (division) => {
          if (angular.isDefined(division) && division !== null && angular.isDefined(division._id)) {
            $scope.divisionData.divisions.push(angular.copy(division));
          }
        });
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.list();
  $scope.getStatelist();

  $scope.addDivision = function () {
    $scope.divisionForm = {};
    $scope.divisionForm.billing_address = {};
    $scope.divisionForm.division_address = {};
    $scope.divisionData.divisionView = true;
    $scope.divisionData.process = "ADD";
    $scope.divisionData.formsubmission = false;
    $scope.divisionData.statelist = [];
    angular.forEach($scope.divisionData.tempstatelist, (state) => {
      if (state !== null && angular.isDefined(state._id)) {
        const obj = {};
        obj._id = angular.copy(state._id);
        obj.name = angular.copy(state.name);
        $scope.divisionData.statelist.push(obj);
      }
    });

    $scope.changeChildPage("Location");
  };

  // Division --->Default gmap location
  $scope.searchLocation = {
    latitude: 11.094566532834266,
    longitude: 77.33402653967278,
  };

  // Copy Division Address
  $scope.copyAddress = function () {
    if (!angular.isUndefined($scope.divisionForm.division_address)) {
      if (!angular.isUndefined($scope.divisionForm.division_address.address) && $scope.divisionForm.division_address.address !== "") {
        $scope.divisionForm.billing_address.address_line = angular.copy($scope.divisionForm.division_address.address);
      }
      if (!angular.isUndefined($scope.divisionForm.division_address.city) && $scope.divisionForm.division_address.city !== "") {
        $scope.divisionForm.billing_address.city = angular.copy($scope.divisionForm.division_address.city);
      }
      if (!angular.isUndefined($scope.divisionForm.division_address.state) && $scope.divisionForm.division_address.state !== "") {
        $scope.divisionForm.billing_address.state = angular.copy($scope.divisionForm.division_address.state);
      }
      if (!angular.isUndefined($scope.divisionForm.division_address.pin_code) && $scope.divisionForm.division_address.pin_code !== "") {
        $scope.divisionForm.billing_address.pin_code = angular.copy($scope.divisionForm.division_address.pin_code);
      }
    }
  };

  // Division Action --->Create
  $scope.create = function (valid) {
    if (!valid) {
      angular.element(".viewplace.wrapper_hight")[0].scrollTop = 450;
      return false;
    }
    if (!angular.isUndefined($scope.searchLocation.latitude) && $scope.searchLocation.latitude !== "" &&
        !angular.isUndefined($scope.searchLocation.longitude) && $scope.searchLocation.longitude !== "") {
      $scope.divisionForm.geolocation = $scope.searchLocation;
    }
    if (angular.isUndefined($scope.divisionForm.statecopy) || $scope.divisionForm.statecopy === null ||
                angular.isUndefined($scope.divisionForm.statecopy._id) || angular.isUndefined($scope.divisionForm.statecopy.name)) {
      angular.element(".viewplace.wrapper_hight")[0].scrollTop = 450;
      Notification.error("Please select the state for division address");
      return false;
    }
    $scope.divisionForm.division_address.state = angular.copy($scope.divisionForm.statecopy.name);

    const obj = {};
    obj.divisionForm = $scope.divisionForm;

    $scope.divisionData.eventLoad = true;

    DivisionService.create(obj, (result) => {
      if (result !== null && angular.isDefined(result) && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
            $scope.divisionForm = result.data;
            $scope.searchLocation = $scope.divisionForm.geolocation;
            $scope.divisionData.process = "UPDATE";
            $scope.divisionData.divisions.push(angular.copy($scope.divisionForm));
            Notification.success(result.message);
          } else {
            $scope.list();
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.divisionData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.divisionData.eventLoad = false;
    });
  };

  // Preferences Action --->Delete
  $scope.delete = function (id, index) {
    if (!angular.isUndefined(id) && id !== "" && index !== "") {
      const obj = {};
      obj.id = id;

      DivisionService.delete(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.divisionData.divisions.splice(index, 1);
          Notification.success(result.message);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    } else {
      $scope.divisionData.divisions.splice(index, 1);
    }
  };

  /* Back to main division page from child page */
  $scope.closeDivisionview = function () {
    //        $scope.list();
    $scope.divisionData.process = "";
    $scope.divisionData.formsubmission = false;
    $scope.divisionData.divisionView = false;
  };

  $scope.setState = function (item, address) {
    if (angular.isDefined(item.name) && item.name !== null && item.name !== "" && angular.isDefined(item._id) &&
        item._id !== null && item._id !== "") {
      address.state = angular.copy(item.name);
      $scope.divisionForm.placeofSupply = angular.copy(item._id);
    }
  };

  /* Edit the divison on setup child page */
  $scope.getdivisionbyId = function (id) {
    $scope.divisionData.statelist = [];
    $scope.divisionData.contentLoad = false;
    if (id !== "") {
      angular.forEach($scope.divisionData.tempstatelist, (state) => {
        if (state !== null && angular.isDefined(state._id)) {
          const obj = {};
          obj._id = angular.copy(state._id);
          obj.name = angular.copy(state.name);
          $scope.divisionData.statelist.push(obj);
        }
      });
      $scope.divisionData.contentLoad = true;
      $scope.divisionForm = {};

      DivisionService.getById(id, (result) => {
        if (result !== null && angular.isDefined(result._id)) {
          $scope.divisionData.formsubmission = false;
          $scope.divisionData.process = "UPDATE";
          $scope.divisionForm = angular.copy(result);
          if (!angular.isUndefined($scope.divisionForm.geolocation)) {
            $scope.searchLocation = $scope.divisionForm.geolocation;
          }
          if (angular.isDefined($scope.divisionForm.placeofSupply) && $scope.divisionForm.placeofSupply !== null &&
            angular.isDefined($scope.divisionData.statelist) && $scope.divisionData.statelist !== null &&
            $scope.divisionData.statelist.length > 0) {
            angular.forEach($scope.divisionData.statelist, (state) => {
              if (angular.isDefined(state._id) && state._id === $scope.divisionForm.placeofSupply) {
                $scope.divisionForm.statecopy = state;
              }
            });
          }
          $scope.divisionData.divisionView = true;
        }
        $scope.divisionData.contentLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.divisionData.contentLoad = false;
      });
    }
  };

  /* Sub -page location update */
  $scope.update = function (valid) {
    if (!valid) {
      angular.element(".viewplace.wrapper_hight")[0].scrollTop = 450;
      return false;
    }
    if (!angular.isUndefined($scope.searchLocation.latitude) && $scope.searchLocation.latitude !== "" &&
        !angular.isUndefined($scope.searchLocation.longitude) && $scope.searchLocation.longitude !== "") {
      $scope.divisionForm.geolocation = $scope.searchLocation;
    }
    if (angular.isUndefined($scope.divisionForm.statecopy) || $scope.divisionForm.statecopy === null ||
                angular.isUndefined($scope.divisionForm.statecopy._id) || angular.isUndefined($scope.divisionForm.statecopy.name)) {
      angular.element(".viewplace.wrapper_hight")[0].scrollTop = 450;
      Notification.error("Please select the state for division address");
      return false;
    }
    $scope.divisionForm.division_address.state = angular.copy($scope.divisionForm.statecopy.name);

    const obj = {};
    obj.divisionForm = $scope.divisionForm;

    $scope.divisionData.eventLoad = true;

    DivisionService.update(obj, (result) => {
      if (result !== null && angular.isDefined(result) && angular.isDefined(result.success)) {
        if (result.success) {
          $scope.divisionData.process = "UPDATE";
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }

      $scope.divisionData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.divisionData.eventLoad = false;
    });
  };

  // Division Account Action --->Create
  $scope.updatedivisionAccount = function (valid, divisionform) {
    $scope.divisionaccountData.formsubmission = true;
    if (!valid) {
      return false;
    }
    if (angular.isDefined($scope.divisionForm._id) && $scope.divisionForm._id !== null && $scope.divisionForm._id !== "") {
      const obj = {};
      obj.divisionaccountForm = divisionform;
      obj.divisionaccountForm.division_id = $scope.divisionForm._id;

      $scope.divisionData.eventLoad = true;

      DivisionAccountService.create(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            Notification.success(result.message);
            $scope.listAccount();
          } else {
            Notification.error(result.message);
          }
        }
        $scope.divisionData.eventLoad = false;
        $scope.divisionaccountData.formsubmission = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.divisionData.eventLoad = false;
        $scope.divisionaccountData.formsubmission = false;
      });
    } else {
      $scope.divisionaccountData.formsubmission = false;
      Notification.success("Please save the division location first.");
    }
  };

  // Division Account form--->initialize
  $scope.divisionaccountview = function () {
    // Show Add Division account form
    $scope.divisionaccountData = {};
    $scope.divisionaccountData.process = "ADD";

    $scope.divisionaccountForm.accounts = {};
    $scope.divisionaccountForm.receive_note = {};
    $scope.divisionaccountForm.delivery_note = {};
    $scope.divisionaccountForm.return_note = {};
    $scope.divisionaccountForm.invoice = {};
    $scope.divisionaccountForm.grn = {};
    $scope.divisionaccountForm.purchase = {};
    $scope.divisionaccountForm.purchase_return = {};
    $scope.divisionaccountForm.credit_note = {};
    $scope.divisionaccountForm.debit_note = {};
    $scope.divisionaccountForm.inward = {};
    $scope.divisionaccountForm.order = {};
    $scope.divisionaccountForm.contract_outward = {};
    $scope.divisionaccountForm.contract_inward = {};
    $scope.divisionaccountData.formsubmission = false;

    $scope.listAccount();
  };

  // Division Account Action based on division id--->List
  $scope.listAccount = function () {
    $scope.divisionData.contentLoad = false;
    if (angular.isDefined($scope.divisionForm) && angular.isDefined($scope.divisionForm._id) && $scope.divisionForm._id !== "") {
      $scope.divisionData.contentLoad = true;

      DivisionAccountService.get($scope.divisionForm._id, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data)) {
              if (angular.isDefined(result.data.Divisionaccount)) {
                $scope.divisionaccountForm.receive_note = result.data.Divisionaccount.receive_note;
                $scope.divisionaccountForm.delivery_note = result.data.Divisionaccount.delivery_note;
                $scope.divisionaccountForm.return_note = result.data.Divisionaccount.return_note;
                $scope.divisionaccountForm.invoice = result.data.Divisionaccount.invoice;
                $scope.divisionaccountForm.grn = result.data.Divisionaccount.grn;
                $scope.divisionaccountForm.purchase = result.data.Divisionaccount.purchase;
                $scope.divisionaccountForm.purchase_return = result.data.Divisionaccount.purchase_return;
                $scope.divisionaccountForm.credit_note = result.data.Divisionaccount.credit_note;
                $scope.divisionaccountForm.debit_note = result.data.Divisionaccount.debit_note;
                $scope.divisionaccountForm.inward = result.data.Divisionaccount.inward;
                $scope.divisionaccountForm.order = result.data.Divisionaccount.order;
                $scope.divisionaccountForm.outward = result.data.Divisionaccount.outward;
                $scope.divisionaccountForm.return = result.data.Divisionaccount.return;
                $scope.divisionaccountForm.contract_outward = result.data.Divisionaccount.contract_outward;
                $scope.divisionaccountForm.contract_inward = result.data.Divisionaccount.contract_inward;
              }
              if (angular.isDefined(result.data.accountledger)) {
                $scope.divisionaccountForm.accounts = result.data.accountledger;
              }
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.divisionData.contentLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.divisionData.contentLoad = false;
      });
    }
  };

  function getUniqueproduct(b) {
    const deferred = $q.defer();
    if ($scope.stockData.categorylist.length > 0) {
      const a = $scope.stockData.categorylist;
      for (let i = 0, len = b.length; i < len; i += 1) {
        let loopfinish = false;
        let exist = false;

        for (let j = 0, len2 = a.length; j < len2; j += 1) {
          if (!exist && angular.isDefined(a[j]._id) && a[j]._id !== null && angular.isDefined(b[i].category_id) && a[j]._id === b[i].category_id) {
            exist = true;
          }
          if (j === len2 - 1) {
            loopfinish = true;
            if (!exist) {
              b.splice(i, 1);
              len = b.length;
            }
          }
        }
        if (loopfinish && i === len - 1) {
          $scope.stockData.productData = angular.copy(b);
          deferred.resolve(true);
        }
      }
    } else {
      $scope.stockData.productData = angular.copy(b);
      deferred.resolve(true);
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function getproductSortlist(b) {
    const deferred = $q.defer();
    if ($scope.stockData.stocklist.length > 0) {
      const a = $scope.stockData.stocklist;
      for (let i = 0, len = a.length; i < len; i += 1) {
        let loopfinish = false;
        for (let j = 0, len2 = b.length; j < len2; j += 1) {
          if (j === len2 - 1) {
            loopfinish = true;
          }
          if (angular.isDefined(a[i].product_id) && a[i].product_id !== null && angular.isDefined(a[i].product_id._id) &&
            angular.isDefined(b[j]._id) && a[i].product_id._id === b[j]._id) {
            b.splice(j, 1);
            len2 = b.length;
          }
        }
        if (loopfinish && i === len - 1) {
          $scope.stockData.productData = angular.copy(b);
          deferred.resolve(true);
        }
      }
    } else {
      $scope.stockData.productData = angular.copy(b);
      deferred.resolve(true);
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function generatestockList() {
    angular.forEach($scope.stockData.productData, (products) => {
      angular.forEach($scope.stockData.categorylist, (categorys) => {
        if (angular.isDefined(products._id) && angular.isDefined(products.category_id) && angular.isDefined(categorys._id) &&
            products.category_id === categorys._id) {
          const obj = {};
          obj.division_id = $scope.divisionForm._id;
          obj.category_id = angular.copy(categorys);
          obj.product_id = angular.copy(products);
          obj.product_name = angular.copy(products.product_name);
          obj.is_active = true;
          obj.quantity = 0;
          $scope.stockData.stocklist.push(obj);
        }
      });
    });
  }

  // Branch Action  --->item stock
  $scope.getavailablestock = function () {
    $scope.divisionData.contentLoad = false;
    $scope.stockData.stocklist = [];
    $scope.stockData.categorylist = [];
    $scope.stockData.productlist = [];
    $scope.stockData.productData = [];

    if (!angular.isUndefined($scope.divisionForm) && !angular.isUndefined($scope.divisionForm._id) && $scope.divisionForm._id !== "") {
      $scope.divisionData.contentLoad = true;

      StockService.initializedata($scope.divisionForm._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null) {
          if (angular.isDefined(result.data.stock) && result.data.stock !== null && result.data.stock.length > 0) {
            $scope.stockData.stocklist = angular.copy(result.data.stock);
          }
          if (angular.isDefined(result.data.category) && result.data.category !== null && result.data.category.length > 0) {
            $scope.stockData.categorylist = angular.copy(result.data.category);
            getUniqueproduct(result.data.product).then((data) => {
              if (data) {
                getproductSortlist($scope.stockData.productData).then((products) => {
                  if (products) {
                    generatestockList();
                  }
                });
              }
            });
          }
        }

        $scope.divisionData.contentLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.divisionData.contentLoad = false;
      });
    }
  };

  function validateStocklist(stocklists) {
    const deferred = $q.defer();
    let valid = true;
    if (stocklists && stocklists !== null && stocklists.length > 0) {
      angular.forEach(stocklists, (stockData, ind) => {
        if (valid && angular.isDefined(stockData.category_id) && stockData.category_id !== null &&
            angular.isDefined(stockData.category_id._id) && angular.isDefined(stockData.product_id) && stockData.product_id !== null &&
            angular.isDefined(stockData.product_id._id) && angular.isDefined(stockData.quantity) && stockData.quantity !== null &&
            stockData.quantity !== "") {
          valid = true;
        } else {
          valid = false;
        }
        if (ind === stocklists.length - 1) {
          deferred.resolve(valid);
        }
      });
    } else {
      valid = false;
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  // Branch Action  --->Update opening stock bulk update
  $scope.updateopeningStock = function () {
    if (angular.isUndefined($scope.stockData.stocklist) || $scope.stockData.stocklist === null || $scope.stockData.stocklist.length === 0) {
      Notification.error("PLease add product to update stock");
      return false;
    }
    const stocklists = $filter("filter")($scope.stockData.stocklist, {currentStockEdit: true}, true);

    if (angular.isDefined($scope.divisionForm._id) && $scope.divisionForm._id !== null && $scope.divisionForm._id !== "") {
      validateStocklist(stocklists).then((stocks) => {
        if (stocks !== null && stocks) {
          const obj = {};
          obj.division_id = $scope.divisionForm._id;
          obj.stockData = angular.copy(stocklists);

          $scope.divisionData.eventLoad = true;

          StockService.updateopeningstock(obj, (result) => {
            if (result !== null && angular.isDefined(result.success)) {
              if (result.success) {
                Notification.success(result.message);
                //  $scope.getavailablestock();
              } else {
                Notification.error(result.message);
              }
            }
            $scope.divisionData.eventLoad = false;
            //  socket.emit("getStockdetails", {division_id: $scope.divisionForm._id});
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            $scope.divisionData.eventLoad = false;
          });
        } else {
          Notification.error("Please enter the value for all fields");
        }
      });
    } else {
      Notification.success("Please save the division details first.");
    }
  };

  // users things begins..
  $scope.userview = function () {
    // Show Add Division User form
    $scope.addusers = function () {
      $scope.userData.formsubmission = false;
      if (!angular.isUndefined($scope.divisionForm._id) && $scope.divisionForm._id !== "") {
        $scope.getPrivileges();
        $scope.userData.process = "ADD";
        $scope.userData.Readall = false;
        $scope.userData.Modifyall = false;
        $scope.userData.Removeall = false;
        $scope.userForm = {};
        $scope.userData.imagesrc = false;
        $scope.userData.loadedfile = "";
        $scope.showadminuserform = true;
      } else {
        Notification.success("Please save the division location first.");
      }
    };

    // On file upload display and assign to scope
    $scope.onFileSelect = function ($files) {
      //            if (errFiles !== null && errFiles.length > 0 && angular.isDefined(errFiles[0].$error)) {
      //                var msg = "Can't upload file. Please try again later.";
      //                if (errFiles[0].$error === "maxSize") {
      //                    if (angular.isDefined(errFiles[0].$errorParam) && errFiles[0].$errorParam !== null && errFiles[0].$errorParam !== "") {
      //                        msg = "File size should be less than " + errFiles[0].$errorParam;
      //                    } else {
      //                        msg = "File is too large to upload.";
      //                    }
      //                } else if (errFiles[0].$error === "pattern") {
      //                    msg = "Invalid file format.";
      //                } else {
      //                    msg = "Can't upload file. Please try again later.";
      //                }
      //                Notification.warning(msg);
      //                return false;
      //            } else {
      if ($files !== "" && isNaN($files)) {
        $scope.files = $files;
        if ($scope.files.length > 0) {
          $scope.profile_picture = [];
          if ($scope.userData.process === "ADD") {
            angular.forEach($scope.files, (profilepics) => {
              $scope.profile_picture.push(profilepics);
              const reader = new FileReader();
              reader.readAsDataURL(profilepics);
              reader.onload = function (e) {
                $scope.$apply(() => {
                  $scope.userData.loadedfile = e.target.result;
                  $scope.userData.imagesrc = true;
                });
              };
            });
          } else if ($scope.userData.process === "UPDATE") {
            angular.forEach($scope.files, (profilepics) => {
              $scope.profile_picture.push(profilepics);
              const reader = new FileReader();
              reader.readAsDataURL(profilepics);
              reader.onload = function (e) {
                $scope.$apply(() => {
                  //                                        $scope.userData.loadedfile = e.target.result;
                  $scope.userData.imagesrc = true;

                  const obj = {};
                  obj.userForm = $scope.userForm;
                  if ($scope.profile_picture.length > 0) {
                    obj.profile_picture = $scope.profile_picture;
                  }

                  UserService.updatePicture(obj, (result) => {
                    if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
                      if (result.success) {
                        if (angular.isDefined(result.filename)) {
                          $scope.userForm.profile_picture = result.filename;
                          angular.forEach($scope.userData.userlist, (user) => {
                            if (!angular.isUndefined(user._id) && !angular.isUndefined($scope.userForm._id) && user._id === $scope.userForm._id) {
                              user.profile_picture = $scope.userForm.profile_picture;
                            }
                          });
                        }
                        $scope.userData.loadedfile = e.target.result;
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
                });
              };
            });
          }
        }
      }
      //            }
    };

    // Division User Action --->List
    $scope.listUser = function () {
      $scope.divisionData.contentLoad = false;
      if (angular.isDefined($scope.divisionForm) && angular.isDefined($scope.divisionForm._id) && $scope.divisionForm._id !== "") {
        $scope.divisionData.contentLoad = true;
        UserService.getUsers($scope.divisionForm._id, (data) => {
          if (data !== null && data !== "" && data.length > 0) {
            $scope.userData.userlist = angular.copy(data);
          } else {
            $scope.userData.userlist = [];
          }
          $scope.divisionData.contentLoad = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.divisionData.contentLoad = false;
        });
      }
    };
    $scope.listUser();

    $scope.setReadall = function (data) {
      if (angular.isUndefined(data.Readall)) {
        data.Readall = true;
      } else {
        data.Readall = !data.Readall;
      }
      angular.forEach($scope.userData.privileges, (privilege) => {
        privilege.Read = angular.copy(data.Readall);
      });
    };

    $scope.setModifyall = function (data) {
      if (angular.isUndefined(data.Modifyall)) {
        data.Modifyall = true;
      } else {
        data.Modifyall = !data.Modifyall;
      }
      angular.forEach($scope.userData.privileges, (privilege) => {
        privilege.Modify = angular.copy(data.Modifyall);
      });
    };

    $scope.setRemoveall = function (data) {
      if (angular.isUndefined(data.Removeall)) {
        data.Removeall = true;
      } else {
        data.Removeall = !data.Removeall;
      }
      angular.forEach($scope.userData.privileges, (privilege) => {
        privilege.Remove = angular.copy(data.Removeall);
      });
    };

    // Division User Action --->Create
    $scope.createUser = function (valid) {
      $scope.userData.formsubmission = true;
      if (angular.isDefined($scope.divisionForm) && angular.isDefined($scope.divisionForm._id) && $scope.divisionForm._id !== "") {
        $scope.userForm.privileges = [];
        if (angular.isDefined($scope.userData.privileges) && $scope.userData.privileges.length > 0) {
          angular.forEach($scope.userData.privileges, (priv) => {
            if (angular.isDefined(priv.pid) && priv.pid !== "" && parseInt(priv.pid) > 0) {
              const privobj = {};
              privobj.privilege_master_id = priv._id;
              privobj.privilege_id = priv.privilege_id;
              privobj.Read = priv.Read;
              privobj.Modify = priv.Modify;
              privobj.Remove = priv.Remove;
              $scope.userForm.privileges.push(angular.copy(privobj));
            }
          });
        }
        if (!valid) {
          angular.element(".viewplace.wrapper_hight")[0].scrollTop = 850;
          Notification.error("Please enter value for all the required fields.");
          return false;
        }
        if (angular.isUndefined($scope.userForm.privileges) || (angular.isDefined($scope.userForm.privileges) &&
            $scope.userForm.privileges.length <= 0)) {
          Notification.error("Add privileges for the user to proceed.");
          return false;
        }
        const obj = {};
        obj.userForm = $scope.userForm;
        obj.userForm.division = $scope.divisionForm._id;
        obj.profile_picture = $scope.profile_picture;

        $scope.divisionData.eventLoad = true;
        UserService.create(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
                $scope.userForm._id = angular.copy(result.data._id);
                $scope.userData.userlist.push(angular.copy($scope.userForm));
              } else {
                $scope.listUser();
                $scope.getPrivileges();
              }
              $scope.userData.process = "";
              $scope.showadminuserform = false;
              $scope.userForm = {};
              $scope.profile_picture = [];
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.userData.formsubmission = false;
          $scope.divisionData.eventLoad = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.userData.formsubmission = false;
          $scope.divisionData.eventLoad = false;
        });
      }
    };

    // Division User Action --->Fetch User details by id
    $scope.getuserbyId = function (id) {
      $scope.userData.formsubmission = false;
      $scope.userData.Readall = false;
      $scope.userData.Modifyall = false;
      $scope.userData.Removeall = false;
      UserService.getPrivilegelist((result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
            angular.isDefined(result.data) && result.data.length > 0) {
          $scope.userData.privileges = angular.copy(result.data);
          $scope.getuserafterprivilege(id);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.getuserafterprivilege(id);
      });
    };

    $scope.getuserafterprivilege = function (id) {
      if (id !== "") {
        $scope.userData.process = "UPDATE";
        $scope.userForm = {};
        $scope.userData.imagesrc = false;
        $scope.userData.loadedfile = "";
        $scope.showadminuserform = true;
        UserService.getById(id, (data) => {
          if (data[0]) {
            $scope.userForm = data[0];
            $scope.userForm.age = `${$scope.userForm.age}`;
            if (!angular.isUndefined($scope.userForm.profile_picture) && $scope.userForm.profile_picture !== "") {
              $scope.userData.imagesrc = true;
              $scope.userData.loadedfile = $scope.profile_imageloc + $scope.userForm.profile_picture;
            }
            if (angular.isDefined($scope.userForm.privileges) && $scope.userForm.privileges.length > 0) {
              if (angular.isDefined($scope.userData.privileges) && $scope.userData.privileges.length > 0) {
                angular.forEach($scope.userData.privileges, (priv) => {
                  if (angular.isDefined(priv.pid) && parseInt(priv.pid) > 0) {
                    angular.forEach($scope.userForm.privileges, (usrpriv) => {
                      if (angular.isDefined(usrpriv.privilege_master_id) && usrpriv.privilege_master_id === priv._id) {
                        if (angular.isDefined(usrpriv.Read)) {
                          priv.Read = angular.copy(usrpriv.Read);
                        }
                        if (angular.isDefined(usrpriv.Modify)) {
                          priv.Modify = angular.copy(usrpriv.Modify);
                        }
                        if (angular.isDefined(usrpriv.Remove)) {
                          priv.Remove = angular.copy(usrpriv.Remove);
                        }
                      }
                    });
                  }
                });
              }
            }
          }
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
        });
      }
    };

    // Division User Action --->Update
    $scope.updateUser = function (valid) {
      $scope.userData.formsubmission = true;
      $scope.userForm.privileges = [];
      if (angular.isDefined($scope.userData.privileges) && $scope.userData.privileges.length > 0) {
        angular.forEach($scope.userData.privileges, (priv) => {
          if (angular.isDefined(priv.pid) && priv.pid !== "" && parseInt(priv.pid) > 0) {
            const privobj = {};
            privobj.privilege_master_id = priv._id;
            privobj.privilege_id = priv.privilege_id;
            privobj.Read = priv.Read;
            privobj.Modify = priv.Modify;
            privobj.Remove = priv.Remove;
            $scope.userForm.privileges.push(angular.copy(privobj));
          }
        });
      }

      if (!valid) {
        angular.element(".viewplace.wrapper_hight")[0].scrollTop = 850;
        Notification.error("Please enter value for all the required fields.");
        return false;
      }
      if (angular.isUndefined($scope.userForm.privileges) || (angular.isDefined($scope.userForm.privileges) &&
        $scope.userForm.privileges.length <= 0)) {
        Notification.error("Add privileges for the user to proceed.");
        return false;
      }

      const obj = {};
      obj.userForm = angular.copy($scope.userForm);
      obj.profile_picture = $scope.profile_picture;

      $scope.divisionData.eventLoad = true;
      UserService.update(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.userData.userlist, (users, index) => {
              if (angular.isDefined(users) && users !== null && angular.isDefined(users._id) && users._id === obj.userForm._id) {
                $scope.userData.userlist[index] = angular.copy(obj.userForm);
              }
            });
            $scope.userData.process = "";
            $scope.showadminuserform = false;
            $scope.userForm = {};
            $scope.profile_picture = [];
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        $scope.userData.formsubmission = false;
        $scope.divisionData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.userData.formsubmission = false;
        $scope.divisionData.eventLoad = false;
      });
    };

    // Division User Action --->Delete
    $scope.deleteUser = function (index) {
      $scope.error = "";
      const item = $scope.userData[index];
      const Obj = {};
      Obj._id = item._id;
      UserService.delete(Obj, (success) => {
        if (angular.isDefined(success) && success !== null && success !== "") {
          Notification.success(success);
          $scope.userForm = {};
          $scope.userData.splice(index, 1);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
      $scope.getPrivileges();
    };

    // CLose View Form
    $scope.closeForm = function () {
      $scope.userData.process = "";
      $scope.showadminuserform = false;
      $scope.userForm = {};
      $scope.profile_picture = [];
    };

    // Show ser password
    $scope.showpassword = function (showorhide) {
      $scope.inputType = showorhide;
    };
  };

  $scope.get_process_data = function () {
    $scope.processData.tax_details = [];
    manageProcessService.initialize($scope.divisionForm._id, (result) => {
      if (angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && result.data !== null &&
        angular.isDefined(result.data.process) && angular.isDefined(result.data.tax)) {
        if (result.data.tax !== null && result.data.tax.length > 0) {
          $scope.processData.process_list = [];
          if (angular.isDefined(result.data.measurement) && result.data.measurement !== null && result.data.measurement !== "" &&
            result.data.measurement.length > 0) {
            $scope.processData.measurement_details = angular.copy(result.data.measurement);
          }
          angular.forEach(result.data.process, (process) => {
            if (angular.isDefined(process._id) && angular.isDefined(process.measurement)) {
              if (angular.isDefined(process.tax_class) && process.tax_class !== null && process.tax_class.length > 0) {
                $scope.processData.process_list.push(angular.copy(process));
                $scope.processData.process_list[$scope.processData.process_list.length - 1].tax_class = [];
                $scope.processData.process_list[$scope.processData.process_list.length - 1].inter_tax_class = [];
                angular.forEach(process.tax_class, (tax) => {
                  if (angular.isDefined(tax._id) && angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage)) {
                    const obj = {};
                    obj.tax_id = tax._id;
                    obj.display_name = `${tax.tax_percentage} % ${tax.tax_name}`;
                    $scope.processData.process_list[$scope.processData.process_list.length - 1].tax_class.push(obj);
                  }
                });

                angular.forEach(process.inter_tax_class, (tax) => {
                  if (angular.isDefined(tax._id) && angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage)) {
                    const obj = {};
                    obj.tax_id = tax._id;
                    obj.display_name = `${tax.tax_percentage} % ${tax.tax_name}`;
                    $scope.processData.process_list[$scope.processData.process_list.length - 1].inter_tax_class.push(obj);
                  }
                });

                if (process.measurement.length > 0) {
                  angular.forEach($scope.processData.measurement_details, (measure) => {
                    if (angular.isDefined(measure._id) && angular.isDefined(measure.fabric_measure)) {
                      let unitexist = false;
                      angular.forEach(process.measurement, (processmeasure, indx) => {
                        if (angular.isDefined(processmeasure.measurement_id) && processmeasure.measurement_id === measure._id) {
                          unitexist = true;
                          $scope.processData.process_list[$scope.processData.process_list.length - 1].measurement[indx].measurement_name = measure.fabric_measure;
                        }
                        if (!unitexist && indx === process.measurement.length - 1) {
                          const objs = {};
                          objs.measurement_id = measure._id;
                          objs.measurement_name = measure.fabric_measure;
                          $scope.processData.process_list[$scope.processData.process_list.length - 1].measurement.push(objs);
                        }
                      });
                    }
                  });
                } else {
                  angular.forEach($scope.processData.measurement_details, (measure) => {
                    if (angular.isDefined(measure._id) && angular.isDefined(measure.fabric_measure)) {
                      const objs = {};
                      objs.measurement_id = measure._id;
                      objs.measurement_name = measure.fabric_measure;
                      $scope.processData.process_list[$scope.processData.process_list.length - 1].measurement.push(objs);
                    }
                  });
                }
              } else {
                $scope.processData.process_list.push(angular.copy(process));
              }
            }
          });
          angular.forEach(result.data.tax, (tax) => {
            if (angular.isDefined(tax._id) && angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage)) {
              const obj = {};
              obj.tax_id = tax._id;
              obj.display_name = `${tax.tax_percentage} % ${tax.tax_name}`;
              $scope.processData.tax_details.push(obj);
            }
          });
        }
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.add_process = function () {
    $scope.processData.process = "ADD";
    $scope.processForm = {};
    $scope.processData.imagesrc = false;
    $scope.processData.loadedfile = "";
    $scope.showbrandform = false;
    $scope.processForm.is_active = true;
    $scope.processForm.measurement = [];
    angular.forEach($scope.processData.measurement_details, (measure) => {
      if (angular.isDefined(measure._id) && angular.isDefined(measure.fabric_measure)) {
        const objs = {};
        objs.measurement_id = measure._id;
        objs.measurement_name = measure.fabric_measure;
        objs.qty = 1;
        $scope.processForm.measurement.push(objs);
      }
    });
    $scope.open("lg");
  };

  $scope.updateProcess = function (proc) {
    if (proc !== "") {
      $scope.processForm = {};
      $scope.processData.imagesrc = false;
      $scope.processData.loadedfile = "";
      $scope.processData.process = "UPDATE";
      $scope.processData.current_tax = "";
      $scope.processData.show_tax_selection = false;
      $scope.processData.current_inter_tax = "";
      $scope.processData.show_inter_tax_selection = false;
      $scope.processData.show_invoice_option = false;
      $scope.processForm = proc;
      if (angular.isDefined($scope.processForm.tax_class) && $scope.processForm.tax_class !== null && $scope.processForm.tax_class.length > 0) {
        angular.forEach($scope.processForm.tax_class, (tax, ind) => {
          if (angular.isDefined(tax.tax_id) && angular.isDefined(tax.display_name)) {
            $scope.processData.current_tax += tax.display_name;
            if ($scope.processForm.tax_class.length - 1 !== ind) {
              $scope.processData.current_tax += ", ";
            }
          }
        });
      }
      if (angular.isDefined($scope.processForm.inter_tax_class) && $scope.processForm.inter_tax_class !== null &&
        $scope.processForm.inter_tax_class.length > 0) {
        angular.forEach($scope.processForm.inter_tax_class, (tax, ind) => {
          if (angular.isDefined(tax.tax_id) && angular.isDefined(tax.display_name)) {
            $scope.processData.current_inter_tax += tax.display_name;
            if ($scope.processForm.inter_tax_class.length - 1 !== ind) {
              $scope.processData.current_inter_tax += ", ";
            }
          }
        });
      }
      if (!angular.isUndefined($scope.processForm.process_picture) && $scope.processForm.process_picture !== "") {
        $scope.processData.imagesrc = true;
        $scope.processData.loadedfile = $scope.imageloc + $scope.processForm.process_picture;
      }

      $scope.open("lg");
    }
  };

  $scope.open = function (size) {
    const contain = angular.element(document.getElementsByClassName("c_setup_iframe"));
    const modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      appendTo: contain,
      templateUrl: "app/views/superadmin/setup/divisions_manageprocess_popup.html",
      controller: "ModalProcessController",
      size,
      resolve: {
        processForm() {
          return $scope.processForm;
        },
        processData() {
          return $scope.processData;
        },
        divisionForm() {
          return $scope.divisionForm;
        },

      },
    });

    modalInstance.result.then((result) => {
      if (angular.isUndefined(result) || result === null) {
        $scope.get_process_data();
      }
    }, () => {
      $log.info(`Modal dismissed at: ${new Date()}`);
    });
  };
}).controller("ModalProcessController", ($scope, $uibModalInstance, processForm, processData, manageProcessService, Notification, divisionForm) => {
  $scope.process_picture = [];
  $scope.processForm = angular.copy(processForm);
  $scope.processData = processData;
  $scope.processData.processsubmission = false;
  $scope.processData.show_inter_tax_selection = false;
  $scope.processData.show_invoice_option = false;
  $scope.processData.show_tax_selection = false;
  $scope.divisionForm = divisionForm;
  $scope.processData.showmenu = false;
  $scope.processData.removemsg = false;
  $scope.processData.eventLoad = false;
  $scope.error = "";

  $scope.files = [];

  $scope.toggleproc = function (procstatus) {
    if (angular.isDefined(procstatus) && angular.isDefined(procstatus._id)) {
      const obj = angular.copy(procstatus);
      obj.is_active = !procstatus.is_active;
      $scope.processData.eventLoad = true;

      manageProcessService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.processData.process_list, (processlist) => {
              if (angular.isDefined(processlist) && processlist !== null && angular.isDefined(processlist._id) &&
                processlist._id === procstatus._id) {
                processlist.is_active = !processlist.is_active;
              }
            });
            procstatus.is_active = !procstatus.is_active;
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        $scope.processData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.processData.eventLoad = false;
      });
    }
  };

  $scope.showMenu = function () {
    if (angular.isDefined($scope.processData.process) && $scope.processData.process !== "ADD") {
      $scope.processData.showmenu = !$scope.processData.showmenu;
      if (!$scope.processData.showmenu) {
        $scope.processData.removemsg = false;
      }
    }
  };

  // Push and show file to the scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files)) {
      $scope.files = [];
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.process_picture = [];
        if ($scope.processData.process === "ADD") {
          angular.forEach($scope.files, (procpics) => {
            $scope.process_picture.push(procpics);
            const reader = new FileReader();
            reader.readAsDataURL(procpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.processData.loadedfile = e.target.result;
                $scope.processData.imagesrc = true;
              });
            };
          });
        } else if ($scope.processData.process === "UPDATE") {
          angular.forEach($scope.files, (procpics) => {
            $scope.process_picture.push(procpics);
            const reader = new FileReader();
            reader.readAsDataURL(procpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.processData.imagesrc = true;
                const obj = {};
                obj.processForm = $scope.processForm;
                if ($scope.process_picture.length > 0) {
                  obj.process_picture = $scope.process_picture;
                }
                manageProcessService.updatePicture(obj, (result) => {
                  if (result.success && result.filename) {
                    $scope.processForm.process_picture = result.filename;
                    angular.forEach($scope.processData.process_list, (procs) => {
                      if (!angular.isUndefined(procs._id) && !angular.isUndefined($scope.processForm._id) && procs._id === $scope.processForm._id) {
                        procs.process_picture = $scope.processForm.process_picture;
                      }
                    });
                    $scope.processData.loadedfile = e.target.result;
                  }
                }, (error) => {
                  if (error !== null && angular.isDefined(error.message)) {
                    Notification.error(error.message);
                  }
                });
              });
            };
          });
        }
      }
    }
  };

  // Brand Action --->Create
  $scope.create = function (valid) {
    $scope.processData.processsubmission = true;
    if (!valid) {
      return false;
    }
    if (angular.isUndefined($scope.processForm.tax_class) || $scope.processForm.tax_class === null || $scope.processForm.tax_class.length === 0) {
      Notification.error("Please select Intra-State Tax details for this process");
      return false;
    }
    if (angular.isUndefined($scope.processForm.inter_tax_class) || $scope.processForm.inter_tax_class === null ||
        $scope.processForm.inter_tax_class.length === 0) {
      Notification.error("Please select Inter-State Tax details for this process");
      return false;
    }
    if (angular.isUndefined($scope.processForm.invoice_option) || $scope.processForm.invoice_option === null ||
        $scope.processForm.invoice_option === "") {
      Notification.error("Please select invoicing option for this process");
      return false;
    }
    if ($scope.processForm.invoice_option !== "Delivery Weight" && $scope.processForm.invoice_option !== "Received Weight") {
      Notification.error("Please select invoicing option for this process");
      return false;
    }
    const tax_class = [];
    const inter_tax_class = [];

    angular.forEach($scope.processForm.measurement, (measurement) => {
      if (angular.isDefined(measurement.cost) && measurement.cost !== null && measurement.cost !== "") {
        measurement.cost = parseFloat(measurement.cost);
      }
    });

    angular.forEach($scope.processForm.tax_class, (taxclass) => {
      if (angular.isDefined(taxclass.tax_id) && taxclass.tax_id !== null && taxclass.tax_id !== "") {
        tax_class.push(taxclass.tax_id);
      }
    });

    angular.forEach($scope.processForm.inter_tax_class, (taxclass) => {
      if (angular.isDefined(taxclass.tax_id) && taxclass.tax_id !== null && taxclass.tax_id !== "") {
        inter_tax_class.push(taxclass.tax_id);
      }
    });

    const obj = {};
    obj.processForm = angular.copy($scope.processForm);
    obj.processForm.tax_class = tax_class;
    obj.processForm.inter_tax_class = inter_tax_class;
    obj.processForm.division_id = $scope.divisionForm._id;

    if ($scope.process_picture.length > 0) {
      obj.process_picture = $scope.process_picture;
    }
    $scope.processData.eventLoad = true;
    manageProcessService.create(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.processForm._id = result.data._id;
            $scope.processData.process_list.push(angular.copy($scope.processForm));
            $scope.processData.process = "";
            $scope.processForm = {};
            $scope.process_picture = [];
            Notification.success(result.message);
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.processData.processsubmission = false;
      $scope.processData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.processData.eventLoad = false;
    });
  };

  // Brand Action --->Update
  $scope.update = function (valid) {
    $scope.processData.processsubmission = true;
    if (!valid) {
      return false;
    }
    if (angular.isUndefined($scope.processForm.tax_class) || $scope.processForm.tax_class === null || $scope.processForm.tax_class.length === 0) {
      Notification.error("Please select tax details for this process");
      return false;
    }
    if (angular.isUndefined($scope.processForm.invoice_option) || $scope.processForm.invoice_option === null ||
        $scope.processForm.invoice_option === "") {
      Notification.error("Please select invoicing option for this process");
      return false;
    }
    if ($scope.processForm.invoice_option !== "Delivery Weight" && $scope.processForm.invoice_option !== "Received Weight") {
      Notification.error("Please select invoicing option for this process");
      return false;
    }
    const tax_class = [];
    const inter_tax_class = [];

    angular.forEach($scope.processForm.tax_class, (taxclass) => {
      if (angular.isDefined(taxclass.tax_id) && taxclass.tax_id !== null && taxclass.tax_id !== "") {
        tax_class.push(taxclass.tax_id);
      }
    });

    angular.forEach($scope.processForm.inter_tax_class, (taxclass) => {
      if (angular.isDefined(taxclass.tax_id) && taxclass.tax_id !== null && taxclass.tax_id !== "") {
        inter_tax_class.push(taxclass.tax_id);
      }
    });

    const obj = {};
    obj.processForm = angular.copy($scope.processForm);
    obj.processForm.tax_class = tax_class;
    obj.processForm.inter_tax_class = inter_tax_class;
    obj.division_id = $scope.divisionForm._id;
    $scope.processData.eventLoad = true;

    manageProcessService.update(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          processForm = angular.copy($scope.processForm);
          $scope.processData.process = "";
          $scope.processForm = {};
          $scope.process_picture = [];
          Notification.success(result.message);
          $scope.ok(obj);
        } else {
          Notification.error(result.message);
        }
      }
      $scope.processData.processsubmission = false;
      $scope.processData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.processData.eventLoad = false;
    });
  };

  // Brand Action --->Delete
  $scope.delete = function (data) {
    let index = -1;
    angular.forEach($scope.processData.process_list, (brand, ind) => {
      if (angular.isDefined(brand._id) && angular.isDefined(data._id) && data._id !== "" && data._id === brand._id) {
        index = ind;
      }
    });

    if (index >= 0) {
      const item = angular.copy(data);
      const Obj = {};
      Obj._id = item._id;
      Obj.name = item.name;
      Obj.is_deleted = true;
      $scope.processData.eventLoad = true;

      manageProcessService.delete(Obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
          $scope.processData.process = "";
          $scope.processForm = {};
          $scope.processData.process_list.splice(index, 1);
          Notification.success(result.message);
          $scope.ok(Obj);
        }
        $scope.processData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.processData.eventLoad = false;
      });
    }
  };

  $scope.ok = function (data) {
    $uibModalInstance.close(data);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss("cancel");
  };
});
