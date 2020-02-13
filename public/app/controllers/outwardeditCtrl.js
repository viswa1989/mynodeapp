/* global _ */
/* global angular */
angular.module("outwardeditCtrl", []).controller("OutwardeditController", ($scope, $rootScope, $routeParams, $sce, $uibModal, $log,
  ContractorService, AuthService, CustomerService, OrderService, DeliveryService, Notification, DyeingDetailService, socket, validateField,
  $q, JobsstorageService, PreferenceService, weightDifference, $filter, DateformatstorageService, DATEFORMATS, $location, $timeout, $window) => {
  $rootScope.contractpageLoader = true;

  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.outwardData = {};
  $scope.outwardForm = {};
  $scope.outwardData.processList = [];
  $scope.outwardData.detailformSumission = false;
  $scope.outwardData.showButton = false;
  $scope.outwardData.weightDifference = weightDifference;
  $scope.outwardData.updateconfirm = false;
  $scope.outwardData.contractor_mobile = "";
  $scope.orderData = {};

  $rootScope.canaccess = true;

  const ordermsgData = {
    customer_id: "Please select customer",
    customer_name: "Please select customer",
    order_no: "Order no not found.",
    order_reference_no: "Order reference no not found.",
    customer_dc_no: "Customer DC No not found.",
    outward_data: "Please add outward details",
    contractor_id: "Please select the contractor.",
    contractor_name: "Please select the contractor.",
    contractor_mobile_no: "Contractor phone no not found.",
    contractor_address1: "Contractor address required",
    vehicle_no: "Please enter the vehicle registration number",
    driver_name: "Please enter the driver name",
  };

  const orderfield = [{ field: "customer_id", type: "string" },
    { field: "customer_name", type: "string" },
    { field: "order_no", type: "string" },
    { field: "order_reference_no", type: "string" },
    { field: "order_date", type: "date" },
    { field: "customer_dc_no", type: "string" },
    { field: "customer_dc_date", type: "date" },
    { field: "outward_data", type: "array" },
    { field: "contractor_id", type: "string" },
    { field: "contractor_name", type: "string" },
    { field: "contractor_mobile_no", type: "string" },
    { field: "contractor_address1", type: "string" },
    { field: "vehicle_no", type: "string" },
    { field: "driver_name", type: "string" }];

  const outwardfield = [{ field: "fabric_type", type: "string" },
    { field: "fabric_color", type: "string" },
    { field: "process", type: "array" },
    { field: "lot_no", type: "string" },
    { field: "dia", type: "numberzero" },
    { field: "rolls", type: "numberzero" },
    { field: "weight", type: "numberzero" },
//    { field: "measurement", type: "object", subfield: "fabric_measure" },
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
//    measurement: "Please select the units for fabric weight",
    fabric_condition: "Please select the fabric condition",
    delivery_roll: "Please enter the no of rolls to deliver.",
    delivery_weight: "Please enter the weight to deliver.",
  };

  const orderDetail = ["customer_dc_date", "customer_dc_no", "customer_id", "customer_mobile_no", "customer_name",
    "division_id", "order_date", "order_no", "order_reference_no"];

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

  function getWeightdiff() {
    PreferenceService.getweightDifference((result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
          result.data !== null && angular.isDefined(result.data._id) && angular.isDefined(result.data.value) &&
          result.data.value !== null && parseInt(result.data.value) > 0) {
        $scope.outwardData.weightDifference = parseInt(result.data.value);
      }
    }, (error) => {

    });
  }

  getWeightdiff();
  
  $scope.getDeliverybyid = function (del) {
    ContractorService.getOutwardeditview(del, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Order) && angular.isDefined(result.data.Delivery)
                  && result.data.Order !== null && result.data.Delivery !== null && angular.isDefined(result.data.Order._id) && 
                  angular.isDefined(result.data.Delivery._id)) {
            let selectedOrder = angular.copy(result.data.Order);
            angular.forEach(selectedOrder.contract_outward, (deldata, dind) => {
              if (angular.isDefined(deldata._id) && deldata._id == result.data.Delivery._id) {
                selectedOrder.contract_outward.splice(dind, 1);
                $scope.outwardForm = angular.copy(result.data.Delivery);
                
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
      $rootScope.contractpageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.contractpageLoader = false;
    });
  }
  
  $scope.initializeDeliverydetails = function () {
    $rootScope.contractpageLoader = true;

    $scope.outwardData.outwards = [];
    $scope.outwardData.processList = [];
    $scope.outwardData.detailformSumission = false;
    $scope.outwardData.showButton = false;
    $scope.outwardData.updateconfirm = false;
    $scope.outwardForm = {};

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
            $scope.outwardData.processList.push(obj);
          }
        });
        if (angular.isDefined($routeParams.id) && $routeParams.id !== null && $routeParams.id !== "") {
          const delID = $routeParams.id;
          $scope.getDeliverybyid(delID);
        } else {
          Notification.error("Outward details not found.");
          $rootScope.contractpageLoader = false;
        }
      } else {
        $rootScope.contractpageLoader = false;
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.contractpageLoader = false;
    });
  };
  
  // Assign contractor details for autocomplete
  $scope.getcontractorDetails = function () {
    $scope.outwardData.contractors = [];
    $scope.outwardData.contractorSearch = true;
    if (angular.isDefined($scope.outwardData.contractor_mobile) && $scope.outwardData.contractor_mobile !== ""
      && $scope.outwardData.contractor_mobile.length > 3) {
      const obj = {};
      obj.contractor_mobile = angular.copy($scope.outwardData.contractor_mobile);

      ContractorService.getContractor(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
            result.data !== null && result.data.length > 0) {
          $scope.outwardData.contractors = angular.copy(result.data);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };
  
  // Select contractor
  $scope.selectContractor = function (contractor) {
    if (angular.isDefined(contractor) && angular.isDefined(contractor._id) && angular.isDefined(contractor.company_name) && contractor._id !== "") {
      $scope.outwardForm.contractor_id = angular.copy(contractor._id);
      $scope.outwardForm.contractor_name = angular.copy(contractor.company_name);
      $scope.outwardForm.contractor_mobile_no = angular.copy(contractor.phone_no);
      $scope.outwardData.contractor_mobile = angular.copy(contractor.phone_no);

      $scope.outwardForm.contractor_address1 = angular.isDefined(contractor.address1) ? angular.copy(contractor.address1) : "";
      $scope.outwardForm.contractor_address2 = angular.isDefined(contractor.address2) ? angular.copy(contractor.address2) : "";
      $scope.outwardForm.contractor_pincode = angular.isDefined(contractor.pin_code) ? angular.copy(contractor.pin_code) : "";
      $scope.outwardForm.gstin_number = angular.isDefined(contractor.gstin_number) ? angular.copy(contractor.gstin_number) : "";
    }
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
              $scope.outwardForm.vehicle_no = angular.copy(ui.item.label);
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
              $scope.outwardForm.driver_name = angular.copy(ui.item.label);
              if (angular.isDefined(ui.item.driver_no) && ui.item.driver_no !== null && ui.item.driver_no !== "") {
                $scope.outwardForm.driver_no = angular.copy(ui.item.driver_no);
              }
            });
          }
        }
      },
    },
  };
  
  $scope.printThisoutward = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/contractor_outward.html");
    outData = $scope.outwardForm;
    outData.outwardData = $scope.outwardForm.outward_data;
    window.open(templateUrl, "_blank");
  };

  $scope.saveOutward = function (opt) {
    if (angular.isDefined($scope.outwardForm.driver_no) && $scope.outwardForm.driver_no !== null &&
      $scope.outwardForm.driver_no !== "" && $scope.outwardForm.driver_no.length > 0 &&
      ($scope.outwardForm.driver_no.length < 10 || $scope.outwardForm.driver_no.length > 12)) {
      Notification.error("Please enter the valid driver phone no.");
      return false;
    }
    validateField.validate($scope.outwardForm, orderfield, ordermsgData).then((orderMsg) => {
      if (angular.isDefined(orderMsg) && orderMsg !== null && orderMsg !== "") {
        Notification.error(orderMsg);
      } else {
        validateField.validateGroup($scope.outwardForm.outward_data, outwardfield, outwardmsgData).then((outwardMsg) => {
          if (angular.isDefined(outwardMsg) && outwardMsg !== null && outwardMsg !== "") {
            Notification.error(outwardMsg);
          } else {
            validateOutwarddata($scope.outwardForm.outward_data).then((valid) => {
              if (angular.isDefined(valid) && valid) {
                $rootScope.contractpageLoader = true;
                const obj = {};
                obj.outwardForm = angular.copy($scope.outwardForm);

                ContractorService.updateOutward(obj, (result) => {
                  if (result !== null && angular.isDefined(result) && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
                        $scope.outwardForm._id = angular.copy(result.data._id);
                        $scope.outwardForm.outward_no = angular.copy(result.data.outward_no);
                        $scope.outwardForm.outward_date = angular.copy(result.data.outward_date);
                        $scope.outwardData.updateconfirm = true;
                        if (opt === "print") {
                          $timeout(() => {
                            $scope.printThisoutward();
                          }, 2000);
                        }
                      }
                    } else {
                      $scope.outwardData.updateconfirm = false;
                      Notification.error(result.message);
                    }
                  }
                  $rootScope.contractpageLoader = false;
                }, (error) => {
                  if (error !== null && angular.isDefined(error.message)) {
                    Notification.error(error.message);
                  }
                  $rootScope.contractpageLoader = false;
                  $scope.outwardData.updateconfirm = false;
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
            Notification.error("Outward weight must be near to the pending weight if whatever remains of the rolls are in delivery");
            validate = false;
          }
          if (parseFloat(difference) >= 0 && rollspending > 0 && angular.isDefined(data.availableweight) &&
            data.availableweight !== null && parseFloat(data.availableweight) > 0 &&
            parseFloat(data.delivery_weight) >= parseFloat(data.availableweight)) {
            Notification.error("Outward rolls must be near to the pending rolls if whatever remains of the weight are in delivery");
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

            $scope.outwardForm.inwards.push(obj);
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
      deferred.resolve($scope.outwardForm.inwards);
    }

    return deferred.promise;
  }

  function getoutwards(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.outwardForm.inwards, (inward) => {
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

    if (outwardCount === $scope.outwardForm.inwards.length) {
      deferred.resolve($scope.outwardForm.inwards);
    }

    return deferred.promise;
  }

  function getreceived(inwards) {
    const deferred = $q.defer();
    let inwardCount = 0;
    angular.forEach($scope.outwardForm.inwards, (inward) => {
      inward.deliveredrolls = angular.isDefined(inward.deliveredrolls) ? parseInt(inward.deliveredrolls) : 0;
      inward.availableweight = angular.isDefined(inward.availableweight) ? parseFloat(inward.availableweight) : parseFloat(inward.weight);
      inward.deliveredweight = angular.isDefined(inward.deliveredweight) ? parseFloat(inward.deliveredweight) : 0;

      if (angular.isDefined(inwards) && inwards.length > 0) {
        angular.forEach(inwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
            outdata.inward_data_id === inward.inward_data_id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.received_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.received_roll)) {
            const delroll = parseFloat(inward.deliveredrolls) - parseFloat(outdata.received_roll);
            const delwt = parseFloat(inward.deliveredweight) - parseFloat(outdata.received_weight);
            if (parseFloat(delroll) > 0) {
              inward.deliveredrolls = parseFloat(inward.deliveredrolls) - parseFloat(outdata.received_roll);
            } else {
              inward.deliveredrolls = 0;
            }
            if (parseFloat(delwt) > 0) {
              inward.deliveredweight = parseFloat(inward.deliveredweight) - parseFloat(outdata.received_weight);
            } else {
              inward.deliveredweight = 0;
            }
            inward.availableweight = parseFloat(inward.availableweight) + parseFloat(outdata.received_weight);
            if (parseFloat(inward.deliveredweight) >= parseFloat(inward.weight)) {
              inward.deliverycompleted = true;
            }
          }
          if (odx === inwards.length - 1) {
            inwardCount += 1;
          }
        });
      } else {
        inwardCount += 1;
      }
    });

    if (inwardCount === $scope.outwardForm.inwards.length) {
      deferred.resolve($scope.outwardForm.inwards);
    }

    return deferred.promise;
  }

  function getCurrentdelivery () {
    const deferred = $q.defer();
      
    angular.forEach($scope.outwardForm.inwards, (inward, inx) => {
      angular.forEach($scope.outwardForm.outward_data, (outdata, odx) => {
        if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
          outdata.inward_data_id === inward.inward_data_id) {
          outdata.deliveredrolls = parseInt(inward.deliveredrolls);
          outdata.deliveredweight = parseFloat(inward.deliveredweight);
          outdata.availableweight = parseFloat(inward.availableweight);

          outdata.tempdeliveredrolls = parseInt(inward.tempdeliveredrolls);
          outdata.tempavailableweight = parseFloat(inward.tempavailableweight);
          outdata.tempdeliveredweight = parseFloat(inward.tempdeliveredweight);
        }
        if (odx === $scope.outwardForm.outward_data.length - 1 && inx === $scope.outwardForm.inwards.length - 1) {
          deferred.resolve($scope.outwardForm.outward_data);
        }
      });
    });

    return deferred.promise;
  }
  
  $scope.selectOrder = function (order) {
    $scope.outwardForm.inwards = [];
    let outwardList = [];
    let outwards = [];
    let returns = [];
    let contractOutward = [];
    let contractInward = [];

    if (angular.isDefined(order) && order !== null && angular.isDefined(order._id) && angular.isDefined(order.inwards) &&
      order.inwards !== null && order.inwards !== "" && order.inwards.length > 0) {
      $scope.outwardForm.order_id = angular.copy(order._id);
      for (let i = 0; i < orderDetail.length; i += 1) {
        if (validateField.checkValid(order, orderDetail[i])) {
          $scope.outwardForm[orderDetail[i]] = angular.copy(order[orderDetail[i]]);
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
        if (angular.isDefined(inwardDara) && inwardDara !== null && inwardDara.length > 0 && outwardList.length > 0) {
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
            if (parseFloat(weightdiffered) > $scope.outwardData.weightDifference) {
              outward.isweightError = true;
              outward.delivery_weight = "0.00";
              Notification.warning("Outward weight exceeds the remaining weight.");
              return false;
            }

            if (parseFloat(weightdiffered) >= 0 && parseFloat(weightdiffered) <= $scope.outwardData.weightDifference) {
              outward.isweightError = false;
              return true;
            } else if (parseFloat(weightdiffered) > $scope.outwardData.weightDifference) {
              outward.isweightError = true;
              Notification.warning("Outward weight exceeds the remaining weight.");
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
    return $scope.outwardData.processList.filter(function(process) {
        return process.process_name.toLowerCase().indexOf($query.toLowerCase()) !== -1;
    });
  };
  $scope.initializeDeliverydetails();
}).controller("InwardeditController", ($scope, $rootScope, $routeParams, $sce, $uibModal, $log, $filter, 
  ContractorService, AuthService, CustomerService, OrderService, DeliveryService, Notification, DyeingDetailService, socket, validateField,
  $q, JobsstorageService, PreferenceService, weightDifference, DateformatstorageService, DATEFORMATS, $location, $timeout, $window) => {
  $rootScope.contractpageLoader = true;

  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.inwardData = {};
  $scope.inwardForm = {};
  $scope.inwardData.processList = [];
  $scope.inwardData.detailformSumission = false;
  $scope.inwardData.showButton = false;
  $scope.inwardData.weightDifference = weightDifference;
  $scope.inwardData.updateconfirm = false;
  $scope.orderData = {};

  $rootScope.canaccess = true;

  const ordermsgData = {
    customer_id: "Please select customer",
    customer_name: "Please select customer",
    outward_no: "Outward no not found.",
    order_no: "Order no not found.",
    order_reference_no: "Order reference no not found.",
    customer_dc_no: "Customer DC No not found.",
    inward_data: "Please add inward details",
    contractor_id: "Please select the contractor.",
    contractor_name: "Please select the contractor.",
    contractor_mobile_no: "Contractor phone no not found.",
    contractor_address1: "Contractor address required",
    vehicle_no: "Please enter the vehicle registration number",
    driver_name: "Please enter the driver name",
  };

  const orderfield = [{ field: "customer_id", type: "string" },
    { field: "customer_name", type: "string" },
    { field: "outward_no", type: "string" },
    { field: "order_no", type: "string" },
    { field: "order_reference_no", type: "string" },
    { field: "order_date", type: "date" },
    { field: "customer_dc_no", type: "string" },
    { field: "customer_dc_date", type: "date" },
    { field: "inward_data", type: "array" },
    { field: "contractor_id", type: "string" },
    { field: "contractor_name", type: "string" },
    { field: "contractor_mobile_no", type: "string" },
    { field: "contractor_address1", type: "string" },
    { field: "vehicle_no", type: "string" },
    { field: "driver_name", type: "string" }];

  const inwardfield = [{ field: "fabric_type", type: "string" },
    { field: "fabric_color", type: "string" },
    { field: "process", type: "array" },
    { field: "lot_no", type: "string" },
    { field: "dia", type: "numberzero" },
    { field: "rolls", type: "numberzero" },
    { field: "weight", type: "numberzero" },
    { field: "fabric_condition", type: "string" },
    { field: "received_roll", type: "numberzero" },
    { field: "received_weight", type: "numberzero" }];
  const inwardmsgData = {
    fabric_type: "Please select fabric type to add more",
    fabric_color: "Please select fabric colour to add more",
    process: "Please select process to add more",
    lot_no: "Please enter the lot no",
    dia: "Please enter the valid dia",
    rolls: "Please enter the valid no of rolls",
    weight: "Please enter the valid fabric weight",
    fabric_condition: "Please select the fabric condition",
    received_roll: "Please enter the no of rolls received.",
    received_weight: "Please enter the weight received.",
  };

  const orderDetail = ["customer_dc_date", "customer_dc_no", "customer_id", "customer_mobile_no", "customer_name",
    "order_date", "order_no", "order_reference_no", "order_id", "outward_no", "outward_date"];

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

  function getWeightdiff() {
    PreferenceService.getweightDifference((result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
          result.data !== null && angular.isDefined(result.data._id) && angular.isDefined(result.data.value) &&
          result.data.value !== null && parseInt(result.data.value) > 0) {
        $scope.inwardData.weightDifference = parseInt(result.data.value);
      }
    }, (error) => {

    });
  }

  getWeightdiff();
  
  $scope.getInwardbyid = function (del) {
    ContractorService.getInwardeditview(del, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Order) && angular.isDefined(result.data.Inward)
                  && result.data.Order !== null && result.data.Inward !== null && angular.isDefined(result.data.Order._id) && 
                  angular.isDefined(result.data.Inward._id)) {
            if (angular.isDefined(result.data.Outward) && result.data.Outward !== null && angular.isDefined(result.data.Outward._id)) {
              let selectedOrder = angular.copy(result.data.Order);
              selectedOrder.outward = {};
              selectedOrder.outward = angular.copy(result.data.Outward);
              angular.forEach(selectedOrder.contract_inward, (deldata, dind) => {
                if (angular.isDefined(deldata._id) && deldata._id == result.data.Inward._id) {
                  selectedOrder.contract_inward.splice(dind, 1);
                  $scope.inwardForm = angular.copy(result.data.Inward);

                  $scope.selectOrder(selectedOrder);
                }
              });
            } else {
              Notification.error("Outward details not found.");
            }
          } else {
            Notification.error("Inward details not found.");
          }
        } else {
          Notification.error(result.message);
        }
      }
      $rootScope.contractpageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.contractpageLoader = false;
    });
  }
  
  $scope.initializeDeliverydetails = function () {
    $rootScope.contractpageLoader = true;
    $scope.inwardData.updateconfirm = false;
    $scope.inwardData.inwards = [];
    $scope.inwardData.processList = [];
    $scope.inwardData.detailformSumission = false;
    $scope.inwardData.showButton = false;
    $scope.inwardForm = {};

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
            $scope.inwardData.processList.push(obj);
          }
        });
        if (angular.isDefined($routeParams.id) && $routeParams.id !== null && $routeParams.id !== "") {
          const inwID = $routeParams.id;
          $scope.getInwardbyid(inwID);
        } else {
          Notification.error("Inward details not found.");
          $rootScope.contractpageLoader = false;
        }
      } else {
        $rootScope.contractpageLoader = false;
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.contractpageLoader = false;
    });
  };

  function getDeliveredorder(outwards) {
    const deferred = $q.defer();

    const inwardDetail = ["fabric_condition", "process", "fabric_type", "fabric_color", "dia", "lot_no", "inward_status"];
        
    if (angular.isDefined(outwards) && outwards !== null && outwards.length > 0) {  
      angular.forEach(outwards, (outwardData) => {
        if (angular.isDefined(outwardData) && angular.isDefined(outwardData._id) && outwardData._id === $scope.inwardForm.outward_id) {
          angular.forEach(outwardData.outward_data, (inwdetails, detailindex) => {
            const obj = {};
            obj.outward_id = angular.copy(outwardData._id);
            obj.inward_id = angular.copy(inwdetails.inward_id);
            obj.inward_data_id = angular.isDefined(inwdetails.inward_data_id) ? angular.copy(inwdetails.inward_data_id) : null;
            obj.outward_data_id = angular.copy(inwdetails._id);
            obj.rolls = angular.copy(inwdetails.delivery_roll);
            obj.weight = angular.copy(inwdetails.delivery_weight);
            obj.availweight = angular.copy(inwdetails.delivery_weight);
            obj.originweight = angular.copy(inwdetails.delivery_weight);
            obj.origindelweight = 0;

            for (let i = 0; i < inwardDetail.length; i += 1) {
              if (validateField.checkValid(inwdetails, inwardDetail[i])) {
                obj[inwardDetail[i]] = angular.copy(inwdetails[inwardDetail[i]]);
              }
            }

            obj.returncompleted = false;
            obj.receivedrolls = 0;
            obj.availableweight = parseFloat(obj.weight);
            obj.receivedweight = 0;
            
            $scope.inwardForm.outwards.push(obj);
            if (detailindex === outwardData.outward_data.length - 1) {
              deferred.resolve($scope.inwardForm.outwards);
            }
          });
        }
      });
    } else {
      deferred.resolve($scope.inwardForm.outwards);
    }

    return deferred.promise;
  }
  
  function getinwards(inwards) {
    const deferred = $q.defer();
    let inwardCount = 0;
    angular.forEach($scope.inwardForm.outwards.outward_data, (outward) => {
      outward.receivedrolls = 0;
      outward.availableweight = parseFloat(outward.weight);
      outward.receivedweight = 0;
      if (angular.isDefined(inwards) && inwards.length > 0) {
        angular.forEach(inwards, (indata, odx) => {
          if (angular.isDefined(indata.inward_id) && angular.isDefined(indata.inward_data_id) && indata.inward_id === outward.inward_id &&
            indata.inward_data_id === outward.inward_data_id && indata.outward_data_id === outward.outward_data_id &&
            angular.isDefined(outward.weight) && angular.isDefined(indata.received_weight) && angular.isDefined(outward.rolls) &&
            angular.isDefined(indata.received_roll)) {
            outward.receivedrolls = parseInt(outward.receivedrolls) + parseInt(indata.received_roll);
            outward.receivedweight = parseFloat(outward.receivedweight) + parseFloat(indata.received_weight);
            outward.availableweight = parseFloat(outward.availableweight) - parseFloat(indata.received_weight);
            
            if (parseFloat(outward.receivedweight) >= parseFloat(outward.weight)) {
              outward.returncompleted = true;
            }
          }
          if (odx === inwards.length - 1) {
            inwardCount += 1;
          }
        });
      } else {
        inwardCount += 1;
      }
    });

    if (inwardCount === $scope.inwardForm.outwards.length) {
      deferred.resolve($scope.inwardForm.outwards);
    }

    return deferred.promise;
  }  
  
  function getoutwards(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.inwardForm.outwards, (inward) => {
      inward.availweight = angular.isDefined(inward.availweight) ? parseFloat(inward.availweight) : parseFloat(inward.originweight);
      inward.delweight = angular.isDefined(inward.delweight) ? parseFloat(inward.delweight) : 0;

      if (angular.isDefined(outwards) && outwards.length > 0) {
        angular.forEach(outwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
            outdata.inward_data_id === inward.inward_data_id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.delivery_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.delivery_roll)) {
            inward.delweight = parseFloat(inward.delweight) + parseFloat(outdata.delivery_weight);
            inward.availweight = parseFloat(inward.availweight) - parseFloat(outdata.delivery_weight);
            if (angular.isDefined(outdata.fabric_id)) {
              inward.origindelweight = parseFloat(inward.origindelweight) + parseFloat(outdata.delivery_weight);
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

    if (outwardCount === $scope.inwardForm.outwards.length) {
      deferred.resolve($scope.inwardForm.outwards);
    }

    return deferred.promise;
  }

  function getreceived(inwards) {
    const deferred = $q.defer();
    let inwardCount = 0;
    angular.forEach($scope.inwardForm.outwards, (inward) => {

      if (angular.isDefined(inwards) && inwards.length > 0) {
        angular.forEach(inwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
            outdata.inward_data_id === inward.inward_data_id && angular.isDefined(outdata.outward_data_id) && 
            angular.isDefined(inward.outward_data_id) && outdata.outward_data_id === inward.outward_data_id && 
            angular.isDefined(outdata.received_weight) && angular.isDefined(outdata.received_roll)) {
        
            inward.receivedrolls = parseInt(inward.receivedrolls) + parseInt(outdata.received_roll);
            inward.receivedweight = parseFloat(inward.receivedweight) + parseFloat(outdata.received_weight);
            inward.availableweight = parseFloat(inward.availableweight) - parseFloat(outdata.received_weight);
          }
          if (odx === inwards.length - 1) {
            inwardCount += 1;
          }
        });
      } else {
        inwardCount += 1;
      }
    });

    if (inwardCount === $scope.inwardForm.outwards.length) {
      deferred.resolve($scope.inwardForm.outwards);
    }

    return deferred.promise;
  }
  
  function getCurrentdelivery () {
    const deferred = $q.defer();
      
    angular.forEach($scope.inwardForm.outwards, (inward, inx) => {
      angular.forEach($scope.inwardForm.inward_data, (outdata, odx) => {
        if (angular.isDefined(outdata.inward_id) && angular.isDefined(inward.outward_id) && angular.isDefined(inward.outward_data_id) && 
          angular.isDefined($scope.inwardForm.outward_id) && angular.isDefined(outdata.outward_data_id) && angular.isDefined(outdata.inward_data_id) && 
          $scope.inwardForm.outward_id === inward.outward_id && outdata.outward_data_id === inward.outward_data_id && 
          outdata.inward_id === inward.inward_id && outdata.inward_data_id === inward.inward_data_id) {
          outdata.receivedrolls = parseInt(inward.receivedrolls);
          outdata.receivedweight = parseFloat(inward.receivedweight);
          outdata.availableweight = parseFloat(inward.availableweight);
        }
        if (odx === $scope.inwardForm.inward_data.length - 1 && inx === $scope.inwardForm.outwards.length - 1) {
          deferred.resolve($scope.inwardForm.inward_data);
        }
      });
    });

    return deferred.promise;
  }
  
  $scope.selectOrder = function (order) {
    $scope.inwardForm.outwards = [];
    let inwardList = [];
    let inwards = [];
    let outwardList = [];
    let receivedList = [];
    let outwards = [];
    let returns = [];
    let contractOutward = [];
    let contractInward = [];

    if (angular.isDefined(order) && order !== null && angular.isDefined(order._id) && angular.isDefined(order.contract_outward) &&
      order.contract_outward !== null && order.contract_outward !== "" && order.contract_outward.length > 0) {
      $scope.inwardForm.order_id = angular.copy(order.order_id);
      for (let i = 0; i < orderDetail.length; i += 1) {
        if (validateField.checkValid(order, orderDetail[i])) {
          $scope.inwardForm[orderDetail[i]] = angular.copy(order[orderDetail[i]]);
        }
      }
      if (angular.isDefined(order.outward) && order.outward !== null && order.outward.length > 0) {
        inwards = _.flatten(_.pluck(order.outward, "outward_data"));
        inwardList = inwards;
      }
      if (angular.isDefined(order.contract_inward) && order.contract_inward !== null && order.contract_inward.length > 0) {
        contractInward = _.flatten(_.pluck(order.contract_inward, "inward_data"));
        receivedList = contractInward;
      }
      
      getDeliveredorder(order.contract_outward).then((inwardDara) => {
        if (angular.isDefined(inwardDara) && inwardDara !== null && inwardDara.length > 0) {
          getreceived(receivedList).then((receivedDara) => {
            getCurrentdelivery().then((outwardDara) => {

            });
          });
        }
      });
    }
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
              $scope.inwardForm.vehicle_no = angular.copy(ui.item.label);
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
              $scope.inwardForm.driver_name = angular.copy(ui.item.label);
              if (angular.isDefined(ui.item.driver_no) && ui.item.driver_no !== null && ui.item.driver_no !== "") {
                $scope.inwardForm.driver_no = angular.copy(ui.item.driver_no);
              }
            });
          }
        }
      },
    },
  };

  function getweightdifference(inward) {
    const deferred = $q.defer();
    let difference = 0;
    if (angular.isDefined(inward.receivedweight) && inward.receivedweight !== null && parseFloat(inward.receivedweight) >= 0 &&
      angular.isDefined(inward.weight) && inward.weight !== null && parseFloat(inward.weight) > 0 &&
      angular.isDefined(inward.received_weight) && inward.received_weight !== null && parseFloat(inward.received_weight) > 0) {
      const del = parseFloat(inward.receivedweight) + parseFloat(inward.received_weight);
      const rec = parseFloat(inward.weight);
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
  
  function calculateweightdiff(inward) {
    const deferred = $q.defer();
    let difference = 0;
    if (angular.isDefined(inward.originweight) && inward.originweight !== null && parseFloat(inward.originweight) >= 0 &&
      angular.isDefined(inward.origindelweight) && inward.origindelweight !== null && parseFloat(inward.origindelweight) >= 0 &&
      angular.isDefined(inward.received_weight) && inward.received_weight !== null && parseFloat(inward.received_weight) > 0) {
      const diffper = (parseFloat(inward.originweight)/100)*$scope.inwardData.weightDifference;
      const wholeweight = parseFloat(inward.originweight) + parseFloat(diffper);
      const rec = parseFloat(inward.origindelweight) + parseFloat(inward.received_weight);
      if (wholeweight === rec) {
        difference = 0;
      } else {
        difference = parseFloat(wholeweight) - parseFloat(rec);
      }

      difference = parseFloat(difference);

      deferred.resolve(difference);
    } else {
      deferred.resolve(difference);
    }

    return deferred.promise;
  }
  
  $scope.validateWeight = function (inward) {
    if (angular.isDefined(inward.availableweight) && inward.availableweight !== null && parseFloat(inward.availableweight) > 0) {
      if (angular.isDefined(inward.received_weight) && inward.received_weight !== null && parseFloat(inward.received_weight) > 0) {
        getweightdifference(inward).then((weightdiffered) => {
          if (angular.isDefined(weightdiffered) && weightdiffered !== null) {
            if (parseFloat(weightdiffered) > $scope.inwardData.weightDifference) {
              inward.isweightError = true;
              inward.received_weight = "0.00";
              Notification.warning("Inward weight exceeds the remaining weight.");
              return false;
            }
            
            calculateweightdiff(inward).then((weightdifference) => {
              if (parseFloat(weightdifference) < 0) {
                inward.isweightError = true;
                inward.received_weight = "0.00";
                Notification.warning("Total order weight exceeds the weight difference.");
                return false;
              }
              if (parseFloat(weightdiffered) >= 0 && parseFloat(weightdiffered) <= $scope.inwardData.weightDifference) {
                inward.isweightError = false;
                return true;
              } else if (parseFloat(weightdiffered) > $scope.inwardData.weightDifference) {
                inward.isweightError = true;
                Notification.warning("Inward weight exceeds the remaining weight.");
                return true;
              }
              
              inward.isweightError = false;
              return true;
            }); 
          }
        });
      } else {
        inward.isweightError = false;
        return true;
      }
    } else {
      inward.isweightError = true;
      Notification.warning("There is no balance weight available for this fabric to deliver");
      return false;
    }
  };

  function validateinwardData(inwards) {
    const deferred = $q.defer();
    let validate = true;
    let count = 0;
    angular.forEach(inwards, (data) => {
      if (angular.isDefined(data) && angular.isDefined(data.received_roll) && angular.isDefined(data.received_weight) && validate) {
        if (validate) {
          let difference = 0;
          if (angular.isDefined(data.receivedweight) && data.receivedweight !== null && parseFloat(data.receivedweight) > 0 &&
            angular.isDefined(data.weight) && data.weight !== null && parseFloat(data.weight) > 0 &&
            data.received_weight !== null && parseFloat(data.received_weight) > 0) {
            difference = (parseFloat(data.receivedweight) + parseFloat(data.received_weight)) - parseFloat(data.weight);
            difference = (difference / parseFloat(data.weight)) * 100;
          }
          const rollspending = parseInt(data.availablerolls) - parseInt(data.received_roll);

          if (rollspending === 0 && (parseFloat(difference) > $scope.inwardData.weightDifference ||
            parseFloat(difference) < (-1 * $scope.inwardData.weightDifference))) {
            Notification.error("Inward weight must be near to the pending weight if whatever remains of the rolls are in delivery");
            validate = false;
          }
          if (parseFloat(difference) >= 0 && rollspending > 0 && angular.isDefined(data.availableweight) &&
            data.availableweight !== null && parseFloat(data.availableweight) > 0 &&
            parseFloat(data.received_weight) >= parseFloat(data.availableweight)) {
            Notification.error("Inward rolls must be near to the pending rolls if whatever remains of the weight are in delivery");
            validate = false;
          }
          if (rollspending === 0 && parseFloat(data.received_weight) > 0 &&
            parseFloat(difference) <= $scope.inwardData.weightDifference &&
            parseFloat(difference) >= (-1 * $scope.inwardData.weightDifference)) {
            data.inward_status = "Completed";
          }
        } else {
          validate = false;
        }
        count += 1;
      } else {
        validate = false;
      }
    });
    if (count === inwards.length) {
      deferred.resolve(validate);
    }
    return deferred.promise;
  }

  $scope.printThisinward = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/contractor_inward.html");
    inData = $scope.inwardForm;
    inData.inwardData = $scope.inwardForm.inward_data;
    window.open(templateUrl, "_blank");
  };

  $scope.saveInward = function (opt) {
    if (angular.isDefined($scope.inwardForm.driver_no) && $scope.inwardForm.driver_no !== null &&
      $scope.inwardForm.driver_no !== "" && $scope.inwardForm.driver_no.length > 0 &&
      ($scope.inwardForm.driver_no.length < 10 || $scope.inwardForm.driver_no.length > 12)) {
      Notification.error("Please enter the valid driver phone no.");
      return false;
    }
    const d = new Date($scope.inwardForm.contract_dc_date);
    if (angular.isDefined($scope.inwardForm.contract_dc_date) && $scope.inwardForm.contract_dc_date !== null && 
            $scope.inwardForm.contract_dc_date !== "" && !angular.isDate(d)) {
      Notification.error("Invalid delivery date");
      return false;
    }
    
    validateField.validate($scope.inwardForm, orderfield, ordermsgData).then((orderMsg) => {
      if (angular.isDefined(orderMsg) && orderMsg !== null && orderMsg !== "") {
        Notification.error(orderMsg);
      } else {
        validateField.validateGroup($scope.inwardForm.inward_data, inwardfield, inwardmsgData).then((inwardMsg) => {
          if (angular.isDefined(inwardMsg) && inwardMsg !== null && inwardMsg !== "") {
            Notification.error(inwardMsg);
          } else {
            validateinwardData($scope.inwardForm.inward_data).then((valid) => {
              if (angular.isDefined(valid) && valid) {
                $rootScope.contractpageLoader = true;
                const obj = {};
                obj.inwardForm = angular.copy($scope.inwardForm);
                
                ContractorService.updateInward(obj, (result) => {
                  if (result !== null && angular.isDefined(result) && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
                        $scope.inwardForm._id = angular.copy(result.data._id);
                        $scope.inwardForm.inward_no = angular.copy(result.data.inward_no);
                        $scope.inwardForm.inward_date = angular.copy(result.data.inward_date);
                        if (opt === "print") {
                          $timeout(() => {
                            $scope.printThisinward();
                          }, 2000);
                        }
                        $scope.inwardData.updateconfirm = true;
                      }
                    } else {
                      Notification.error(result.message);
                      $scope.inwardData.updateconfirm = false;
                    }
                  }
                  $rootScope.contractpageLoader = false;
                }, (error) => {
                  if (error !== null && angular.isDefined(error.message)) {
                    Notification.error(error.message);
                  }
                  $scope.inwardData.updateconfirm = false;
                  $rootScope.contractpageLoader = false;
                });
              }
            });
          }
        });
      }
    });
  };
  
  $scope.loadTags = function($query) {
    return $scope.inwardData.processList.filter(function(process) {
        return process.process_name.toLowerCase().indexOf($query.toLowerCase()) !== -1;
    });
  };
  $scope.initializeDeliverydetails();
});
