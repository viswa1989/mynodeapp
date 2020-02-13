/* global angular */
angular.module("appRouter", []).config(($routeProvider, $locationProvider) => {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when("/superadmin/login", {
      templateUrl(params) {
        return "app/views/superadmin/login.html";
      },
    })
    .when("/superadmin/dashboard", {
      templateUrl(params) {
        return "app/views/superadmin/dashboard.html";
      },
    })
    .when("/superadmin/customers", {
      templateUrl(params) {
        return "app/views/superadmin/customers.html";
      },
    })
    .when("/superadmin/accounts", {
      templateUrl(params) {
        return "app/views/superadmin/accounts.html";
      },
    })
    .when("/superadmin/purchase_stock", {
      templateUrl(params) {
        return "app/views/superadmin/purchase_stock.html";
      },
    })
    .when("/superadmin/purchase_stock/:action", {
      templateUrl(params) {
        return "app/views/superadmin/purchase_stock.html";
      },
    })
    .when("/superadmin/contractors", {
      templateUrl(params) {
        return "app/views/superadmin/contractors.html";
      },
    })
    .when("/superadmin/reports", {
      templateUrl(params) {
        return "app/views/superadmin/reports.html";
      },
    })
    .when("/superadmin/reports/:id", {
      templateUrl(params) {
        return "app/views/superadmin/reports.html";
      },
    })
    .when("/superadmin/profile", {
      templateUrl(params) {
        return "app/views/superadmin/profile.html";
      },
    })
    .when("/divisionadmin/login", {
      templateUrl(params) {
        return "app/views/divisionadmin/login.html";
      },
    })
    .when("/divisionadmin/dashboard", {
      templateUrl(params) {
        return "app/views/divisionadmin/dashboard.html";
      },
    })
    .when("/divisionadmin/customers", {
      templateUrl(params) {
        return "app/views/divisionadmin/customers.html";
      },
    })
    .when("/divisionadmin/accounts", {
      templateUrl(params) {
        return "app/views/divisionadmin/accounts.html";
      },
    })
    .when("/divisionadmin/purchase_stock", {
      templateUrl(params) {
        return "app/views/divisionadmin/purchase_stock.html";
      },
    })
    .when("/divisionadmin/purchase_stock/:action", {
      templateUrl(params) {
        return "app/views/divisionadmin/purchase_stock.html";
      },
    })
    .when("/divisionadmin/reports", {
      templateUrl(params) {
        return "app/views/divisionadmin/reports.html";
      },
    })
    .when("/divisionadmin/reports/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/reports.html";
      },
    })
    .when("/divisionadmin/profile", {
      templateUrl(params) {
        return "app/views/divisionadmin/profile.html";
      },
    })
    .when("/divisionadmin/order/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/order.html";
      },
    })
    .when("/divisionadmin/orderedit/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/orderedit.html";
      },
    })
    .when("/divisionadmin/deliveryedit/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/deliveryedit.html";
      },
    })
    .when("/divisionadmin/returnedit/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/returnedit.html";
      },
    })
    .when("/divisionadmin/contract/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/contract.html";
      },
    })
    .when("/divisionadmin/contract/outwardedit/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/outwardedit.html";
      },
    })
    .when("/divisionadmin/contract/inwardedit/:id", {
      templateUrl(params) {
        return "app/views/divisionadmin/inwardedit.html";
      },
    })
    .when("/customer/login", {
      templateUrl(params) {
        return "app/views/customer/login.html";
      },
    })
    .when("/customer/dashboard", {
      templateUrl(params) {
        return "app/views/customer/dashboard.html";
      },
    })
    .when("/customer/reports", {
      templateUrl(params) {
        return "app/views/customer/reports.html";
      },
    })
    .when("/customer/profile", {
      templateUrl(params) {
        return "app/views/customer/profile.html";
      },
    })
    .when("/superadmin", {
      templateUrl: "app/views/superadmin/dashboard.html",
    })
    .when("/divisionadmin", {
      templateUrl: "app/views/divisionadmin/dashboard.html",
    })
    .when("/customer", {
      templateUrl: "app/views/customer/dashboard.html",
    })
    .otherwise({
      redirectTo: '/customer',
    });
})
  .run(($rootScope, $routeParams, $location, AuthService, AuthToken, $window, $timeout, $http) => {
    $rootScope.layout = {};
    $rootScope.layout.loading = false;
    $rootScope.loginStatus = false;

    // on page reload
    if (AuthService.isLogged()) {
      $http.defaults.headers.common.Authorization = `Bearer ${AuthToken.getToken()}`;
      $rootScope.loginStatus = true;
      AuthService.me();
    } else {
      const pId = $location.path().split("/");
      if (pId.length === 1) {
        $rootScope.loginStatus = false;
        if ($rootScope.currentapp !== "superadmin" && $rootScope.currentapp !== "divisionadmin") {
          $rootScope.currentapp = "customer";
        }
      } else if (pId.length === 2 || (pId.length > 2 && (pId[1] === "superadmin" || pId[1] === "divisionadmin" ||
        pId[1] === "customer") && pId[2] !== "login")) {
        $rootScope.loginStatus = false;
        $rootScope.currentapp = (pId[1] === "superadmin" || pId[1] === "divisionadmin" || pId[1] === "customer") ? pId[1] : "customer";
      }
    }

    $rootScope.$on("$routeChangeStart", (event, next, current) => { // on route change
      $rootScope.layout.loading = true;
      const pId = $location.path().split("/");

      if (AuthService.isLogged()) {
        $rootScope.loginStatus = true;
        const currentapp = AuthService.currentApp();

        if (pId.length > 0 && pId[1] !== "") {
          $rootScope.currentapp = (pId[1] === "superadmin" || pId[1] === "divisionadmin" || pId[1] === "customer") ? pId[1] : "customer";
        }

        if (pId.length === 0 && AuthService.currentApp() !== "") {
          $rootScope.currentapp = currentapp;
          $location.path(`/${$rootScope.currentapp}/dashboard`);
        } else if (angular.isUndefined($rootScope.currentapp) || $rootScope.currentapp !== currentapp) {
          $rootScope.currentapp = currentapp;
          $location.path(`/${$rootScope.currentapp}/dashboard`);
        } else if (pId.length > 1 && (pId[2] === "" || pId[2] === "login")) {
          $rootScope.currentapp = currentapp;
          $location.path(`/${$rootScope.currentapp}/dashboard`);
        }
      } else if (pId.length === 1) {
        $rootScope.loginStatus = false;
        if ($rootScope.currentapp !== "superadmin" && $rootScope.currentapp !== "divisionadmin") {
          $rootScope.currentapp = "customer";
        }
        $location.path(`/${$rootScope.currentapp}/login`);
      } else if (pId.length === 2 || (pId.length > 2 && (pId[1] === "superadmin" || pId[1] === "divisionadmin" ||
        pId[1] === "customer") && pId[2] !== "login")) {
        $rootScope.loginStatus = false;
        $rootScope.currentapp = (pId[1] === "superadmin" || pId[1] === "divisionadmin" || pId[1] === "customer") ? pId[1] : "customer";
        $location.path(`/${$rootScope.currentapp}/login`);
      } else {
        $rootScope.loginStatus = false;
      }
    });

    angular.element(".initialtag").removeClass("hide");
    $rootScope.$on("$routeChangeSuccess", () => {
      $timeout(() => {
        $rootScope.layout.loading = false;
      }, 200);
    });

    $rootScope.$on("$routeChangeError", () => {
      $timeout(() => {
        $rootScope.layout.loading = false;
      }, 200);
    });
  });
