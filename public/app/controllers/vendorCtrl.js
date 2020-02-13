/* global _ */
/* global angular */
angular.module("vendorCtrl", []).controller("VendorController", ($scope, $uibModal, $log, $routeParams, $location, Notification, VendorService,
  DateformatstorageService, DATEFORMATS) => {
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.vendorForm = {};
  $scope.vendorData = {};
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.vendorData.pageLoad = true;
  $scope.vendorData.contentLoad = true;
  $scope.vendorData.eventLoad = false;

  $scope.imageloc = "Uploads/vendor_picture/";
  $scope.vendorData.imagesrc = false;
  $scope.vendorData.loadedfile = "";
  $scope.vendorData.vendorlist = [];
  $scope.vendorData.process = "";
  $scope.files = [];

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

  // Show modal form to add Vendor
  $scope.addvendor = function () {
    $scope.vendorData.process = "ADD";
    $scope.vendorForm = {};
    $scope.vendorData.imagesrc = false;
    $scope.vendorData.loadedfile = "";
    $scope.showvendorform = false;
    $scope.vendorForm.is_active = true;
    $scope.open("lg");
  };

  // Vendor Action --->List
  $scope.list = function () {
    $scope.vendorData.pageLoad = true;
    $scope.vendorData.vendorlist = [];

    VendorService.get((data) => {
      if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
        $scope.vendorData.vendorlist = angular.copy(data);
      }
      $scope.vendorData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.vendorData.pageLoad = false;
    });
  };
  $scope.list();

  // Vendor Action --->View user by id
  $scope.getvendorbyId = function (id) {
    if (id !== "") {
      $scope.vendorForm = {};
      $scope.vendorData.imagesrc = false;
      $scope.vendorData.loadedfile = "";

      VendorService.getById(id, (data) => {
        if (angular.isDefined(data) && data !== null && angular.isDefined(data._id)) {
          $scope.vendorData.process = "UPDATE";
          if (angular.isDefined(data.brand) && data.brand !== null && data.brand !== "" && data.brand.length > 0) {
            data.brand = _.map(data.brand, (brands) => {
              if (angular.isDefined(brands) && brands !== "" && brands !== "" && angular.isDefined(brands._id)) {
                return brands = brands._id;
              }
              return brands;
            });
          }
          $scope.vendorForm = angular.copy(data);
          if (angular.isDefined($scope.vendorForm.vendor_picture) && $scope.vendorForm.vendor_picture !== "" &&
          $scope.vendorForm.vendor_picture !== null) {
            $scope.vendorData.imagesrc = true;
            $scope.vendorData.loadedfile = $scope.imageloc + $scope.vendorForm.vendor_picture;
          }
          $scope.open("lg");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  $scope.animationsEnabled = true;

  $scope.open = function (size) {
    const contain = angular.element(document.getElementsByClassName("c_setup_iframe"));
    const modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      appendTo: contain,
      templateUrl: "app/views/superadmin/setup/purchaseStocksVendor_popup.html",
      controller: "ModalVendorController",
      size,
      resolve: {
        vendorForm() {
          return $scope.vendorForm;
        },
        vendorData() {
          return $scope.vendorData;
        },
      },
    });

    modalInstance.result.then((result) => {
      if (angular.isUndefined(result) || result === null) {
        $scope.list();
      }
    }, () => {
      $log.info(`Modal dismissed at: ${new Date()}`);
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };
}).controller("ModalVendorController", ($scope, $uibModalInstance, vendorForm, vendorData, $location, VendorService, Notification) => {
  $scope.vendor_picture = [];
  $scope.vendorForm = vendorForm;
  $scope.vendorData = vendorData;
  $scope.vendorData.showmenu = false;
  $scope.vendorData.removemsg = false;
  $scope.vendorData.eventLoad = false;
  $scope.vendorData.vendorsubmission = false;
  $scope.imageloc = "Uploads/vendor_picture/";
  $scope.files = [];

  $scope.togglevendor = function (vendor) {
    if (angular.isDefined(vendor) && angular.isDefined(vendor._id)) {
      $scope.vendorData.eventLoad = true;
      const obj = angular.copy(vendor);
      obj.is_active = !vendor.is_active;

      VendorService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.vendorData.vendorlist, (vendorlist, indx) => {
              if (angular.isDefined(vendorlist) && vendorlist !== null && angular.isDefined(vendorlist._id) && vendorlist._id === vendor._id) {
                $scope.vendorData.vendorlist[indx].is_active = !vendorlist.is_active;
              }
            });
            vendor.is_active = !vendor.is_active;
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        $scope.vendorData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.vendorData.eventLoad = false;
      });
    }
  };

  $scope.showMenu = function () {
    if (angular.isDefined($scope.vendorData.process) && $scope.vendorData.process !== "ADD") {
      $scope.vendorData.showmenu = !$scope.vendorData.showmenu;
      if (!$scope.vendorData.showmenu) {
        $scope.vendorData.removemsg = false;
      }
    }
  };

  $scope.toggleremoveMessage = function () {
    $scope.vendorData.removemsg = !$scope.vendorData.removemsg;
  };

  // Push and show file to the scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files)) {
      $scope.files = [];
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.vendor_picture = [];
        if ($scope.vendorData.process === "ADD") {
          angular.forEach($scope.files, (vendorpics) => {
            $scope.vendor_picture.push(vendorpics);
            const reader = new FileReader();
            reader.readAsDataURL(vendorpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.vendorData.loadedfile = e.target.result;
                $scope.vendorData.imagesrc = true;
              });
            };
          });
        } else if ($scope.vendorData.process === "UPDATE") {
          angular.forEach($scope.files, (vendorpics) => {
            $scope.vendor_picture.push(vendorpics);
            const reader = new FileReader();
            reader.readAsDataURL(vendorpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.vendorData.imagesrc = true;
                const obj = {};
                obj.vendorForm = $scope.vendorForm;
                if ($scope.vendor_picture.length > 0) {
                  obj.vendor_picture = $scope.vendor_picture;
                }

                VendorService.updatePicture(obj, (result) => {
                  if (result !== null && angular.isDefined(result.success) && result.success) {
                    if (result.success) {
                      if (result.filename) {
                        $scope.vendorForm.vendor_picture = result.filename;
                        angular.forEach($scope.vendorData.vendorlist, (vendor, indx) => {
                          if (!angular.isUndefined(vendor._id) && !angular.isUndefined($scope.vendorForm._id) &&
                          vendor._id === $scope.vendorForm._id) {
                            $scope.vendorData.vendorlist[indx].vendor_picture = $scope.vendorForm.vendor_picture;
                          }
                        });
                      }
                      $scope.vendorData.loadedfile = e.target.result;
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

  // Vendor Action --->Create
  $scope.create = function (valid) {
    $scope.vendorData.vendorsubmission = true;
    if (!valid) {
      return false;
    }

    const obj = {};
    obj.vendorForm = $scope.vendorForm;
    if ($scope.vendor_picture.length > 0) {
      obj.vendor_picture = $scope.vendor_picture;
    }
    $scope.vendorData.eventLoad = true;

    VendorService.create(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.vendorData.process = "";
            $scope.vendorForm = {};
            $scope.vendor_picture = [];
            $scope.vendorData.vendorlist.push(angular.copy(result.data));
            Notification.success(result.message);
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.vendorData.vendorsubmission = false;
      $scope.vendorData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.vendorData.eventLoad = false;
    });
  };

  // Vendor Action --->Update
  $scope.update = function (valid) {
    $scope.vendorData.vendorsubmission = true;
    if (!valid) {
      return false;
    }

    const obj = {};
    obj.vendorForm = $scope.vendorForm;
    $scope.vendorData.eventLoad = true;


    VendorService.update(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            angular.forEach($scope.vendorData.vendorlist, (vendors, indx) => {
              if (angular.isDefined(vendors) && vendors !== null && angular.isDefined(vendors._id) && vendors._id === result.data._id) {
                $scope.vendorData.vendorlist[indx] = angular.copy(result.data);
              }
            });
            $scope.vendorData.process = "";
            $scope.vendorForm = {};
            $scope.vendor_picture = [];
            Notification.success(result.message);
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.vendorData.vendorsubmission = false;
      $scope.vendorData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.vendorData.eventLoad = false;
    });
  };

  // Vendor Action --->Delete
  $scope.delete = function (data) {
    let index = -1;
    angular.forEach($scope.vendorData.vendorlist, (vendor, ind) => {
      if (angular.isDefined(vendor._id) && angular.isDefined(data._id) && data._id !== "" && data._id === vendor._id) {
        index = ind;
      }
    });

    if (index >= 0) {
      const Obj = {};
      Obj._id = angular.copy(data._id);
      Obj.name = angular.copy(data.name);
      Obj.is_deleted = true;
      $scope.vendorData.eventLoad = true;

      VendorService.delete(Obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.vendorData.process = "";
          $scope.vendorForm = {};
          $scope.vendorData.vendorlist.splice(index, 1);
          Notification.success(result.message);
          $scope.ok(Obj);
        }
        $scope.vendorData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.vendorData.eventLoad = false;
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
