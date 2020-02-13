/* global _ */
/* global angular */
angular.module("deliveryeditCtrl", []).controller("DeliveryeditController", ($scope, $rootScope, $routeParams, $sce, $uibModal, $log,
  AuthService, CustomerService, OrderService, DeliveryService, Notification, DyeingDetailService, socket, validateField, $q,
  JobsstorageService, PreferenceService, weightDifference, $filter, $location, $timeout, $window) => {
  $rootScope.orderpageLoader = false;
  $scope.deliveryData = {};
  $scope.deliveryForm = {};
  $scope.deliveryData.processList = [];
  $scope.deliveryData.detailformSumission = false;
  $scope.deliveryData.showButton = false;
  $scope.deliveryData.weightDifference = weightDifference;
  $scope.deliveryData.addresschange = false;
  $scope.deliveryData.updateconfirm = false;

  const ordermsgData = {
    customer_id: "Please select customer",
    customer_name: "Please select customer",
    contactperson: "Please select the followup person",
    order_reference_no: "Please enter the order reference no.",
    customer_dc_no: "Please enter the customer dc no.",
    customer_dc_date: "Please select the customer dc date.",
    dyeing: "Please select the dyeing name.",
    dyeing_dc_no: "Please enter the dyeing dc no.",
    dyeing_dc_date: "Please select the dyeing dc date.",
    order_type: "Please choose the order type.",
    outward_data: "Please add delivery details",
    delivery_company_name: "Please enter the company name in delivery details",
    delivery_address_line: "Address line, City, State and Pincode must be required in delivery address",
    delivery_city: "Address line, City, State and Pincode must be required in delivery address",
    delivery_state: "Address line, City, State and Pincode must be required in delivery address",
    delivery_pincode: "Address line, City, State and Pincode must be required in delivery address",
    vehicle_no: "Please enter the vehicle registration number",
    driver_name: "Please enter the driver name",
  };

  const orderfield = [{ field: "customer_id", type: "string" },
    { field: "customer_name", type: "string" },
    { field: "contactperson", type: "object", subfield: "name" },
    { field: "order_reference_no", type: "string" },
    { field: "customer_dc_no", type: "string" },
    { field: "customer_dc_date", type: "date" },
    { field: "dyeing", type: "object", subfield: "dyeing_name" },
    { field: "dyeing_dc_no", type: "string" },
    { field: "dyeing_dc_date", type: "date" },
    { field: "order_type", type: "string" },
    { field: "outward_data", type: "array" },
    { field: "delivery_company_name", type: "string" },
    //        {"field": "delivery_address_line", "type": "string"},
    //        {"field": "delivery_city", "type": "string"},
    //        {"field": "delivery_state", "type": "string"},
    //        {"field": "delivery_pincode", "type": "string"},
    { field: "vehicle_no", type: "string" },
    { field: "driver_name", type: "string" }];

  const outwardfield = [{ field: "fabric_type", type: "string" },
    { field: "fabric_color", type: "string" },
    { field: "process", type: "array" },
    { field: "lot_no", type: "string" },
    { field: "dia", type: "numberzero" },
    { field: "rolls", type: "numberzero" },
    { field: "weight", type: "numberzero" },
    { field: "measurement", type: "object", subfield: "fabric_measure" },
    { field: "fabric_condition", type: "string" },
    { field: "delivery_roll", type: "numberzero" },
    { field: "delivery_weight", type: "numberzero" }];
  const outwardmsgData = {
    fabric_type: "Please select fabric type to add more",
    fabric_color: "Please select fabric colour to add more",
    process: "Please select process to add more",
    lot_no: "Please enter the lot no",
    dia: "Please enter the valid dia",
    rolls: "Please enter the valid no of rolls",
    weight: "Please enter the valid fabric weight",
    measurement: "Please select the units for fabric weight",
    fabric_condition: "Please select the fabric condition",
    delivery_roll: "Please enter the no of rolls to deliver.",
    delivery_weight: "Please enter the weight to deliver.",
  };

  $scope.initializeJobdetails = function () {
    PreferenceService.getweightDifference((result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
          result.data !== null && angular.isDefined(result.data._id) && angular.isDefined(result.data.value) &&
          result.data.value !== null && parseInt(result.data.value) > 0) {
        $scope.deliveryData.weightDifference = parseInt(result.data.value);
      }
    }, (error) => {

    });
    
  };
  $scope.initializeJobdetails();
  
  $scope.getDeliverybyid = function (del) {
    DeliveryService.getDeliveryeditview(del, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Order) && angular.isDefined(result.data.Delivery)
                  && result.data.Order !== null && result.data.Delivery !== null && angular.isDefined(result.data.Order._id) && 
                  angular.isDefined(result.data.Delivery._id)) {
            let selectedOrder = angular.copy(result.data.Order);
            angular.forEach(selectedOrder.outward_delivery, (deldata, dind) => {
              if (angular.isDefined(deldata._id) && deldata._id == result.data.Delivery._id) {
                selectedOrder.outward_delivery.splice(dind, 1);
                $scope.deliveryForm = angular.copy(result.data.Delivery);
                
                $scope.deliveryData.delivery_company_name = angular.copy(result.data.Delivery.delivery_company_name);
                $scope.deliveryData.delivery_address_line = angular.copy(result.data.Delivery.delivery_address_line);
                $scope.deliveryData.delivery_city = angular.copy(result.data.Delivery.delivery_city);
                $scope.deliveryData.delivery_pincode = angular.copy(result.data.Delivery.delivery_pincode);
                
                $scope.selectOrder(selectedOrder);
              }
            });
          } else {
            Notification.error("Delivery details not found.");
          }
        } else {
          Notification.error(result.message);
        }
      }
      $rootScope.orderpageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.orderpageLoader = false;
    });
  }
  
  $scope.initializeDeliverydetails = function () {
    $rootScope.orderpageLoader = true;
    $scope.deliveryData.outwards = [];
    $scope.deliveryData.processList = [];
    $scope.deliveryData.detailformSumission = false;
    $scope.deliveryData.showButton = false;
    $scope.deliveryForm = {};
    $scope.deliveryData.updateconfirm = false;
    
    DeliveryService.getProcessdetail((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
        angular.isDefined(result.data) && result.data !== null &&
        result.data !== "" && result.data.length > 0) {
        angular.forEach(result.data, (process) => {
          if (angular.isDefined(process) && process !== null && process !== "" && angular.isDefined(process._id) &&
            angular.isDefined(process.process_name)) {
            const obj = {};
            obj.process_id = angular.copy(process._id);
            obj.process_name = angular.copy(process.process_name);
            $scope.deliveryData.processList.push(obj);
          }
        });
        if (angular.isDefined($routeParams.id) && $routeParams.id !== null && $routeParams.id !== "") {
          const delID = $routeParams.id;
          $scope.getDeliverybyid(delID);
        } else {
          Notification.error("Delivery details not found.");
          $rootScope.orderpageLoader = false;
        }
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.orderpageLoader = false;
    });
  };

  $scope.cleardeliveryaddress = function () {
    $scope.deliveryData.delivery_company_name = "";
    $scope.deliveryData.addresssubmission = false;
  };

  $scope.companyOption = {
    options: {
      html: true,
      minLength: 3,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const obj = {};
          obj.term = angular.copy(request.term);

          DyeingDetailService.getDyeing(obj, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
              angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (dyeingData) => {
                const objs = {};
                objs.label = dyeingData.dyeing_name;
                objs.value = dyeingData._id;
                objs.delivery_address_line = angular.isDefined(dyeingData.dyeing_address) ? angular.copy(dyeingData.dyeing_address) : "";
                objs.delivery_city = angular.isDefined(dyeingData.dyeing_city) ? angular.copy(dyeingData.dyeing_city) : "";
                objs.delivery_pincode = angular.isDefined(dyeingData.dyeing_pin) ? angular.copy(dyeingData.dyeing_pin) : "";

                data.push(objs);
              });
            }
            return response(data);
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();
        $scope.deliveryData.delivery_company_name = "";
        $scope.deliveryData.delivery_address_line = "";
        $scope.deliveryData.delivery_city = "";
        $scope.deliveryData.delivery_state = "";
        $scope.deliveryData.delivery_pincode = "";

        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          if (angular.isDefined(ui.item.label) && ui.item.label !== null && ui.item.label !== "") {
            $scope.$apply(() => {
              $scope.deliveryData.delivery_company_name = angular.copy(ui.item.label);
            });
            if (angular.isDefined(ui.item.delivery_address_line) && ui.item.delivery_address_line !== null && ui.item.delivery_address_line !== "") {
              $scope.deliveryData.delivery_address_line = angular.copy(ui.item.delivery_address_line);
            }
            if (angular.isDefined(ui.item.delivery_city) && ui.item.delivery_city !== null && ui.item.delivery_city !== "") {
              $scope.deliveryData.delivery_city = angular.copy(ui.item.delivery_city);
            }
            if (angular.isDefined(ui.item.delivery_pincode) && ui.item.delivery_pincode !== null && ui.item.delivery_pincode !== "") {
              $scope.deliveryData.delivery_pincode = angular.copy(ui.item.delivery_pincode);
            }
          }
        }
      },
    },
  };

  $scope.vehicleOption = {
    options: {
      html: true,
      minLength: 3,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];
        if (angular.isDefined(request.term) && request.term !== "") {
          const obj = {};
          obj.term = angular.copy(request.term);

          DeliveryService.getVehicles(obj, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
              angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (veh) => {
                const objs = {};
                objs.label = veh.vehicle_no;
                objs.value = veh.vehicle_no;

                data.push(objs);
              });
            }
            return response(data);
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();

        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          if (angular.isDefined(ui.item.label) && ui.item.label !== null && ui.item.label !== "") {
            $scope.$apply(() => {
              $scope.deliveryForm.vehicle_no = angular.copy(ui.item.label);
            });
          }
        }
      },
    },
  };

  $scope.driverOption = {
    options: {
      html: true,
      minLength: 3,
      onlySelectValid: true,
      outHeight: 50,
      source(request, response) {
        const data = [];

        if (angular.isDefined(request.term) && request.term !== "") {
          const obj = {};
          obj.term = angular.copy(request.term);

          DeliveryService.getDriverdata(obj, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
              angular.isDefined(result.data) && result.data.length > 0) {
              angular.forEach(result.data, (dri) => {
                const objs = {};
                objs.label = dri.driver_name;
                objs.value = dri.driver_name;
                objs.driver_no = angular.isDefined(dri.driver_no) ? angular.copy(dri.driver_no) : "";

                data.push(objs);
              });
            }
            return response(data);
          }, (error) => {
            return response(data);
          });
        } else {
          return response(data);
        }
      },
    },
    events: {
      focus(event) {
        event.preventDefault();
        return false;
      },
      change(event) {
        event.preventDefault();
        return false;
      },
      select(event, ui) {
        event.preventDefault();

        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          if (angular.isDefined(ui.item.label) && ui.item.label !== null && ui.item.label !== "") {
            $scope.$apply(() => {
              $scope.deliveryForm.driver_name = angular.copy(ui.item.label);
              if (angular.isDefined(ui.item.driver_no) && ui.item.driver_no !== null && ui.item.driver_no !== "") {
                $scope.deliveryForm.driver_no = angular.copy(ui.item.driver_no);
              }
            });
          }
        }
      },
    },
  };

  $scope.changedeliveryaddress = function () {
    $scope.cleardeliveryaddress();
    $scope.deliveryData.addresschange = true;
  };

  $scope.closedeliveryaddress = function () {
    $scope.cleardeliveryaddress();
    $scope.deliveryData.addresschange = false;
  };

  $scope.saveDeliveryaddress = function () {
    $scope.deliveryData.addresssubmission = true;
    if (angular.isUndefined($scope.deliveryData.delivery_company_name) || $scope.deliveryData.delivery_company_name === null ||
      $scope.deliveryData.delivery_company_name === "") {
      Notification.error("Please enter the company name");
      return false;
    }
    $scope.deliveryForm.delivery_company_name = angular.copy($scope.deliveryData.delivery_company_name);
    $scope.deliveryForm.delivery_address_line = angular.copy($scope.deliveryData.delivery_address_line);
    $scope.deliveryForm.delivery_city = angular.copy($scope.deliveryData.delivery_city);
    $scope.deliveryForm.delivery_pincode = angular.copy($scope.deliveryData.delivery_pincode);
    $scope.deliveryData.addresschange = false;
  };

  $scope.printThisdelivery = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/order_delivery.html");
    delData = $scope.deliveryForm;
    delData.outwardData = $scope.deliveryForm.outward_data;
    window.open(templateUrl, "_blank");
  };

  $scope.saveDelivery = function (opt) {
    if ($scope.deliveryData.addresschange) {
      Notification.error("Please update the delivery address to proceed further");
      return false;
    }
    if (angular.isDefined($scope.deliveryForm.driver_no) && $scope.deliveryForm.driver_no !== null &&
      $scope.deliveryForm.driver_no !== "" && $scope.deliveryForm.driver_no.length > 0 &&
      ($scope.deliveryForm.driver_no.length < 10 || $scope.deliveryForm.driver_no.length > 12)) {
      Notification.error("Please enter the valid driver phone no.");
      return false;
    }
    validateField.validate($scope.deliveryForm, orderfield, ordermsgData).then((orderMsg) => {
      if (angular.isDefined(orderMsg) && orderMsg !== null && orderMsg !== "") {
        Notification.error(orderMsg);
      } else {
        validateField.validateGroup($scope.deliveryForm.outward_data, outwardfield, outwardmsgData).then((outwardMsg) => {
          if (angular.isDefined(outwardMsg) && outwardMsg !== null && outwardMsg !== "") {
            Notification.error(outwardMsg);
          } else {
            validateOutwarddata($scope.deliveryForm.outward_data).then((valid) => {
              if (angular.isDefined(valid) && valid) {
                $rootScope.orderpageLoader = true;
                const obj = {};
                obj.deliveryForm = angular.copy($scope.deliveryForm);

                DeliveryService.update(obj, (result) => {
                  if (result !== null && angular.isDefined(result) && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
                        $scope.deliveryForm._id = angular.copy(result.data._id);
                        $scope.deliveryForm.delivery_no = angular.copy(result.data.delivery_no);
                        $scope.deliveryForm.delivery_date = angular.copy(result.data.delivery_date);
                        $scope.deliveryData.updateconfirm = true;
                        if (opt === "print") {
                          $timeout(() => {
                            $scope.printThisdelivery();
                          }, 2000);
                        }
                      }
                    } else {
                      $scope.deliveryData.updateconfirm = false;
                      Notification.error(result.message);
                    }
                  }
                  $rootScope.orderpageLoader = false;
                  
                }, (error) => {
                  if (error !== null && angular.isDefined(error.message)) {
                    Notification.error(error.message);
                  }
                  $rootScope.orderpageLoader = false;
                  $scope.deliveryData.updateconfirm = false;
                });
              }
            });
          }
        });
      }
    });
  };

  function validateOutwarddata(outwards) {
    const deferred = $q.defer();
    let validate = true;
    let count = 0;
    angular.forEach(outwards, (data) => {
      if (angular.isDefined(data) && angular.isDefined(data.delivery_roll) && angular.isDefined(data.delivery_weight) && validate) {
        if (validate) {
          let difference = 0;
          if (angular.isDefined(data.deliveredweight) && data.deliveredweight !== null && parseFloat(data.deliveredweight) > 0 &&
            angular.isDefined(data.weight) && data.weight !== null && parseFloat(data.weight) > 0 &&
            angular.isDefined(data.delivery_weight) && data.delivery_weight !== null && parseFloat(data.delivery_weight) > 0) {
            difference = (parseFloat(data.deliveredweight) + parseFloat(data.delivery_weight)) - parseFloat(data.weight);
            difference = (difference / parseFloat(data.weight)) * 100;
          }
          const rollspending = parseInt(data.availablerolls) - parseInt(data.delivery_roll);

          if (rollspending === 0 && (parseFloat(difference) > $scope.deliveryData.weightDifference ||
            parseFloat(difference) < (-1 * $scope.deliveryData.weightDifference))) {
            Notification.error("Delivery weight must be near to the pending weight if whatever remains of the rolls are in delivery");
            validate = false;
          }
          if (parseFloat(difference) >= 0 && rollspending > 0 && angular.isDefined(data.availableweight) &&
            data.availableweight !== null && parseFloat(data.availableweight) > 0 &&
            parseFloat(data.delivery_weight) >= parseFloat(data.availableweight)) {
            Notification.error("Delivery rolls must be near to the pending rolls if whatever remains of the weight are in delivery");
            validate = false;
          }
          if (rollspending === 0 && parseFloat(data.delivery_weight) > 0 &&
            parseFloat(difference) <= $scope.deliveryData.weightDifference &&
            parseFloat(difference) >= (-1 * $scope.deliveryData.weightDifference)) {
            data.delivery_status = "Completed";
          }
        } else {
          validate = false;
        }
        count += 1;
      } else {
        validate = false;
      }
    });
    if (count === outwards.length) {
      deferred.resolve(validate);
    }
    return deferred.promise;
  }

  function getinwards(inwards) {
    const deferred = $q.defer();

    const inwardDetail = ["fabric_condition", "process", "measurement", "fabric_id", "fabric_type", "fabric_color_id",
      "fabric_color", "dia", "rolls", "weight", "lot_no", "delivery_status", "delivered_weight", "returned_weight"];
    let inwardsCount = 0;

    angular.forEach(inwards, (inw) => {
      if (angular.isDefined(inw) && inw !== null && angular.isDefined(inw._id) && angular.isDefined(inw.inward_data) &&
        inw.inward_data !== null && inw.inward_data.length > 0) {
        angular.forEach(inw.inward_data, (inwdetails, detailindex) => {
          if (angular.isDefined(inwdetails) && angular.isDefined(inwdetails._id)) {
            const obj = {};
            obj.inward_id = angular.copy(inw._id);
            obj.inward_date = angular.isDefined(inw.inward_date) ? angular.copy(inw.inward_date) : null;
            obj.inward_no = angular.isDefined(inw.inward_no) ? angular.copy(inw.inward_no) : null;
            obj.inward_status = angular.isDefined(inw.inward_status) ? angular.copy(inw.inward_status) : null;
            obj.inward_data_id = angular.copy(inwdetails._id);

            for (let i = 0; i < inwardDetail.length; i += 1) {
              if (validateField.checkValid(inwdetails, inwardDetail[i])) {
                obj[inwardDetail[i]] = angular.copy(inwdetails[inwardDetail[i]]);
              }
            }

            obj.deliverycompleted = false;
            obj.deliveredrolls = 0;
            obj.availableweight = parseFloat(obj.weight);
            obj.deliveredweight = 0;

            if (parseFloat(obj.deliveredweight) >= parseFloat(obj.weight)) {
              obj.deliverycompleted = true;
            }

            $scope.deliveryForm.inwards.push(obj);
          }
          if (detailindex === inw.inward_data.length - 1) {
            inwardsCount += 1;
          }
        });
      } else {
        inwardsCount += 1;
      }
    });
    if (inwardsCount === inwards.length) {
      deferred.resolve($scope.deliveryForm.inwards);
    }

    return deferred.promise;
  }

  function getoutwards(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.deliveryForm.inwards, (inward) => {
      inward.deliveredrolls = angular.isDefined(inward.deliveredrolls) ? parseInt(inward.deliveredrolls) : 0;
      inward.availableweight = angular.isDefined(inward.availableweight) ? parseFloat(inward.availableweight) : parseFloat(inward.weight);
      inward.deliveredweight = angular.isDefined(inward.deliveredweight) ? parseFloat(inward.deliveredweight) : 0;
            
      inward.tempdeliveredrolls = angular.isDefined(inward.tempdeliveredrolls) ? parseInt(inward.tempdeliveredrolls) : 0;
      inward.tempavailableweight = angular.isDefined(inward.tempavailableweight) ? parseFloat(inward.tempavailableweight) : parseFloat(inward.weight);
      inward.tempdeliveredweight = angular.isDefined(inward.tempdeliveredweight) ? parseFloat(inward.tempdeliveredweight) : 0;
      if (angular.isDefined(outwards) && outwards.length > 0) {
        angular.forEach(outwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
            outdata.inward_data_id === inward.inward_data_id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.delivery_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.delivery_roll)) {
            inward.deliveredrolls = parseInt(inward.deliveredrolls) + parseInt(outdata.delivery_roll);
            inward.deliveredweight = parseFloat(inward.deliveredweight) + parseFloat(outdata.delivery_weight);
            inward.availableweight = parseFloat(inward.availableweight) - parseFloat(outdata.delivery_weight);
            
            inward.tempdeliveredrolls = parseInt(inward.tempdeliveredrolls) + parseInt(outdata.delivery_roll);
            inward.tempavailableweight = parseFloat(inward.tempavailableweight) - parseFloat(outdata.delivery_weight);
            inward.tempdeliveredweight = parseFloat(inward.tempdeliveredweight) + parseFloat(outdata.delivery_weight);
              
            if (parseFloat(inward.deliveredweight) >= parseFloat(inward.weight)) {
              inward.deliverycompleted = true;
            }
          }
          if (odx === outwards.length - 1) {
            outwardCount += 1;
          }
        });
      } else {
        outwardCount += 1;
      }
    });

    if (outwardCount === $scope.deliveryForm.inwards.length) {
      deferred.resolve($scope.deliveryForm.inwards);
    }

    return deferred.promise;
  }
    
  function getCurrentdelivery () {
    const deferred = $q.defer();
    
    angular.forEach($scope.deliveryForm.inwards, (inward, inx) => {
      angular.forEach($scope.deliveryForm.outward_data, (outdata, odx) => {
        if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
          outdata.inward_data_id === inward.inward_data_id) {
          outdata.deliveredrolls = parseInt(inward.deliveredrolls);
          outdata.deliveredweight = parseFloat(inward.deliveredweight);
          outdata.availableweight = parseFloat(inward.availableweight);
          
          outdata.tempdeliveredrolls = parseInt(inward.tempdeliveredrolls);
          outdata.tempavailableweight = parseFloat(inward.tempavailableweight);
          outdata.tempdeliveredweight = parseFloat(inward.tempdeliveredweight);
        }
        if (odx === $scope.deliveryForm.outward_data.length - 1 && inx === $scope.deliveryForm.inwards.length - 1) {
          deferred.resolve($scope.deliveryForm.outward_data);
        }
      });
    });

    return deferred.promise;
  }
  
  $scope.selectOrder = function (order) {
    //        $scope.deliveryForm = {};
    $scope.deliveryForm.inwards = [];
    
    const orderDetail = ["customer_dc_date", "customer_dc_no", "customer_id", "customer_mobile_no", "customer_name",
      "division_id", "dyeing", "dyeing_dc_date", "dyeing_dc_no", "order_date", "order_no", "order_reference_no",
      "contactperson", "order_type"];
    let outwardList = [];
    let outwards = [];
    let returns = [];
    let contractOutward = [];
    let contractInward = [];
    
    if (angular.isDefined(order) && order !== null && angular.isDefined(order._id) && angular.isDefined(order.inwards) &&
      order.inwards !== null && order.inwards !== "" && order.inwards.length > 0) {
      for (let i = 0; i < orderDetail.length; i += 1) {
        if (validateField.checkValid(order, orderDetail[i])) {
          $scope.deliveryForm[orderDetail[i]] = angular.copy(order[orderDetail[i]]);
        }
      }      
      if (angular.isDefined(order.outward_delivery) && order.outward_delivery !== null && order.outward_delivery.length > 0) {
        outwards = _.flatten(_.pluck(order.outward_delivery, "outward_data"));
        outwardList = outwards;
      }
      if (angular.isDefined(order.return_delivery) && order.return_delivery !== null && order.return_delivery.length > 0) {
        returns = _.flatten(_.pluck(order.return_delivery, "outward_data"));
        outwardList = outwardList.concat(returns);
      }
      if (angular.isDefined(order.contract_outward) && order.contract_outward !== null && order.contract_outward.length > 0) {
        const coutwards = $filter("filter")(order.contract_outward, {outward_status: "In Progress"}, true);
        
        contractOutward = _.flatten(_.pluck(coutwards, "outward_data"));
        outwardList = outwardList.concat(contractOutward);
      }
      
      getinwards(order.inwards).then((inwardDara) => {
        if (angular.isDefined(inwardDara) && inwardDara !== null && inwardDara.length > 0) {
          getoutwards(outwardList).then((outwardDara) => {
              getCurrentdelivery().then((delData) => {
                  
              });
          });
        }
      });
    }
  };

  function getweightdifference(outward) {
    const deferred = $q.defer();
    let difference = 0;
    if (angular.isDefined(outward.deliveredweight) && outward.deliveredweight !== null && parseFloat(outward.deliveredweight) >= 0 &&
      angular.isDefined(outward.weight) && outward.weight !== null && parseFloat(outward.weight) > 0 &&
      angular.isDefined(outward.delivery_weight) && outward.delivery_weight !== null && parseFloat(outward.delivery_weight) > 0) {
      const del = parseFloat(outward.deliveredweight) + parseFloat(outward.delivery_weight);
      const rec = parseFloat(outward.weight);
      if (rec === del) {
        difference = 0;
      } else {
        difference = ((del - rec) / rec) * 100;
      }

      difference = parseFloat(difference);

      deferred.resolve(difference);
    } else {
      deferred.resolve(difference);
    }

    return deferred.promise;
  }
  
  $scope.validateWeight = function (outward) {
    if (angular.isDefined(outward.availableweight) && outward.availableweight !== null && parseFloat(outward.availableweight) > 0) {
      if (angular.isDefined(outward.delivery_weight) && outward.delivery_weight !== null && parseFloat(outward.delivery_weight) > 0) {
        getweightdifference(outward).then((weightdiffered) => {
          if (angular.isDefined(weightdiffered) && weightdiffered !== null) {
            if (parseFloat(weightdiffered) > $scope.deliveryData.weightDifference) {
              outward.isweightError = true;
              outward.delivery_weight = "0.00";
              Notification.warning("Delivery weight exceeds the remaining weight.");
              return false;
            }

            if (parseFloat(weightdiffered) >= 0 && parseFloat(weightdiffered) <= $scope.deliveryData.weightDifference) {
              outward.isweightError = false;
              return true;
            } else if (parseFloat(weightdiffered) > $scope.deliveryData.weightDifference) {
              outward.isweightError = true;
              Notification.warning("Delivery weight exceeds the remaining weight.");
              return true;
            }
            outward.isweightError = false;
            return true;
          }
        });
      } else {
        outward.isweightError = false;
        return true;
      }
    } else {
      outward.isweightError = true;
      Notification.warning("There is no balance weight available for this fabric to deliver");
      return false;
    }
  };
  
  $scope.loadTags = function($query) {
    return $scope.deliveryData.processList.filter(function(process) {
        return process.process_name.toLowerCase().indexOf($query.toLowerCase()) !== -1;
    });
  };
  $scope.initializeDeliverydetails();
});
