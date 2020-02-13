/* global angular */
angular.module("categoryCtrl", []).controller("CategoryController", ($scope, $uibModal, $log, $routeParams, $location,
  CategoryService, Notification, DateformatstorageService, DATEFORMATS) => { // Setup category ctrl
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.categoryForm = {};
  $scope.categoryData = {};
  $scope.categoryData.pageLoad = true;
  $scope.categoryData.eventLoad = false;
  $scope.error = "";
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;
  $scope.categoryData.categorylist = [];

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

  // Category Action --->List
  $scope.list = function () {
    $scope.categoryData.pageLoad = true;

    CategoryService.getCategory((data) => {
      if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
        $scope.categoryData.categorylist = angular.copy(data);
      }
      $scope.categoryData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.categoryData.pageLoad = false;
    });
  };

  $scope.list();

  // Show modal form to add Category
  $scope.addCategory = function () {
    const Obj = {};
    Obj.level = 1;
    Obj.name = "";
    Obj.code = "";
    Obj.is_active = true;
    $scope.categoryData.process = "ADD";
    $scope.categoryForm = {};
    $scope.showcategoryform = false;
    $scope.categoryForm.is_active = true;
    $scope.categoryForm.level = 0;
    $scope.open("lg");
  };

  // get categoryid
  $scope.getCategorydetailsById = function (id) {
    if (id !== "") {
      $scope.categoryData.pageLoad = true;
      $scope.categoryForm = {};

      CategoryService.getCategorydetailsById(id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Category) &&
                angular.isDefined(result.data.Category._id)) {
              $scope.categoryData.process = "UPDATE";
              $scope.categoryForm = angular.copy(result.data.Category);
              $scope.categoryData.pageLoad = false;

              $scope.open("lg");
            }
          } else {
            Notification.error(result.message);
          }
        }

        $scope.categoryData.pageLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.pageLoad = false;
      });
    }
  };

  // Category Action --->Update Status
  $scope.updatestatus = function (id, status, index) {
    if (!angular.isUndefined(id) && id !== "") {
      const obj = {};
      obj.id = id;
      obj.is_active = !status;
      $scope.categoryData.eventLoad = true;

      CategoryService.updatestatus(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              $scope.categoryData.categorylist[index] = result.data;
              Notification.success(result.message);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.categoryData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.eventLoad = false;
      });
    }
  };

  // Category Action --->Delete
  $scope.delete = function (id, index) {
    if (!angular.isUndefined(id) && id !== "") {
      $scope.error = "";
      const product = $scope.categoryData.categorylist[index];
      const Obj = {};
      Obj._id = product._id;
      Obj.is_deleted = true;
      $scope.categoryData.eventLoad = true;

      CategoryService.delete(Obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
          $scope.categoryData.categorylist.splice(index, 1);
          Notification.success(result.message);
        }
        $scope.categoryData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.eventLoad = false;
      });
    } else {
      $scope.categoryData.categorylist.splice(index, 1);
    }
  };

  $scope.animationsEnabled = true;

  $scope.open = function (size) {
    const contain = angular.element(document.getElementsByClassName("c_setup_iframe"));
    const modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      appendTo: contain,
      templateUrl: "app/views/superadmin/setup/purchaseStocksCategory_popup.html",
      controller: "ModalCategoryController",
      size,
      resolve: {
        categoryForm() {
          return $scope.categoryForm;
        },
        categoryData() {
          return $scope.categoryData;
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
}).controller("ModalCategoryController", ($scope, $uibModalInstance, categoryForm, categoryData, $location, CategoryService, Notification) => {
  $scope.categoryForm = categoryForm;
  $scope.categoryData = categoryData;
  $scope.categoryData.formsubmission = false;
  $scope.categoryData.showmenu = false;
  $scope.categoryData.removemsg = false;
  $scope.categoryData.eventLoad = false;
  $scope.error = "";

  $scope.togglecategory = function (category) {
    if (angular.isDefined(category) && angular.isDefined(category._id)) {
      $scope.categoryData.eventLoad = true;
      const obj = angular.copy(category);
      obj.is_active = !category.is_active;

      CategoryService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.categoryData.categorylist, (categorylist, indx) => {
              if (angular.isDefined(categorylist) && categorylist !== null && angular.isDefined(categorylist._id) &&
                categorylist._id === category._id) {
                $scope.categoryData.categorylist[indx].is_active = !categorylist.is_active;
              }
            });
            category.is_active = !category.is_active;
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        $scope.categoryData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.eventLoad = false;
      });
    } else {
      category.is_active = !category.is_active;
    }
  };

  $scope.showMenu = function () {
    if (angular.isDefined($scope.categoryData.process) && $scope.categoryData.process !== "ADD") {
      $scope.categoryData.showmenu = !$scope.categoryData.showmenu;
      if (!$scope.categoryData.showmenu) {
        $scope.categoryData.removemsg = false;
      }
    }
  };

  $scope.toggleremoveMessage = function () {
    $scope.categoryData.removemsg = !$scope.categoryData.removemsg;
  };

  // Category Action --->Create
  $scope.create = function (valid) {
    $scope.categoryData.formsubmission = true;
    if (!valid) {
      return false;
    }
    const obj = {};
    obj.categoryForm = $scope.categoryForm;
    $scope.categoryData.eventLoad = true;

    CategoryService.create(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.categoryForm = {};
            Notification.success(result.message);
            $scope.categoryData.categorylist.push(angular.copy(result.data));
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.categoryData.formsubmission = false;
      $scope.categoryData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.categoryData.eventLoad = false;
    });
  };

  // Brand Action --->Update
  $scope.update = function (valid) {
    $scope.categoryData.formsubmission = true;
    if (!valid) {
      return false;
    }
    const obj = {};
    obj.categoryForm = $scope.categoryForm;

    const results = [];

    if (results.length === 0) {
      $scope.categoryData.eventLoad = true;

      CategoryService.update(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              angular.forEach($scope.categoryData.categorylist, (categories, indx) => {
                if (angular.isDefined(categories) && categories !== null && angular.isDefined(categories._id) && categories._id === result.data._id) {
                  $scope.categoryData.categorylist[indx] = angular.copy(result.data);
                }
              });
              $scope.categoryForm = {};
              Notification.success(result.message);
              $scope.ok(result.data);
            } else {
              $scope.ok(null);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.categoryData.formsubmission = false;
        $scope.categoryData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.eventLoad = false;
      });
    }
  };

  // Brand Action --->Delete
  $scope.delete = function (data) {
    let index = -1;
    angular.forEach($scope.categoryData.categorylist, (category, ind) => {
      if (angular.isDefined(category._id) && angular.isDefined(category._id) && category._id !== "" && category._id === data._id) {
        index = ind;
      }
    });

    if (index >= 0) {
      $scope.error = "";
      const product = angular.copy(data);
      const Obj = {};
      Obj._id = product._id;
      Obj.name = product.name;
      Obj.is_deleted = true;
      $scope.categoryData.eventLoad = true;

      CategoryService.delete(Obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
          $scope.categoryForm = {};
          $scope.categoryData.categorylist.splice(index, 1);
          Notification.success(result.message);
          $scope.ok(Obj);
        }
        $scope.categoryData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.eventLoad = false;
      });
    }
  };

  $scope.deletesubcategory = function (subcategory) {
    const index = $scope.categoryForm.subcategory.indexOf(subcategory);
    if (index > -1 && $scope.categoryForm.subcategory.length > 1) {
      if (angular.isDefined(subcategory._id) && subcategory._id !== "") {
        subcategory.is_deleted = !subcategory.is_deleted;
      } else {
        $scope.categoryForm.subcategory.splice(index, 1);
      }
    } else {
      Notification.error("Category needs atleast one sub category. you cant remove all the sub category");
    }
  };

  $scope.addsubCategory = function () {
    const Obj = {};
    Obj.level = 1;
    Obj.name = "";
    Obj.code = "";
    Obj.is_active = true;
    $scope.categoryForm.subcategory.push(Obj);
  };

  $scope.updatesubcategorystatus = function (subcategory, status) {
    if ($scope.categoryForm.subcategory.indexOf(subcategory) > -1) {
      subcategory.is_active = !status;
    }
  };

  $scope.updatestatus = function (id, status, index) {
    if (!angular.isUndefined(id) && id !== "") {
      const obj = {};
      obj.id = id;
      obj.is_active = !status;
      $scope.categoryData.eventLoad = true;

      CategoryService.updatestatus(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              $scope.categoryData.categorylist[index] = result.data;
              Notification.success(result.message);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.categoryData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.categoryData.eventLoad = false;
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
