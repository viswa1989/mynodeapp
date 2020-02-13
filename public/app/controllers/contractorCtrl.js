/* global angular */
angular.module("contractorCtrl", []).controller("ContractorController", ($scope, $routeParams, $rootScope, Notification, $log, ContractorService) => {
  $scope.contractorForm = {};
  $scope.contractorData = {};
  $scope.contractorData.contractorList = [];
  $scope.contractorData.contractorTabselect = "Profile";
  $scope.contractorData.viewContractor = false;
  $scope.contractorData.pageLoad = true;
  $scope.contractorData.eventLoad = false;
  $scope.contractorForm.processList = [];

  $scope.imageloc = "Uploads/contractor_picture/";

  // List
  $scope.list = function () {
    $scope.contractorData.pageLoad = true;
    ContractorService.get((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.contractorData.contractorList = angular.copy(result.data);
      }
      $scope.contractorData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.contractorData.pageLoad = false;
    });
  };

  // Process List
  $scope.processlist = function () {
    if (angular.isDefined($scope.contractorForm._id)) {
      $scope.contractorData.processLoad = true;
      ContractorService.getProcesslist($scope.contractorForm._id, (result) => {
        $scope.contractorForm.processList = [];
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
          $scope.contractorForm.processList = angular.copy(result.data);
        }
        $scope.contractorData.processLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.contractorData.processLoad = false;
      });
    }
  };

  $scope.add = function () {
    $scope.contractorData.formsubmission = false;
    $scope.contractorForm = {};
    $scope.contractorData.imagesrc = false;
    $scope.contractorData.loadedfile = "";
    $scope.contractorData.loadedfile = "";
    $scope.contractorForm.is_active = true;
    $scope.contractorData.contractorTabselect = "Profile";
    $scope.contractorData.viewContractor = true;
  };
  $scope.list();

  $scope.selectTab = function (menu) {
    if (menu === "Profile" || menu === "Process") {
      if (menu === "Process") {
        if (angular.isUndefined($scope.contractorForm._id)) {
          Notification.warning("Please save the contractor profile details to add process");
          return false;
        }
        $scope.contractorData.processLoad = false;
        $scope.contractorData.formsubmission = false;
        $scope.processlist();
        $scope.contractorData.contractorTabselect = menu;
      } else {
        $scope.contractorData.contractorTabselect = menu;
      }
    }
  };

  // On file upload display and assign to scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files)) {
      $scope.files = [];
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.profile_picture = [];
        if (angular.isUndefined($scope.contractorForm._id) || $scope.contractorForm._id === null || $scope.contractorForm._id === "") {
          angular.forEach($scope.files, (profilepics) => {
            $scope.profile_picture.push(profilepics);
            const reader = new FileReader();
            reader.readAsDataURL(profilepics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.contractorData.loadedfile = e.target.result;
                $scope.contractorData.imagesrc = true;
              });
            };
          });
        } else if (angular.isDefined($scope.contractorForm._id) && $scope.contractorForm._id !== null && $scope.contractorForm._id !== "") {
          angular.forEach($scope.files, (profilepics) => {
            $scope.profile_picture.push(profilepics);
            const reader = new FileReader();
            reader.readAsDataURL(profilepics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.contractorData.loadedfile = e.target.result;
                $scope.contractorData.imagesrc = true;
                const obj = {};
                obj.contractorForm = angular.copy($scope.contractorForm);
                if ($scope.profile_picture.length > 0) {
                  obj.profile_picture = angular.copy($scope.profile_picture);
                }

                ContractorService.updatePicture(obj, (result) => {
                  if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (angular.isDefined(result.filename)) {
                        $scope.contractorForm.profile_picture = result.filename;
                        angular.forEach($scope.contractorData.contractorList, (user) => {
                          if (!angular.isUndefined(user._id) && !angular.isUndefined($scope.contractorForm._id) &&
                            user._id === $scope.contractorForm._id) {
                            user.profile_picture = $scope.contractorForm.profile_picture;
                          }
                        });
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
              });
            };
          });
        }
      }
    }
  };

  // Create
  $scope.create = function (valid) {
    $scope.contractorData.formsubmission = true;
    if (!valid) {
      return false;
    }

    const obj = {};
    obj.contractorForm = angular.copy($scope.contractorForm);
    if (angular.isDefined(obj.contractorForm.processList)) {
      obj.contractorForm.processList = [];
    }
    if (angular.isDefined($scope.profile_picture) && $scope.profile_picture.length > 0) {
      obj.profile_picture = $scope.profile_picture;
    }
    $scope.contractorData.eventLoad = true;

    ContractorService.create(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.contractorData.contractorList.push(angular.copy(result.data));
          } else {
            $scope.list();
          }
          $scope.contractorForm = {};
          $scope.profile_picture = [];
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }
      $scope.contractorData.viewContractor = false;
      $scope.contractorData.formsubmission = false;
      $scope.contractorData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.contractorData.formsubmission = false;
      $scope.contractorData.eventLoad = false;
    });
  };

  // Update
  $scope.update = function (valid) {
    $scope.contractorData.formsubmission = true;
    if (!valid) {
      return false;
    }
    const obj = {};
    obj.contractorForm = angular.copy($scope.contractorForm);
    if (angular.isDefined(obj.contractorForm.processList)) {
      obj.contractorForm.processList = [];
    }
    obj.profile_picture = angular.copy($scope.profile_picture);
    $scope.contractorData.eventLoad = true;

    ContractorService.update(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.contractorData.contractorList.push(angular.copy(result.data));
          } else {
            $scope.list();
          }
          $scope.contractorData.viewContractor = false;
          $scope.contractorForm = {};
          $scope.profile_picture = [];
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }
      $scope.contractorData.formsubmission = false;
      $scope.contractorData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.contractorData.formsubmission = false;
      $scope.contractorData.eventLoad = false;
    });
  };

  $scope.getContractorbyId = function (id) {
    if (id !== "") {
      $scope.contractorForm = {};
      $scope.contractorData.imagesrc = false;
      $scope.contractorData.loadedfile = "";
      $scope.contractorData.formsubmission = false;

      ContractorService.getById(id, (data) => {
        if (angular.isDefined(data) && data !== null && data !== "" && angular.isDefined(data._id)) {
          $scope.contractorForm = angular.copy(data);
          $scope.contractorForm.processList = [];
          if (!angular.isUndefined($scope.contractorForm.profile_picture) && $scope.contractorForm.profile_picture !== "") {
            $scope.contractorData.imagesrc = true;
            $scope.contractorData.loadedfile = $scope.imageloc + $scope.contractorForm.profile_picture;
          }
          $scope.contractorData.contractorTabselect = "Profile";
          $scope.contractorData.viewContractor = true;
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  $scope.closeContractorview = function () {
    $scope.contractorData.viewContractor = false;
    $scope.contractorData.contractorList = [];
    $scope.list();
    $scope.contractorForm = {};
  };

  $scope.addProcess = function () {
    $scope.contractorData.formsubmission = false;
    const obj = {};
    obj.process_name = "";
    obj.subprocess_name = "";
    obj.is_active = true;
    obj.is_deleted = false;
    obj.editable = true;
    $scope.contractorForm.processList.push(angular.copy(obj));
  };

  $scope.deleteProcess = function (process) {
    if (angular.isDefined(process) && process !== null && angular.isDefined(process._id)) {
      process.is_deleted = true;
    } else {
      const index = $scope.contractorForm.processList.indexOf(process);
      if (index > -1) {
        $scope.contractorForm.processList.splice(index, 1);
      }
    }
  };

  $scope.updateProcess = function (valid) {
    if (angular.isDefined($scope.contractorForm._id)) {
      if (angular.isUndefined($scope.contractorForm.processList) || $scope.contractorForm.processList.length === 0) {
        Notification.error("Add process to update");
        return false;
      }
      $scope.contractorData.formsubmission = true;
      if (!valid) {
        return false;
      }
      const obj = {};
      obj._id = angular.copy($scope.contractorForm._id);
      obj.name = angular.copy($scope.contractorForm.company_name);
      obj.processList = angular.copy($scope.contractorForm.processList);
      $scope.contractorData.eventLoad = true;

      ContractorService.updateProcess(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            Notification.success(result.message);
          }
        }
        $scope.processlist();
        $scope.contractorData.formsubmission = false;
        $scope.contractorData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.contractorData.formsubmission = false;
        $scope.contractorData.eventLoad = false;
      });
    }
  };

  $scope.closeForm = function () {
    $scope.contractorForm = {};
    $scope.contractorData.viewContractor = false;
  };
});
