/* global angular */
angular.module("preferenesCtrl", []).controller("PreferenesController", ($scope, $uibModal, $log, $routeParams, PreferenceService,
  Notification, validateField) => {
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;

  // Codes scope variables
  $scope.preferenceForm = {};
  $scope.preferenceData = {};

  $scope.preferenceData.pageLoad = true;
  $scope.preferenceData.contentLoad = true;
  $scope.preferenceData.eventLoad = false;

  $scope.preferenceForm.preferences = [];
  $scope.preferenceForm.inputType = "password";

  // Preferences Action --->List
  $scope.list = function () {
    $scope.preferenceData.pageLoad = true;
    $scope.preferenceForm.preferences = [];

    PreferenceService.get((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.preferenceForm.preferences = angular.copy(result.data);
      }
      $scope.preferenceData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.preferenceData.pageLoad = false;
    });
  };
  $scope.list();

  $scope.addPreference = function () {
    const obj = {};
    obj.module = "";
    obj.preference = "";
    obj.value = "";
    $scope.preferenceForm.preferences.push(obj);
  };

  // Preferences Action --->Create
  $scope.create = function (preference) {
    let obj = {};

    if (!angular.isUndefined(preference) && !angular.isUndefined(preference._id) && preference._id !== "" &&
        !angular.isUndefined(preference.module) && preference.module !== "" && !angular.isUndefined(preference.preference) &&
        preference.preference !== "" && !angular.isUndefined(preference.value) && preference.value !== "") {
      obj.preferenceForm = preference;
      PreferenceService.update(obj, (result) => {
        obj = null;
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            $scope.list();
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
    } else if (!angular.isUndefined(preference.module) && preference.module !== "" && !angular.isUndefined(preference.preference) &&
        preference.preference !== "" && !angular.isUndefined(preference.value) && preference.value !== "") {
      obj.preferenceForm = preference;

      PreferenceService.create(obj, (result) => {
        obj = null;
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            $scope.list();
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
    } else {
      obj = null;
      return false;
    }
  };

  // Preferences Action --->Create
  $scope.updatePreferences = function (preference) {
    const preferencefield = [{field: "module", type: "string"},
      {field: "preference", type: "string"},
      {field: "value", type: "string"}];

    const preferencemsgData = {module: "Please enter the values for module.",
      preference: "Please enter the values for preference.",
      value: "Please enter value for preference"};
    if (angular.isUndefined($scope.preferenceForm.userPassword) || $scope.preferenceForm.userPassword === null ||
        $scope.preferenceForm.userPassword === "") {
      $scope.preferenceForm.userPasswordvalid = true;
      Notification.error("Please enter developer password to update the preferences.");
    } else {
      $scope.preferenceForm.userPasswordvalid = false;

      if (angular.isDefined(preference) && preference !== null && preference !== "" && preference.length > 0) {
        validateField.validateGroup(preference, preferencefield, preferencemsgData).then((preferenceMsg) => {
          if (angular.isDefined(preferenceMsg) && preferenceMsg !== null && preferenceMsg !== "") {
            Notification.error("Please enter value for all the fields and then update.");
          } else {
            let obj = {};
            obj.preferenceForm = preference;
            obj.preferencePassword = angular.copy($scope.preferenceForm.userPassword);

            PreferenceService.updatePreferencelist(obj, (result) => {
              obj = null;
              if (result !== null && angular.isDefined(result.success)) {
                if (result.success) {
                  $scope.list();
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
      } else {
        Notification.error("Preferences is empty you can't update.");
      }
    }
  };

  $scope.showpassword = function (type) {
    $scope.preferenceForm.inputType = type;
  };

  // Preferences Action --->Update
  $scope.updatestatus = function (id, status, index) {
    if (!angular.isUndefined(id) && id !== "") {
      const obj = {};
      obj.id = id;
      obj.is_active = !status;

      PreferenceService.updatestatus(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              $scope.preferenceForm.preferences[index] = result.data;
              Notification.success(result.message);
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
  };

  // Preferences Action --->Delete
  $scope.delete = function (id, index) {
    if (!angular.isUndefined(id) && id !== "" && index !== "") {
      const obj = {};
      obj.id = id;

      PreferenceService.delete(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.preferenceForm.preferences.splice(index, 1);
          Notification.success(result.message);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };
});
