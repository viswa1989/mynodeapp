/* global angular */
angular.module("ordereditCtrl", []).controller("OrdereditController", ($scope, $rootScope, $routeParams, $sce, $uibModal, $log, AuthService,
  OrderService, CustomerService, validateField, JobsstorageService, TypeService, Notification, commonobjectService, socket, $timeout,
  DateformatstorageService, DATEFORMATS, $location, $q, $window) => {
  $rootScope.orderpageLoader = true;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.orderData = {};
  $scope.orderData.selectedIndex = -1;
  $scope.orderData.currency = commonobjectService.getCurrency();
  $scope.customerData = {};
  $scope.customerForm = {};
  $scope.orderForm = {};
  $scope.orderData.jobstatus = "PENDING";

  $scope.orderForm.contactlist = [];
  $scope.orderForm.contactperson = {};

  $scope.orderData.focusinput = true;
  $scope.orderData.formData = {};
  $scope.orderData.joblist = [];
  $scope.orderData.addProcess = false;
  $scope.orderData.customers = [];
  $scope.orderData.process = [];
  $scope.orderData.processcopy = [];
  $scope.orderData.fabrics = [];
  $scope.orderData.colors = [];
  $scope.orderData.dyeing = [];
  $scope.orderData.measurement = [];
  $scope.orderData.inwards = [];
  $scope.orderData.detailformSumission = false;
  $scope.orderData.showButton = false;

  $rootScope.canaccess = true;

  const ordermsgData = {customer_id: "Please select customer",
    customer_name: "Please select customer",
    contactperson: "Please select the followup person",
    order_reference_no: "Please enter the order reference no.",
    customer_dc_no: "Please enter the customer dc no.",
    customer_dc_date: "Please select the customer dc date.",
    dyeing: "Please select the dyeing name.",
    dyeing_dc_no: "Please enter the dyeing dc no.",
    order_type: "Please choose the order type.",
    inwardData: "Please add inward / fabric details"};

  const orderfield = [{field: "customer_id", type: "string"},
    {field: "customer_name", type: "string"},
    {field: "contactperson", type: "object", subfield: "name"},
    {field: "order_reference_no", type: "string"},
    {field: "customer_dc_no", type: "string"},
    {field: "customer_dc_date", type: "date"},
    {field: "dyeing", type: "object", subfield: "dyeing_name"},
    {field: "dyeing_dc_no", type: "string"},
    {field: "order_type", type: "string"},
    {field: "inward_data", type: "array"}];

  const inwardfield = [{field: "fabric_type", type: "string"},
    {field: "fabric_color", type: "string"},
    {field: "process", type: "array"},
    {field: "lot_no", type: "string"},
    {field: "dia", type: "numberzero"},
    {field: "rolls", type: "numberzero"},
    {field: "weight", type: "numberzero"},
    {field: "measurement", type: "object", subfield: "fabric_measure"},
    {field: "fabric_condition", type: "string"}];

  const inwardmsgData = {fabric_type: "Please select fabric type to add more",
    fabric_color: "Please select fabric colour to add more",
    process: "Please select process to add more",
    lot_no: "Please enter the lot no",
    dia: "Please enter the valid dia",
    rolls: "Please enter the valid no of rolls",
    weight: "Please enter the valid fabric weight",
    measurement: "Please select the units for fabric weight",
    fabric_condition: "Please select the fabric condition"};

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

  $scope.initializeData = function () {
    $scope.customerForm = {};
    $scope.customerForm.address = [{is_default: true, address_line: "", city: "", pincode: "", area: "", contact_no: "", landmark: "", state: ""}];
    $scope.orderData.jobstatus = "PENDING";
    $scope.orderData.fabrics = [];
    $scope.orderData.divisionaddress = {};
    $scope.orderData.colors = [];
    $scope.orderData.dyeing = [];
    $scope.orderData.processcopy = [];
    $scope.orderData.measurement = [];
    $scope.orderData.showButton = false;
    $scope.customerData.Gsttreatmentdetails = [];
    $scope.customerData.Statelistdetails = [];
    
    OrderService.editinitializedata((result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data)) {
            if (angular.isDefined(result.data.Process) && result.data.Process.length > 0) {
              $scope.orderData.processcopy = angular.copy(result.data.Process);
            }
            if (angular.isDefined(result.data.Fabriccolor) && result.data.Fabriccolor.length > 0) {
              $scope.orderData.colors = angular.copy(result.data.Fabriccolor);
            }
            if (angular.isDefined(result.data.Dyeingdetails) && result.data.Dyeingdetails.length > 0) {
              $scope.orderData.dyeing = angular.copy(result.data.Dyeingdetails);
            }
            if (angular.isDefined(result.data.Measurementdetails) && result.data.Measurementdetails.length > 0) {
              $scope.orderData.measurement = angular.copy(result.data.Measurementdetails);
            }

            if (angular.isDefined($routeParams.id) && $routeParams.id !== null && $routeParams.id !== "") {
              const orderID = $routeParams.id;
              $scope.getCurrentJob(orderID);
            } else {
              Notification.error("Order details not found.");
            }
            if (angular.isDefined(result.data.Statelistdetails)) {
              $scope.customerData.Statelistdetails = angular.copy(result.data.Statelistdetails);
            }
            if (angular.isDefined(result.data.Gsttreatmentdetails)) {
              $scope.customerData.Gsttreatmentdetails = angular.copy(result.data.Gsttreatmentdetails);
            }
            if (angular.isDefined(result.data.Divisiondetails) && result.data.Divisiondetails !== null && result.data.Divisiondetails !== "" &&
                angular.isDefined(result.data.Divisiondetails.billing_address)) {
              $scope.orderData.divisionaddress = angular.copy(result.data.Divisiondetails.billing_address);
            }

            $rootScope.canaccess = true;
            if ($scope.orderData.processcopy.length === 0 || $scope.orderData.colors.length === 0 || $scope.orderData.dyeing.length === 0
                                || $scope.orderData.measurement.length === 0) {
              $rootScope.canaccess = false;
            }
          } else {
            $rootScope.canaccess = true;
          }
        } else {
          $rootScope.canaccess = true;
          Notification.error(result.message);
        }
      } else {
        $rootScope.canaccess = true;
      }
      $scope.orderData.process = angular.copy($scope.orderData.processcopy);
      $scope.selectedCard("CUSTOMER");
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.getCurrentJob = function (job) {
    $scope.orderForm = {};
    OrderService.getOrderview(job, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.orderForm = angular.copy(result.data);
          } else {
            Notification.error("Order details not found.");
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
  };

  // Assign customer details selceted in autocomplete
  $scope.getcustomerDetails = function () {
    $scope.orderData.customers = [];
    $scope.orderData.customerSearch = true;
    if (angular.isDefined($scope.orderData.customer_mobile) && $scope.orderData.customer_mobile !== ""
                && $scope.orderData.customer_mobile.length > 4) {
      const obj = {};
      obj.customer_mobile = angular.copy($scope.orderData.customer_mobile);
      $scope.orderData.customerSearchloader = true;

      CustomerService.getcustomerDetails(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (angular.isDefined(result.data.Customer) && result.data.Customer.length > 0) {
            $scope.orderData.customers = angular.copy(result.data.Customer);
          }
        }
        $scope.orderData.customerSearchloader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  // Assign fabric details selected in autocomplete
  $scope.getfabricDetails = function () {
    $scope.orderData.fabrics = [];
    if (angular.isDefined($scope.orderData.fabric) && $scope.orderData.fabric !== ""
                && $scope.orderData.fabric.length > 3) {
      const obj = {};
      obj.fabric = angular.copy($scope.orderData.fabric);
      $scope.orderData.fabricSearchloader = true;

      TypeService.getfabricDetails(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
            $scope.orderData.fabrics = angular.copy(result.data);
          }
        }
        $scope.orderData.fabricSearchloader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.orderData.fabricSearchloader = false;
      });
    }
  };

  // Select customer
  $scope.selectCustomer = function (customer) {
    $scope.orderData.morecustomerdetails = false;
    $scope.orderData.fabric = "";
    $scope.orderData.process_type = "";
    if (angular.isDefined(customer) && angular.isDefined(customer._id) && angular.isDefined(customer.name) && customer._id !== "") {
      if (angular.isDefined(customer.status_inward) && customer.status_inward) {
        Notification.error("This customer has been blocked. Please contact your administrator to proceed further");
        return false;
      }
      $rootScope.orderpageLoader = true;
      $scope.orderData.inwards = [];
      $scope.orderForm.contactlist = [];
      if (angular.isDefined(customer.followup_person) && customer.followup_person !== null && customer.followup_person !== "" &&
        customer.followup_person.length > 0) {
        angular.forEach(customer.followup_person, (person) => {
          if (angular.isDefined(person.name) && angular.isDefined(person.mobile_no) && person.name !== null && person.name !== ""
                                && person.mobile_no !== null && person.mobile_no !== "") {
            $scope.orderForm.contactlist.push({name: person.name, mobile_no: person.mobile_no});
          }
        });
      }
      $scope.orderForm.contactperson = {};
      $scope.orderForm.customer_id = angular.copy(customer._id);
      $scope.orderForm.customer_name = angular.copy(customer.name);
      $scope.orderForm.customer_mobile_no = angular.copy(customer.mobile_no);
      $scope.orderData.customer_mobile = angular.copy(customer.mobile_no);
      if (angular.isDefined(customer.alternate_no)) {
        $scope.orderForm.customer_alternate_no = angular.copy(customer.alternate_no);
      }
      if (angular.isDefined(customer.is_favourite)) {
        $scope.orderForm.is_favourite = angular.copy(customer.is_favourite);
      }
      if (angular.isDefined(customer.contact_person) && angular.isDefined(customer.contactperson_mobile_no) && customer.contact_person !== null &&
        customer.contact_person !== "" && customer.contactperson_mobile_no !== null && customer.contactperson_mobile_no !== "") {
        $scope.orderForm.contactlist.push({name: customer.contact_person, mobile_no: customer.contactperson_mobile_no});
      }

      angular.forEach(customer.address, (addr) => {
        if (angular.isDefined(addr.is_default) && addr.is_default) {
          if (angular.isDefined(addr.address_line) && addr.address_line !== "") {
            $scope.orderForm.billing_address_line = angular.copy(addr.address_line);
          } else {
            $scope.orderForm.billing_address_line = "";
          }

          $scope.orderForm.billing_area = (angular.isDefined(addr.area) && addr.area !== "") ? angular.copy(addr.area) : "";

          $scope.orderForm.billing_city = (angular.isDefined(addr.city) && addr.city !== "") ? angular.copy(addr.city) : "";

          $scope.orderForm.billing_state = (angular.isDefined(addr.state) && addr.state !== "") ? angular.copy(addr.state) : "";

          $scope.orderForm.billing_pincode = (angular.isDefined(addr.pincode) && addr.pincode !== "") ? angular.copy(addr.pincode) : "";

          $scope.orderForm.billing_landmark = (angular.isDefined(addr.landmark) && addr.landmark !== "") ? angular.copy(addr.landmark) : "";

          $scope.orderForm.billing_contact_no = (angular.isDefined(addr.contact_no) && addr.contact_no !== "") ? angular.copy(addr.contact_no) : "";
        }
      });
      $scope.orderData.customerSearch = false;
      $scope.selectedCard("CUSTOMER");
      $rootScope.orderpageLoader = false;
      setTimeout(() => {
        angular.element(".customerview_tabpane")[0].scrollTop = 180;
      }, 300);
    }
  };

  $scope.assignCustomergsttreatment = function (customer) {
    if (angular.isDefined(customer.gstTreatmentcopy) && customer.gstTreatmentcopy !== null &&
        angular.isDefined(customer.gstTreatmentcopy._id) && customer.gstTreatmentcopy._id !== null) {
      if (customer.gstTreatmentcopy.name === "Overseas" || customer.gstTreatmentcopy.name === "Consumer" ||
        customer.gstTreatmentcopy.name === "Unregistered Business") {
        customer.gstin = "";
      }
      if (customer.gstTreatmentcopy.name === "Overseas") {
        customer.statecopy = {};
        customer.state = "";
      }
      customer.gstTreatment = angular.copy(customer.gstTreatmentcopy._id);
    }
  };

  $scope.assignCustomerplaceofsupply = function (customer) {
    if (angular.isDefined(customer.statecopy) && customer.statecopy !== null && angular.isDefined(customer.statecopy._id) &&
        customer.statecopy._id !== null) {
      customer.state = angular.copy(customer.statecopy._id);
    }
  };

  // Create Customer
  $scope.createCustomer = function (valid) {
    if (!valid) {
      return false;
    }
    if (angular.isUndefined($scope.customerForm.gstTreatmentcopy) || $scope.customerForm.gstTreatmentcopy === null ||
        angular.isUndefined($scope.customerForm.gstTreatmentcopy._id) || angular.isUndefined($scope.customerForm.gstTreatmentcopy.name) ||
        angular.isUndefined($scope.customerForm.gstTreatment) || $scope.customerForm.gstTreatment === null) {
      Notification.error("Please select the GST Treatment for this customer");
      return false;
    }
    if (($scope.customerForm.gstTreatmentcopy.name === "Registered Business - Regular" ||
        $scope.customerForm.gstTreatmentcopy.name === "Registered Business - Composition" ||
        $scope.customerForm.gstTreatmentcopy.name === "Special Economic Zone") && (angular.isUndefined($scope.customerForm.gstin) ||
        $scope.customerForm.gstin === null || $scope.customerForm.gstin === "")) {
      Notification.error("Please enter the GSTIN number for this customer");
      return false;
    }
    if (($scope.customerForm.gstTreatmentcopy.name === "Registered Business - Regular" ||
        $scope.customerForm.gstTreatmentcopy.name === "Registered Business - Composition" ||
        $scope.customerForm.gstTreatmentcopy.name === "Special Economic Zone" ||
        $scope.customerForm.gstTreatmentcopy.name === "Unregistered Business" || $scope.customerForm.gstTreatmentcopy.name === "Consumer") &&
        (angular.isUndefined($scope.customerForm.statecopy) || $scope.customerForm.statecopy === null ||
        angular.isUndefined($scope.customerForm.statecopy._id) || angular.isUndefined($scope.customerForm.statecopy.name) ||
        angular.isUndefined($scope.customerForm.state) ||
        $scope.customerForm.state === null)) {
      Notification.error("Please select the place of supply for this customer");
      return false;
    }

    let addrlen = 0;
    let exist = false;
    angular.forEach($scope.customerForm.address, (addr) => {
      if (angular.isDefined(addr.is_default) && addr.is_default) {
        exist = true;
      }
      addrlen += 1;
    });

    if (addrlen === $scope.customerForm.address.length && (addrlen === 0 || exist)) {
      const obj = {};
      obj.customerForm = angular.copy($scope.customerForm);

      CustomerService.partialcreate(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.orderData.customers.push(angular.copy(result.data));
            $scope.selectCustomer(angular.copy(result.data));
            $scope.customerForm = {};
            $scope.customerForm.address = [{is_default: true,
              company_name: "",
              address_line: "",
              city: "",
              pincode: "",
              area: "",
              contact_no: "",
              landmark: "",
              state: ""}];
            Notification.success("Customer details save successfully");
          } else {
            Notification.error(result.message);
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    } else {
      Notification.error("Please select billing address for the customer");
      return false;
    }
  };

  $scope.selectFabrics = function (fab) {
    $scope.orderData.formData.fabric_id = "";
    $scope.orderData.formData.fabric_type = "";
    $scope.orderData.formData.fabric_color_id = "";
    $scope.orderData.formData.fabric_color = "";
    $scope.orderData.colourname = "";
    if (angular.isDefined(fab) && angular.isDefined(fab._id) && angular.isDefined(fab.fabric_type) && fab._id !== "" && fab.fabric_type !== "") {
      $scope.orderData.formData.fabric_id = angular.copy(fab._id);
      $scope.orderData.formData.fabric_type = angular.copy(fab.fabric_type);
      setTimeout(() => {
        const fabcol = $window.document.getElementById('fabcolor');
        fabcol.focus();
      }, 100);
    }
  };

  function updateInwardprocess(process) {
    const deferred = $q.defer();
    const obj = {};
    obj.process_id = angular.copy(process._id);
    obj.process_name = angular.copy(process.process_name);
    if (angular.isUndefined($scope.orderData.formData.process) || $scope.orderData.formData.process.length === 0) {
      $scope.orderData.formData.process = [];
      $scope.orderData.formData.process.push(obj);
      deferred.resolve($scope.orderData.formData.process);
    } else {
      let index = -1;
      angular.forEach($scope.orderData.formData.process, (pro, ind) => {
        if (angular.isDefined(pro.process_id) && pro.process_id === process._id) {
          index = ind;
        }
        if (ind === $scope.orderData.formData.process.length - 1 && index > -1) {
          $scope.orderData.formData.process.splice(index, 1);
          deferred.resolve($scope.orderData.formData.process);
        } else if (ind === $scope.orderData.formData.process.length - 1 && index === -1) {
          $scope.orderData.formData.process.push(obj);
          deferred.resolve($scope.orderData.formData.process);
        }
      });
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  $scope.currentInward = function(inwards) {
    $scope.orderData.fabric ="";
    $scope.orderData.colourname ="";
    $scope.orderData.process_type = "";
    $scope.orderData.formData = {};
    if (angular.isDefined($scope.orderForm.inwards[0]) && angular.isDefined($scope.orderForm.inwards[0].inward_data) && $scope.orderForm.inwards[0].inward_data.length) {
      angular.forEach($scope.orderForm.inwards[0].inward_data, (pro, ind) => {
        if (pro._id === inwards._id) {
          $scope.orderData.formData =  angular.copy(pro);
          $scope.orderData.selectedIndex = ind;
          $scope.orderData.fabrics = [];
          if (angular.isDefined($scope.orderData.formData.fabric_id) && angular.isDefined($scope.orderData.formData.fabric_type)) {
            const obj = {};
            obj._id = $scope.orderData.formData.fabric_id;
            obj.fabric_type = $scope.orderData.formData.fabric_type;
            $scope.orderData.fabrics.push(obj);
          }
        }
      });
    }
  }
  
  $scope.selectProcess = function (process) {
    if (angular.isDefined(process) && angular.isDefined(process._id) && angular.isDefined(process.process_name) &&
        process._id !== "" && process.process_name !== "") {
      
      updateInwardprocess(process).then((data) => { });
    }
  };

  $scope.selectColor = function (color, fab) {
    $scope.orderData.formData.fabric_color_id = "";
    $scope.orderData.formData.fabric_color = "";

    if (angular.isDefined(fab) && angular.isDefined(fab._id) && angular.isDefined(fab.fabric_type) && fab._id !== "" && fab.fabric_type !== "" &&
        angular.isDefined(color) && angular.isDefined(color._id) && angular.isDefined(color.fabric_color) && color._id !== "" &&
        color.fabric_color !== "") {      
      $scope.orderData.formData.fabric_id = angular.copy(fab._id);
      $scope.orderData.formData.fabric_type = angular.copy(fab.fabric_type);
      $scope.orderData.formData.fabric_color_id = angular.copy(color._id);
      $scope.orderData.formData.fabric_color = angular.copy(color.fabric_color);

      $scope.selectedCard('PROCESS');
    }
  };

  $scope.toggleimmediatejob = function (data) {
    $scope.orderForm.immediate_job = !data;
  };

  $scope.selectordertype = function (data) {
    $scope.orderForm.order_type = data;
    if (data === 'Reprocess') {
      $scope.orderData.fabric = "";
    }
  };

  $scope.selectfabricCondition = function (data) {
    $scope.orderData.formData.fabric_condition = data;
  };
  
  $scope.updateInward = function () {
    if (angular.isUndefined($scope.orderData.selectedIndex) || $scope.orderData.selectedIndex<0) {
      Notification.error("Please enter the inward details.");
      return false;
    }
    if (angular.isUndefined($scope.orderForm.inwards[0].inward_data) || angular.isUndefined($scope.orderForm.inwards[0].inward_data[$scope.orderData.selectedIndex])) {
      Notification.error("Please enter the inward details.");
      return false;
    }
    if (angular.isDefined($scope.orderData.formData) && $scope.orderData.formData !== null) {
      validateField.validate($scope.orderData.formData, inwardfield, inwardmsgData).then((inwardMsg) => {
        if (angular.isDefined(inwardMsg) && inwardMsg !== null && inwardMsg !== "") {
          Notification.error(inwardMsg);
        } else {
          $scope.orderForm.inwards[0].inward_data[$scope.orderData.selectedIndex] = angular.copy($scope.orderData.formData);
          $scope.orderData.formData = {};
          $scope.orderData.selectedIndex = -1;
          $scope.orderData.fabrics = [];
          $scope.selectedCard('FABRIC');
        }
      });
    } else {
      Notification.error("Please enter the job details.");
    }
  };
  
  $scope.addInward = function () {
    if (angular.isDefined($scope.orderForm) && $scope.orderForm !== null) {
      validateField.validate($scope.orderData.formData, inwardfield, inwardmsgData).then((inwardMsg) => {
        if (angular.isDefined(inwardMsg) && inwardMsg !== null && inwardMsg !== "") {
            Notification.error(inwardMsg);
        } else {
            $scope.orderForm.inwards[0].inward_data.push(angular.copy($scope.orderData.formData));
            $scope.orderData.formData = {};
            $scope.orderData.fabrics = [];
            $scope.selectedCard('FABRIC');
        }
      });
    }
  };

  $scope.saveInward = function (type) {
    validateField.validate($scope.orderForm, orderfield, ordermsgData).then((orderMsg) => {
      if (angular.isDefined(orderMsg) && orderMsg !== null && orderMsg !== "") {
        Notification.error(orderMsg);
      } else {
        validateField.validateGroup($scope.orderForm.inwards[0].inward_data, inwardfield, inwardmsgData).then((inwardMsg) => {
          if (angular.isDefined(inwardMsg) && inwardMsg !== null && inwardMsg !== "") {
            Notification.error(inwardMsg);
          } else {
            const obj = {};
            obj.orderForm = angular.copy($scope.orderForm);

            for (const key in obj.orderForm.inwards[0].inward_data) {
              if (Object.keys(obj.orderForm.inwards[0].inward_data[key]).length === 0) {
                obj.orderForm.inwards[0].inward_data.splice(key, 1);
              } else {
                obj.orderForm.inwards[0].inward_data[key].dia = parseFloat(obj.orderForm.inwards[0].inward_data[key].dia);
                obj.orderForm.inwards[0].inward_data[key].rolls = parseFloat(obj.orderForm.inwards[0].inward_data[key].rolls);
                obj.orderForm.inwards[0].inward_data[key].weight = parseFloat(obj.orderForm.inwards[0].inward_data[key].weight);
              }
            }

            $rootScope.orderpageLoader = true;

            OrderService.update(obj, (result) => {
              if (result !== null && angular.isDefined(result.success)) {
                if (result.success) {
                  if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && result.data._id !== "") {
                    $scope.orderData.customers = [];
                    $scope.orderData.customer_mobile = "";
                    $scope.orderData.inwards = [];
                    $scope.orderForm.contactlist = [];
                    $scope.orderForm.contactperson = {};
                    $scope.orderData.detailformSumission = false;
                    $scope.orderData.showButton = false;
                    $scope.orderForm._id = angular.copy(result.data._id);
                    $scope.orderForm.order_date = angular.copy(result.data.order_date);
                    $scope.orderForm.order_no = angular.copy(result.data.order_no);
                    if (angular.isDefined(result.data.customer_dc_date) && result.data.customer_dc_date !== null &&
                        result.data.customer_dc_date !== "") {
                      $scope.orderForm.customer_dc_date = angular.copy(result.data.customer_dc_date);
                    }
                    if (angular.isDefined(result.data.dyeing_dc_date) && result.data.dyeing_dc_date !== null && result.data.dyeing_dc_date !== "") {
                      $scope.orderForm.dyeing_dc_date = angular.copy(result.data.dyeing_dc_date);
                    }
                    $scope.orderData.jobstatus = "COMPLETED";
                    if (type === "print") {
                      $timeout(() => {
                        $scope.printThisbill();
                      }, 2000);
                    }
                    Notification.success(result.message);
                  } else {
                    $scope.orderData.jobstatus = "PENDING";
                  }
                } else {
                  Notification.error(result.message);
                  $scope.orderData.jobstatus = "PENDING";
                }
              } else {
                $scope.orderData.jobstatus = "PENDING";
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
  };

  $scope.removeInward = function (inward) {
    if (angular.isDefined(inward) && $scope.orderForm.inwards[0].inward_data.indexOf(inward) > -1) {
      const currentInward = $scope.orderForm.inwards[0].inward_data.indexOf(inward);

      $scope.orderForm.inwards[0].inward_data.splice(currentInward, 1);
      $scope.orderData.formData = {};
      $scope.orderData.selectedIndex = -1;
      $scope.orderData.fabrics = [];
    }
  };

  $scope.printThisbill = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/order_print.html");
    orderData = $scope.orderForm;
    orderData.inwardData = $scope.orderForm.inwards[0].inward_data;
    currency = $scope.orderData.currency;
    window.open(templateUrl, "_blank");
  };

  $scope.animationsEnabled = true;

  $scope.selectedCard = function (data) {
    $scope.orderData.fabric = "";
    $scope.orderData.process_type = "";
    if (angular.isDefined(data) && data !== "") {
      const myEl = angular.element(document.querySelector(".col1"));
      const myE2 = angular.element(document.querySelector(".col2"));
      const myE3 = angular.element(document.querySelector(".col3"));
      const orderview = angular.element(document.querySelector(".bill-view-section"));

      myEl.removeClass("bill_current_first");
      myEl.removeClass("bill_current_second");
      myEl.removeClass("bill_current_third");

      myE2.removeClass("bill_current_first");
      myE2.removeClass("bill_current_second");
      myE2.removeClass("bill_current_third");

      myE3.removeClass("bill_current_first");
      myE3.removeClass("bill_current_second");
      myE3.removeClass("bill_current_third");

      if (data === "CUSTOMER") {
        myEl.addClass("bill_current_first");
        myE2.addClass("bill_current_second");
        myE3.addClass("bill_current_third");

        orderview.addClass("bill_sec_active");
      } else if (data === "FABRIC") {
        myEl.addClass("bill_current_second");
        myE2.addClass("bill_current_first");
        myE3.addClass("bill_current_third");
        const fab = $window.document.getElementById('fabsrch');
        if (fab) {
          fab.focus();
        }
        orderview.addClass("bill_sec_active");
      } else if (data === "PROCESS") {
        myEl.addClass("bill_current_third");
        myE2.addClass("bill_current_second");
        myE3.addClass("bill_current_first");
        const fablotno = $window.document.getElementById('fablotno');

        orderview.removeClass("bill_sec_active");
      }
    }
  };

  $scope.initializeData();
});
