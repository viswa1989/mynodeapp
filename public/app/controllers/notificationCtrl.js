/* global angular */
angular.module("notificationCtrl", []).controller("NotificationController", ($scope, $routeParams, $location, Notification,
  ActivityService, angularGridInstance, DateformatstorageService, DATEFORMATS, $timeout, socket) => {
  $scope.activity = {};
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;
  $scope.activity.searchnotification = "";
  $scope.activity.selectednotifymenu = "";
  $scope.activity.selectednotifydates = "";
  $scope.activity.notificationData = [];
  $scope.activity.disablescroll = false;
  $scope.activity.skip = 0;
  $scope.activity.limit = 50;
  $scope.activity.loader = false;

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

  // User Action --->Fetch notification
  $scope.getNotification = function () {
    if ($scope.activity.selectednotifymenu === "") {
      $scope.activity.selectednotifymenu = "ALL";
    }
    if ($scope.activity.selectednotifydates === "") {
      $scope.activity.selectednotifydates = "TODAY";
    }
    const obj = {};
    obj.category = angular.copy($scope.activity.selectednotifymenu);
    obj.period = angular.copy($scope.activity.selectednotifydates);
    obj.skip = angular.copy($scope.activity.skip);
    obj.limit = angular.copy($scope.activity.limit);
    $scope.activity.disablescroll = true;
    $scope.activity.loader = true;
    ActivityService.getNotification(obj, (result) => {
      if (angular.isDefined(result.success) && result.success) {
        if (angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
          angular.forEach(result.data, (notify, index) => {
            $scope.activity.notificationData.push(angular.copy(notify));
            if (index === result.data.length - 1) {
              $timeout(() => {
                $scope.$broadcast("masonry.reload");
              }, 100);
              $scope.activity.skip += result.data.length;
              $scope.activity.disablescroll = false;
            }
          });
        } else {
          $timeout(() => {
            $scope.activity.disablescroll = false;
          }, 5000);
          $scope.$broadcast("masonry.reload");
        }
      } else {
        $timeout(() => {
          $scope.activity.disablescroll = false;
        }, 5000);
        $scope.$broadcast("masonry.reload");
      }
      $scope.activity.loader = false;
    }, (error) => {
      $scope.activity.loader = false;
      $scope.activity.disablescroll = false;
    });
  };

  $scope.selectnotifycategory = function (data) {
    $scope.activity.skip = 0;
    $scope.activity.selectednotifymenu = data;
    $scope.activity.notificationData = [];
    $scope.getNotification();
  };

  $scope.selectnotifyfilter = function (data) {
    $scope.activity.skip = 0;
    $scope.activity.selectednotifydates = data;
    $scope.activity.notificationData = [];
    $scope.getNotification();
  };

  $scope.expand_notification = function (e, th) {
    expand_div_click_toggle(e, th);
    // $timeout(() => {
    angularGridInstance.gallery.refresh();
    // $scope.$broadcast("masonry.reload");
    // }, 100);
  };

  socket.on("updateNotification", (Activity) => {
    if (angular.isDefined(Activity) && angular.isDefined(Activity._id) && Activity._id !== "" && ($scope.activity.selectednotifydates === "TODAY" ||
            $scope.activity.selectednotifydates === "ALL")) {
      if (angular.isDefined(Activity.MENU) && Activity.MENU !== "") {
        if ($scope.activity.selectednotifymenu === "ALL") {
          $scope.activity.notificationData.unshift(angular.copy(Activity));
        } else if ($scope.activity.selectednotifymenu !== "ALL" && $scope.activity.selectednotifymenu === Activity.MENU) {
          $scope.activity.notificationData.unshift(angular.copy(Activity));
        }
      }
    }
  });

  $scope.loadMorenotification = function () {
    $scope.getNotification();
  };

  $scope.getNotification();
});
