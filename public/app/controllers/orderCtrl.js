/* global angular */
angular.module("orderCtrl", []).controller("OrderController", ($scope, $rootScope, $routeParams, $sce, $uibModal, $log, AuthService,
  OrderService, CustomerService, ColorService, validateField, JobsstorageService, TypeService, $filter, Notification, commonobjectService, socket, 
  $timeout, DateformatstorageService, DATEFORMATS, $location, $q, $window) => {
  $rootScope.orderpageLoader = true;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.orderData = {};
  $scope.orderData.currency = commonobjectService.getCurrency();
  $scope.customerData = {};
  $scope.customerForm = {};
  $scope.orderForm = {};
  $scope.orderForm.immediate_job = false;
  $scope.orderForm.is_billable = false;

  $scope.customerData.Gsttreatmentdetails = [];
  $scope.customerData.Statelistdetails = [];

  $scope.orderForm.inwardData = [];
  $scope.orderForm.contactlist = [];
  $scope.orderForm.contactperson = {};

  $scope.orderData.focusinput = true;
  $scope.orderData.formData = {};
  $scope.orderData.joblist = [];
  $scope.orderData.addProcess = false;
  $scope.orderData.customers = [];
  $scope.orderData.process = [];
  $scope.orderData.processcopy = [];
  $scope.orderData.procesList = [];
  $scope.orderData.fabrics = [];
  $scope.orderData.completedjoblist = [];
  $scope.orderData.colors = [];
  $scope.orderData.dyeing = [];
  $scope.orderData.measurement = [];
  $scope.orderData.inwards = [];
  $scope.orderData.detailformSumission = false;
  $scope.orderData.showButton = false;
  $scope.orderData.currentSelectedcard = "";

  $rootScope.canaccess = true;

  const ordermsgData = {customer_id: "Please select customer",
    customer_name: "Please select customer",
    contactperson: "Please select the followup person",
    order_reference_no: "Please enter the order reference no.",
    customer_dc_no: "Please enter the customer dc no.",
    customer_dc_date: "Please select the customer dc date.",
    dyeing: "Please select the dyeing name.",
    dyeing_dc_no: "Please enter the dyeing dc no.",
    // dyeing_dc_date: "Please select the dyeing dc date.",
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
    //    {field: "dyeing_dc_date", type: "date"},
    {field: "order_type", type: "string"},
    {field: "inwardData", type: "array"}];

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

  $scope.refreshData = function () {
    $scope.orderData.addProcess = false;
    $scope.orderData.customers = [];
    $scope.orderData.process = [];
    $scope.orderData.processcopy = [];
    $scope.orderData.procesList = [];
    $scope.orderData.fabrics = [];
    $scope.orderData.completedjoblist = [];
    $scope.orderData.colors = [];
    $scope.orderData.dyeing = [];
    $scope.orderData.measurement = [];
    $scope.orderData.inwards = [];
    $scope.orderForm.contactlist = [];
    $scope.orderForm.contactperson = {};
    $scope.orderData.detailformSumission = false;
    $scope.orderData.showButton = false;
    $scope.orderData.customerSearch = false;
    $scope.orderData.customerSearchloader = false;

    const myEl = angular.element(document.querySelector(".col1"));
    const myE2 = angular.element(document.querySelector(".col2"));
    const myE3 = angular.element(document.querySelector(".col3"));

    myEl.removeClass("bill_current_first");
    myEl.addClass("bill_current_first");
    myEl.removeClass("bill_current_second");
    myEl.removeClass("bill_current_third");

    myE2.removeClass("bill_current_first");
    myE2.removeClass("bill_current_second");
    myE2.removeClass("bill_current_third");

    myE3.removeClass("bill_current_first");
    myE3.removeClass("bill_current_second");
    myE3.removeClass("bill_current_third");
  };

  $scope.initializeData = function () {
    $scope.customerData.Gsttreatmentdetails = [];
    $scope.customerData.Statelistdetails = [];
    $scope.customerForm = {};
    $scope.customerForm.address = [{is_default: true, address_line: "", city: "", pincode: "", area: "", contact_no: "", landmark: "", state: ""}];

    $scope.orderData.fabrics = [];
    $scope.orderData.completedjoblist = [];
    $scope.orderData.divisionaddress = {};
    $scope.orderData.colors = [];
    $scope.orderData.dyeing = [];
    $scope.orderData.processcopy = [];
    $scope.orderData.procesList = [];
    $scope.orderData.measurement = [];
    $scope.orderData.showButton = false;

    OrderService.initializedata((result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data)) {
            if (angular.isDefined(result.data.Process) && result.data.Process.length > 0) {
              $scope.orderData.processcopy = angular.copy(result.data.Process);
            }
            //                        if (angular.isDefined(result.data.Fabrictype) && result.data.Fabrictype.length > 0) {
            //                            $scope.orderData.fabrics = angular.copy(result.data.Fabrictype);
            //                        }
            angular.forEach(result.data.Process, (process) => {
               if (angular.isDefined(process) && process !== null && process !== "" && angular.isDefined(process._id) &&
                  angular.isDefined(process.process_name)) {
                  const obj = {};
                  obj.process_id = angular.copy(process._id);
                  obj.process_name = angular.copy(process.process_name);
                  $scope.orderData.procesList.push(obj);
               }
            });
            if (angular.isDefined(result.data.Fabriccolor) && result.data.Fabriccolor.length > 0) {
              $scope.orderData.colors = angular.copy(result.data.Fabriccolor);
            }
            if (angular.isDefined(result.data.Dyeingdetails) && result.data.Dyeingdetails.length > 0) {
              $scope.orderData.dyeing = angular.copy(result.data.Dyeingdetails);
            }
            if (angular.isDefined(result.data.Measurementdetails) && result.data.Measurementdetails.length > 0) {
              $scope.orderData.measurement = angular.copy(result.data.Measurementdetails);
            }
            if (angular.isDefined(result.data.order_date)) {
              $scope.orderData.orddate = angular.copy(result.data.order_date);
            }
            if (angular.isDefined(result.data.Statelistdetails)) {
              $scope.customerData.Statelistdetails = angular.copy(result.data.Statelistdetails);
            }
            if (angular.isDefined(result.data.Gsttreatmentdetails)) {
              $scope.customerData.Gsttreatmentdetails = angular.copy(result.data.Gsttreatmentdetails);
            }

            const obj = {};

            if (angular.isDefined(result.data.order_date)) {
              obj.orddate = result.data.order_date;
            }
            if ((angular.isUndefined($scope.orderForm) || angular.isUndefined($scope.orderForm.order_id)) && JobsstorageService.setJobdetail(obj)) {
              const job = "";
              $rootScope.orderpageLoader = true;
              $scope.initializeJobdetails();
              $scope.getCurrentJob(job);
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
            $rootScope.orderpageLoader = false;
          }
        } else {
          $rootScope.canaccess = true;
          $rootScope.orderpageLoader = false;
          Notification.error(result.message);
        }
      } else {
        $rootScope.canaccess = true;
        $rootScope.orderpageLoader = false;
      }
      $scope.orderData.process = angular.copy($scope.orderData.processcopy);
      $scope.selectedCard("CUSTOMER");
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $rootScope.orderpageLoader = false;
    });
  };

  $scope.initializeJobdetails = function () {
    $scope.orderData.joblist = [];
    $scope.orderForm = {};
    $scope.orderData.focusinput = false;
    JobsstorageService.getJobdetail().then((data) => {
      if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
        angular.forEach(data, (jobs) => {
          if (angular.isDefined(jobs.current_bill) && jobs.current_bill) {
            //                        $location.path("/" + angular.lowercase($rootScope.currentapp) + "/order/new/"+jobs.order_id);
            $scope.orderForm = angular.copy(jobs);
            if (angular.isUndefined($scope.orderForm.inwardData)) {
              $scope.orderForm.inwardData = [];
            }
            if (angular.isDefined($scope.orderForm.inwardData) && $scope.orderForm.inwardData !== null && $scope.orderForm.inwardData.length > 0) {
              $scope.orderData.formData = angular.copy($scope.orderForm.inwardData[$scope.orderForm.inwardData.length - 1]);
            }

            if (angular.isDefined(jobs.customer_mobile_no) && jobs.customer_mobile_no !== "") {
              $scope.orderData.customer_mobile = angular.copy(jobs.customer_mobile_no);
            }
            setTimeout(() => {
              $scope.orderData.focusinput = true;
            }, 200);
          }

          const obj = {};
          obj.current_bill = (angular.isDefined(jobs.current_bill) && jobs.current_bill) ? angular.copy(jobs.current_bill) : false;
          obj.order_id = jobs.order_id;
          obj.mobile_no = (angular.isDefined(jobs.customer_mobile_no) && jobs.customer_mobile_no !== "") ? angular.copy(jobs.customer_mobile_no) : "";

          $scope.orderData.joblist.push(obj);
        });
      }
      $rootScope.orderpageLoader = false;
    });
  };

  $scope.initializeJobdetails();

  $scope.newJobcard = function () {
    if (angular.isDefined($scope.orderData.joblist) && $scope.orderData.joblist.length < 4) {
      JobsstorageService.updateJobdetail(angular.copy($scope.orderForm)).then((data) => {
        if (angular.isDefined(data)) {
          $scope.orderForm = {};
          $scope.orderData.customer_mobile = "";
          $scope.orderData.formData = {};
          if (angular.isUndefined($scope.orderForm.inwardData)) {
            $scope.orderForm.inwardData = [];
          }
          $scope.initializeData();
        }
      });
    }
  };

  $scope.closeThisJob = function () {
    if (angular.isDefined($scope.orderForm._id) && $scope.orderForm._id !== "") {
      JobsstorageService.closeJobdetail(angular.copy($scope.orderForm)).then((data) => {
        if (angular.isDefined(data)) {
          if (angular.isDefined($scope.orderData.joblist) && $scope.orderData.joblist !== null && $scope.orderData.joblist.length === 1) {
            $scope.orderForm = {};
            $scope.orderData.customer_mobile = "";
            $scope.orderData.formData = {};
            if (angular.isUndefined($scope.orderForm.inwardData)) {
              $scope.orderForm.inwardData = [];
            }
          } else {
            $scope.initializeJobdetails();
          }
          $scope.initializeData();
        }
      });
    }
  };

  $scope.closeJob = function (jobs) {
    if (angular.isDefined(jobs) && jobs !== "" && jobs !== null && angular.isDefined(jobs.order_id)) {
      if (angular.isDefined(jobs._id) && jobs._id !== "") {
        JobsstorageService.closeJobdetail(angular.copy(jobs)).then((data) => {
          if (angular.isDefined(data)) {
            if (angular.isDefined($scope.orderData.joblist) && $scope.orderData.joblist !== null && $scope.orderData.joblist.length === 1) {
              $scope.orderForm = {};
              $scope.orderData.customer_mobile = "";
              $scope.orderData.formData = {};
              if (angular.isUndefined($scope.orderForm.inwardData)) {
                $scope.orderForm.inwardData = [];
              }
            } else {
              $scope.initializeJobdetails();
            }
            $scope.initializeData();
          }
        });
      } else {
        JobsstorageService.closetempJobdetail(angular.copy(jobs)).then((data) => {
          if (angular.isDefined(data)) {
            if (angular.isDefined($scope.orderData.joblist) && $scope.orderData.joblist !== null && $scope.orderData.joblist.length === 1) {
              $scope.orderForm = {};
              $scope.orderData.customer_mobile = "";
              $scope.orderData.formData = {};
              if (angular.isUndefined($scope.orderForm.inwardData)) {
                $scope.orderForm.inwardData = [];
              }
            } else {
              $scope.initializeJobdetails();
            }
            $scope.initializeData();
          }
        });
      }
    }
  };

  $scope.getCurrentJob = function (job) {
    $scope.orderForm = {};
    $scope.orderData.focusinput = true;
    if (angular.isDefined(job) && job === "") {
      JobsstorageService.getJobdetail().then((data) => {
        if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
          angular.forEach(data, (jobs) => {
            if (angular.isDefined(jobs.current_bill) && jobs.current_bill) {
              //                            $location.path("/" + angular.lowercase($rootScope.currentapp) + "/order/new/"+jobs.order_id);
              $scope.orderForm = angular.copy(jobs);
              if (angular.isUndefined($scope.orderForm.inwardData)) {
                $scope.orderForm.inwardData = [];
              }
              if (angular.isDefined($scope.orderForm.inwardData) && $scope.orderForm.inwardData !== null && $scope.orderForm.inwardData.length > 0) {
                $scope.orderData.formData = angular.copy($scope.orderForm.inwardData[$scope.orderForm.inwardData.length - 1]);
              }
              if (angular.isDefined(jobs.customer_mobile_no) && jobs.customer_mobile_no !== "") {
                $scope.orderData.customer_mobile = angular.copy(jobs.customer_mobile_no);
              }
              $rootScope.orderpageLoader = false;
            }
          });
        }
      });
    }
  };

  $scope.getJob = function (job) {
    $scope.orderData.customer_mobile = "";
    $scope.orderData.customers = [];
    $scope.orderData.formData = {};
    if (angular.isDefined(job) && job !== "") {
      $rootScope.orderpageLoader = true;
      JobsstorageService.updateJobdetail(angular.copy($scope.orderForm)).then((jbdata) => {
        if (angular.isDefined(jbdata)) {
          JobsstorageService.selectJobdetail(job).then((data) => {
            $scope.initializeJobdetails();
            if (angular.isDefined(data) && angular.isDefined(data.order_id)) {
              $scope.orderForm = {};
              $scope.orderForm = angular.copy(data);
              if (angular.isUndefined($scope.orderForm.inwardData)) {
                $scope.orderForm.inwardData = [];
              }
              if (angular.isDefined($scope.orderForm.inwardData) && $scope.orderForm.inwardData !== null && $scope.orderForm.inwardData.length > 0) {
                $scope.orderData.formData = angular.copy($scope.orderForm.inwardData[$scope.orderForm.inwardData.length - 1]);
              }
              if (angular.isDefined(data.customer_mobile_no) && data.customer_mobile_no !== "") {
                $scope.orderData.customer_mobile = angular.copy(data.customer_mobile_no);
              }
            }
            $rootScope.orderpageLoader = false;
          });
        }
      });
    }
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
  
  // Assign job selected in autocomplete
  $scope.getjobDetails = function () {
    $scope.orderData.completedjoblist = [];
    if (angular.isDefined($scope.orderData.jobsearchno) && $scope.orderData.jobsearchno !== ""
                && $scope.orderData.jobsearchno.length > 3 && angular.isDefined($scope.orderForm.customer_id) && $scope.orderForm.customer_id !== null && 
                $scope.orderForm.customer_id !== "") {
      const obj = {};
      obj.jobno = angular.copy($scope.orderData.jobsearchno);
      obj.customerid = angular.copy($scope.orderForm.customer_id);
      $scope.orderData.fabricSearchloader = true;

      OrderService.getjobDetails(obj, (result) => {
        if (result !== null && angular.isDefined(result.success)) {
          if (angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
            angular.forEach(result.data, (ord) => {
              if (angular.isDefined(ord) && angular.isDefined(ord.inwards) && ord.inwards !== null && ord.inwards.length > 0) {
                const list = _.flatten(_.pluck(ord.inwards, "inward_data"));
                const res = _.flatten(_.pluck(list, "process"));
                const processlist = _.flatten(_.pluck(res, "process_name"));
                ord.processes = processlist.join(", ");
                $scope.orderData.completedjoblist.push(angular.copy(ord));
              }
            });
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
  
  $scope.selectInward = function(inwards) {
    if(angular.isDefined(inwards) && angular.isDefined(inwards._id) && inwards._id === $scope.orderForm.currentIndex){
      $scope.orderForm.currentIndex = "";
    }
  }

  // Select customer
  $scope.selectCustomer = function (customer) {
    $scope.orderData.morecustomerdetails = false;
    $scope.orderData.fabric = "";
    $scope.orderData.jobsearchno = "";
    $scope.orderData.process_type = "";
    $scope.orderData.jobsearchno = false;
    $scope.orderData.completedjoblist = [];
    $scope.orderData.tempinwardData = [];
    $scope.orderForm.reprocess_orderid = ""; 
    $scope.orderForm.reprocess_orderno = "";
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
      $scope.orderForm.gstin = angular.copy(customer.gstin);
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
      $scope.updateJobData();
      $scope.orderData.customerSearch = false;
      $scope.selectedCard("CUSTOMER");
      $rootScope.orderpageLoader = false;
      const contact = $window.document.getElementById('contactperson').getElementsByClassName('ui-select-focusser')[0];
      contact.focus();
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
    $scope.orderData.fabric_color_code = "";
    if (angular.isDefined(fab) && angular.isDefined(fab._id) && angular.isDefined(fab.fabric_type) && fab._id !== "" && fab.fabric_type !== "") {
      $scope.orderData.formData.fabric_id = angular.copy(fab._id);
      $scope.orderData.formData.fabric_type = angular.copy(fab.fabric_type);
      $scope.orderData.fabric = "";
      setTimeout(() => {
        const fabcol = $window.document.getElementById('fabcolor');
        fabcol.focus();
      }, 100);
    }
  };
  
  $scope.saveColor = function (fab) {
    if (angular.isUndefined($scope.orderData.colourname) || $scope.orderData.colourname === null || $scope.orderData.colourname === "") {
      Notification.error("Please enter the colour name.");
      return false;
    }
    if (angular.isUndefined($scope.orderData.fabric_color_code) || $scope.orderData.fabric_color_code === null || $scope.orderData.fabric_color_code === "") {
      Notification.error("Please choose the colour.");
      return false;
    }
    const obj = {};
    obj.fabric_color = angular.copy($scope.orderData.colourname);
    obj.fabric_color_code = angular.copy($scope.orderData.fabric_color_code);
    obj.color = angular.copy($scope.orderData.fabric_color_code);

    ColorService.create(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            if (angular.isUndefined($scope.orderData.colors)) {
              $scope.orderData.colors = [];
            }
            const Objs = {};
            Objs._id = result.data._id;
            Objs.color = result.data.color;
            Objs.fabric_color = result.data.fabric_color;
            Objs.fabric_color_code = result.data.fabric_color_code;
            
            const fabs = {}
            fabs._id = angular.copy($scope.orderData.formData.fabric_id);
            fabs.fabric_type = angular.copy($scope.orderData.formData.fabric_type);
            
            $scope.orderData.colors.push(Objs);
            $scope.orderData.colourname = result.data.fabric_color;
            $scope.selectColor(Objs, fabs);
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
  };
  
  $scope.selectOrder = function (order) {
    if(angular.isDefined(order) && order !== null && angular.isDefined(order._id) && angular.isDefined(order.order_no) && order.order_no !== null &&
            order._id !== null && angular.isDefined(order.inwards) && order.inwards !== null && order.inwards.length>0 && 
            angular.isDefined(order.inwards[0].inward_data) && order.inwards[0].inward_data !== null && order.inwards[0].inward_data.length>0) {
      $scope.orderForm.reprocess_orderid = angular.copy(order._id); 
      $scope.orderForm.reprocess_orderno = angular.copy(order.order_no);
      $scope.orderData.tempinwardData = angular.copy(order.inwards[0].inward_data);
      $scope.orderData.jobsearchno = "";
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

  function setInwardcurrentrow() {
    const deferred = $q.defer();
    let index = 0;
    if (angular.isDefined($scope.orderForm.inwardData) && $scope.orderForm.inwardData.length) {
      index = $scope.orderForm.inwardData.length - 1;
    } else {
      $scope.orderForm.inwardData = [{}];
    }
    deferred.resolve(index);
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  $scope.selectProcess = function (process) {
    if (angular.isDefined(process) && angular.isDefined(process._id) && angular.isDefined(process.process_name) &&
        process._id !== "" && process.process_name !== "") {
      setInwardcurrentrow().then((index) => {
        if (angular.isUndefined($scope.orderForm.inwardData[index].process)) {
          $scope.orderForm.inwardData[index].process = [];
        }
        updateInwardprocess(process).then((data) => {
          if (angular.isDefined(data) && data !== null && data !== "") {
            $scope.orderForm.inwardData[index].process = angular.copy(data);
          }
          $scope.updateJobData();
        });
      });
    }
  };

  $scope.selectColor = function (color, fab) {
    $scope.orderData.formData.fabric_color_id = "";
    $scope.orderData.formData.fabric_color = "";

    if (angular.isDefined(fab) && angular.isDefined(fab._id) && angular.isDefined(fab.fabric_type) && fab._id !== "" && fab.fabric_type !== "" &&
        angular.isDefined(color) && angular.isDefined(color._id) && angular.isDefined(color.fabric_color) && color._id !== "" &&
        color.fabric_color !== "") {
      setInwardcurrentrow().then((index) => {
        $scope.orderData.formData.fabric_id = angular.copy(fab._id);
        $scope.orderData.formData.fabric_type = angular.copy(fab.fabric_type);
        $scope.orderData.formData.fabric_color_id = angular.copy(color._id);
        $scope.orderData.formData.fabric_color = angular.copy(color.fabric_color);

        $scope.orderForm.inwardData[index].fabric_id = angular.copy(fab._id);
        $scope.orderForm.inwardData[index].fabric_type = angular.copy(fab.fabric_type);
        $scope.orderForm.inwardData[index].fabric_color_id = angular.copy(color._id);
        $scope.orderForm.inwardData[index].fabric_color = angular.copy(color.fabric_color);
        $scope.updateJobData();
        $scope.selectedCard('PROCESS');
        const fablot = $window.document.getElementById('fablotno');
        fablot.focus();
      });
    }
  };

  $scope.selectMeasuerement = function () {
    if (angular.isDefined($scope.orderData.formData.measurement) && $scope.orderData.formData.measurement !== null &&
        angular.isDefined($scope.orderData.formData.measurement._id) && angular.isDefined($scope.orderData.formData.measurement.fabric_measure)) {
      setInwardcurrentrow().then((index) => {
        $scope.orderForm.inwardData[index].measurement = angular.copy($scope.orderData.formData.measurement);
        $scope.updateJobData();
      });
    }
  };

  $scope.addInwarddata = function (field, value) {
    if (angular.isDefined(value) && value !== null && value !== "") {
      setInwardcurrentrow().then((index) => {
        $scope.orderForm.inwardData[index][field] = angular.copy($scope.orderData.formData[field]);
        $scope.updateJobData();
      });
    }
  };

  $scope.toggleimmediatejob = function (data) {
    $scope.orderForm.immediate_job = !data;
    $scope.updateJobData();
  };
  
  $scope.toggleBillablejob = function (data) {
    $scope.orderForm.is_billable = !data;
    $scope.updateJobData();
  }
  
  $scope.selectordertype = function (data) {
    if(data !== $scope.orderForm.order_type){
      $scope.orderData.fabric = "";
      $scope.orderData.jobsearchno = "";
      $scope.orderData.process_type = "";
      $scope.orderForm.reprocess_orderid = ""; 
      $scope.orderForm.reprocess_orderno = "";
      $scope.orderForm.inwardData = [];
      $scope.orderData.tempinwardData = [];
      $scope.orderData.formData = {};
      $scope.orderForm.is_billable = false;
      $scope.orderData.completedjoblist = [];
      $scope.orderForm.order_type = data;
      $scope.updateJobData();
    }
  };

  $scope.selectfabricCondition = function (data) {
    $scope.orderData.formData.fabric_condition = data;
    $scope.addInwarddata('fabric_condition', $scope.orderData.formData.fabric_condition);
  };

  $scope.updateJobData = function () {
    JobsstorageService.updateJobdetail(angular.copy($scope.orderForm)).then(() => {

    });
  };

  $scope.addInward = function () {
    if (angular.isDefined($scope.orderForm) && $scope.orderForm !== null) {
      if (angular.isDefined($scope.orderForm.inwardData) && $scope.orderForm.inwardData !== null && $scope.orderForm.inwardData.length > 0) {
        validateField.validate($scope.orderForm.inwardData[$scope.orderForm.inwardData.length - 1], inwardfield, inwardmsgData).then((inwardMsg) => {
          if (angular.isDefined(inwardMsg) && inwardMsg !== null && inwardMsg !== "") {
            Notification.error(inwardMsg);
          } else {
            $scope.orderData.formData = {};
            $scope.orderForm.inwardData.push({});
            $scope.selectedCard('FABRIC');
          }
        });
      } else {
        Notification.error("Please enter the job details.");
      }
    }
  };

  $scope.saveInward = function (type) {
    validateField.validate($scope.orderForm, orderfield, ordermsgData).then((orderMsg) => {
      if (angular.isDefined(orderMsg) && orderMsg !== null && orderMsg !== "") {
        Notification.error(orderMsg);
      } else {
        validateField.validateGroup($scope.orderForm.inwardData, inwardfield, inwardmsgData).then((inwardMsg) => {
          if (angular.isDefined(inwardMsg) && inwardMsg !== null && inwardMsg !== "") {
            Notification.error(inwardMsg);
          } else {
            const obj = {};
            obj.orderForm = angular.copy($scope.orderForm);

            for (const key in obj.orderForm.inwardData) {
              if (Object.keys(obj.orderForm.inwardData[key]).length === 0) {
                obj.orderForm.inwardData.splice(key, 1);
              } else {
                obj.orderForm.inwardData[key].dia = parseFloat(obj.orderForm.inwardData[key].dia);
                obj.orderForm.inwardData[key].rolls = parseFloat(obj.orderForm.inwardData[key].rolls);
                obj.orderForm.inwardData[key].weight = parseFloat(obj.orderForm.inwardData[key].weight);
              }
            }

            $rootScope.orderpageLoader = true;
            
            OrderService.save(obj, (result) => {
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
                    $scope.orderForm.jobstatus = "COMPLETED";
                    if (type === "print") {
                      $timeout(() => {
                        $scope.printThisbill();
                      }, 2000);
                    }
                    Notification.success(result.message);
                  } else {
                    $scope.orderForm.jobstatus = "PENDING";
                  }
                } else {
                  Notification.error(result.message);
                  $scope.orderForm.jobstatus = "PENDING";
                }
              } else {
                $scope.orderForm.jobstatus = "PENDING";
              }
              $scope.updateJobData();
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
  
  $scope.savereprocessInward = function (type) {
    if ($scope.orderForm.order_type == 'Reprocess') {
        if (angular.isDefined($scope.orderData.tempinwardData) && $scope.orderData.tempinwardData !== null && $scope.orderData.tempinwardData.length>0) {
          let inwdata = angular.copy($scope.orderData.tempinwardData);
          $scope.orderForm.inwardData = angular.copy($filter("filter")(inwdata, {reorder: true }));
          setTimeout(() => {
            $scope.updateJobData();
            $scope.saveInward(type);
          }, 200);
        } else {
          Notification.error("Please select the inward details");
        }
    }
  }
  
  $scope.removeInward = function (inward) {
    if (angular.isDefined(inward) && $scope.orderForm.inwardData.indexOf(inward) > -1) {
    //   const noofinward = $scope.orderForm.inwardData.length;
      const currentInward = $scope.orderForm.inwardData.indexOf(inward);

      $scope.orderForm.inwardData.splice(currentInward, 1);
      $scope.orderData.formData = {};
      $scope.updateJobData();
    }
  };

  $scope.printThisbill = function () {
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/order_print.html");
    orderData = $scope.orderForm;
    currency = $scope.orderData.currency;
    window.open(templateUrl, "_blank");
  };

  $scope.animationsEnabled = true;

  $scope.selectedCard = function (data) {
    $scope.orderData.fabric = "";
    $scope.orderData.jobsearchno = "";
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
        const cussrch = $window.document.getElementById('cussrch');
        if (cussrch && $scope.orderData.currentSelectedcard !== data) {
          cussrch.focus();
          $scope.orderData.currentSelectedcard = data;
        }
        orderview.addClass("bill_sec_active");
      } else if (data === "FABRIC") {
        myEl.addClass("bill_current_second");
        myE2.addClass("bill_current_first");
        myE3.addClass("bill_current_third");
        const fab = $window.document.getElementById('fabsrch');
        if (fab && $scope.orderData.currentSelectedcard !== data) {
          fab.focus();
          $scope.orderData.currentSelectedcard = data;
        }
        orderview.addClass("bill_sec_active");
      } else if (data === "PROCESS") {
        myEl.addClass("bill_current_third");
        myE2.addClass("bill_current_second");
        myE3.addClass("bill_current_first");
//        const fablotno = $window.document.getElementById('fablotno');
//        fablotno.focus();

        orderview.removeClass("bill_sec_active");
      }
    }
  };
  
  $scope.loadTags = function($query) {
    return $scope.orderData.procesList.filter(function(process) {
        return process.process_name.toLowerCase().indexOf($query.toLowerCase()) !== -1;
    });
  };
  
  $scope.initializeData();
});
