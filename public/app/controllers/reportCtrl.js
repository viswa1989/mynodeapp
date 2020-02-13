/* global angular */
angular.module("reportCtrl", [])
  .controller("ReportController", ($scope, $rootScope, $routeParams) => {
    $rootScope.reportpageLoader = true;
    $rootScope.reportData = {};
    $rootScope.reportData.currentpage = "pending_payments";

    if (angular.isDefined($routeParams.id) && $routeParams.id !== null && $routeParams.id !== "") {
      $rootScope.reportData.currentpage = $routeParams.id;
    }

    $rootScope.reportData.loadPage = `app/views/${$rootScope.currentapp}/${$rootScope.reportData.currentpage}.html`;
  });
