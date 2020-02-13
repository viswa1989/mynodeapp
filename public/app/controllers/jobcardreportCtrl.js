/* global parseFloat */
/* global angular */
function strPad(input, length, string) {
  string = string || "0";
  input = `${input}`;
  return input.length >= length ? input : new Array(length - (input.length + 1)).join(string) + input;
}
angular.module("jobcardreportCtrl", []).controller("JobcardstatementController", ($scope, $routeParams, DivisionService,  
  DateformatstorageService, DATEFORMATS, Notification, AuthService, commonobjectService, $filter, $q, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.JobreportData = {};
  $scope.JobreportData.pageLoader = true;
  $scope.JobreportData.currentDate = new Date();

  $scope.JobreportData.currentRow = -1;
  $scope.JobreportData.divisionList = [{_id: "", name: "ALL"}];
  $scope.JobreportData.processList = [];
  $scope.JobreportData.selectedDivisionid = "";
  $scope.JobreportData.selectedDivisionname = "ALL";
  $scope.JobreportData.Orderstatusfilter = [];
  $scope.JobreportData.Processstatusfilter = [];
  $scope.JobreportData.immediate_check = false;

  $scope.JobreportData.activeDay = "THIS_MONTH";
  $scope.JobreportData.orderList = [];
  $scope.JobreportData.limit = 50;
  $scope.JobreportData.skip = 0;
  $scope.JobreportData.searchtext = "";
  $scope.JobreportData.disablescroll = true;
  
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
      $scope.JobreportData.selectedDivisionid = angular.copy(division._id);
      $scope.JobreportData.selectedDivisionname = angular.copy(division.name);
      $scope.JobreportData.pageLoader = true;
      $scope.JobreportData.skip = 0;
      $scope.JobreportData.orderList = [];
      $scope.JobreportData.disablescroll = false;
      $scope.viewData();
    }
  };
  
  $scope.filterByorderstat = function (stat) {
    if (stat !== null && stat !== "") {
      if (stat === "ALL") {
        $scope.JobreportData.Orderstatusfilter = []; 
      } else {
        if ($scope.JobreportData.Orderstatusfilter.indexOf(stat) >= 0) {
          $scope.JobreportData.Orderstatusfilter.splice($scope.JobreportData.Orderstatusfilter.indexOf(stat), 1);
        } else {
          $scope.JobreportData.Orderstatusfilter.push(stat);
        }
      }
      $scope.JobreportData.pageLoader = true;
      $scope.JobreportData.skip = 0;
      $scope.JobreportData.orderList = [];
      $scope.JobreportData.disablescroll = false;
      $scope.viewData();
    } 
  }
  
  $scope.filterByprocess = function (process) {
    if (process !== null && process !== "") {
      if (process === "ALL") {
        $scope.JobreportData.Processstatusfilter = []; 
      } else {
        if ($scope.JobreportData.Processstatusfilter.indexOf(process) >= 0) {
          $scope.JobreportData.Processstatusfilter.splice($scope.JobreportData.Processstatusfilter.indexOf(process), 1);
        } else {
          $scope.JobreportData.Processstatusfilter.push(process);
        }
      }
      $scope.JobreportData.pageLoader = true;
      $scope.JobreportData.skip = 0;
      $scope.JobreportData.orderList = [];
      $scope.JobreportData.disablescroll = false;
      $scope.viewData();
    } 
  }
    
  $scope.toogleImmediatejob = function () {    
    $scope.JobreportData.immediate_check = !$scope.JobreportData.immediate_check;
    $scope.JobreportData.pageLoader = true;
    $scope.JobreportData.skip = 0;
    $scope.JobreportData.orderList = [];
    $scope.JobreportData.disablescroll = false;
    $scope.viewData();
  }

  $scope.viewData = function () {
    $scope.JobreportData.searchtext = "";
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.JobreportData.limit);
    if(angular.isUndefined($scope.JobreportData.skip)){
      $scope.JobreportData.skip = 0;
    }
    obj.filterData.skip = angular.copy($scope.JobreportData.skip);
    obj.filterData.division = angular.copy($scope.JobreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.JobreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.JobreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.JobreportData.searchtext);
    obj.filterData.order_status = angular.copy($scope.JobreportData.Orderstatusfilter);
    obj.filterData.process = angular.copy($scope.JobreportData.Processstatusfilter);
    obj.filterData.immediate_check = angular.copy($scope.JobreportData.immediate_check);
    
    $scope.JobreportData.disablescroll = true;
    $scope.JobreportData.orderList = [];
    ReportService.getJobcardstatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, function (orders) {
            if(angular.isDefined(orders) && orders !== null && angular.isDefined(orders._id)){
                $scope.JobreportData.orderList.push(orders);
            }
        });
        $scope.JobreportData.skip += result.data.length;
        $scope.JobreportData.disablescroll = false;
      } else {
        $scope.JobreportData.disablescroll = true;
      }
      $scope.JobreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.JobreportData.disablescroll = true;
      $scope.JobreportData.pageLoader = false;
    });
  };
  
  $scope.searchJobstatement = function () {
    $scope.JobreportData.skip = 0;
    $scope.JobreportData.orderList = [];
    $scope.JobreportData.disablescroll = false;
  }
  
  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null) {
      if (angular.isDefined(result.data.Divisiondetail) && result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
        angular.forEach(result.data.Divisiondetail, (division, index) => {
          if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
            if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
            result.data.Currentbranch === division._id) {
              $scope.JobreportData.selectedDivisionid = angular.copy(division._id);
              $scope.JobreportData.selectedDivisionname = angular.copy(division.name);
              $scope.JobreportData.divisionList = [];
            }
            $scope.JobreportData.divisionList.push(angular.copy(division));
          }
          if (index === result.data.Divisiondetail.length - 1) {
            $scope.filterOrderstatement($scope.JobreportData.activeDay);
          }
        });
      }
      if (angular.isDefined(result.data.Processdetail) && result.data.Processdetail !== null && result.data.Processdetail.length > 0) {
        angular.forEach(result.data.Processdetail, (process, index) => {
          if (process !== null && angular.isDefined(process._id) && angular.isDefined(process.process_name)) {

            $scope.JobreportData.processList.push(angular.copy(process));
          }
        });
      }
    }
    $scope.JobreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.JobreportData.pageLoader = false;
  });
  
  $scope.callDateRangePicker = function (startDate, endDate) {
    $scope.JobreportData.FromDate = startDate;
    $scope.JobreportData.ToDate = endDate;
    $scope.JobreportData.skip = 0;
    $scope.JobreportData.orderList = [];
    const curDate = moment(new Date()).format("DD/MM/YYYY");
    $(".rangeDate").daterangepicker({
      locale: {format: "DD-MM-YYYY"},
      startDate : startDate,
      endDate : endDate,
      maxDate : curDate
    });

    $(".rangeDate").on("apply.daterangepicker", (ev, picker) => {
      $scope.JobreportData.skip = 0;
      $scope.JobreportData.orderList = [];
      const ang_startDate = picker.startDate.format("YYYY-MM-DD");
      const ang_endDate = picker.endDate.format("YYYY-MM-DD");
      $scope.JobreportData.FromDate = ang_startDate;
      $scope.JobreportData.ToDate = ang_endDate;
      $scope.viewData();
    });
    $scope.viewData();
  };
  
  
  $scope.filterOrderstatement = function (data) {
    $scope.JobreportData.activeDay = data;
    const Dateformat = new Date();
    if (data === "TODAY") {
      const curDate = $filter("date")(Dateformat, "dd/MM/yyyy");
      $scope.callDateRangePicker(curDate, curDate);
    }

    if (data === "YDAY") {
      const dt = new Date(Dateformat);
      const yesterDay = dt.setDate(dt.getDate() - 1);
      const currentDate = $filter("date")(new Date(yesterDay), "dd/MM/yyyy");
      
      $scope.callDateRangePicker(currentDate, currentDate);
    }

    if (data === "7DAY") {
      const dt1 = new Date();
      const be47Day = dt1.setDate(dt1.getDate() - 7);
      const currentDate_format = $filter("date")(new Date(), "dd/MM/yyyy");
      const be4_7day_format = $filter("date")(new Date(be47Day), "dd/MM/yyyy");

      $scope.callDateRangePicker(be4_7day_format, currentDate_format);
    }

    if (data === "THIS_MONTH") {
      const date1 = new Date();
      const firstDt = new Date(date1.getFullYear(), date1.getMonth(), 1);
      const lastDt = new Date(date1.getFullYear(), date1.getMonth() + 1, 0);
      const startdt3 = $filter('date')(new Date(firstDt),'dd/MM/yyyy');
      const enddt3 = $filter('date')(new Date(),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(startdt3, enddt3);
    }

    if (data === "LAST_MONTH") {
      const datedt = new Date();
      const firstDay = new Date(datedt.getFullYear(), datedt.getMonth() - 1, 1);
      const lastDay = new Date(datedt.getFullYear(), datedt.getMonth(), 0);
      const start = $filter('date')(new Date(firstDay),'dd/MM/yyyy');
      const end = $filter('date')(new Date(lastDay),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(start, end);
    }
  };
  
  $scope.printThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.JobreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.JobreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.JobreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.JobreportData.searchtext);
    
    $scope.JobreportData.printview = true;
    var todt = obj.filterData.ToDate;
    var fromdt = obj.filterData.FromDate;
    
    ReportService.getJobcardprintstatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        const templateUrl = $sce.getTrustedResourceUrl("app/views/common/jobcardstatement_print.html");
        orderList = angular.copy(result.data);
        selectedDivision = $scope.JobreportData.selectedDivisionname;
        FromDate = fromdt;
        ToDate = todt;
        selectedDivisionId = $scope.JobreportData.selectedDivisionid;
        currency = $scope.JobreportData.currency;
        window.open(templateUrl, "_blank");
      }
      $scope.JobreportData.printview = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.JobreportData.printview = false;
    });
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.JobreportData.limit);
    obj.filterData.skip = angular.copy($scope.JobreportData.skip);
    obj.filterData.division = angular.copy($scope.JobreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.JobreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.JobreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.JobreportData.searchtext);
    obj.filterData.order_status = angular.copy($scope.JobreportData.Orderstatusfilter);
    obj.filterData.immediate_check = angular.copy($scope.JobreportData.immediate_check);
    obj.filterData.process = angular.copy($scope.JobreportData.Processstatusfilter);
    
     ReportService.exportjobcardstatement(obj, (result) => {
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
  };
})
.controller("PendingdeliverystatementController", ($scope, $routeParams, DivisionService, DateformatstorageService, DATEFORMATS, 
    Notification, AuthService, commonobjectService, $filter, $q, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.PendingdelreportData = {};
  $scope.PendingdelreportData.pageLoader = true;
  $scope.PendingdelreportData.currentDate = new Date();

  $scope.PendingdelreportData.currentRow = -1;
  $scope.PendingdelreportData.divisionList = [{_id: "", name: "ALL"}];
  $scope.PendingdelreportData.processList = [];
  $scope.PendingdelreportData.selectedDivisionid = "";
  $scope.PendingdelreportData.selectedDivisionname = "ALL";
  $scope.PendingdelreportData.Orderstatusfilter = [];
  $scope.PendingdelreportData.Processstatusfilter = [];
  $scope.PendingdelreportData.immediate_check = false;

  $scope.PendingdelreportData.activeDay = "THIS_MONTH";
  $scope.PendingdelreportData.orderList = [];
  $scope.PendingdelreportData.limit = 50;
  $scope.PendingdelreportData.skip = 0;
  $scope.PendingdelreportData.searchtext = "";
  $scope.PendingdelreportData.disablescroll = true;
  $scope.PendingdelreportData.sortColumn = "customer_name";
  $scope.PendingdelreportData.sortBy = "asc";
  
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
      $scope.PendingdelreportData.selectedDivisionid = angular.copy(division._id);
      $scope.PendingdelreportData.selectedDivisionname = angular.copy(division.name);
      $scope.PendingdelreportData.pageLoader = true;
      $scope.PendingdelreportData.skip = 0;
      $scope.PendingdelreportData.orderList = [];
      $scope.PendingdelreportData.disablescroll = false;
      $scope.viewData();
    }
  };
  
  $scope.filterByprocess = function (process) {
    if (process !== null && process !== "") {
      if (process === "ALL") {
        $scope.PendingdelreportData.Processstatusfilter = []; 
      } else {
        if ($scope.PendingdelreportData.Processstatusfilter.indexOf(process) >= 0) {
          $scope.PendingdelreportData.Processstatusfilter.splice($scope.PendingdelreportData.Processstatusfilter.indexOf(process), 1);
        } else {
          $scope.PendingdelreportData.Processstatusfilter.push(process);
        }
      }
      $scope.PendingdelreportData.pageLoader = true;
      $scope.PendingdelreportData.skip = 0;
      $scope.PendingdelreportData.orderList = [];
      $scope.PendingdelreportData.disablescroll = false;
      $scope.viewData();
    } 
  }  
  
  $scope.filterByorderstat = function (stat) {
    if (stat !== null && stat !== "") {
      if (stat === "ALL") {
        $scope.PendingdelreportData.Orderstatusfilter = []; 
      } else {
        if ($scope.PendingdelreportData.Orderstatusfilter.indexOf(stat) >= 0) {
          $scope.PendingdelreportData.Orderstatusfilter.splice($scope.PendingdelreportData.Orderstatusfilter.indexOf(stat), 1);
        } else {
          $scope.PendingdelreportData.Orderstatusfilter.push(stat);
        }
      }
      $scope.PendingdelreportData.pageLoader = true;
      $scope.PendingdelreportData.skip = 0;
      $scope.PendingdelreportData.orderList = [];
      $scope.PendingdelreportData.disablescroll = false;
      $scope.viewData();
    } 
  }
  
  $scope.toogleImmediatejob = function () {    
    $scope.PendingdelreportData.immediate_check = !$scope.PendingdelreportData.immediate_check;
    $scope.PendingdelreportData.pageLoader = true;
    $scope.PendingdelreportData.skip = 0;
    $scope.PendingdelreportData.orderList = [];
    $scope.PendingdelreportData.disablescroll = false;
    $scope.viewData();
  }
  
  $scope.viewData = function () {
    $scope.PendingdelreportData.searchtext = "";
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PendingdelreportData.limit);
    if(angular.isUndefined($scope.PendingdelreportData.skip)){
      $scope.PendingdelreportData.skip = 0;
    }
    obj.filterData.skip = angular.copy($scope.PendingdelreportData.skip);
    obj.filterData.division = angular.copy($scope.PendingdelreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.PendingdelreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.PendingdelreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.PendingdelreportData.searchtext);
    obj.filterData.order_status = angular.copy($scope.PendingdelreportData.Orderstatusfilter);
    obj.filterData.sortColumn = angular.copy($scope.PendingdelreportData.sortColumn);
    obj.filterData.sortBy = angular.copy($scope.PendingdelreportData.sortBy);
    obj.filterData.process = angular.copy($scope.PendingdelreportData.Processstatusfilter);
    obj.filterData.immediate_check = angular.copy($scope.PendingdelreportData.immediate_check);
  
    $scope.PendingdelreportData.disablescroll = true;
    $scope.PendingdelreportData.orderList = [];
    
    ReportService.getPendingdeliverystatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, function (orders) {
            if(angular.isDefined(orders) && orders !== null && angular.isDefined(orders._id)){
                $scope.PendingdelreportData.orderList.push(orders);
            }
        });
        $scope.PendingdelreportData.skip += result.data.length;
        $scope.PendingdelreportData.disablescroll = false;
      } else {
        $scope.PendingdelreportData.disablescroll = true;
      }
      $scope.PendingdelreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PendingdelreportData.disablescroll = true;
      $scope.PendingdelreportData.pageLoader = false;
    });
  };
  
  $scope.searchJobstatement = function () {
    $scope.PendingdelreportData.skip = 0;
    $scope.PendingdelreportData.orderList = [];
    $scope.PendingdelreportData.disablescroll = false;
  }
  
  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null) {
      if (angular.isDefined(result.data.Divisiondetail) && result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
        angular.forEach(result.data.Divisiondetail, (division, index) => {
          if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
            if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
            result.data.Currentbranch === division._id) {
              $scope.PendingdelreportData.selectedDivisionid = angular.copy(division._id);
              $scope.PendingdelreportData.selectedDivisionname = angular.copy(division.name);
              $scope.PendingdelreportData.divisionList = [];
            }
            $scope.PendingdelreportData.divisionList.push(angular.copy(division));
          }
          if (index === result.data.Divisiondetail.length - 1) {
            $scope.filterOrderstatement($scope.PendingdelreportData.activeDay);
          }
        });
      }
      
      if (angular.isDefined(result.data.Processdetail) && result.data.Processdetail !== null && result.data.Processdetail.length > 0) {
        angular.forEach(result.data.Processdetail, (process, index) => {
          if (process !== null && angular.isDefined(process._id) && angular.isDefined(process.process_name)) {

            $scope.PendingdelreportData.processList.push(angular.copy(process));
          }
        });
      }
    }
    $scope.PendingdelreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.PendingdelreportData.pageLoader = false;
  });
  
  $scope.callDateRangePicker = function (startDate, endDate) {
    $scope.PendingdelreportData.FromDate = startDate;
    $scope.PendingdelreportData.ToDate = endDate;
    $scope.PendingdelreportData.skip = 0;
    $scope.PendingdelreportData.orderList = [];
    const curDate = moment(new Date()).format("DD/MM/YYYY");
    $(".rangeDate").daterangepicker({
      locale: {format: "DD-MM-YYYY"},
      startDate : startDate,
      endDate : endDate,
      maxDate : curDate
    });

    $(".rangeDate").on("apply.daterangepicker", (ev, picker) => {
      $scope.PendingdelreportData.skip = 0;
      $scope.PendingdelreportData.orderList = [];
      const ang_startDate = picker.startDate.format("YYYY-MM-DD");
      const ang_endDate = picker.endDate.format("YYYY-MM-DD");
      $scope.PendingdelreportData.FromDate = ang_startDate;
      $scope.PendingdelreportData.ToDate = ang_endDate;
      $scope.viewData();
    });
    $scope.viewData();
  };
  
  
  $scope.filterOrderstatement = function (data) {
    $scope.PendingdelreportData.activeDay = data;
    const Dateformat = new Date();
    if (data === "TODAY") {
      const curDate = $filter("date")(Dateformat, "dd/MM/yyyy");
      $scope.callDateRangePicker(curDate, curDate);
    }

    if (data === "YDAY") {
      const dt = new Date(Dateformat);
      const yesterDay = dt.setDate(dt.getDate() - 1);
      const currentDate = $filter("date")(new Date(yesterDay), "dd/MM/yyyy");
      
      $scope.callDateRangePicker(currentDate, currentDate);
    }

    if (data === "7DAY") {
      const dt1 = new Date();
      const be47Day = dt1.setDate(dt1.getDate() - 7);
      const currentDate_format = $filter("date")(new Date(), "dd/MM/yyyy");
      const be4_7day_format = $filter("date")(new Date(be47Day), "dd/MM/yyyy");

      $scope.callDateRangePicker(be4_7day_format, currentDate_format);
    }

    if (data === "THIS_MONTH") {
      const date1 = new Date();
      const firstDt = new Date(date1.getFullYear(), date1.getMonth(), 1);
      const lastDt = new Date(date1.getFullYear(), date1.getMonth() + 1, 0);
      const startdt3 = $filter('date')(new Date(firstDt),'dd/MM/yyyy');
      const enddt3 = $filter('date')(new Date(),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(startdt3, enddt3);
    }

    if (data === "LAST_MONTH") {
      const datedt = new Date();
      const firstDay = new Date(datedt.getFullYear(), datedt.getMonth() - 1, 1);
      const lastDay = new Date(datedt.getFullYear(), datedt.getMonth(), 0);
      const start = $filter('date')(new Date(firstDay),'dd/MM/yyyy');
      const end = $filter('date')(new Date(lastDay),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(start, end);
    }
  };
  
  $scope.sortBycolum =  function (data) {
    if (data && data !== null && data !== "") {
      $scope.PendingdelreportData.pageLoader = true;
      $scope.PendingdelreportData.skip = 0;
      $scope.PendingdelreportData.orderList = [];
      $scope.PendingdelreportData.disablescroll = false;
      if ($scope.PendingdelreportData.sortColumn !== data) {
          $scope.PendingdelreportData.sortColumn = data;
          $scope.PendingdelreportData.sortBy = "asc";
          $scope.viewData();
      } else {
          if ($scope.PendingdelreportData.sortBy === "asc") {
            $scope.PendingdelreportData.sortBy = "desc";
          } else {
            $scope.PendingdelreportData.sortBy = "asc";
          }
          $scope.viewData();
      }
    }
  }
  
  $scope.printThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.PendingdelreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.PendingdelreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.PendingdelreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.PendingdelreportData.searchtext);
    
    $scope.PendingdelreportData.printview = true;
    var todt = obj.filterData.ToDate;
    var fromdt = obj.filterData.FromDate;
    
    ReportService.getPendingdeliveryprintstatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        const templateUrl = $sce.getTrustedResourceUrl("app/views/common/pendingdelivery_print.html");
        orderList = angular.copy(result.data);
        selectedDivision = $scope.PendingdelreportData.selectedDivisionname;
        FromDate = fromdt;
        ToDate = todt;
        selectedDivisionId = $scope.PendingdelreportData.selectedDivisionid;
        currency = $scope.PendingdelreportData.currency;
        window.open(templateUrl, "_blank");
      }
      $scope.PendingdelreportData.printview = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.PendingdelreportData.printview = false;
    });
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.PendingdelreportData.limit);
    obj.filterData.skip = angular.copy($scope.PendingdelreportData.skip);
    obj.filterData.division = angular.copy($scope.PendingdelreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.PendingdelreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.PendingdelreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.PendingdelreportData.searchtext);
    obj.filterData.order_status = angular.copy($scope.PendingdelreportData.Orderstatusfilter);
    obj.filterData.sortColumn = angular.copy($scope.PendingdelreportData.sortColumn);
    obj.filterData.sortBy = angular.copy($scope.PendingdelreportData.sortBy);
    obj.filterData.immediate_check = angular.copy($scope.PendingdelreportData.immediate_check);
    obj.filterData.process = angular.copy($scope.PendingdelreportData.Processstatusfilter);
    
    ReportService.exportpendingdelivery(obj, (result) => {
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
  };
})
.controller("DeliverystatementController", ($scope, $routeParams, DivisionService,  
  DateformatstorageService, DATEFORMATS, Notification, AuthService, commonobjectService, $filter, $q, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.DeliveryreportData = {};
  $scope.DeliveryreportData.pageLoader = true;
  $scope.DeliveryreportData.currentDate = new Date();

  $scope.DeliveryreportData.currentRow = -1;
  $scope.DeliveryreportData.divisionList = [{_id: "", name: "ALL"}];
  $scope.DeliveryreportData.selectedDivisionid = "";
  $scope.DeliveryreportData.selectedDivisionname = "ALL";

  $scope.DeliveryreportData.activeDay = "THIS_MONTH";
  $scope.DeliveryreportData.deliveryList = [];
  $scope.DeliveryreportData.limit = 50;
  $scope.DeliveryreportData.skip = 0;
  $scope.DeliveryreportData.searchtext = "";
  $scope.DeliveryreportData.disablescroll = true;
  
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
      $scope.DeliveryreportData.selectedDivisionid = angular.copy(division._id);
      $scope.DeliveryreportData.selectedDivisionname = angular.copy(division.name);
      $scope.DeliveryreportData.pageLoader = true;
      $scope.DeliveryreportData.skip = 0;
      $scope.DeliveryreportData.deliveryList = [];
      $scope.DeliveryreportData.disablescroll = true;
      $scope.viewData();
    }
  };

  $scope.viewData = function () {
    $scope.DeliveryreportData.searchtext = "";
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.DeliveryreportData.limit);
    if(angular.isUndefined($scope.DeliveryreportData.skip)){
      $scope.DeliveryreportData.skip = 0;
    }
    obj.filterData.skip = angular.copy($scope.DeliveryreportData.skip);
    obj.filterData.division = angular.copy($scope.DeliveryreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.DeliveryreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.DeliveryreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.DeliveryreportData.searchtext);
    obj.filterData.deliverytype = "OUTWARD";
    
    $scope.DeliveryreportData.disablescroll = true;
    $scope.DeliveryreportData.deliveryList = [];
    ReportService.getDeliverystatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, function (orders) {
            if(angular.isDefined(orders) && orders !== null && angular.isDefined(orders._id)){
                $scope.DeliveryreportData.deliveryList.push(orders);
            }
        });
        $scope.DeliveryreportData.skip += result.data.length;
        $scope.DeliveryreportData.disablescroll = false;
      } else {
        $scope.DeliveryreportData.disablescroll = true;
      }
      $scope.DeliveryreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.DeliveryreportData.disablescroll = true;
      $scope.DeliveryreportData.pageLoader = false;
    });
  };
  
  $scope.searchDeliverystatement = function () {
    $scope.DeliveryreportData.skip = 0;
    $scope.DeliveryreportData.deliveryList = [];
    $scope.DeliveryreportData.disablescroll = true;
    $scope.viewData();
  }
  
  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Divisiondetail) &&
    result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
      angular.forEach(result.data.Divisiondetail, (division, index) => {
        if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
          if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
          result.data.Currentbranch === division._id) {
            $scope.DeliveryreportData.selectedDivisionid = angular.copy(division._id);
            $scope.DeliveryreportData.selectedDivisionname = angular.copy(division.name);
            $scope.DeliveryreportData.divisionList = [];
          }
          $scope.DeliveryreportData.divisionList.push(angular.copy(division));
        }
        if (index === result.data.Divisiondetail.length - 1) {
          $scope.filterOrderstatement($scope.DeliveryreportData.activeDay);
        }
      });
    }
    $scope.DeliveryreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.DeliveryreportData.pageLoader = false;
  });
  
  $scope.callDateRangePicker = function (startDate, endDate) {
    $scope.DeliveryreportData.FromDate = startDate;
    $scope.DeliveryreportData.ToDate = endDate;
    $scope.DeliveryreportData.skip = 0;
    $scope.DeliveryreportData.deliveryList = [];
    $(".rangeDate").daterangepicker({
      locale: {format: "DD-MM-YYYY"},
      startDate,
      endDate,
    });

    $(".rangeDate").on("apply.daterangepicker", (ev, picker) => {
      $scope.DeliveryreportData.skip = 0;
      $scope.DeliveryreportData.deliveryList = [];
      const ang_startDate = picker.startDate.format("YYYY-MM-DD");
      const ang_endDate = picker.endDate.format("YYYY-MM-DD");
      $scope.DeliveryreportData.FromDate = ang_startDate;
      $scope.DeliveryreportData.ToDate = ang_endDate;
      $scope.DeliveryreportData.disablescroll = true;
      $scope.viewData();
    });
    $scope.DeliveryreportData.disablescroll = true;
    $scope.viewData();
  };
  
  
  $scope.filterOrderstatement = function (data) {
    $scope.DeliveryreportData.activeDay = data;
    const Dateformat = new Date();
    if (data === "TODAY") {
      const curDate = $filter("date")(Dateformat, "dd/MM/yyyy");
      $scope.callDateRangePicker(curDate, curDate);
    }

    if (data === "YDAY") {
      const dt = new Date(Dateformat);
      const yesterDay = dt.setDate(dt.getDate() - 1);

      const currentDate = $filter("date")(new Date(yesterDay), "dd/MM/yyyy");
      $scope.callDateRangePicker(currentDate, currentDate);
    }

    if (data === "7DAY") {
      const dt1 = new Date();
      const be47Day = dt1.setDate(dt1.getDate() - 7);
      const currentDate_format = $filter("date")(new Date(), "dd/MM/yyyy");
      const be4_7day_format = $filter("date")(new Date(be47Day), "dd/MM/yyyy");

      $scope.callDateRangePicker(be4_7day_format, currentDate_format);
    }

    if (data === "THIS_MONTH") {
      const date1 = new Date();
      const firstDt = new Date(date1.getFullYear(), date1.getMonth(), 1);
      const lastDt = new Date(date1.getFullYear(), date1.getMonth() + 1, 0);
      const startdt3 = $filter('date')(new Date(firstDt),'dd/MM/yyyy');
      const enddt3 = $filter('date')(new Date(),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(startdt3, enddt3);
    }

    if (data === "LAST_MONTH") {
      const datedt = new Date();
      const firstDay = new Date(datedt.getFullYear(), datedt.getMonth() - 1, 1);
      const lastDay = new Date(datedt.getFullYear(), datedt.getMonth(), 0);
      const start = $filter('date')(new Date(firstDay),'dd/MM/yyyy');
      const end = $filter('date')(new Date(lastDay),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(start, end);
    }
  };
  
  $scope.printThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.DeliveryreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.DeliveryreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.DeliveryreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.DeliveryreportData.searchtext);
    obj.filterData.deliverytype = "OUTWARD";
    
    $scope.DeliveryreportData.printview = true;
    var todt = obj.filterData.ToDate;
    var fromdt = obj.filterData.FromDate;
    
    ReportService.getDeliveryprintstatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        const templateUrl = $sce.getTrustedResourceUrl("app/views/common/jobcardstatement_print.html");
        deliveryList = angular.copy(result.data);
        selectedDivision = $scope.DeliveryreportData.selectedDivisionname;
        FromDate = fromdt;
        ToDate = todt;
        selectedDivisionId = $scope.DeliveryreportData.selectedDivisionid;
        currency = $scope.DeliveryreportData.currency;
        window.open(templateUrl, "_blank");
      }
      $scope.DeliveryreportData.printview = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.DeliveryreportData.printview = false;
    });
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.DeliveryreportData.limit);
    obj.filterData.skip = angular.copy($scope.DeliveryreportData.skip);
    obj.filterData.division = angular.copy($scope.DeliveryreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.DeliveryreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.DeliveryreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.DeliveryreportData.searchtext);
    obj.filterData.deliverytype = "OUTWARD";
    
    ReportService.exportdeliverystatement(obj, (result) => {
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
  };
})
.controller("ReturnstatementController", ($scope, $routeParams, DivisionService,  
  DateformatstorageService, DATEFORMATS, Notification, AuthService, commonobjectService, $filter, $q, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.ReturnreportData = {};
  $scope.ReturnreportData.pageLoader = true;
  $scope.ReturnreportData.currentDate = new Date();

  $scope.ReturnreportData.currentRow = -1;
  $scope.ReturnreportData.divisionList = [{_id: "", name: "ALL"}];
  $scope.ReturnreportData.selectedDivisionid = "";
  $scope.ReturnreportData.selectedDivisionname = "ALL";

  $scope.ReturnreportData.activeDay = "THIS_MONTH";
  $scope.ReturnreportData.deliveryList = [];
  $scope.ReturnreportData.limit = 50;
  $scope.ReturnreportData.skip = 0;
  $scope.ReturnreportData.searchtext = "";
  $scope.ReturnreportData.disablescroll = true;
  
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
      $scope.ReturnreportData.selectedDivisionid = angular.copy(division._id);
      $scope.ReturnreportData.selectedDivisionname = angular.copy(division.name);
      $scope.ReturnreportData.pageLoader = true;
      $scope.ReturnreportData.skip = 0;
      $scope.ReturnreportData.deliveryList = [];
      $scope.ReturnreportData.disablescroll = true;
      $scope.viewData();
    }
  };

  $scope.viewData = function () {
    $scope.ReturnreportData.searchtext = "";
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.ReturnreportData.limit);
    if(angular.isUndefined($scope.ReturnreportData.skip)){
      $scope.ReturnreportData.skip = 0;
    }
    obj.filterData.skip = angular.copy($scope.ReturnreportData.skip);
    obj.filterData.division = angular.copy($scope.ReturnreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.ReturnreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.ReturnreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.ReturnreportData.searchtext);
    obj.filterData.deliverytype = "RETURN";
    
    $scope.ReturnreportData.disablescroll = true;
    $scope.ReturnreportData.deliveryList = [];
    ReportService.getDeliverystatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, function (orders) {
            if(angular.isDefined(orders) && orders !== null && angular.isDefined(orders._id)){
                $scope.ReturnreportData.deliveryList.push(orders);
            }
        });
        $scope.ReturnreportData.skip += result.data.length;
        $scope.ReturnreportData.disablescroll = false;
      } else {
        $scope.ReturnreportData.disablescroll = true;
      }
      $scope.ReturnreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.ReturnreportData.disablescroll = true;
      $scope.ReturnreportData.pageLoader = false;
    });
  };
  
  $scope.searchReturnstatement = function () {
    $scope.ReturnreportData.skip = 0;
    $scope.ReturnreportData.deliveryList = [];
    $scope.ReturnreportData.disablescroll = true;
    $scope.viewData();
  }
  
  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Divisiondetail) &&
    result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
      angular.forEach(result.data.Divisiondetail, (division, index) => {
        if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
          if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
          result.data.Currentbranch === division._id) {
            $scope.ReturnreportData.selectedDivisionid = angular.copy(division._id);
            $scope.ReturnreportData.selectedDivisionname = angular.copy(division.name);
            $scope.ReturnreportData.divisionList = [];
          }
          $scope.ReturnreportData.divisionList.push(angular.copy(division));
        }
        if (index === result.data.Divisiondetail.length - 1) {
          $scope.filterOrderstatement($scope.ReturnreportData.activeDay);
        }
      });
    }
    $scope.ReturnreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.ReturnreportData.pageLoader = false;
  });
  
  $scope.callDateRangePicker = function (startDate, endDate) {
    $scope.ReturnreportData.FromDate = startDate;
    $scope.ReturnreportData.ToDate = endDate;
    $scope.ReturnreportData.skip = 0;
    $scope.ReturnreportData.deliveryList = [];
    $(".rangeDate").daterangepicker({
      locale: {format: "DD-MM-YYYY"},
      startDate,
      endDate,
    });

    $(".rangeDate").on("apply.daterangepicker", (ev, picker) => {
      $scope.ReturnreportData.skip = 0;
      $scope.ReturnreportData.deliveryList = [];
      const ang_startDate = picker.startDate.format("YYYY-MM-DD");
      const ang_endDate = picker.endDate.format("YYYY-MM-DD");
      $scope.ReturnreportData.FromDate = ang_startDate;
      $scope.ReturnreportData.ToDate = ang_endDate;
      $scope.ReturnreportData.disablescroll = true;
      $scope.viewData();
    });
    $scope.ReturnreportData.disablescroll = true;
    $scope.viewData();
  };
  
  
  $scope.filterOrderstatement = function (data) {
    $scope.ReturnreportData.activeDay = data;
    const Dateformat = new Date();
    if (data === "TODAY") {
      const curDate = $filter("date")(Dateformat, "dd/MM/yyyy");
      $scope.callDateRangePicker(curDate, curDate);
    }

    if (data === "YDAY") {
      const dt = new Date(Dateformat);
      const yesterDay = dt.setDate(dt.getDate() - 1);

      const currentDate = $filter("date")(new Date(yesterDay), "dd/MM/yyyy");
      $scope.callDateRangePicker(currentDate, currentDate);
    }

    if (data === "7DAY") {
      const dt1 = new Date();
      const be47Day = dt1.setDate(dt1.getDate() - 7);
      const currentDate_format = $filter("date")(new Date(), "dd/MM/yyyy");
      const be4_7day_format = $filter("date")(new Date(be47Day), "dd/MM/yyyy");

      $scope.callDateRangePicker(be4_7day_format, currentDate_format);
    }

    if (data === "THIS_MONTH") {
      const date1 = new Date();
      const firstDt = new Date(date1.getFullYear(), date1.getMonth(), 1);
      const lastDt = new Date(date1.getFullYear(), date1.getMonth() + 1, 0);
      const startdt3 = $filter('date')(new Date(firstDt),'dd/MM/yyyy');
      const enddt3 = $filter('date')(new Date(),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(startdt3, enddt3);
    }

    if (data === "LAST_MONTH") {
      const datedt = new Date();
      const firstDay = new Date(datedt.getFullYear(), datedt.getMonth() - 1, 1);
      const lastDay = new Date(datedt.getFullYear(), datedt.getMonth(), 0);
      const start = $filter('date')(new Date(firstDay),'dd/MM/yyyy');
      const end = $filter('date')(new Date(lastDay),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(start, end);
    }
  };
  
  $scope.printThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.division = angular.copy($scope.ReturnreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.ReturnreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.ReturnreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.ReturnreportData.searchtext);
    obj.filterData.deliverytype = "RETURN";
    
    $scope.ReturnreportData.printview = true;
    var todt = obj.filterData.ToDate;
    var fromdt = obj.filterData.FromDate;
    
    ReportService.getDeliveryprintstatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        const templateUrl = $sce.getTrustedResourceUrl("app/views/common/jobcardstatement_print.html");
        deliveryList = angular.copy(result.data);
        selectedDivision = $scope.ReturnreportData.selectedDivisionname;
        FromDate = fromdt;
        ToDate = todt;
        selectedDivisionId = $scope.ReturnreportData.selectedDivisionid;
        currency = $scope.ReturnreportData.currency;
        window.open(templateUrl, "_blank");
      }
      $scope.ReturnreportData.printview = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.ReturnreportData.printview = false;
    });
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.ReturnreportData.limit);
    obj.filterData.skip = angular.copy($scope.ReturnreportData.skip);
    obj.filterData.division = angular.copy($scope.ReturnreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.ReturnreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.ReturnreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.ReturnreportData.searchtext);
    obj.filterData.deliverytype = "RETURN";
    
    ReportService.exportdeliverystatement(obj, (result) => {
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
  };
})
.controller("DivisionstatementController", ($scope, $routeParams, DivisionService, DateformatstorageService, DATEFORMATS, 
    Notification, AuthService, commonobjectService, $filter, $q, ReportService, $sce) => {
  $scope.UserPrivilege = AuthService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.DivisionreportData = {};
  $scope.DivisionreportData.pageLoader = true;
  $scope.DivisionreportData.currentDate = new Date();
  $scope.DivisionreportData.currency = commonobjectService.getCurrency();
  
  $scope.DivisionreportData.currentRow = -1;
  $scope.DivisionreportData.divisionList = [];
  $scope.DivisionreportData.selectedDivisionid = "";
  $scope.DivisionreportData.selectedDivisionname = "";

  $scope.DivisionreportData.activeDay = "THIS_MONTH";
  $scope.DivisionreportData.ledgerTrans = [];
  $scope.DivisionreportData.InvoiceTrans = {};
  $scope.DivisionreportData.limit = 50;
  $scope.DivisionreportData.skip = 0;
  $scope.DivisionreportData.searchtext = "";
  $scope.DivisionreportData.disablescroll = true;
  $scope.DivisionreportData.sortColumn = "customer_name";
  $scope.DivisionreportData.sortBy = "asc";
  
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
      $scope.DivisionreportData.selectedDivisionid = angular.copy(division._id);
      $scope.DivisionreportData.selectedDivisionname = angular.copy(division.name);
      $scope.DivisionreportData.pageLoader = true;
      $scope.DivisionreportData.skip = 0;
      $scope.DivisionreportData.ledgerTrans = [];
      $scope.DivisionreportData.InvoiceTrans = {};
      $scope.DivisionreportData.disablescroll = false;
      $scope.viewData();
    }
  };
  
  $scope.viewData = function () {
    $scope.DivisionreportData.searchtext = "";
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.DivisionreportData.limit);
    if(angular.isUndefined($scope.DivisionreportData.skip)){
      $scope.DivisionreportData.skip = 0;
    }
    obj.filterData.skip = angular.copy($scope.DivisionreportData.skip);
    obj.filterData.division = angular.copy($scope.DivisionreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.DivisionreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.DivisionreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.DivisionreportData.searchtext);
  
    $scope.DivisionreportData.disablescroll = true;
    $scope.DivisionreportData.ledgerTrans = [];
    $scope.DivisionreportData.InvoiceTrans = {};
    
    ReportService.getDivisionaccountstatement(obj, (result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        angular.forEach(result.data, function (led) {
            if(angular.isDefined(led) && led !== null && angular.isDefined(led._id)){                
                let leddetails = angular.copy(led);
                leddetails.total_received = 0;
                leddetails.total_spend = 0;
                leddetails.total_received += parseFloat(led.opening_balance);
                if (angular.isDefined(leddetails.transaction) && leddetails.transaction !== null && leddetails.transaction.length>0) {                    
                    if (led.type === "INVOICE") {
                        leddetails.total_received = leddetails.transaction.reduce((s, f) => {
                            return parseFloat(f.total) + s; // return the sum of the accumulator and the current time. (as the the new accumulator)
                        }, 0); // initial value of 0
                        leddetails.balance = parseFloat(leddetails.total_received);
                        $scope.DivisionreportData.InvoiceTrans = leddetails;
                    } else {
                        var debitentry = _.filter(leddetails.transaction, function(led){
                            return led.transaction_type === "DEBIT";
                        });
                        var creditentry = _.filter(leddetails.transaction, function(led){
                            return led.transaction_type === "CREDIT";
                        });
                        leddetails.total_received = creditentry.reduce((s, f) => {
                            return parseFloat(f.transaction_amount) + s; // return the sum of the accumulator and the current time. (as the the new accumulator)
                        }, 0); // initial value of 0
                        leddetails.total_spend = debitentry.reduce((s, f) => {
                            return parseFloat(f.transaction_amount) + s; // return the sum of the accumulator and the current time. (as the the new accumulator)
                        }, 0); // initial value of 0
                        leddetails.balance = parseFloat(leddetails.total_received) - parseFloat(leddetails.total_spend);
                        
                        $scope.DivisionreportData.ledgerTrans.push(leddetails);
                    }
                } else {
                    leddetails.balance = parseFloat(leddetails.total_received);
                    if (led.type === "INVOICE") {
                        $scope.DivisionreportData.InvoiceTrans = leddetails;
                    } else {
                        $scope.DivisionreportData.ledgerTrans.push(leddetails);
                    }
                }
            }
        });
        $scope.DivisionreportData.skip += result.data.length;
        $scope.DivisionreportData.disablescroll = false;
      } else {
        $scope.DivisionreportData.disablescroll = true;
      }
      $scope.DivisionreportData.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.DivisionreportData.disablescroll = true;
      $scope.DivisionreportData.pageLoader = false;
    });
  };
  
  $scope.searchJobstatementsearchAccountstatement = function () {
    $scope.DivisionreportData.skip = 0;
    $scope.DivisionreportData.ledgerTrans = [];
    $scope.DivisionreportData.InvoiceTrans = {};
    $scope.DivisionreportData.disablescroll = false;
  }
  
  DivisionService.getDivisions((result) => {
    if (result !== null && angular.isDefined(result.data) && result.data !== null) {
      if (angular.isDefined(result.data.Divisiondetail) && result.data.Divisiondetail !== null && result.data.Divisiondetail.length > 0) {
        angular.forEach(result.data.Divisiondetail, (division, index) => {
          if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
            if (angular.isDefined(result.data.Currentbranch) && result.data.Currentbranch !== null && result.data.Currentbranch !== "" &&
            result.data.Currentbranch === division._id) {
              $scope.DivisionreportData.selectedDivisionid = angular.copy(division._id);
              $scope.DivisionreportData.selectedDivisionname = angular.copy(division.name);
              $scope.DivisionreportData.divisionList = [];
            }
            $scope.DivisionreportData.divisionList.push(angular.copy(division));
          }
          if (index === result.data.Divisiondetail.length - 1) {
            if ($scope.DivisionreportData.selectedDivisionid === "" && $scope.DivisionreportData.selectedDivisionname === "") {
                $scope.DivisionreportData.selectedDivisionid = $scope.DivisionreportData.divisionList[0]._id;
                $scope.DivisionreportData.selectedDivisionname = $scope.DivisionreportData.divisionList[0].name;
            }
            
            $scope.filterOrderstatement($scope.DivisionreportData.activeDay);
          }
        });
      }      
    }
    $scope.DivisionreportData.pageLoader = false;
  }, (error) => {
    if (error !== null && angular.isDefined(error.message)) {
      Notification.error(error.message);
    }
    $scope.DivisionreportData.pageLoader = false;
  });
  
  $scope.callDateRangePicker = function (startDate, endDate) {
    $scope.DivisionreportData.FromDate = startDate;
    $scope.DivisionreportData.ToDate = endDate;
    $scope.DivisionreportData.skip = 0;
    $scope.DivisionreportData.ledgerTrans = [];
    $scope.DivisionreportData.InvoiceTrans = {};
    const curDate = moment(new Date()).format("DD/MM/YYYY");
    $(".rangeDate").daterangepicker({
      locale: {format: "DD-MM-YYYY"},
      startDate : startDate,
      endDate : endDate,
      maxDate : curDate
    });

    $(".rangeDate").on("apply.daterangepicker", (ev, picker) => {
      $scope.DivisionreportData.skip = 0;
      $scope.DivisionreportData.ledgerTrans = [];
      $scope.DivisionreportData.InvoiceTrans = {};
      const ang_startDate = picker.startDate.format("YYYY-MM-DD");
      const ang_endDate = picker.endDate.format("YYYY-MM-DD");
      $scope.DivisionreportData.FromDate = ang_startDate;
      $scope.DivisionreportData.ToDate = ang_endDate;
      $scope.viewData();
    });
    $scope.viewData();
  };
  
  
  $scope.filterOrderstatement = function (data) {
    $scope.DivisionreportData.activeDay = data;
    const Dateformat = new Date();
    if (data === "TODAY") {
      const curDate = $filter("date")(Dateformat, "dd/MM/yyyy");
      $scope.callDateRangePicker(curDate, curDate);
    }

    if (data === "YDAY") {
      const dt = new Date(Dateformat);
      const yesterDay = dt.setDate(dt.getDate() - 1);
      const currentDate = $filter("date")(new Date(yesterDay), "dd/MM/yyyy");
      
      $scope.callDateRangePicker(currentDate, currentDate);
    }

    if (data === "7DAY") {
      const dt1 = new Date();
      const be47Day = dt1.setDate(dt1.getDate() - 7);
      const currentDate_format = $filter("date")(new Date(), "dd/MM/yyyy");
      const be4_7day_format = $filter("date")(new Date(be47Day), "dd/MM/yyyy");

      $scope.callDateRangePicker(be4_7day_format, currentDate_format);
    }

    if (data === "THIS_MONTH") {
      const date1 = new Date();
      const firstDt = new Date(date1.getFullYear(), date1.getMonth(), 1);
      const lastDt = new Date(date1.getFullYear(), date1.getMonth() + 1, 0);
      const startdt3 = $filter('date')(new Date(firstDt),'dd/MM/yyyy');
      const enddt3 = $filter('date')(new Date(),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(startdt3, enddt3);
    }

    if (data === "LAST_MONTH") {
      const datedt = new Date();
      const firstDay = new Date(datedt.getFullYear(), datedt.getMonth() - 1, 1);
      const lastDay = new Date(datedt.getFullYear(), datedt.getMonth(), 0);
      const start = $filter('date')(new Date(firstDay),'dd/MM/yyyy');
      const end = $filter('date')(new Date(lastDay),'dd/MM/yyyy');
      
      $scope.callDateRangePicker(start, end);
    }
  };
    
  $scope.printThisReport = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/divisionstatement_print.html");
    const obj = {};
    obj.currency = $scope.DivisionreportData.currency;
    obj.selectedDivision = $scope.DivisionreportData.selectedDivisionname;
    obj.dateformats = $scope.dateformats;
    obj.FromDate = $scope.DivisionreportData.FromDate;
    obj.ToDate = $scope.DivisionreportData.ToDate;
    obj.selectedDivisionId = $scope.DivisionreportData.selectedDivisionid;
    obj.ledgerTrans = $scope.DivisionreportData.ledgerTrans;
    obj.InvoiceTrans = $scope.DivisionreportData.InvoiceTrans;
    divisionstatement = obj;
    window.open(templateUrl, "_blank");
  };
  
  $scope.exportThisReport = function () {
    const obj = {};
    obj.filterData = {};
    obj.filterData.limit = angular.copy($scope.DivisionreportData.limit);
    obj.filterData.skip = angular.copy($scope.DivisionreportData.skip);
    obj.filterData.division = angular.copy($scope.DivisionreportData.selectedDivisionid);
    obj.filterData.FromDate = angular.copy($scope.DivisionreportData.FromDate);
    obj.filterData.ToDate = angular.copy($scope.DivisionreportData.ToDate);
    obj.filterData.searchtext = angular.copy($scope.DivisionreportData.searchtext);
    
    ReportService.exportpendingdelivery(obj, (result) => {
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
  };
});
