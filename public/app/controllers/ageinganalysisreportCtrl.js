/* global parseFloat */
/* global angular */
angular.module("ageinganalysisCtrl", []).controller("AgeinganalysisController", ($scope, $routeParams, DivisionService, CustomerService, 
  DateformatstorageService, DATEFORMATS, Notification, AuthService, commonobjectService, $filter, $q, PreferenceService, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.AgeingreportData = {};
  $scope.AgeingreportData.currency = commonobjectService.getCurrency();
  $scope.AgeingreportData.pageLoader = true;
  $scope.AgeingreportData.currentDate = new Date();

  $scope.AgeingreportData.divisionList = [{_id: "", name: "ALL"}];
  $scope.AgeingreportData.selectedDivisionid = "";
  $scope.AgeingreportData.selectedDivisionname = "ALL";

  $scope.AgeingreportData.activeDay = "TODAY";
  $scope.AgeingreportData.ageingList = [];
  $scope.AgeingreportData.ageingheader = [];
  
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
      $scope.AgeingreportData.selectedDivisionid = angular.copy(division._id);
      $scope.AgeingreportData.selectedDivisionname = angular.copy(division.name);
      $scope.AgeingreportData.pageLoader = true;
      $scope.viewData();
    }
  };

  $scope.viewData = function () {
    $scope.AgeingreportData.ageingList = [];
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.AgeingreportData.selectedDivisionid);

    ReportService.getAgeing(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.AgeingreportData.ageingList = angular.copy(result.data);
        if ($scope.AgeingreportData.ageingheader.length === 0) {
          angular.forEach($scope.AgeingreportData.ageingList[0], (ageingData, index) => {
              if (index !== "division_id" && index !== "mobile_no" && index !== "customer_id" && index !== "customer_name" && 
                      index !== "openingBalance" && index !== "totalBalance") {
                $scope.AgeingreportData.ageingheader.push(index);
              }
          });
        }
      }
      $scope.AgeingreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.AgeingreportData.pageLoader = false;
    });
  };

  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Divisiondetail) &&
    result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
      angular.forEach(result.data.Divisiondetail, (division, index) => {
        if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
          if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
          result.data.Currentbranch === division._id) {
            $scope.AgeingreportData.selectedDivisionid = angular.copy(division._id);
            $scope.AgeingreportData.selectedDivisionname = angular.copy(division.name);
            $scope.AgeingreportData.divisionList = [];
          }
          $scope.AgeingreportData.divisionList.push(angular.copy(division));
        }
        if (index === result.data.Divisiondetail.length - 1) {
          $scope.viewData();
        }
      });
    }
    $scope.AgeingreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.AgeingreportData.pageLoader = false;
  });
  
  PreferenceService.getPendingduelist((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
      $scope.AgeingreportData.ageingheader = angular.copy(result.data);
    }
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
  });
  
  $scope.printThisReport = function () {
    if (angular.isDefined($scope.AgeingreportData.ageingList) && $scope.AgeingreportData.ageingList !== null &&
    $scope.AgeingreportData.ageingList.length > 0) {
      const templateUrl = $sce.getTrustedResourceUrl("app/views/common/ageinganalysis_print.html");
      ageingListDetail = $scope.AgeingreportData.ageingList;
      ageingheader = $scope.AgeingreportData.ageingheader;
      if (angular.isDefined($scope.AgeingreportData.fillterByCustomer) && $scope.AgeingreportData.fillterByCustomer !== null &&
      $scope.AgeingreportData.fillterByCustomer !== "") {
        ageingListDetail = $filter("filter")($scope.AgeingreportData.ageingList, $scope.AgeingreportData.fillterByCustomer);
      }
      selectedDivision = $scope.AgeingreportData.selectedDivisionname;
      currentDate = $scope.AgeingreportData.currentDate;
      selectedDivisionId = $scope.AgeingreportData.selectedDivisionid;
      currency = $scope.AgeingreportData.currency;
      window.open(templateUrl, "_blank");
    }
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.AgeingreportData.selectedDivisionid);
    obj.filterData.searchtext = angular.copy($scope.AgeingreportData.fillterByCustomer);
    obj.filterData.divisionname = angular.copy($scope.AgeingreportData.selectedDivisionname);
    
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
