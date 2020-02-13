/* global angular */
angular.module("productsCtrl", []).controller("ProductsController", ($scope, $uibModal, $log, $routeParams, ProductService,
  CategoryService, Notification, DateformatstorageService, DATEFORMATS) => {
  $scope.product_picture = [];
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.productForm = {};
  $scope.productData = {};
  $scope.error = "";
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.productData.pageLoad = true;
  $scope.productData.contentLoad = true;
  $scope.productData.eventLoad = false;

  $scope.imageloc = "Uploads/product_picture/";
  $scope.productData.imagesrc = false;
  $scope.productData.loadedfile = "";
  $scope.productData.productlist = [];
  $scope.productData.process = "";
  $scope.productData.categorylist = [];
  $scope.files = [];
  $scope.productData.formsubmission = false;

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

  // Show modal form to add Products
  $scope.addproduct = function () {
    $scope.productData.formsubmission = false;
    $scope.productData.process = "ADD";
    $scope.productForm = {};
    $scope.productData.imagesrc = false;
    $scope.productData.loadedfile = "";
    $scope.productForm.is_active = true;
    $scope.open("lg");
  };

  // Category / Sub Category  Action --->List
  $scope.categorylist = function () {
    CategoryService.get((data) => {
      if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
        $scope.productData.categorylist = angular.copy(data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Product Action --->List
  $scope.list = function () {
    $scope.productData.pageLoad = true;

    ProductService.get((data) => {
      if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
        $scope.productData.productlist = angular.copy(data);
      }
      $scope.productData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.productData.pageLoad = false;
    });
  };

  $scope.categorylist();
  $scope.list();

  // Product Action --->View user by id
  $scope.getproductbyId = function (id) {
    if (id !== "") {
      $scope.productForm = {};
      $scope.productData.imagesrc = false;
      $scope.productData.loadedfile = "";

      ProductService.getById(id, (data) => {
        if (angular.isDefined(data) && data !== null && angular.isDefined(data._id)) {
          $scope.productData.formsubmission = false;
          $scope.productData.process = "UPDATE";
          $scope.productForm = angular.copy(data);
          if (!angular.isUndefined($scope.productForm.product_picture) && $scope.productForm.product_picture !== "") {
            $scope.productData.imagesrc = true;
            $scope.productData.loadedfile = $scope.imageloc + $scope.productForm.product_picture;
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

  // Open modal and pass values to modal controller to add,update,view and delete
  $scope.open = function (size) {
    const contain = angular.element(document.getElementsByClassName("c_setup_iframe"));
    const modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      appendTo: contain,
      templateUrl: "app/views/superadmin/setup/purchaseStocksProducts_popup.html",
      controller: "ModalProductController",
      size,
      resolve: {
        productForm() {
          return $scope.productForm;
        },
        productData() {
          return $scope.productData;
        },
      },
    });
    modalInstance.result.then((selectedProduct) => {
      if (angular.isUndefined(selectedProduct) || selectedProduct === null) {
        $scope.list();
      }
    }, () => {
      $log.info(`Modal dismissed at: ${new Date()}`);
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };
}).controller("ModalProductController", ($scope, $uibModalInstance, productForm, productData, CategoryService, ProductService,
  $filter, $sce, Notification) => {
  $scope.product_picture = [];
  $scope.productForm = angular.copy(productForm);
  $scope.productData = productData;
  $scope.productData.formsubmission = false;
  $scope.error = "";
  $scope.productData.eventLoad = false;
  $scope.imageloc = "Uploads/product_picture/";
  $scope.files = [];

  $scope.toggleproduct = function (prodForm) {
    if (angular.isDefined(prodForm) && angular.isDefined(prodForm._id)) {
      $scope.productData.eventLoad = true;
      const obj = angular.copy(prodForm);
      obj.is_active = !prodForm.is_active;

      ProductService.statusupdate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.productData.productlist, (productlist, ins) => {
              if (angular.isDefined(productlist) && productlist !== null && angular.isDefined(productlist._id) && productlist._id === prodForm._id) {
                $scope.productData.productlist[ins].is_active = !productlist.is_active;
              }
            });
            prodForm.is_active = !prodForm.is_active;
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        $scope.productData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.productData.eventLoad = false;
      });
    }
  };

  // Push and show file to the scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files)) {
      $scope.files = [];
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.product_picture = [];
        if ($scope.productData.process === "ADD") {
          angular.forEach($scope.files, (brandpics) => {
            $scope.product_picture.push(brandpics);
            const reader = new FileReader();
            reader.readAsDataURL(brandpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.productData.loadedfile = e.target.result;
                $scope.productData.imagesrc = true;
              });
            };
          });
        } else if ($scope.productData.process === "UPDATE") {
          angular.forEach($scope.files, (brandpics) => {
            $scope.product_picture.push(brandpics);
            const reader = new FileReader();
            reader.readAsDataURL(brandpics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.productData.imagesrc = true;
                const obj = {};
                obj.productForm = $scope.productForm;
                if ($scope.product_picture.length > 0) {
                  obj.product_picture = $scope.product_picture;
                }

                ProductService.updatePicture(obj, (result) => {
                  if (result !== null && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (result.filename) {
                        $scope.productForm.product_picture = result.filename;
                        angular.forEach($scope.productData.productlist, (products, ins) => {
                          if (!angular.isUndefined(products._id) && !angular.isUndefined($scope.productForm._id) &&
                            products._id === $scope.productForm._id) {
                            $scope.productData.productlist[ins].product_picture = angular.copy($scope.productForm.product_picture);
                          }
                        });
                        Notification.success(result.message);
                      }
                      $scope.productData.loadedfile = e.target.result;
                    } else {
                      Notification.error(result.message);
                    }
                  } else {
                    Notification.error(result.message);
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

  // Product Action --->Create
  $scope.create = function (valid) {
    if (angular.isDefined($scope.productForm.minimum_stock) && angular.isDefined($scope.productForm.maximum_stock) &&
        $scope.productForm.minimum_stock !== null && $scope.productForm.minimum_stock !== "" &&
        $scope.productForm.maximum_stock !== null && $scope.productForm.maximum_stock !== "" &&
        parseFloat($scope.productForm.maximum_stock) < parseFloat($scope.productForm.minimum_stock)) {
      Notification.warning("Maximum stock level must be greater than or equal to the minimun stock level");
    }
    $scope.productData.formsubmission = true;
    if (!valid) {
      return false;
    }

    if (!angular.isUndefined($scope.productForm.category_id) || $scope.productForm.category_id !== "" ||
                !angular.isUndefined($scope.productForm.product_name) || $scope.productForm.product_name !== "") {
      const obj = {};
      obj.productForm = $scope.productForm;
      if ($scope.product_picture.length > 0) {
        obj.product_picture = $scope.product_picture;
      }
      $scope.productData.eventLoad = true;

      ProductService.create(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              $scope.productData.process = "";
              $scope.productForm = {};
              $scope.product_picture = [];
              $scope.productData.productlist.push(angular.copy(result.data));
              Notification.success(result.message);
              $scope.ok(result.data);
            } else {
              $scope.ok(null);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.productData.formsubmission = false;
        $scope.productData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.productData.eventLoad = false;
      });
    } else {
      Notification.error("Category is required field");
    }
  };

  // Product Action --->Update
  $scope.update = function (valid) {
    if (angular.isDefined($scope.productForm.minimum_stock) && angular.isDefined($scope.productForm.maximum_stock) &&
        $scope.productForm.minimum_stock !== null && $scope.productForm.minimum_stock !== "" &&
        $scope.productForm.maximum_stock !== null && $scope.productForm.maximum_stock !== "" &&
        parseFloat($scope.productForm.maximum_stock) < parseFloat($scope.productForm.minimum_stock)) {
      Notification.warning("Maximum stock level must be greater than or equal to the minimun stock level");
      return false;
    }
    $scope.productData.formsubmission = true;
    if (!valid) {
      return false;
    }
    const obj = {};
    obj.productForm = $scope.productForm;
    $scope.productData.eventLoad = true;

    ProductService.update(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            angular.forEach($scope.productData.productlist, (products, ins) => {
              if (angular.isDefined(products) && products !== null && angular.isDefined(products._id) && products._id === result.data._id) {
                $scope.productData.productlist[ins] = angular.copy(result.data);
              }
            });
            $scope.productData.process = "";
            $scope.productForm = {};
            $scope.product_picture = [];
            Notification.success(result.message);
            $scope.ok(result.data);
          } else {
            $scope.ok(null);
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.productData.formsubmission = false;
      $scope.productData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.productData.eventLoad = false;
    });
  };

  // Product Action --->Delete
  $scope.delete = function (data) {
    let index = -1;
    angular.forEach($scope.productData.productlist, (product, ind) => {
      if (angular.isDefined(product._id) && angular.isDefined(data._id) && data._id !== "" && data._id === product._id) {
        index = ind;
      }
    });

    if (index >= 0) {
      const Obj = {};
      Obj._id = angular.copy(data._id);
      $scope.productData.eventLoad = true;

      ProductService.delete(Obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success) {
          $scope.productForm = {};
          if (angular.isDefined($scope.productData.productlist)) {
            $scope.productData.productlist.splice(index, 1);
          }
          $scope.ok(Obj);
          Notification.success(result);
        }
        $scope.productData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.productData.eventLoad = false;
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
