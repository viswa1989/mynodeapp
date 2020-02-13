/* global angular */
angular.module("jobCtrl", []).controller("JobController", ($scope, $rootScope, $routeParams) => {
  $rootScope.orderpageLoader = true;
  $rootScope.jobData = {};
  $rootScope.jobData.currentpage = "new_order";

  if (angular.isDefined($routeParams.id) && ($routeParams.id === "inward" || $routeParams.id === "delivery" || $routeParams.id === "return")) {
    $rootScope.jobData.currentpage = $routeParams.id;
  }

  $rootScope.jobData.loadPage = `app/views/divisionadmin/${$rootScope.jobData.currentpage}.html`;
  
}).controller("ContractController", ($scope, $rootScope, $routeParams) => {
  $rootScope.contractpageLoader = true;
  $rootScope.contractData = {};
  $rootScope.contractData.currentpage = "outward";

  if (angular.isDefined($routeParams.id) && ($routeParams.id === "inward" || $routeParams.id === "outward")) {
    $rootScope.contractData.currentpage = $routeParams.id;
  }

  $rootScope.contractData.loadPage = `app/views/divisionadmin/${$rootScope.contractData.currentpage}.html`;
});
