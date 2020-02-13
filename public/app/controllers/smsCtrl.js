/* global angular */
angular.module("smsCtrl", []).controller("smsController", ($scope, $uibModal, $log, SmsgatewayService, Notification, validateField) => {
  // Codes scope variables
  $scope.smsGatewayForm = {};

  $scope.getData = function () {
    SmsgatewayService.get((result) => {
      if (result !== null && angular.isDefined(result.success) && angular.isDefined(result.data)) {
        $scope.smsGatewayForm = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.getData();

  // SMS Gateway Action --->Create
  $scope.updateGateway = function (gateway) {
    if (angular.isUndefined(gateway) || gateway === null) {
      Notification.error("Please enter value for all the fields and then update.");
      return false;
    }

    const gatewayfield = [
      {field: "url", type: "string"},
      {field: "username", type: "string"},
      {field: "password", type: "string"},
      {field: "senderid", type: "string"},
    ];

    const gatewaymsgData = {
      url: "Please enter the values for Url.",
      username: "Please enter the values for Username.",
      password: "Please enter value for Password",
      senderid: "Please enter value for Sender ID",
    };

    validateField.validate(gateway, gatewayfield, gatewaymsgData).then((gatewayMsg) => {
      if (angular.isDefined(gatewayMsg) && gatewayMsg !== null && gatewayMsg !== "") {
        Notification.error("Please enter value for all the fields and then update.");
      } else {
        let obj = {};
        obj.smsGatewayForm = gateway;

        SmsgatewayService.create(obj, (result) => {
          obj = null;
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
        }, (error) => {
          obj = null;
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
        });
      }
    });
  };
});


