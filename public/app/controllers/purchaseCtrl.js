/* global angular */
angular.module("purchaseCtrl", []).controller("PurchaseController", ($scope, $routeParams, DivisionService, $rootScope, Notification,
  $uibModal, $log, AuthService) => {
  $scope.UserPrivilege = AuthService;
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;

  $scope.purchaseStockChildPage = function (field) {
    switch (true) {
      case field === "Managevendor":
        $rootScope.clientData.purchaseStockPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/purchaseStocksVendor.html`;
        $rootScope.clientData.purchaseStockPageName = "MANAGEVENDOR";
        break;
      case field === "Managecategory":
        $rootScope.clientData.purchaseStockPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/purchaseStocksCategory.html`;
        $rootScope.clientData.purchaseStockPageName = "MANAGECATEGORY";
        break;
      case field === "Manageproducts":
        $rootScope.clientData.purchaseStockPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/purchaseStocksProducts.html`;
        $rootScope.clientData.purchaseStockPageName = "MANAGEPRODUCTS";
        break;
      default:
        $rootScope.clientData.purchaseStockPage = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/purchaseStocksVendor.html`;
        $rootScope.clientData.purchaseStockPageName = "MANAGEVENDOR";
        break;
    }
  };

  // initialise stock page and it will call default page to load..
  $scope.purchaseStockChildPage();
});
