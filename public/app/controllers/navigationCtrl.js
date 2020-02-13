/* global angular */
angular.module("navigationCtrl", []).controller("NavigationController", ($scope, $rootScope, AuthService) => {
  $scope.UserPrivilege = AuthService;
  $scope.items = {};
  $scope.states = {};
  $scope.states.activeItem = "";

  $rootScope.clientData.showNotification = false;
  $rootScope.clientData.notifyPage = `app/views/${angular.lowercase($rootScope.currentapp)}/notification.html`;

  $scope.mainMenuChange = function (activeItem) {
    $scope.states.activeItem = activeItem;
  };

  $scope.items.mainMenu = [{
    auth: true,
    id: "userlist",
    url: `${angular.lowercase($rootScope.currentapp)}/dashboard`,
    title: "Dashboard",
  }, {
    id: "customers",
    url: `${angular.lowercase($rootScope.currentapp)}/customers`,
    title: "Customers",
  }, {
    id: "profile",
    url: `${angular.lowercase($rootScope.currentapp)}/profile`,
    title: "Profile",
  }, {
    id: "accounts",
    url: `${angular.lowercase($rootScope.currentapp)}/accounts`,
    title: "Accounts",
  },
  {
    id: "puchase&stocks",
    url: `${angular.lowercase($rootScope.currentapp)}/purchase_stock`,
    title: "Purchase & Stocks",
  },
  {
    id: "Contractors",
    url: `${angular.lowercase($rootScope.currentapp)}/contractors`,
    title: "Contractors",
  },
  {
    id: "reports",
    url: `${angular.lowercase($rootScope.currentapp)}/reports`,
    title: "Reports",
  }, {
    id: "setup",
    url: `${angular.lowercase($rootScope.currentapp)}/setup`,
    title: "Setup",
  }];
  $scope.items.logoutmenu = `${angular.lowercase($rootScope.currentapp)}/profile`;
  $scope.items.homepage = angular.lowercase($rootScope.currentapp);

  $scope.togglenotificationPanel = function () {
    $rootScope.clientData.showNotification = !$rootScope.clientData.showNotification;
  };
});
