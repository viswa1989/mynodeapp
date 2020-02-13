/* global angular */
angular.module("manageCtrl", []).controller("ManageController", ($scope, $routeParams, $rootScope, Notification, $uibModal, $log,
  TypeService, ColorService, MeasureService) => {
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;

  $scope.manageData = {};
  $scope.manageData.types = [];
  $scope.manageData.colors = [];
  $scope.manageData.measures = [];
  $scope.config = {};
  $scope.config.primaryColor = "#b9b9c8";
  
  // List types
  $scope.list_type = function () {
    TypeService.get((result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.manageData.types = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Add new types temporary
  $scope.newType = function () {
    $scope.manageData.types.push({fabric_type: ""});
  };

  // Update types
  $scope.update_type = function (type) {
    if (angular.isDefined(type) && angular.isDefined(type._id)) {
      TypeService.update(type, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            Notification.success(result.message);
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

  // Active / Inactive types
  $scope.toggleFabrictype = function (type) {
    if (angular.isDefined(type) && angular.isDefined(type._id)) {
      const obj = angular.copy(type);
      obj.is_active = !type.is_active;

      TypeService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            Notification.success(result.message);
            type.is_active = !type.is_active;
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

  // Save new types
  $scope.addType = function (type) {
    if (angular.isDefined(type) && type !== null && angular.isDefined(type.fabric_type) && type.fabric_type !== null && type.fabric_type !== "") {
      if (!angular.isUndefined(type._id) && type._id !== "") {
        $scope.update_type(type);
      } else {
        const obj = {};
        obj.fabric_type = type.fabric_type;
        if (angular.isDefined(type.color) && type.color !== null && type.color !== "") {
          obj.color = type.color;
        } else {
          obj.color = angular.copy($scope.config.primaryColor);
        }

        TypeService.create(obj, (result) => {
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
                type._id = result.data._id;
                type.is_active = result.data.is_active;
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
    }
  };

  // delete fabric type..
  $scope.deleteType = function (id, index) {
    if (!angular.isUndefined(id) && id !== "") {
      const obj = {};
      obj.id = id;

      TypeService.delete(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.manageData.types.splice(index, 1);
          Notification.success(result.message);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    } else {
      $scope.manageData.types.splice(index, 1);
    }
  };

  // List Colors..
  $scope.listColor = function () {
    ColorService.get((result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.manageData.colors = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.new_color = function () {
    $scope.manageData.colors.push({fabric_color: ""});
  };

  $scope.update_color = function (color) {
    if (angular.isDefined(color) && angular.isDefined(color._id)) {
      ColorService.update(color, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            Notification.success(result.message);
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

  $scope.toggleColor = function (color) {
    if (angular.isDefined(color) && angular.isDefined(color._id)) {
      const obj = angular.copy(color);
      obj.is_active = !color.is_active;

      ColorService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            color.is_active = !color.is_active;
            Notification.success(result.message);
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

  $scope.addColor = function (color) {
    if (angular.isDefined(color) && color !== null && angular.isDefined(color.fabric_color) && color.fabric_color !== null &&
        color.fabric_color !== "") {
      if (angular.isUndefined(color.fabric_color_code) || color.fabric_color_code === null || color.fabric_color_code === "") {
        Notification.warning("Please enter code.");
        return false;
      }
      if (!angular.isUndefined(color._id) && color._id !== "") {
        $scope.update_color(color);
      } else {
        const obj = {};
        obj.fabric_color = color.fabric_color;
        obj.fabric_color_code = angular.isDefined(color.fabric_color_code) ? color.fabric_color_code : "";
        if (angular.isDefined(color.color) && color.color !== null && color.color !== "") {
          obj.color = color.color;
        } else {
          obj.color = angular.copy($scope.config.primaryColor);
        }

        ColorService.create(obj, (result) => {
          if (result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
                color._id = result.data._id;
                color.is_active = result.data.is_active;
              }
              Notification.success(result.message);
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
    }
  };

  $scope.addColorcode = function (color, index) {
    if (angular.isDefined(color) && color !== null && angular.isDefined(color.fabric_color) && color.fabric_color !== null &&
        color.fabric_color !== "") {
      $scope.addColor(color, index);
    } else {
      Notification.warning("Please enter colour name to add or update");
    }
  };

  // delete fabric color..
  $scope.deleteColor = function (id, index) {
    if (!angular.isUndefined(id) && id !== "") {
      const obj = {};
      obj.id = id;

      ColorService.delete(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.manageData.colors.splice(index, 1);
          Notification.success(result.message);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    } else {
      $scope.manageData.colors.splice(index, 1);
    }
  };

  // List measures..
  $scope.listMeasure = function () {
    MeasureService.get((result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.manageData.measures = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.newMeasure = function () {
    $scope.manageData.measures.push({fabric_measure: ""});
  };

  $scope.update_measure = function (measure) {
    if (angular.isDefined(measure) && angular.isDefined(measure._id)) {
      MeasureService.update(measure, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  $scope.togglemeasurement = function (measurement) {
    if (angular.isDefined(measurement) && angular.isDefined(measurement._id)) {
      const obj = angular.copy(measurement);
      obj.is_active = !measurement.is_active;

      MeasureService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            measurement.is_active = !measurement.is_active;
            Notification.success(result.message);
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

  $scope.add_measure = function (measure) {
    if (!angular.isUndefined(measure._id) && measure._id !== "") {
      $scope.update_measure(measure);
    } else {
      const obj = {};
      obj.fabric_measure = measure.fabric_measure;

      MeasureService.create(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              measure._id = result.data._id;
              measure.is_active = result.data.is_active;
            }
            Notification.success(result.message);
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

  // delete fabric measure..
  $scope.delete_measure = function (id, index) {
    if (!angular.isUndefined(id) && id !== "") {
      const obj = {};
      obj.id = id;

      MeasureService.delete(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.manageData.measures.splice(index, 1);
          Notification.success(result.message);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    } else {
      $scope.manageData.measures.splice(index, 1);
    }
  };

  // manage pages part begins..
  $scope.managePage = function (fields) {
    switch (true) {
      case fields === "type":
        $rootScope.clientData.manage_page_link = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/manage-type.html`;
        $rootScope.clientData.managePageName = "type";
        $scope.list_type();
        break;

      case fields === "color":
        $rootScope.clientData.manage_page_link = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/manage-color.html`;
        $rootScope.clientData.managePageName = "color";
        $scope.listColor();
        break;

      case fields === "measure":
        $rootScope.clientData.manage_page_link = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/manage-measurement.html`;
        $rootScope.clientData.managePageName = "measure";
        $scope.listMeasure();
        break;
      default:
        $rootScope.clientData.manage_page_link = `app/views/${angular.lowercase($rootScope.currentapp)}/setup/manage-type.html`;
        $rootScope.clientData.managePageName = "type";
        $scope.list_type();
        break;
    }
  };

  // call default manage page..
  $scope.managePage("type");
});
