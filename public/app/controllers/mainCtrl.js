/* global angular */
angular.module("mainCtrl", []).controller("MainController", ($rootScope, $routeParams, $scope, $location, AuthService, OrderService,
  orderviewService, AuthToken, Notification) => {
  $rootScope.loginStatus = false;
  $scope.UserPrivilege = AuthService;
  $scope.loginForm = {};
  $rootScope.clientData = {};
  $rootScope.clientData.prevurl = "";
  $rootScope.clientData.splitPanes = false;
  $rootScope.clientData.setup = "";
  AuthService.isAuthorized();
  $rootScope.clientData.headermenu = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/header.html`;

  $rootScope.logout = function () {
    if ($rootScope.currentapp === "customer") {
      AuthService.customerlogout();
    } else {
      AuthService.logout();
    }
  };

  if ($rootScope.currentapp === "divisionadmin") {
    $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/item_stock.html`;
  } else {
    $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}setup/emptyframe.html`;
  }

  $scope.iframeLoadPage = function () {
    $rootScope.clientData.splitPanes = true;
    $rootScope.clientData.headermenu = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/header.html`;
    $rootScope.clientData.setup = "SETUP";
    $rootScope.clientData.pageMenu = "";

    if ($rootScope.clientData.setup === "SETUP") {
      $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/emptyframe.html`;
    }
    iframeResizeDiv();
    setupClickEvent();
    return false;
  };

  $rootScope.clientData.iframeorder = "dashboard/setupOrder";
  $rootScope.clientData.loadedPage = "dashboard/iframeLoader";

  $scope.setSetupFrameLoadingPage = function (field) {
    if ($rootScope.clientData.pageMenu !== field) {
      switch (true) {
        case field === "DIVISIONS":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/divisions.html`;
          $rootScope.clientData.pageMenu = "DIVISIONS";
          break;
        case field === "MANAGE":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/manage.html`;
          $rootScope.clientData.pageMenu = "MANAGE";
          break;
        case field === "CUSTOMERGROUP":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/customer_group.html`;
          $rootScope.clientData.pageMenu = "CUSTOMERGROUP";
          break;
        case field === "DYEING":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/manage-dyeing.html`;
          $rootScope.clientData.pageMenu = "DYEING";
          break;
        case field === "CONTRACTOR":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/contractor.html`;
          $rootScope.clientData.pageMenu = "CONTRACTOR";
          break;
        case field === "PURCHASESTOCK":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/purchaseStocks.html`;
          $rootScope.clientData.pageMenu = "PURCHASESTOCK";
          break;
        case field === "VENDOR":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/vendor.html`;
          $rootScope.clientData.pageMenu = "VENDOR";
          break;
        case field === "ADMINUSER":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/adminuser.html`;
          $rootScope.clientData.pageMenu = "ADMINUSER";
          break;
        case field === "ACCOUNT":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/account.html`;
          $rootScope.clientData.pageMenu = "ACCOUNT";
          break;
        case field === 'SMS':
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/sms.html`;
          $rootScope.clientData.pageMenu = 'SMS';
          break;
        case field === "PREFERENCES":
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/preferenes.html`;
          $rootScope.clientData.pageMenu = "PREFERENCES";
          break;
        default:
          $rootScope.clientData.iframeloadPage = "/dashboard/dashboard_emptyiframe";
          $rootScope.clientData.pageMenu = "";
          break;
      }
      if (field !== "ORDER") {
        $scope.loadSetup();
      }
    }
    if (field) {
      setTimeout(() => {
        setupSection();
      }, 2000);
    } else {
      setTimeout(() => {
        setupSection();
      }, 1000);
    }
  };

  $scope.splitAction = function () {
    if (angular.element(".s_dashboard_section").hasClass("left-component") && $rootScope.currentapp === "superadmin" &&
        (angular.isUndefined($rootScope.clientData.pageMenu) || ($rootScope.clientData.pageMenu !== "ORDER" &&
        $rootScope.clientData.pageMenu === ""))) {
      $rootScope.clientData.splitPanes = true;
      $rootScope.clientData.setup = "SETUP";
      $rootScope.clientData.pageMenu = "";
      $rootScope.clientData.headermenu = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/header.html`;
      $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/emptyframe.html`;
    }
  };

  $scope.loadSetup = function () {
    if ($rootScope.clientData.prevurl !== $rootScope.clientData.pageMenu) {
      $rootScope.layout.setuploading = true;
    }
    const unlisten = $scope.$on("$includeContentLoaded", () => {
      $rootScope.layout.setuploading = false;
      unlisten(); // remove the listener
      $rootScope.clientData.prevurl = angular.copy($rootScope.clientData.pageMenu);
    });
  };

  $scope.loadOrder = function () {
    if ($rootScope.clientData.prevurl !== $rootScope.clientData.pageMenu) {
      $scope.$broadcast("openJob");
    }
    const unlisten = $scope.$on("$includeContentLoaded", () => {
      $scope.$broadcast("openJob");
      unlisten(); // remove the listener
    });
  };

  $rootScope.clientData.setupMenu = "ITEMSTOCK";

  $scope.setupMainMenu = function (field) {
    switch (true) {
      case field === "ITEMSTOCK":
        $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/item_stock.html`;
        $rootScope.clientData.setupMenu = "ITEMSTOCK";
        break;

      case field === "SCRAPSTOCK":
        $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/scrap_stock.html`;
        $rootScope.clientData.setupMenu = "SCRAPSTOCK";
        break;

      case field === "PURCHASE":
        $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/purchase.html`;
        $rootScope.clientData.setupMenu = "PURCHASE";
        break;

      case field === "JOBCARD":
        $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/add_job_card.html`;
        $rootScope.clientData.setupMenu = "JOBCARD";
        break;
    }
    setTimeout(() => {
      setupSection();
    }, 1000);
  };

  // Get order details
  $scope.getOrdersdetail = function (id, type, jobs) {
    if ($rootScope.currentapp === "customer") {
      OrderService.viewCustomerorder(id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.Orders) && result.data.Orders !== null && angular.isDefined(result.data.Orders._id)) {
          orderviewService.setOrder(angular.copy(result.data.Orders));

          if (angular.isDefined(result.data.Invoice) && result.data.Invoice !== null && angular.isDefined(result.data.Invoice._id)) {
            orderviewService.setInvoice(angular.copy(result.data.Invoice));
          } else {
            orderviewService.setInvoice({});
          }

          if (angular.isDefined(result.data.order_status) && result.data.order_status !== null && result.data.order_status.length > 0) {
            orderviewService.setOrderstatus(angular.copy(result.data.order_status));
          } else {
            orderviewService.setOrderstatus([]);
          }

          if (angular.isDefined(result.data.Users) && result.data.Users !== null && result.data.Users.length > 0) {
            orderviewService.setUsers(angular.copy(result.data.Users));
          } else {
            orderviewService.setUsers([]);
          }

          if (angular.isDefined(result.data.measurement) && result.data.measurement !== null && result.data.measurement.length > 0) {
            orderviewService.setMeasurement(angular.copy(result.data.measurement));
          } else {
            orderviewService.setMeasurement([]);
          }

          if (angular.isDefined(result.data.specialPrice) && result.data.specialPrice !== null && result.data.specialPrice.length > 0) {
            orderviewService.setSpecialprice(angular.copy(result.data.specialPrice));
          } else {
            orderviewService.setSpecialprice([]);
          }

          if (type === "OUTWARDRETURN" || type === "OUTWARD") {
            orderviewService.setSelectedid(jobs._id);
          } else {
            orderviewService.setSelectedid("");
          }

          orderviewService.setMenu(type);

          $scope.setSetupFrameLoadingPage("ORDER");
          $rootScope.clientData.splitPanes = true;
          $rootScope.clientData.headermenu = "";
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/order_view.html`;
          $rootScope.clientData.setup = "SETUP";
          $rootScope.clientData.pageMenu = "";
          iframeResizeDiv();
          setupClickEvent();
          order_view_setup_link();
          $rootScope.clientData.pageMenu = type;
          $scope.loadOrder();
        } else {
          Notification.warning("Job details not found");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $rootScope.clientData.orderView = true;
      });
    } else {
      OrderService.view(id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.Orders) && result.data.Orders !== null && angular.isDefined(result.data.Orders._id)) {
          orderviewService.setOrder(angular.copy(result.data.Orders));

          if (angular.isDefined(result.data.Invoice) && result.data.Invoice !== null && angular.isDefined(result.data.Invoice._id)) {
            orderviewService.setInvoice(angular.copy(result.data.Invoice));
          } else {
            orderviewService.setInvoice({});
          }
          
          if (angular.isDefined(result.data.Inwards) && result.data.Inwards !== null && result.data.Inwards.length>0) {
            orderviewService.setInwards(angular.copy(result.data.Inwards));
          } else {
            orderviewService.setInwards([]);
          }
          if (angular.isDefined(result.data.Outwards) && result.data.Outwards !== null && result.data.Outwards.length>0) {
            orderviewService.setOutwards(angular.copy(result.data.Outwards));
          } else {
            orderviewService.setOutwards([]);
          }
          if (angular.isDefined(result.data.Customer) && result.data.Customer !== null && result.data.Customer.length>0) {
            orderviewService.setCustomer(angular.copy(result.data.Customer[0]));
          } else {
            orderviewService.setCustomer({});
          }
          
          if (angular.isDefined(result.data.order_status) && result.data.order_status !== null && result.data.order_status.length > 0) {
            orderviewService.setOrderstatus(angular.copy(result.data.order_status));
          } else {
            orderviewService.setOrderstatus([]);
          }

          if (angular.isDefined(result.data.Users) && result.data.Users !== null && result.data.Users.length > 0) {
            orderviewService.setUsers(angular.copy(result.data.Users));
          } else {
            orderviewService.setUsers([]);
          }

          if (angular.isDefined(result.data.measurement) && result.data.measurement !== null && result.data.measurement.length > 0) {
            orderviewService.setMeasurement(angular.copy(result.data.measurement));
          } else {
            orderviewService.setMeasurement([]);
          }

          if (angular.isDefined(result.data.specialPrice) && result.data.specialPrice !== null && result.data.specialPrice.length > 0) {
            orderviewService.setSpecialprice(angular.copy(result.data.specialPrice));
          } else {
            orderviewService.setSpecialprice([]);
          }

          if (type === "OUTWARDRETURN" || type === "OUTWARD" || type === "CONTRACTOUTWARD" || type === "CONTRACTINWARD") {
            orderviewService.setSelectedid(jobs._id);
          } else {
            orderviewService.setSelectedid("");
          }

          orderviewService.setMenu(type);

          $scope.setSetupFrameLoadingPage("ORDER");
          $rootScope.clientData.splitPanes = true;
          $rootScope.clientData.headermenu = "";
          $rootScope.clientData.iframeloadPage = `app/views/${angular.lowercase($rootScope.currentapp)}/order_view.html`;
          $rootScope.clientData.setup = "SETUP";
          $rootScope.clientData.pageMenu = "";
          iframeResizeDiv();
          setupClickEvent();
          order_view_setup_link();
          $rootScope.clientData.pageMenu = type;
          $scope.loadOrder();
        } else {
          Notification.warning("Job details not found");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $rootScope.clientData.orderView = true;
      });
    }
  };

  $scope.getOrderview = function () {
    if (angular.isDefined($rootScope.clientData.headermenu) && angular.isDefined($rootScope.clientData.setup) &&
        angular.isDefined($rootScope.clientData.pageMenu) && $rootScope.clientData.headermenu === "" &&
        $rootScope.clientData.setup === "SETUP" && $rootScope.clientData.pageMenu !== "") {
      $scope.$broadcast("openJob");
    }
  };

  // View jobcard details
  $scope.viewJob = function (jobs, type) {
    if (angular.isDefined(jobs) && angular.isDefined(jobs._id) && jobs._id !== "") {
      $rootScope.clientData.selectCard = jobs._id;
      if (type === "INVOICE") {
        if (angular.isDefined(jobs.items) && jobs.items !== null && jobs.items.length && angular.isDefined(jobs.items[0]) &&
            jobs.items[0] !== null && angular.isDefined(jobs.items[0].order_id)) {
          jobs.order_id = jobs.items[0].order_id;
          $scope.getOrdersdetail(jobs.order_id, type, jobs);
        } else {
          Notification.warning("Job details not found.");
        }
      } else if (type === "ORDER") {
        $scope.getOrdersdetail(jobs._id, type, jobs);
      } else {
        $scope.getOrdersdetail(jobs.order_id, type, jobs);
      }
    }
  };

  // Window Resize Page load
  const windowWidow = $(window).width();
  if (windowWidow < 1600 && windowWidow > 1000) {
    lset("WINDOWWIDTH", 1600);
  } else if (windowWidow < 1000) {
    lset("WINDOWWIDTH", 1000);
  } else if (windowWidow > 1600) {
    lset("WINDOWWIDTH", 1700);
  }
});
