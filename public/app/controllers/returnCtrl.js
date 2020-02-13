/* global _ */
/* global angular */
angular.module("returnCtrl", []).controller("ReturnController", ($scope, $rootScope, $routeParams, $sce, $uibModal, $log, AuthService,
  CustomerService, OrderService, DeliveryreturnService, DeliveryService, Notification, DyeingDetailService, socket, validateField,
  $q, JobsstorageService, PreferenceService, weightDifference, $filter, $location, $timeout, $window) => {
  $rootScope.orderpageLoader = false;
  $scope.deliveryreturnData = {};
  $scope.deliveryreturnForm = {};
  $scope.deliveryreturnData.customers = [];
  $scope.deliveryreturnData.orders = [];
  $scope.deliveryreturnData.processList = [];
  $scope.deliveryreturnData.detailformSumission = false;
  $scope.deliveryreturnData.showButton = false;
  $scope.deliveryreturnData.weightDifference = weightDifference;
  $scope.deliveryreturnData.addresschange = false;
  $scope.orderData = {};

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
    outwardData: "Please add delivery details",
    delivery_company_name: "Please enter the company name in delivery details",
    delivery_address_line: "Address line, City, State and Pincode must be required in delivery address",
    delivery_city: "Address line, City, State and Pincode must be required in delivery address",
    delivery_state: "Address line, City, State and Pincode must be required in delivery address",
    delivery_pincode: "Address line, City, State and Pincode must be required in delivery address",
    vehicle_no: "Please enter the vehicle registration number",
    driver_name: "Please enter the driver name",
  };

  const orderfield = [{field: "customer_id", type: "string"},
    {field: "customer_name", type: "string"},
    {field: "contactperson", type: "object", subfield: "name"},
    {field: "order_reference_no", type: "string"},
    {field: "customer_dc_no", type: "string"},
    {field: "customer_dc_date", type: "date"},
    {field: "dyeing", type: "object", subfield: "dyeing_name"},
    {field: "dyeing_dc_no", type: "string"},
    {field: "dyeing_dc_date", type: "date"},
    {field: "order_type", type: "string"},
    {field: "outwardData", type: "array"},
    {field: "delivery_company_name", type: "string"},
    //        {"field": "delivery_address_line", "type": "string"},
    //        {"field": "delivery_city", "type": "string"},
    //        {"field": "delivery_state", "type": "string"},
    //        {"field": "delivery_pincode", "type": "string"},
    {field: "vehicle_no", type: "string"},
    {field: "driver_name", type: "string"}];

  const outwardfield = [{field: "fabric_type", type: "string"},
    {field: "fabric_color", type: "string"},
    {field: "process", type: "array"},
    {field: "lot_no", type: "string"},
    {field: "dia", type: "numberzero"},
    {field: "rolls", type: "numberzero"},
    {field: "weight", type: "numberzero"},
    {field: "measurement", type: "object", subfield: "fabric_measure"},
    {field: "fabric_condition", type: "string"},
    {field: "delivery_roll", type: "numberzero"},
    {field: "delivery_weight", type: "numberzero"}];
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
    $scope.orderData.joblist = [];
    JobsstorageService.getJobdetail().then((data) => {
      if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
        angular.forEach(data, (jobs) => {
          const obj = {};
          obj.current_bill = (angular.isDefined(jobs.current_bill) && jobs.current_bill) ? angular.copy(jobs.current_bill) : false;
          obj.order_id = jobs.order_id;
          obj.mobile_no = (angular.isDefined(jobs.customer_mobile_no) && jobs.customer_mobile_no !== "") ? angular.copy(jobs.customer_mobile_no) : "";

          $scope.orderData.joblist.push(obj);
        });
      }
    });

    PreferenceService.getweightDifference((result) => {
      if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) &&
          result.data !== null && angular.isDefined(result.data._id) && angular.isDefined(result.data.value) &&
          result.data.value !== null && parseInt(result.data.value) > 0) {
        $scope.deliveryreturnData.weightDifference = parseInt(result.data.value);
      }
    }, (error) => {

    });
  };

  $scope.initializeJobdetails();

  $scope.selectJob = function (job) {
    if (angular.isDefined(job) && job !== "") {
      JobsstorageService.selectJobdetail(job).then(() => {
        $location.path("/divisionadmin/order/newjob");
      });
    } else {
      $location.path("/divisionadmin/order/newjob");
    }
  };

  $scope.closeJob = function (jobs) {
    if (angular.isDefined(jobs) && jobs !== "" && jobs !== null && angular.isDefined(jobs.order_id)) {
      if (angular.isDefined(jobs._id) && jobs._id !== "") {
        JobsstorageService.closeJobdetail(angular.copy(jobs)).then((data) => {
          if (angular.isDefined(data)) {
            $location.path("/divisionadmin/order/newjob");
          }
        });
      } else {
        JobsstorageService.closetempJobdetail(angular.copy(jobs)).then((data) => {
          if (angular.isDefined(data)) {
            $location.path("/divisionadmin/order/newjob");
          }
        });
      }
    }
  };

  $scope.initializeDeliverydetails = function () {
    $rootScope.orderpageLoader = true;

    $scope.deliveryreturnData.customers = [];
    $scope.deliveryreturnData.orders = [];
    $scope.deliveryreturnData.outwards = [];
    $scope.deliveryreturnData.processList = [];
    $scope.deliveryreturnData.detailformSumission = false;
    $scope.deliveryreturnData.showButton = false;
    $scope.deliveryreturnData.customerSearch = false;
    $scope.deliveryreturnData.customer_mobile = "";
    $scope.deliveryreturnForm = {};

    DeliveryreturnService.getProcessdetail((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) &&
        result.data !== null && result.data !== "" && result.data.length > 0) {
        angular.forEach(result.data, (process) => {
          if (angular.isDefined(process) && process !== null && process !== "" && angular.isDefined(process._id) &&
          angular.isDefined(process.process_name)) {
            const obj = {};
            obj.process_id = angular.copy(process._id);
            obj.process_name = angular.copy(process.process_name);
            $scope.deliveryreturnData.processList.push(obj);
          }
        });
      }
      $rootScope.orderpageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.orderpageLoader = false;
    });
  };

  // Assign customer details for autocomplete
  $scope.getcustomerDetails = function () {
    $scope.deliveryreturnData.customers = [];
    $scope.deliveryreturnData.customerSearch = true;
    if (angular.isDefined($scope.deliveryreturnData.customer_mobile) && $scope.deliveryreturnData.customer_mobile !== ""
        && $scope.deliveryreturnData.customer_mobile.length > 4) {
      const obj = {};
      obj.customer_mobile = angular.copy($scope.deliveryreturnData.customer_mobile);

      CustomerService.getcustomerbyDivision(obj, (result) => {
        if (result !== null && angular.isDefined(result.success) && result.success && angular.isDefined(result.data) && 
            result.data!==null && angular.isDefined(result.data.Customer) && result.data.Customer.length > 0) {
          $scope.deliveryreturnData.customers = angular.copy(result.data.Customer);
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  // Select customer
  $scope.selectCustomer = function (customer) {
    $scope.deliveryreturnForm = {};
    $scope.deliveryreturnData.addresschange = false;
    if (angular.isDefined(customer) && angular.isDefined(customer._id) && angular.isDefined(customer.name) && customer._id !== "") {
      if (angular.isDefined(customer.status_outward) && customer.status_outward) {
        Notification.error("This customer has been blocked. Please contact your administrator to proceed further");
        return false;
      }
      $scope.deliveryreturnForm.customer_id = angular.copy(customer._id);
      $scope.deliveryreturnForm.customer_name = angular.copy(customer.name);
      $scope.deliveryreturnForm.customer_mobile_no = angular.copy(customer.mobile_no);
      $scope.deliveryreturnData.customer_mobile = angular.copy(customer.mobile_no);
      $scope.deliveryreturnForm.gstin = angular.copy(customer.gstin);
      if (angular.isDefined(customer.customer_alternate_no)) {
        $scope.deliveryreturnForm.customer_alternate_no = angular.copy(customer.customer_alternate_no);
      }
      if (angular.isDefined(customer.is_favourite)) {
        $scope.deliveryreturnForm.is_favourite = angular.copy(customer.is_favourite);
      }

      $scope.deliveryreturnForm.delivery_company_name = angular.copy(customer.name);

      angular.forEach(customer.address, (addr) => {
        if (angular.isDefined(addr.is_default) && addr.is_default) {
          if (angular.isDefined(addr.company_name) && addr.company_name !== "" && addr.company_name !== null) {
            $scope.deliveryreturnForm.billing_company_name = angular.copy(addr.company_name);
          }
          if (angular.isDefined(addr.gstin) && addr.gstin !== "" && addr.gstin !== null) {
            $scope.deliveryreturnForm.billing_gstin = angular.copy(addr.gstin);
          }
          if (angular.isDefined(addr.address_line) && addr.address_line !== "") {
            $scope.deliveryreturnForm.billing_address_line = angular.copy(addr.address_line);
          }
          if (angular.isDefined(addr.area) && addr.area !== "") {
            $scope.deliveryreturnForm.billing_area = angular.copy(addr.area);
          }
          if (angular.isDefined(addr.city) && addr.city !== "") {
            $scope.deliveryreturnForm.billing_city = angular.copy(addr.city);
          }
          if (angular.isDefined(addr.state) && addr.state !== "") {
            $scope.deliveryreturnForm.billing_state = angular.copy(addr.state);
          }
          if (angular.isDefined(addr.pincode) && addr.pincode !== "") {
            $scope.deliveryreturnForm.billing_pincode = angular.copy(addr.pincode);
          }
          if (angular.isDefined(addr.landmark) && addr.landmark !== "") {
            $scope.deliveryreturnForm.billing_landmark = angular.copy(addr.landmark);
          }
          if (angular.isDefined(addr.contact_no) && addr.contact_no !== "") {
            $scope.deliveryreturnForm.billing_contact_no = angular.copy(addr.contact_no);
          }
        }
      });

      $rootScope.orderpageLoader = true;
      $scope.deliveryreturnData.orders = [];
      $scope.deliveryreturnData.outwards = [];

      OrderService.getreturnOrders(customer._id, (result) => {
        if (result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
          angular.forEach(result.data, (ord) => {
            if (angular.isDefined(ord) && angular.isDefined(ord.inwards) && ord.inwards !== null && ord.inwards.length > 0) {
              const orders = angular.copy(ord);
              const list = _.flatten(_.pluck(orders.inwards, "inward_data"));
              const res = _.flatten(_.pluck(list, "process"));
              const processlist = _.flatten(_.pluck(res, "process_name"));
              orders.processes = processlist.join(", ");
              $scope.deliveryreturnData.orders.push(angular.copy(orders));
            }
          });
          setTimeout(() => {
            const orderfilter = $window.document.getElementById('ordersrch');
            orderfilter.focus();
          }, 200);
        }
        $scope.deliveryreturnData.customerSearch = false;

        $rootScope.orderpageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $rootScope.orderpageLoader = false;
      });
    }
  };

  $scope.cleardeliveryaddress = function () {
    $scope.deliveryreturnData.delivery_company_name = "";
    $scope.deliveryreturnData.addresssubmission = false;
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
        $scope.deliveryreturnData.delivery_company_name = "";
        $scope.deliveryreturnData.delivery_address_line = "";
        $scope.deliveryreturnData.delivery_city = "";
        $scope.deliveryreturnData.delivery_state = "";
        $scope.deliveryreturnData.delivery_pincode = "";

        if (angular.isDefined(ui.item) && angular.isDefined(ui.item.value) && angular.isDefined(ui.item.label) && ui.item.value !== "") {
          if (angular.isDefined(ui.item.label) && ui.item.label !== null && ui.item.label !== "") {
            $scope.$apply(() => {
              $scope.deliveryreturnData.delivery_company_name = angular.copy(ui.item.label);
            });
            if (angular.isDefined(ui.item.delivery_address_line) && ui.item.delivery_address_line !== null && ui.item.delivery_address_line !== "") {
              $scope.deliveryreturnData.delivery_address_line = angular.copy(ui.item.delivery_address_line);
            }
            if (angular.isDefined(ui.item.delivery_city) && ui.item.delivery_city !== null && ui.item.delivery_city !== "") {
              $scope.deliveryreturnData.delivery_city = angular.copy(ui.item.delivery_city);
            }
            if (angular.isDefined(ui.item.delivery_pincode) && ui.item.delivery_pincode !== null && ui.item.delivery_pincode !== "") {
              $scope.deliveryreturnData.delivery_pincode = angular.copy(ui.item.delivery_pincode);
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
              $scope.deliveryreturnForm.vehicle_no = angular.copy(ui.item.label);
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
              $scope.deliveryreturnForm.driver_name = angular.copy(ui.item.label);
              if (angular.isDefined(ui.item.driver_no) && ui.item.driver_no !== null && ui.item.driver_no !== "") {
                $scope.deliveryreturnForm.driver_no = angular.copy(ui.item.driver_no);
              }
            });
          }
        }
      },
    },
  };

  $scope.changedeliveryaddress = function () {
    $scope.cleardeliveryaddress();
    $scope.deliveryreturnData.addresschange = true;
  };

  $scope.closedeliveryaddress = function () {
    $scope.cleardeliveryaddress();
    $scope.deliveryreturnData.addresschange = false;
  };

  $scope.saveDeliveryaddress = function () {
    $scope.deliveryreturnData.addresssubmission = true;
    if (angular.isUndefined($scope.deliveryreturnData.delivery_company_name) || $scope.deliveryreturnData.delivery_company_name === null ||
    $scope.deliveryreturnData.delivery_company_name === "") {
      Notification.error("Please enter the company name");
      return false;
    }
    $scope.deliveryreturnForm.delivery_company_name = angular.copy($scope.deliveryreturnData.delivery_company_name);
    $scope.deliveryreturnForm.delivery_address_line = angular.copy($scope.deliveryreturnData.delivery_address_line);
    $scope.deliveryreturnForm.delivery_city = angular.copy($scope.deliveryreturnData.delivery_city);
    $scope.deliveryreturnForm.delivery_pincode = angular.copy($scope.deliveryreturnData.delivery_pincode);
    $scope.deliveryreturnData.addresschange = false;
  };

  $scope.checkBalanceweight = function (inward) {
    let bal_weight = 0;
    if (angular.isDefined(inward) && angular.isDefined(inward.delivery_weight)) {
      bal_weight += parseFloat(inward.delivery_weight);
    }
    if (angular.isDefined(inward) && angular.isDefined(inward.delivered_weight)) {
      bal_weight += parseFloat(inward.delivered_weight);
    }
    if (angular.isDefined(inward) && angular.isDefined(inward.returned_weight)) {
      bal_weight += parseFloat(inward.returned_weight);
    }
    if ((bal_weight + 10) > parseFloat(inward.weight)) {
      inward.delivered_weight = "";
      Notification.error("Delivery weight greater than balance weight");
      return false;
    }
  };

  $scope.toggleInwards = function (inwards) {
    inwards.delivery_weight = "";
    inwards.selected = !inwards.selected;
  };

  $scope.printThisdelivery = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/order_return.html");
    retData = $scope.deliveryreturnForm;
    window.open(templateUrl, "_blank");
  };

  $scope.saveDelivery = function (opt) {
    validateField.validate($scope.deliveryreturnForm, orderfield, ordermsgData).then((orderMsg) => {
      if (angular.isDefined(orderMsg) && orderMsg !== null && orderMsg !== "") {
        Notification.error(orderMsg);
      } else {
        validateField.validateGroup($scope.deliveryreturnForm.outwardData, outwardfield, outwardmsgData).then((outwardMsg) => {
          if (angular.isDefined(outwardMsg) && outwardMsg !== null && outwardMsg !== "") {
            Notification.error(outwardMsg);
          } else {
            validateOutwarddata($scope.deliveryreturnForm.outwardData).then((valid) => {
              if (angular.isDefined(valid) && valid) {
                $rootScope.orderpageLoader = true;
                const obj = {};
                obj.deliveryreturnForm = angular.copy($scope.deliveryreturnForm);

                DeliveryreturnService.save(obj, (result) => {
                  if (result !== null && angular.isDefined(result) && angular.isDefined(result.success)) {
                    if (result.success) {
                      if (angular.isDefined(result.data) && angular.isDefined(result.data._id)) {
                        $scope.deliveryreturnForm._id = angular.copy(result.data._id);
                        $scope.deliveryreturnForm.delivery_no = angular.copy(result.data.delivery_no);
                        $scope.deliveryreturnForm.delivery_date = angular.copy(result.data.delivery_date);
                        if (opt === "print") {
                          $timeout(() => {
                            $scope.printThisdelivery();
                          }, 2000);
                        }
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

          if (rollspending === 0 && (parseFloat(difference) > $scope.deliveryreturnData.weightDifference ||
          parseFloat(difference) < (-1 * $scope.deliveryreturnData.weightDifference))) {
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
            parseFloat(difference) <= $scope.deliveryreturnData.weightDifference &&
            parseFloat(difference) >= (-1 * $scope.deliveryreturnData.weightDifference)) {
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

            $scope.deliveryreturnForm.inwards.push(obj);
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
      deferred.resolve($scope.deliveryreturnForm.inwards);
    }

    return deferred.promise;
  }

  function getoutwards(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.deliveryreturnForm.inwards, (inward) => {
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

    if (outwardCount === $scope.deliveryreturnForm.inwards.length) {
      deferred.resolve($scope.deliveryreturnForm.inwards);
    }

    return deferred.promise;
  }

  function getreceived (inwards){
    const deferred = $q.defer();
    let inwardCount = 0;
    angular.forEach($scope.deliveryreturnForm.inwards, (inward) => {
      inward.deliveredrolls = angular.isDefined(inward.deliveredrolls) ? parseInt(inward.deliveredrolls) : 0;
      inward.availableweight = angular.isDefined(inward.availableweight) ? parseFloat(inward.availableweight) : parseFloat(inward.weight);
      inward.deliveredweight = angular.isDefined(inward.deliveredweight) ? parseFloat(inward.deliveredweight) : 0;
      
      if (angular.isDefined(inwards) && inwards.length > 0) {
        angular.forEach(inwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
            outdata.inward_data_id === inward.inward_data_id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.received_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.received_roll)) {
        
            inward.deliveredrolls = parseFloat(inward.deliveredrolls) - parseFloat(outdata.received_roll);
            inward.deliveredweight = parseFloat(inward.deliveredweight) - parseFloat(outdata.received_weight);
            inward.availableweight = parseFloat(inward.availableweight) + parseFloat(outdata.received_weight);
            if (parseFloat(inward.deliveredweight) >= parseFloat(inward.weight)) {
              inward.deliverycompleted = true;
            } else {
              inward.deliverycompleted = false;
            }
          }
          if (odx === inwards.length - 1) {
            inwardCount += 1;
            if(parseFloat(inward.deliveredrolls)<0){
              inward.deliveredrolls = 0;
            }
            if(parseFloat(inward.deliveredweight)<0){
              inward.deliveredweight = 0;
            }
          }
        });
      } else {
        inwardCount += 1;
      }
    });

    if (inwardCount === $scope.deliveryreturnForm.inwards.length) {
      deferred.resolve($scope.deliveryreturnForm.inwards);
    }

    return deferred.promise;
  }
  
  function getreturns(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.deliveryreturnForm.inwards, (inward) => {
      inward.deliveredrolls = angular.isDefined(inward.deliveredrolls) ? parseInt(inward.deliveredrolls) : 0;
      inward.availableweight = angular.isDefined(inward.availableweight) ? parseFloat(inward.availableweight) : parseFloat(inward.weight);
      inward.deliveredweight = angular.isDefined(inward.deliveredweight) ? parseFloat(inward.deliveredweight) : 0;
      if (angular.isDefined(outwards) && outwards.length > 0) {
        angular.forEach(outwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inward.inward_id &&
            outdata.inward_data_id === inward.inward_data_id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.delivery_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.delivery_roll)) {
            inward.deliveredrolls = parseInt(inward.deliveredrolls) + parseInt(outdata.delivery_roll);
            inward.deliveredweight = parseFloat(inward.deliveredweight) + parseFloat(outdata.delivery_weight);
            inward.availableweight = parseFloat(inward.availableweight) - parseFloat(outdata.delivery_weight);
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

    if (outwardCount === $scope.deliveryreturnForm.inwards.length) {
      deferred.resolve($scope.deliveryreturnForm.inwards);
    }

    return deferred.promise;
  }

  $scope.selectOrder = function (order) {
    $scope.deliveryreturnForm.inwards = [];
    $scope.deliveryreturnForm.outwardData = [];
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
      $scope.deliveryreturnForm.order_id = angular.copy(order._id);
      for (let i = 0; i < orderDetail.length; i += 1) {
        if (validateField.checkValid(order, orderDetail[i])) {
          $scope.deliveryreturnForm[orderDetail[i]] = angular.copy(order[orderDetail[i]]);
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

          });
        }
      });
    }
  };

  $scope.selectInward = function (inward) {
    if (angular.isDefined(inward) && inward !== null && angular.isDefined(inward.deliverycompleted) && !inward.deliverycompleted &&
    $scope.deliveryreturnForm.inwards.indexOf(inward) > -1) {
      if ($scope.deliveryreturnForm.outwardData.length > 0) {
        let indexexist = -1;
        angular.forEach($scope.deliveryreturnForm.outwardData, (inw, ind) => {
          if (angular.isDefined(inw.inward_data_id) && inw.inward_data_id === inward.inward_data_id) {
            indexexist = ind;
            inward.is_checked = false;
          }
          if (ind === $scope.deliveryreturnForm.outwardData.length - 1) {
            if (indexexist > -1) {
              $scope.deliveryreturnForm.outwardData.splice(indexexist, 1);
            } else {
              inward.is_checked = true;
              $scope.deliveryreturnForm.outwardData.push(angular.copy(inward));
            }
          }
        });
      } else {
        inward.is_checked = true;
        $scope.deliveryreturnForm.outwardData.push(angular.copy(inward));
      }
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
            if (parseFloat(weightdiffered) > $scope.deliveryreturnData.weightDifference) {
              outward.isweightError = true;
              outward.delivery_weight = "0.00";
              Notification.warning("Delivery weight exceeds the remaining weight.");
              return false;
            }

            if (parseFloat(weightdiffered) >= 0 && parseFloat(weightdiffered) <= $scope.deliveryreturnData.weightDifference) {
              outward.isweightError = false;
              return true;
            } else if (parseFloat(weightdiffered) > $scope.deliveryreturnData.weightDifference) {
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

  $scope.initializeDeliverydetails();
});
