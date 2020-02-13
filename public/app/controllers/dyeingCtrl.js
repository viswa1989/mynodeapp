/* global angular */
angular.module("dyeingCtrl", []).controller("DyeingController", ($scope, $routeParams, $rootScope, Notification, $uibModal, $log,
  DyeingDetailService, DateformatstorageService, DATEFORMATS) => {
  $scope.config = {};
  $scope.config.primaryColor = "#b9b9c8";
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.dyeingForm = {};
  $scope.dyeingData = {};
  $scope.dyeingData.dyeingList = [];
  $scope.imageloc = "Uploads/dyeing_picture/";

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

  $scope.get_dyeing_data = function () {
    DyeingDetailService.get((result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.dyeingData.dyeingList = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.add_dyeing = function () {
    $scope.dyeingData.dyeing = "ADD";
    $scope.dyeingForm = {};
    $scope.dyeingData.imagesrc = false;
    $scope.dyeingData.loadedfile = "";
    $scope.showbrandform = false;
    $scope.dyeingForm.is_active = true;
    $scope.open("lg");
  };

  $scope.updateDyeing = function (proc) {
    if (proc !== "") {
      $scope.dyeingForm = {};
      $scope.dyeingData.imagesrc = false;
      $scope.dyeingData.loadedfile = "";
      $scope.dyeingData.dyeing = "UPDATE";
      $scope.dyeingForm = angular.copy(proc);
      if (!angular.isUndefined($scope.dyeingForm.dyeing_picture) && $scope.dyeingForm.dyeing_picture !== "") {
        $scope.dyeingData.imagesrc = true;
        $scope.dyeingData.loadedfile = $scope.imageloc + $scope.dyeingForm.dyeing_picture;
      }
      $scope.open("lg");
    }
  };

  $scope.open = function (size) {
    const contain = angular.element(document.getElementsByClassName("c_setup_iframe"));
    const modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      appendTo: contain,
      templateUrl: "app/views/superadmin/setup/dyeingDetails_popup.html",
      controller: "DyeingDetailsController",
      size,
      resolve: {
        dyeingForm() {
          return $scope.dyeingForm;
        },
        dyeingData() {
          return $scope.dyeingData;
        },
      },
    });

    modalInstance.result.then((result) => {
      if (angular.isUndefined(result) || result === null) {
        $scope.get_dyeing_data();
      }
    }, () => {
      $log.info(`Modal dismissed at: ${new Date()}`);
    });
  };

  $scope.get_dyeing_data();
}).controller("DyeingDetailsController", ($scope, $uibModalInstance, dyeingForm, dyeingData, DyeingDetailService, Notification) => {
  $scope.dyeing_picture = [];
  $scope.dyeingForm = dyeingForm;
  $scope.dyeingData = dyeingData;
  $scope.dyeingData.dyeingsubmission = false;
  $scope.dyeingData.showmenu = false;
  $scope.dyeingData.removemsg = false;
  $scope.dyeingData.eventLoad = false;

  $scope.files = [];

  $scope.toggleproc = function (dyeForm) {
    if (angular.isDefined(dyeForm) && angular.isDefined(dyeForm._id)) {
      $scope.dyeingData.eventLoad = true;
      const obj = angular.copy(dyeForm);
      obj.is_active = !obj.is_active;

      DyeingDetailService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.dyeingData.dyeingList, (dyelist, index) => {
              if (angular.isDefined(dyelist) && dyelist !== null && angular.isDefined(dyelist._id) && dyelist._id === obj._id) {
                $scope.dyeingData.dyeingList[index].is_active = angular.copy(obj.is_active);
              }
            });
            Notification.success(result.message);
            $scope.dyeingForm.is_active = !$scope.dyeingForm.is_active;
          } else {
            Notification.error(result.message);
          }
        }
        $scope.dyeingData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.dyeingData.eventLoad = false;
      });
    }
  };

  $scope.showMenu = function () {
    if (angular.isDefined($scope.dyeingData.dyeing) && $scope.dyeingData.dyeing !== "ADD") {
      $scope.dyeingData.showmenu = !$scope.dyeingData.showmenu;
      if (!$scope.dyeingData.showmenu) {
        $scope.dyeingData.removemsg = false;
      }
    }
  };

  $scope.toggleremoveMessage = function () {
    $scope.dyeingData.removemsg = !$scope.dyeingData.removemsg;
  };
  // Push and show file to the scope
  $scope.onFileSelect = function ($files) {
    //        if (errFiles !== null && errFiles.length > 0 && angular.isDefined(errFiles[0].$error)) {
    //            var msg = "Can't upload file. Please try again later.";
    //            if (errFiles[0].$error === "maxSize") {
    //                if (angular.isDefined(errFiles[0].$errorParam) && errFiles[0].$errorParam !== null && errFiles[0].$errorParam !== "") {
    //                    msg = "File size should be less than " + errFiles[0].$errorParam;
    //                } else {
    //                    msg = "File is too large to upload.";
    //                }
    //            } else if (errFiles[0].$error === "pattern") {
    //                msg = "Invalid file format.";
    //            } else {
    //                msg = "Can't upload file. Please try again later.";
    //            }
    //            Notification.warning(msg);
    //            return false;
    //        } else {
    if ($files !== "" && isNaN($files)) {
      $scope.files = [];
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.dyeing_picture = [];
        if ($scope.dyeingData.dyeing === "ADD") {
          angular.forEach($scope.files, (procpics) => {
            $scope.dyeing_picture.push(procpics);
            const reader = new FileReader();
            reader.readAsDataURL(procpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.dyeingData.loadedfile = e.target.result;
                $scope.dyeingData.imagesrc = true;
              });
            };
          });
        } else if ($scope.dyeingData.dyeing === "UPDATE") {
          angular.forEach($scope.files, (procpics) => {
            $scope.dyeing_picture.push(procpics);
            const reader = new FileReader();
            reader.readAsDataURL(procpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                //                                    $scope.dyeingData.loadedfile = e.target.result;
                $scope.dyeingData.imagesrc = true;
                const obj = {};
                obj.dyeingForm = $scope.dyeingForm;
                if ($scope.dyeing_picture.length > 0) {
                  obj.dyeing_picture = $scope.dyeing_picture;
                }
                DyeingDetailService.updatePicture(obj, (result) => {
                  if (result !== null && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (result.filename) {
                        $scope.dyeingForm.dyeing_picture = result.filename;
                        angular.forEach($scope.dyeingData.dyeingList, (procs) => {
                          if (!angular.isUndefined(procs._id) && !angular.isUndefined($scope.dyeingForm._id) && procs._id === $scope.dyeingForm._id) {
                            procs.dyeing_picture = $scope.dyeingForm.dyeing_picture;
                          }
                        });
                        Notification.success(result.message);
                      }
                      $scope.dyeingData.loadedfile = e.target.result;
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
    //        }
  };

  // Action --->Create
  $scope.create = function (valid) {
    $scope.dyeingData.dyeingsubmission = true;
    if (!valid) {
      return false;
    }
    const obj = {};
    obj.dyeingForm = $scope.dyeingForm;

    if ($scope.dyeing_picture.length > 0) {
      obj.dyeing_picture = $scope.dyeing_picture;
    }
    $scope.dyeingData.eventLoad = true;
    DyeingDetailService.create(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.dyeingData.dyeingList.push(angular.copy(result.data));
            $scope.dyeingData.dyeing = "";
            $scope.dyeingForm = {};
            $scope.dyeing_picture = [];
            Notification.success(result.message);
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.dyeingData.dyeingsubmission = false;
      $scope.dyeingData.eventLoad = false;
    }, (error) => {
      $scope.dyeingData.eventLoad = false;
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Action --->Update
  $scope.update = function (valid) {
    $scope.dyeingData.dyeingsubmission = true;
    if (!valid) {
      return false;
    }
    const obj = {};
    obj.dyeingForm = $scope.dyeingForm;
    $scope.dyeingData.eventLoad = true;
    DyeingDetailService.update(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.dyeingData.dyeing = "";
            $scope.dyeingForm = {};
            $scope.dyeing_picture = [];
            Notification.success(result.message);
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.dyeingData.dyeingsubmission = false;
      $scope.dyeingData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.dyeingData.eventLoad = false;
    });
  };

  // Action --->Delete
  $scope.delete = function (data) {
    let index = -1;
    angular.forEach($scope.dyeingData.dyeingList, (brand, ind) => {
      if (angular.isDefined(brand._id) && angular.isDefined(data._id) && data._id !== "" && data._id === brand._id) {
        index = ind;
      }
    });

    if (index >= 0) {
      const item = angular.copy(data);
      const Obj = {};
      Obj._id = item._id;
      Obj.name = item.name;
      Obj.is_deleted = true;
      $scope.dyeingData.eventLoad = true;
      DyeingDetailService.delete(Obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.dyeingData.dyeing = "";
          $scope.dyeingForm = {};
          $scope.dyeingData.dyeingList.splice(index, 1);
          Notification.success(result.message);
          $scope.ok(Obj);
        }
        $scope.dyeingData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.dyeingData.eventLoad = false;
      });
    }
  };

  $scope.ok = function (data) {
    $uibModalInstance.close(data);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss("cancel");
  };
});
