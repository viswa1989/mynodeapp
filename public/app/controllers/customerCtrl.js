/* global _ */
/* global angular */
angular.module("customerCtrl", []).controller("CustomerController", ($scope, $rootScope, $anchorScroll, Notification, CustomerService,
  DateformatstorageService, DATEFORMATS, $timeout, commonobjectService, DeliveryService, InvoiceService, accountsService, $filter, $q, 
  $sce, $location) => { // Customer ctrl
  $scope.commonobjectService = commonobjectService;
  $scope.data = {};
  $scope.data.currency = commonobjectService.getCurrency();
  $scope.data.paymentcardToggle = false;
  $scope.data.limit = 35;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  $scope.customerForm = {};
  $scope.customerdata = {};
  $scope.customerdata.newCustomer = false;
  $scope.customerdata.formsubmission = false;
  $scope.customerdata.viewaddress = false;
  $scope.customerdata.addressIndex = -1;
  $scope.customerdata.selectedCustomer = "";
  $scope.customerdata.list = [];
  $scope.customerdata.filters = {};

  $scope.customerdata.filters.skip = 0;
  $scope.customerdata.filters.limit = 50;

  $scope.customerdata.filters.favourites = false;
  $scope.customerdata.filters.divisions = "ALL";
  $scope.customerdata.filters.groups = "ALL";
  $scope.customerdata.filters.startswith = "";
  $scope.customerdata.filters.process = "";

  $scope.customerdata.divisionList = [];
  $scope.customerdata.groupfilters = [];
  $scope.customerdata.customergroups = [];
  $scope.customerdata.processfilters = [];
  $scope.customerdata.Jobdetails = [];
  $scope.customerdata.Billdetails = [];
  $scope.customerdata.Transactiondetails = [];
  $scope.customerdata.Statelistdetails = [];
  $scope.customerdata.Gsttreatmentdetails = [];
  $scope.customerdata.Customergroupdetails = [];
  $scope.customerdata.Totalorder = 0;
  $scope.customerdata.Totalreceived = 0;
  $scope.customerdata.Totalpending = 0;
  $scope.customerdata.Openingbalance = 0;
  $scope.customerdata.Totalspend = 0;

  $scope.customerdata.moregroupfilters = false;
  $scope.customerdata.moredivisionfilters = false;
  $scope.customerdata.divisionfiltersLimit = 6;
  $scope.customerdata.groupfiltersLimit = 6;
  $scope.customerdata.moreprocessfilters = false;
  $scope.customerdata.processfiltersLimit = 6;

  $scope.customerdata.disablescroll = false;
  $scope.customerdata.pageLoader = true;
  // Default gmap location
  $scope.searchLocation = {
    latitude: 11.094566532834266,
    longitude: 77.33402653967278,
  };

  $scope.data.filterbyAlphabets = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
    "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "ALL"];

  $scope.customerdata.filters.startswith = "ALL";

  const chartlabel = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  $scope.arealabels = [];
  $scope.areaseries = ["Order", "Invoice"];
  $scope.areadata = [];

  $scope.labels2 = ["New Order", "In Progress", "Completed", "Delivered"];
  $scope.data2 = [5, 2, 15, 22];

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

  // User Action --->get Filter data
  $scope.getFilterdata = function () {
    $scope.customerdata.Statelistdetails = [];
    $scope.customerdata.Gsttreatmentdetails = [];
    $scope.customerdata.selectedCustomer = "";
    $scope.customerdata.processfilters = [];

    CustomerService.getFilterdata((data) => {
      if (angular.isDefined(data) && data !== null && angular.isDefined(data.success)) {
        if (data.success) {
          if (angular.isDefined(data.data) && ($rootScope.currentapp === "divisionadmin" || $rootScope.currentapp === "superadmin")) {
            $scope.customerdata.filters.process = "";
            $scope.customerdata.filters.divisions = "ALL";
            angular.forEach(data.data.Divisions, (division) => {
              if (division !== null && angular.isDefined(division._id) && angular.isDefined(division.name)) {
                if (angular.isDefined(data.data.Currentbranch) && data.data.Currentbranch !== null && data.data.Currentbranch !== "" &&
                    data.data.Currentbranch === division._id) {
                  $scope.customerdata.filters.divisions = angular.copy(division._id);
                  $scope.customerdata.divisionList = [];
                }
                $scope.customerdata.divisionList.push(angular.copy(division));
              }
            });

            angular.forEach(data.data.Customergroup, (grp) => {
              if (angular.isDefined(grp.is_active) && grp.is_active === true && angular.isDefined(grp.is_deleted) &&
                grp.is_deleted === false) { $scope.customerdata.groupfilters.push(angular.copy(grp)); }
            });

            angular.forEach(data.data.Processdetail, (grp) => {
              if (angular.isDefined(grp._id)) { $scope.customerdata.processfilters.push(angular.copy(grp)); }
            });

            $scope.customerdata.customergroups = (angular.isDefined(data.data.Customergroup) && data.data.Customergroup.length > 0) ?
              angular.copy(data.data.Customergroup) : [];

            if (angular.isDefined(data.data.Processdetail) && data.data.Processdetail.length > 0) { $scope.list(); }

            $scope.customerdata.Statelistdetails = (angular.isDefined(data.data.Statelistdetails) && data.data.Statelistdetails !== null &&
                data.data.Statelistdetails.length > 0) ? angular.copy(data.data.Statelistdetails) : [];

            $scope.customerdata.Gsttreatmentdetails = (angular.isDefined(data.data.Gsttreatmentdetails) &&
                data.data.Gsttreatmentdetails !== null && data.data.Gsttreatmentdetails.length > 0) ?
              angular.copy(data.data.Gsttreatmentdetails) : [];
          }
        } else {
          Notification.error(data.message);
        }
      }

      $scope.customerdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.customerdata.pageLoader = false;
    });
  };

  $scope.addnewcustomer = function (stat) {
    $scope.customerdata.formsubmission = false;
    $scope.customerForm = {};
    $scope.customerForm.address = [];
    $scope.customerForm.followup_person = [];
    $scope.customerdata.viewableCustomerData = {};
    $scope.customerdata.address = {};
    $scope.customerdata.followup = {};
    $scope.customerdata.address.is_default = false;
    $scope.customerdata.address.is_delivery = false;
    $scope.customerdata.address.is_invoice = false;
    $scope.customerdata.newCustomer = stat;
    $scope.customerdata.addressIndex = -1;
    $scope.customerdata.followupIndex = -1;
    $scope.updation = !stat;
    $scope.customerdata.selectedCustomer = "";
  };

  $scope.refreshCustomeraddressdetails = function () {
    $scope.customerdata.addressIndex = -1;
    $scope.customerdata.address = {};
    $scope.customerdata.address.is_default = false;
    $scope.customerdata.address.is_delivery = false;
    $scope.customerdata.address.is_invoice = false;
  };

  $scope.refreshFollowupdetails = function () {
    $scope.customerdata.followupIndex = -1;
    $scope.customerdata.imagesrc = false;
    $scope.customerdata.followupformsubmission = false;
    $scope.customerdata.loadedfile = "";
    $scope.customerdata.followup = {};
  };

  $scope.addnewAddress = function () {
    $scope.refreshCustomeraddressdetails();
    $scope.customerdata.viewaddress = true;
    $scope.searchLocation = {
      latitude: 11.094566532834266,
      longitude: 77.33402653967278,
    };
    if (angular.isDefined($scope.customerdata.viewableCustomerData) && $scope.customerdata.viewableCustomerData !== null && 
            angular.isDefined($scope.customerdata.viewableCustomerData._id)) {
      if (angular.isDefined($scope.customerdata.viewableCustomerData.name)) {
        $scope.customerdata.address.company_name = angular.copy($scope.customerdata.viewableCustomerData.name);
      }
      if (angular.isDefined($scope.customerdata.viewableCustomerData.gstin)) {
        $scope.customerdata.address.gstin = angular.copy($scope.customerdata.viewableCustomerData.gstin);
      }  
    } else {
      if (angular.isDefined($scope.customerForm.name)) {
        $scope.customerdata.address.company_name = angular.copy($scope.customerForm.name);
      }
      if (angular.isDefined($scope.customerForm.gstin)) {
        $scope.customerdata.address.gstin = angular.copy($scope.customerForm.gstin);
      }
    }
  };

  // On file upload display and assign to scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files) && $files.length > 0 && $scope.customerdata.newCustomer) {
      $scope.files = $files;
      $scope.profile_picture = [];
      angular.forEach($scope.files, (profilepics) => {
        $scope.profile_picture.push(profilepics);
        const reader = new FileReader();
        reader.readAsDataURL(profilepics);
        reader.onload = function (e) {
          $scope.$apply(() => {
            $scope.customerdata.loadedfile = e.target.result;
            $scope.customerdata.imagesrc = true;
          });
        };
      });
    }
  };

  $scope.addnewFollowup = function () {
    $scope.refreshFollowupdetails();
    $scope.customerdata.viewfollowup = true;
  };

  function addressvalid(addressData) {
    const deferred = $q.defer();
    let count = 0;
    let defcount = 0;
    angular.forEach(addressData, (adrs) => {
      if (angular.isDefined(adrs.is_default) && adrs.is_default) {
        defcount += 1;
      }
      count += 1;
    });
    if (count === addressData.length) {
      if (defcount > 1) {
        deferred.resolve(false);
      } else {
        deferred.resolve(true);
      }
    }
    return deferred.promise;
  }

  $scope.updateAddress = function (address) {
    if (!angular.isUndefined(address.address_line) && !angular.isUndefined(address.city) && !angular.isUndefined(address.pincode) &&
        !angular.isUndefined(address.state) && address.address_line !== "" && address.city !== "" && address.pincode !== "" &&
        address.state !== "" && address.address_line !== null && address.city !== null && address.pincode !== null && address.state !== null) {
      const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (angular.isDefined(address.gstin) && address.gstin !== null && address.gstin !== "" && !pattern.test(address.gstin)) {
        Notification.error("Please enter the valid gstin no.");
        return false;
      }
      if ($scope.customerdata.newCustomer && angular.isDefined($scope.customerForm.address) && $scope.customerForm.address.length > 0) {
        addressvalid($scope.customerForm.address).then((adrexist) => {
          if (!adrexist) {
            Notification.error("Default Address has been enabled already for this customer");
            return false;
          }
          angular.forEach($scope.customerForm.address, (addrs, ind) => {
            if (ind === $scope.customerdata.addressIndex) {
              $scope.customerForm.address[ind] = angular.copy(address);
              $scope.refreshCustomeraddressdetails();
            }
          });
        });
      }

      if (!$scope.customerdata.newCustomer && angular.isDefined($scope.customerdata.viewableCustomerData) &&
        angular.isDefined($scope.customerdata.viewableCustomerData.address) && $scope.customerdata.viewableCustomerData.address.length > 0) {
        addressvalid($scope.customerdata.viewableCustomerData.address).then((adrexist) => {
          if (!adrexist) {
            Notification.error("Default Address has been enabled already for this customer");
            return false;
          }
          angular.forEach($scope.customerdata.viewableCustomerData.address, (addrs, ind) => {
            if (ind === $scope.customerdata.addressIndex) {
              $scope.customerdata.viewableCustomerData.address[ind] = angular.copy(address);
              $scope.refreshCustomeraddressdetails();
            }
          });
        });
      }

      $scope.customerdata.viewaddress = false;
    } else {
      Notification.error("Address Line, City, Pincode and State must be required");
      return false;
    }
  };

  $scope.updateFollowup = function (followup) {
    if (angular.isUndefined(followup.name) || followup.name === null || followup.name === "") {
      Notification.error("Please enter the follow-up person name");
      return false;
    }
    if (angular.isUndefined(followup.mobile_no) || followup.mobile_no === null || followup.mobile_no === "") {
      Notification.error("Please enter the valid 10 digit mobile no");
      return false;
    }
    const emailpattern = /\S+@\S+\.\S+/;
    const mobilepattern = /^[0-9]{10,12}$/;
    if (angular.isDefined(followup.email_id) && followup.email_id !== null && followup.email_id !== "" &&
            !emailpattern.test(followup.email_id)) {
      Notification.error("Please enter the valid email address");
      return false;
    }
    if (!mobilepattern.test(followup.mobile_no)) {
      Notification.error("Please enter the valid 10 digit mobile no");
      return false;
    }
    if ($scope.customerdata.newCustomer && angular.isDefined($scope.customerForm.followup_person) &&
            $scope.customerForm.followup_person.length > 0) {
      angular.forEach($scope.customerForm.followup_person, (follow, ind) => {
        if (ind === $scope.customerdata.followupIndex) { follow = angular.copy(followup); }
      });
    } else if (!$scope.customerdata.newCustomer && angular.isDefined($scope.customerdata.viewableCustomerData) &&
            angular.isDefined($scope.customerdata.viewableCustomerData.followup_person) &&
            $scope.customerdata.viewableCustomerData.followup_person.length > 0) {
      angular.forEach($scope.customerdata.viewableCustomerData.followup_person, (follow, ind) => {
        if (ind === $scope.customerdata.followupIndex) { follow = angular.copy(followup); }
      });
    }

    $scope.customerdata.viewfollowup = false;
    $scope.refreshFollowupdetails();
  };

  $scope.pushAddress = function () {
    if (!angular.isUndefined($scope.customerdata.address)) {
      if (!angular.isUndefined($scope.customerdata.address.address_line) && !angular.isUndefined($scope.customerdata.address.city) &&
        !angular.isUndefined($scope.customerdata.address.pincode) && !angular.isUndefined($scope.customerdata.address.state) &&
        $scope.customerdata.address.address_line !== "" && $scope.customerdata.address.city !== "" &&
        $scope.customerdata.address.pincode !== "" && $scope.customerdata.address.state !== "" &&
        $scope.customerdata.address.address_line !== null && $scope.customerdata.address.city !== null &&
        $scope.customerdata.address.pincode !== null && $scope.customerdata.address.state !== null) {
        const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (angular.isDefined($scope.customerdata.address.gstin) && $scope.customerdata.address.gstin !== null &&
                $scope.customerdata.address.gstin !== "" && !pattern.test($scope.customerdata.address.gstin)) {
          Notification.error("Please enter the valid gstin no.");
          return false;
        }
        let exist = true;
        let len = 0;
        if ($scope.customerdata.newCustomer) {
          if ($scope.customerForm.address.length > 0) {
            angular.forEach($scope.customerForm.address, (address, index) => {
              if (angular.isDefined(address.is_default) && address.is_default) {
                exist = false;
              }
              if (index === $scope.customerForm.address.length - 1 && exist) {
                $scope.customerForm.address.push(angular.copy($scope.customerdata.address));
                $scope.customerdata.viewaddress = false;
              } else if (index === $scope.customerForm.address.length - 1 && !exist && !$scope.customerdata.address.is_default) {
                $scope.customerForm.address.push(angular.copy($scope.customerdata.address));
                $scope.customerdata.viewaddress = false;
              }
              len += 1;
            });
            if (!exist && len === $scope.customerForm.address.length && $scope.customerdata.address.is_default) {
              Notification.error("Default Address has been enabled already for this customer");
              return false;
            }
          } else {
            $scope.customerForm.address.push(angular.copy($scope.customerdata.address));
            $scope.customerdata.viewaddress = false;
          }
        } else if ($scope.customerdata.viewableCustomerData.address.length > 0) {
          angular.forEach($scope.customerdata.viewableCustomerData.address, (address, index) => {
            if (angular.isDefined(address.is_default) && address.is_default) {
              exist = false;
            }
            if (index === $scope.customerdata.viewableCustomerData.address.length - 1 && exist) {
              $scope.customerdata.viewableCustomerData.address.push(angular.copy($scope.customerdata.address));
              $scope.customerdata.viewaddress = false;
            } else if (index === $scope.customerdata.viewableCustomerData.address.length - 1 && !exist && !$scope.customerdata.address.is_default) {
              $scope.customerdata.viewableCustomerData.address.push(angular.copy($scope.customerdata.address));
              $scope.customerdata.viewaddress = false;
            }
            len += 1;
          });
          if (!exist && len === $scope.customerdata.viewableCustomerData.address.length && $scope.customerdata.address) {
            Notification.error("Billing Address has been enabled already for this customer");
            return false;
          }
        } else {
          $scope.customerdata.viewableCustomerData.address.push(angular.copy($scope.customerdata.address));
          $scope.customerdata.viewaddress = false;
        }
        //                $scope.addnewAddress();
      } else {
        Notification.error("Address Line, City, Pincode and State must be required");
        return false;
      }
    } else {
      Notification.error("Address Line, City, Pincode and State must be required");
      return false;
    }
  };

  $scope.pushFollowup = function (valid) {
    if (angular.isUndefined($scope.customerdata.followup.name) || $scope.customerdata.followup.name === null ||
      $scope.customerdata.followup.name === "") {
      Notification.error("Please enter the follow-up person name");
      return false;
    }
    if (angular.isUndefined($scope.customerdata.followup.mobile_no) || $scope.customerdata.followup.mobile_no === null ||
      $scope.customerdata.followup.mobile_no === "") {
      Notification.error("Please enter the valid 10 digit mobile no");
      return false;
    }
    const emailpattern = /\S+@\S+\.\S+/;
    const mobilepattern = /^[0-9]{10,12}$/;
    if (angular.isDefined($scope.customerdata.followup.email_id) && $scope.customerdata.followup.email_id !== null &&
      $scope.customerdata.followup.email_id !== "" && !emailpattern.test($scope.customerdata.followup.email_id)) {
      Notification.error("Please enter the valid email address");
      return false;
    }
    if (!mobilepattern.test($scope.customerdata.followup.mobile_no)) {
      Notification.error("Please enter the valid 10 digit mobile no");
      return false;
    }
    if (!valid) {
      return false;
    }
    if (angular.isDefined($scope.customerdata.followup)) {
      if ($scope.customerdata.followup.mobile_no.length !== 10) {
        Notification.error("Mobile no must be 10 numbers exactly.");
        return false;
      }
      if ($scope.customerdata.newCustomer) {
        if (angular.isDefined($scope.customerdata.loadedfile) && $scope.customerdata.loadedfile !== null && $scope.customerdata.loadedfile !== "") {
          $scope.customerdata.followup.profile_picture = angular.copy($scope.customerdata.loadedfile);
        }
        $scope.customerdata.followupformsubmission = false;
        $scope.customerForm.followup_person.push(angular.copy($scope.customerdata.followup));
      } else if (!$scope.customerdata.newCustomer) {
        if (angular.isDefined($scope.customerdata.loadedfile) && $scope.customerdata.loadedfile !== null && $scope.customerdata.loadedfile !== "") {
          $scope.customerdata.followup.profile_picture = angular.copy($scope.customerdata.loadedfile);
        }
        $scope.customerdata.followupformsubmission = false;
        $scope.customerdata.viewableCustomerData.followup_person.push(angular.copy($scope.customerdata.followup));
      }

      //                $scope.addnewFollowup();
      $scope.customerdata.viewfollowup = false;
    } else {
      Notification.error("Follow up person name and mobile no must be required");
      return false;
    }
  };

  $scope.viewaddress = function (address) {
    let index = -1;
    $scope.customerdata.address = {};
    $scope.customerdata.address.is_default = false;
    $scope.customerdata.address.is_delivery = false;
    $scope.customerdata.address.is_invoice = false;
    if ($scope.customerdata.newCustomer && angular.isDefined($scope.customerForm.address) && $scope.customerForm.address.length > 0) {
      index = $scope.customerForm.address.indexOf(address);
    }
    if (!$scope.customerdata.newCustomer && angular.isDefined($scope.customerdata.viewableCustomerData) &&
                angular.isDefined($scope.customerdata.viewableCustomerData.address) && $scope.customerdata.viewableCustomerData.address.length > 0) {
      index = $scope.customerdata.viewableCustomerData.address.indexOf(address);
    }

    if (index > -1) {
      $scope.customerdata.address = angular.copy(address);
      if (angular.isDefined(address.latitude) && angular.isDefined(address.longitude)) {
        $scope.searchLocation.latitude = angular.copy(address.latitude);
        $scope.searchLocation.longitude = angular.copy(address.longitude);
      }
      $scope.customerdata.viewaddress = true;
      $scope.customerdata.addressIndex = index;
      return false;
    }
    $scope.refreshCustomeraddressdetails();
    $scope.customerdata.viewaddress = false;
  };

  $scope.viewfollowup = function (followup) {
    let index = -1;
    $scope.customerdata.followup = {};
    if ($scope.customerdata.newCustomer && angular.isDefined($scope.customerForm.followup_person) && $scope.customerForm.followup_person.length > 0) {
      index = $scope.customerForm.followup_person.indexOf(followup);
    }
    if (!$scope.customerdata.newCustomer && angular.isDefined($scope.customerdata.viewableCustomerData) &&
        angular.isDefined($scope.customerdata.viewableCustomerData.followup_person) &&
        $scope.customerdata.viewableCustomerData.followup_person.length > 0) {
      index = $scope.customerdata.viewableCustomerData.followup_person.indexOf(followup);
    }

    if (index > -1) {
      $scope.customerdata.followup = angular.copy(followup);
      $scope.customerdata.viewfollowup = true;
      $scope.customerdata.followupIndex = index;
      return false;
    }
    $scope.refreshFollowupdetails();
    $scope.customerdata.viewfollowup = false;
  };

  $scope.deleteaddress = function () {
    if ($scope.customerdata.newCustomer && angular.isDefined($scope.customerForm.address[$scope.customerdata.addressIndex])) {
      $scope.customerForm.address.splice($scope.customerdata.addressIndex, 1);
    } else if (!$scope.customerdata.newCustomer &&
        angular.isDefined($scope.customerdata.viewableCustomerData.address[$scope.customerdata.addressIndex])) {
      $scope.customerdata.viewableCustomerData.address.splice($scope.customerdata.addressIndex, 1);
    }
    $scope.customerdata.address = {};
    $scope.customerdata.address.is_default = false;
    $scope.customerdata.address.is_delivery = false;
    $scope.customerdata.address.is_invoice = false;
    $scope.customerdata.viewaddress = false;
    $scope.customerdata.addressIndex = -1;
  };

  $scope.deletefollowup = function () {
    if ($scope.customerdata.newCustomer && angular.isDefined($scope.customerForm.followup_person[$scope.customerdata.followupIndex])) {
      $scope.customerForm.followup_person.splice($scope.customerdata.followupIndex, 1);
    } else if (!$scope.customerdata.newCustomer &&
        angular.isDefined($scope.customerdata.viewableCustomerData.followup_person[$scope.customerdata.followupIndex])) {
      $scope.customerdata.viewableCustomerData.followup_person.splice($scope.customerdata.followupIndex, 1);
    }
    $scope.customerdata.followup = {};
    $scope.customerdata.viewfollowup = false;
    $scope.customerdata.followupIndex = -1;
  };

  // User Action --->List
  $scope.list = function () {
    const objs = {};
    objs.filterData = $scope.customerdata.filters;
    // $scope.customerdata.pageLoader=true;
    $scope.customerdata.disablescroll = true;

    CustomerService.get(objs, (data) => {
      if (data && data !== null && data !== "" && data.length > 0) {
        const customerList = angular.copy(data);

        angular.forEach($scope.data.filterbyAlphabets, (alpha) => {
          const letter = /^[a-zA-Z]+$/;
          let alphabets = false;
          const customerOrder = [];
          if (alpha !== "#") {
            alphabets = true;
          }
          angular.forEach(customerList, (customers, cusIndex) => {
            if (angular.isDefined(customers.name)) {
              const obj = {};

              const firstLetter = customers.name.charAt(0);
              if (alphabets && firstLetter.toUpperCase() === alpha) {
                customerOrder.push(customers);
                if (angular.isDefined($scope.customerdata.list) && $scope.customerdata.list.length > 0 &&
                                        angular.isDefined($scope.customerdata.list[$scope.customerdata.list.length - 1]) &&
                                        angular.isDefined($scope.customerdata.list[$scope.customerdata.list.length - 1].filterAlpha) &&
                                        $scope.customerdata.list[$scope.customerdata.list.length - 1].filterAlpha === alpha) {
                  $scope.customerdata.list[$scope.customerdata.list.length - 1].customers.push(customers);
                } else {
                  obj.customers = [];
                  obj.customers.push(customers);
                  obj.filterAlpha = alpha;
                  $scope.customerdata.list.push(obj);
                }
              } else if (!alphabets && !firstLetter.match(letter)) {
                customerOrder.push(customers);
                obj.filterAlpha = alpha;
                obj.customers = [];
                obj.customers.push(customers);
                $scope.customerdata.list.push(obj);
              }
            }
            if (cusIndex === customerList.length - 1) {
              $scope.customerdata.filters.skip += customerOrder.length;
            }
          });
        });
        $scope.customerdata.disablescroll = false;
      } else {
        $timeout(() => {
          $scope.customerdata.disablescroll = false;
        }, 5000);
      }

      $scope.customerdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.customerdata.disablescroll = false;
      $scope.customerdata.pageLoader = false;
    });
  };


  $scope.refreshCutomerform = function () {
    $scope.customerdata.process = "";
    $scope.customerdata.formsubmission = false;
    $scope.customerForm = {};
    $scope.customerForm.address = [];
  };

  // Create Customer
  $scope.create = function (valid) {
    if (!valid) {
      angular.element(".customer-profile-container.addcustomer_profile")[0].scrollTop = 50;
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
        angular.isUndefined($scope.customerForm.state) || $scope.customerForm.state === null)) {
      Notification.error("Please select the place of supply for this customer");
      return false;
    }
    if ($scope.checkRetypePasswordmatch($scope.customerForm)) {
      let groupexist = 0;
      let defaultgroup = "";
      angular.forEach($scope.customerdata.groupfilters, (grps, grpind) => {
        if (angular.isDefined(grps._id) && grps._id !== "" && angular.isDefined(grps.default) && grps.default === true) {
          defaultgroup = grps._id;
        }

        if (angular.isDefined(grps._id) && grps._id !== "" && grps._id === $scope.customerForm.group) {
          groupexist += 1;
        } else if (groupexist === 0 && $scope.customerdata.groupfilters.length - 1 === grpind && defaultgroup !== "") {
          $scope.customerForm.group = defaultgroup;
        }
      });

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
        obj.customerForm = $scope.customerForm;

        CustomerService.create(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              $scope.list();
              $scope.refreshCutomerform();
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
      } else {
        Notification.error("Please add address details for the customer");
        return false;
      }
    } else {
      Notification.error("Password and Retype Password field doesn't match");
    }
  };

  // Update Customer
  $scope.update = function (valid) {
    if (!valid) {
      return false;
    }
    if (!$scope.checkRetypePasswordmatch($scope.customerdata.viewableCustomerData)) {
      Notification.error("Password and Retype Password field doesn't match");
      return false;
    }
    if (angular.isUndefined($scope.customerdata.viewableCustomerData.gstTreatmentcopy) ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy === null ||
        angular.isUndefined($scope.customerdata.viewableCustomerData.gstTreatmentcopy._id) ||
        angular.isUndefined($scope.customerdata.viewableCustomerData.gstTreatmentcopy.name) ||
        angular.isUndefined($scope.customerdata.viewableCustomerData.gstTreatment) ||
        $scope.customerdata.viewableCustomerData.gstTreatment === null) {
      Notification.error("Please select the GST Treatment for this customer");
      return false;
    }
    if (($scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Registered Business - Regular" ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Registered Business - Composition" ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Special Economic Zone") &&
        (angular.isUndefined($scope.customerdata.viewableCustomerData.gstin) || $scope.customerdata.viewableCustomerData.gstin === null ||
        $scope.customerdata.viewableCustomerData.gstin === "")) {
      Notification.error("Please enter the GSTIN number for this customer");
      return false;
    }
    if (($scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Registered Business - Regular" ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Registered Business - Composition" ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Special Economic Zone" ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Unregistered Business" ||
        $scope.customerdata.viewableCustomerData.gstTreatmentcopy.name === "Consumer") &&
        (angular.isUndefined($scope.customerdata.viewableCustomerData.statecopy) || $scope.customerdata.viewableCustomerData.statecopy === null ||
        angular.isUndefined($scope.customerdata.viewableCustomerData.statecopy._id) ||
        angular.isUndefined($scope.customerdata.viewableCustomerData.statecopy.name) ||
        angular.isUndefined($scope.customerdata.viewableCustomerData.state) || $scope.customerdata.viewableCustomerData.state === null)) {
      Notification.error("Please select the place of supply for this customer");
      return false;
    }
    if (angular.isDefined($scope.customerdata.viewableCustomerData) && angular.isDefined($scope.customerdata.viewableCustomerData._id) &&
                $scope.customerdata.viewableCustomerData._id !== "") {
      let addrlen = 0;
      let exist = false;
      angular.forEach($scope.customerdata.viewableCustomerData.address, (addr) => {
        if (angular.isDefined(addr.is_default) && addr.is_default) {
          exist = true;
        }
        addrlen += 1;
      });

      if (addrlen === $scope.customerdata.viewableCustomerData.address.length && (addrlen === 0 || exist)) {
        const obj = {};
        obj.customerForm = angular.copy($scope.customerdata.viewableCustomerData);

        CustomerService.update(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              angular.forEach($scope.customerdata.list, (cus) => {
                if (angular.isDefined(cus._id) && cus._id !== "" && cus._id === $scope.customerdata.selectedCustomer) {
                  cus = angular.copy($scope.customerdata.viewableCustomerData);
                }
              });

              $scope.refreshCutomerform();
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
      } else {
        Notification.error("Please add address details for the customer");
        return false;
      }
    }
  };

  $scope.checkRetypePasswordmatch = function (customer) {
    let valid = true;
    if ((angular.isDefined(customer.password) && customer.password !== "" && angular.isUndefined(customer.confirm_password)) ||
                (angular.isUndefined(customer.password) && angular.isDefined(customer.confirm_password) && customer.confirm_password !== "")) {
      valid = false;
    }
    if (angular.isDefined(customer.password) && angular.isDefined(customer.confirm_password) && customer.password !== customer.confirm_password) {
      valid = false;
    }

    return valid;
  };

  $scope.setDefaultaddress = function () {
    $scope.customerdata.address.is_default = !$scope.customerdata.address.is_default;
  };

  $scope.setDeliveryaddress = function () {
    $scope.customerdata.address.is_delivery = !$scope.customerdata.address.is_delivery;
  };

  $scope.setInvoiceaddress = function () {
    $scope.customerdata.address.is_invoice = !$scope.customerdata.address.is_invoice;
  };

  $scope.refreshSelectedcustomer = function () {
    $scope.customerdata.viewableCustomerData = {};
    $scope.customerdata.viewaddress = false;
    $scope.customerdata.newCustomer = false;
    $scope.customerdata.selectedCustomer = "";
    $scope.customerdata.Jobdetails = [];
    $scope.customerdata.Billdetails = [];
    $scope.customerdata.Transactiondetails = [];

    $scope.customerdata.Customergroupdetails = [];
    $scope.customerdata.Totalorder = 0;
    $scope.customerdata.Totalreceived = 0;
    $scope.customerdata.Totalspend = 0;
    $scope.customerdata.Totalpending = 0;
    $scope.customerdata.Openingbalance = 0;
  };

  $scope.filterBydata = function (filters, value) {
    $scope.refreshSelectedcustomer();
    $scope.customerdata.filters.skip = 0;
    $scope.customerdata.list = [];
    if (angular.isDefined(value) && value !== "") {
      let groups = "";
      if (value === "ALL") {
        groups = "ALL";
      } else if (angular.isDefined(value._id) && value._id !== "") {
        groups = angular.copy(value._id);
      }

      if (filters === "FIRSTLETTER") {
        $scope.customerdata.filters.startswith = value;
      } else if (filters === "FAVORITE") {
        $scope.customerdata.filters.favourites = !$scope.customerdata.filters.favourites;
      } else if (filters === "PROCESS") {
        if ($scope.customerdata.filters.process === groups) {
          $scope.customerdata.filters.process = "";
        } else {
          $scope.customerdata.filters.process = groups;
        }
      } else if (filters === "DIVISIONS") {
        $scope.customerdata.filters.divisions = groups;
      } else if (filters === "GROUPS") {
        $scope.customerdata.filters.groups = groups;
      }
      $scope.list();
    }
  };

  // User On scroll paginate
  $scope.loadMoreCustomer = function () {
    if (angular.isDefined($scope.customerdata.processfilters) && $scope.customerdata.processfilters.length > 0) {
      $scope.list();
    } else {
      $scope.getFilterdata();
    }
  };

  // View invoice data
  $scope.viewInvoice = function (invoice) {
    invoice.viewInvoice = !invoice.viewInvoice;
    if (invoice.viewInvoice && angular.isDefined(invoice) && invoice !== null && invoice._id) {
      invoice.invoiceloader = true;
      invoice.invoiceexist = false;
      InvoiceService.viewinvoice(invoice._id, (result) => {
        if (angular.isDefined(result) && result !== null && result !== "" && angular.isDefined(result._id)) {
          invoice.viewinvoiceData = angular.copy(result);
          invoice.invoiceexist = true;
        }
        invoice.invoiceloader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        invoice.invoiceloader = false;
      });
    }
  };

  // Customer Discount group calculation
  $scope.discountCalculation = function (measurement, discountBy) {
    if (angular.isUndefined(measurement.cost) || isNaN(measurement.cost) || parseFloat(measurement.cost) === 0) {
      measurement.discount_price = "0.00";
      measurement.discount_percentage = "0.00";
      return true;
    }

    if (angular.isDefined(measurement.cost) && !isNaN(measurement.cost)) {
      if (angular.isDefined(discountBy) && discountBy === "PAGE" && isNaN(measurement.discount_price)) {
        const cost = parseFloat(measurement.cost);
        measurement.discount_price = cost.toFixed(2);
      }
      if (angular.isDefined(discountBy) && discountBy === "PRICE" && isNaN(measurement.discount_percentage)) {
        measurement.discount_percentage = "0.00";
      }
    }

    if (angular.isDefined(measurement.discount_price) && !isNaN(measurement.discount_price)) {
      const discount = parseFloat(measurement.discount_price);
      measurement.discount_price = discount.toFixed(2);
    }
    if (angular.isDefined(measurement.discount_percentage) && !isNaN(measurement.discount_percentage)) {
      const discountpercentage = parseFloat(measurement.discount_percentage);
      measurement.discount_percentage = discountpercentage.toFixed(2);
    }

    if (angular.isDefined(discountBy) && discountBy === "PAGE") {
      const afterDiscountAmount = parseFloat(measurement.discount_price);
      const wholeAmount = parseFloat(measurement.cost);
      const page = (parseFloat(afterDiscountAmount) * 100) / parseFloat(wholeAmount);
      const calc1 = parseFloat(100) - parseFloat(page);
      measurement.discount_percentage = calc1.toFixed(2);
    }

    if (angular.isDefined(discountBy) && discountBy === "PRICE") {
      const wholeAmount2 = parseFloat(measurement.cost);
      const price2 = (parseFloat(wholeAmount2) * parseFloat(measurement.discount_percentage)) / 100;
      const calc2 = parseFloat(wholeAmount2) - parseFloat(price2);
      measurement.discount_price = calc2.toFixed(2);
    }
  };

  $scope.formatDiscounts = function (divisionData) {
    angular.forEach($scope.customerdata.Customergroupdetails, (group) => {
      if (angular.isDefined(group.group_discount) && group.group_discount !== null && group.group_discount.length > 0) {
        group.discountview = [];
        angular.forEach(divisionData, (division) => {
          if (angular.isDefined(division.name) && angular.isDefined(division._id)) {
            angular.forEach($scope.customerdata.processfilters, (process) => {
              if (angular.isDefined(process.division_id) && process.division_id === division._id) {
                const obj = {};
                obj.process_name = process.process_name;
                obj.division_name = division.name;
                obj.measurements = [];
                let proceedindex = 0;
                angular.forEach(group.group_discount, (grp, grpindex) => {
                  if (angular.isDefined(grp.division_id) && angular.isDefined(grp.process_id) && angular.isDefined(grp.measurement_id) &&
                    angular.isDefined(grp.discount_price) && grp.division_id === division._id && process._id === grp.process_id &&
                    process.division_id === grp.division_id) {
                    angular.forEach($scope.customerdata.Measurements, (measurement) => {
                      if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure) &&
                                                    measurement._id === grp.measurement_id) {
                        const objs = {};
                        objs.cost = 0.00;
                        if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                          objs.cost = $filter("getProcesscostFilter")(process.measurement, grp.measurement_id);
                        }
                        objs.measurement_id = grp.measurement_id;
                        objs.discount_price = grp.discount_price;
                        objs.percentage = 0.00;

                        $scope.discountCalculation(objs, "PAGE");
                        obj.measurements.push(objs);
                      }
                    });
                  }
                  if (grpindex === group.group_discount.length - 1) {
                    proceedindex = 1;
                    if (obj.measurements.length === 0) {
                      angular.forEach($scope.customerdata.Measurements, (measurement) => {
                        if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure)) {
                          const objs = {};
                          objs.cost = 0.00;
                          if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                            objs.cost = $filter("getProcesscostFilter")(process.measurement, measurement._id);
                          }
                          objs.measurement_id = measurement._id;
                          objs.discount_price = 0.00;
                          objs.percentage = 0.00;

                          $scope.discountCalculation(objs, "PAGE");
                          obj.measurements.push(objs);
                        }
                      });
                    }
                  }
                });
                if (proceedindex > 0 && obj.measurements.length > 0) {
                  obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
                  group.discountview.push(obj);
                }
              }
            });
          }
        });
      } else {
        group.discountview = [];
        angular.forEach(divisionData, (division) => {
          if (angular.isDefined(division.name) && angular.isDefined(division._id)) {
            angular.forEach($scope.customerdata.processfilters, (process) => {
              if (angular.isDefined(process._id) && angular.isDefined(process.division_id) && division._id === process.division_id) {
                const obj = {};
                obj.process_name = process.process_name;
                obj.process_id = process._id;
                obj.division_name = division.name;
                obj.division_id = division._id;
                obj.measurements = [];
                angular.forEach($scope.customerdata.Measurements, (measurement, measureindex) => {
                  if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure)) {
                    const objs = {};
                    objs.cost = 0.00;
                    if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                      objs.cost = $filter("getProcesscostFilter")(process.measurement, measurement._id);
                    }
                    objs.measurement_id = measurement._id;
                    objs.discount_price = 0.00;
                    objs.percentage = 0.00;
                    $scope.discountCalculation(objs, "PAGE");
                    obj.measurements.push(objs);
                  }
                  if (measureindex === $scope.customerdata.Measurements.length - 1) {
                    obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
                    group.discountview.push(obj);
                  }
                });
              }
            });
          }
        });
      }

      if (angular.isDefined(group.name) && angular.isDefined(group._id) && angular.isDefined($scope.customerdata.viewableCustomerData.group) &&
                    $scope.customerdata.viewableCustomerData.group !== null && $scope.customerdata.viewableCustomerData.group === group._id) {
        $scope.customerdata.currentUserCustomerGroup = angular.copy(group);
        $scope.customerdata.assignedDiscountGroupName = angular.copy(group.name);
        $scope.assignCustomerGroupToCurrentUser(group);
      }
    });
  };

  function calculateBilltotal() {
    const deferred = $q.defer();
    let count = 0;
    angular.forEach($scope.customerdata.Billdetails, (bills) => {
      if (angular.isDefined(bills.total) && bills.total !== null && bills.total !== "" && parseFloat(bills.total) > 0) {
        $scope.customerdata.Totalorder += parseFloat(bills.total);
        $scope.customerdata.Totalpending += parseFloat(bills.total);
      }
      count += 1;
    });
    if (count === $scope.customerdata.Billdetails.length) {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function calculateTransactiontotal() {
    angular.forEach($scope.customerdata.Transactiondetails, (trans) => {
      if (angular.isDefined(trans.transaction_amount) && trans.transaction_amount !== null && trans.transaction_amount !== "" &&
        parseFloat(trans.transaction_amount) > 0) {
        if (angular.isDefined(trans.transaction_type) && trans.transaction_type === "DEDIT") {
          $scope.customerdata.Totalspend += parseFloat(trans.transaction_amount);
        } else {
          $scope.customerdata.Totalreceived += parseFloat(trans.transaction_amount);
          $scope.customerdata.Totalpending -= parseFloat(trans.transaction_amount);
        }
      }
      if (angular.isDefined(trans.previous_owe) && trans.previous_owe !== null && trans.previous_owe !== "" &&
        parseFloat(trans.previous_owe) > 0) {
        //$scope.customerdata.Totalpending -= parseFloat(trans.previous_owe);
      }
    });
    if (angular.isDefined($scope.customerdata.viewableCustomerData.opening_balance) && $scope.customerdata.viewableCustomerData.opening_balance !== null && 
            angular.isDefined($scope.customerdata.viewableCustomerData.opening_balance.total_balance) && 
            $scope.customerdata.viewableCustomerData.opening_balance.total_balance !== null && 
            (parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance)>0 || parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance)<0)) {
      $scope.customerdata.Totalpending += parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance);
    }
  }


  $scope.assignInvoicetransaction = function () {
    angular.forEach($scope.customerdata.Transactiondetails, (trans) => {
      if (angular.isDefined(trans.bills) && trans.bills !== null && trans.bills.length > 0) {
        angular.forEach(trans.bills, (bills) => {
          if (angular.isDefined(bills.bill_id) && bills.bill_id !== null) {
            angular.forEach($scope.customerdata.Billdetails, (invoice) => {
              if (angular.isDefined(invoice._id) && invoice._id !== null && invoice._id !== "" && invoice._id === bills.bill_id) {
                if (angular.isUndefined(invoice.transactions)) {
                  invoice.transactions = [];
                }
                const obj = {};
                obj.transaction_date = angular.copy(trans.transaction_date);
                obj.transaction_amount = angular.copy(trans.transaction_amount);
                obj.transaction_id = angular.copy(trans._id);
                obj.allocated_amount = angular.copy(bills.amount_allocated);
                obj.balance_due = angular.copy(bills.balance_due);
                if(angular.isDefined(trans.previous_owe) && trans.previous_owe !== null && parseFloat(trans.previous_owe)>0){
                  obj.previous_owe = angular.copy(trans.previous_owe);
                }
                invoice.transactions.push(angular.copy(obj));
              }
            });
          }
        });
      }
    });
  };

  function setDeliverydetail(deliveryData, type) {
    angular.forEach(deliveryData, (data) => {
      if (angular.isDefined(data) && data !== null && angular.isDefined(data._id)) {
        const obj = {};
        obj._id = data._id;
        obj.order_id = data.order_id;
        obj.customer_name = data.customer_name;
        obj.order_no = data.order_no;
        obj.order_date = data.order_date;
        if (type === "DELIVERY") {
          obj.order_status = data.order_status;
        }
        obj.delivery_no = data.delivery_no;
        obj.delivery_date = data.delivery_date;
        obj.process = [];
        angular.forEach(data.outward_data, (owd) => {
          if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
            angular.forEach(owd.process, (pro) => {
              if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                obj.process.push(pro);
              }
            });
          }
        });
        if (type === "DELIVERY") {
          $scope.customerdata.delivery.push(angular.copy(obj));
        } else {
          $scope.customerdata.deliveryReturn.push(angular.copy(obj));
        }
      }
    });
  }

  function invoicegraph(trans) {
    const deferred = $q.defer();
    let count = 0;
    let val = 0;
    const data = [];
    if (angular.isDefined(trans) && trans !== null && trans.length > 0) {
      angular.forEach($scope.labelsno, (lbno) => {
        let exist = false;
        angular.forEach(trans, (inv, ind) => {
          if (inv.month === lbno + 1) {
            val = inv.count;
            exist = true;
          }
          if (ind === trans.length - 1) {
            if (!exist) {
              val = 0;
            }

            data.push(val);
            count += 1;
          }
        });
      });
    } else {
      angular.forEach($scope.labelsno, () => {
        data.push(val);
        count += 1;
      });
    }

    if (count === $scope.labelsno.length) {
      deferred.resolve(data);
    }
    return deferred.promise;
  }

  // User Action --->View
  $scope.view = function (selectedCustomer) {
    $scope.customerdata.currentUserCustomerGroup = {};
    $scope.refreshSelectedcustomer();
    $scope.customerdata.viewmenu = "Order";
    $scope.arealabels = [];
    $scope.labelsno = [];
    const a = [];
    const b = [];
    $scope.areadata = [a, b];
    if (angular.isDefined(selectedCustomer) && angular.isDefined(selectedCustomer._id) && selectedCustomer._id !== "") {
      const obj = angular.copy(selectedCustomer._id);
      $scope.customerdata.selectedCustomer = obj;
      $scope.customerdata.delivery = [];
      $scope.customerdata.skipdelivery = [];
      $scope.customerdata.deliveryReturn = [];
      $scope.customerdata.skipdeliveryReturn = [];
      $scope.customerdata.openingbalancedetails = [];
      CustomerService.view(obj, (data) => {
        if (angular.isDefined(data) && data !== null && angular.isDefined(data.success)) {
          if (data.success) {
            if (angular.isDefined(data.data) && data.data !== null && angular.isDefined(data.data.Customerdetails) &&
                data.data.Customerdetails !== null && angular.isDefined(data.data.Customerdetails._id)) {
              if (angular.isDefined(data.data.filterdates)) {
                let startmnth = data.data.filterdates;
                for (let i = 0; i < 6; i += 1) {
                  $scope.labelsno.push(startmnth);
                  $scope.arealabels.push(chartlabel[startmnth]);
                  if (startmnth === 11) {
                    startmnth = 0;
                  } else {
                    startmnth += 1;
                  }
                }
              }

              invoicegraph(data.data.orders).then((ordergraphdata) => {
                if (angular.isDefined(ordergraphdata) && ordergraphdata !== null && ordergraphdata.length > 0) {
                  $scope.areadata[0] = ordergraphdata;
                }
              });

              invoicegraph(data.data.transaction).then((invoicegraphdata) => {
                if (angular.isDefined(invoicegraphdata) && invoicegraphdata !== null && invoicegraphdata.length > 0) {
                  $scope.areadata[1] = invoicegraphdata;
                }
              });

              $scope.customerdata.viewableCustomerData = angular.copy(data.data.Customerdetails);
              if (angular.isDefined($scope.customerdata.viewableCustomerData.opening_balance) && $scope.customerdata.viewableCustomerData.opening_balance !== null && 
                      angular.isDefined($scope.customerdata.viewableCustomerData.opening_balance.total_balance) && 
                      $scope.customerdata.viewableCustomerData.opening_balance.total_balance !== null) {
                $scope.customerdata.Openingbalance = parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance);
                if(parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance) > 0 || 
                        parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance) < 0) {
                    const objs = {};
                    objs.created = angular.copy($scope.customerdata.viewableCustomerData.opening_balance.created);
                    objs.category_name = "Opening Balance";
                    if(parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance)>0) {
                      objs.transaction_type = "DEBIT";
                      objs.transaction_amount = parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance);
                    } else {
                      objs.transaction_type = "CREDIT";
                      objs.transaction_amount = -1 * parseFloat($scope.customerdata.viewableCustomerData.opening_balance.total_balance);
                    }
                    $scope.customerdata.openingbalancedetails.push(objs);
                }
              }
              $scope.customerdata.viewableCustomerData.balance_status = false;
              
              if(angular.isDefined(data.data.Customerdetails.opening_balance) && data.data.Customerdetails.opening_balance !== null && 
                angular.isDefined(data.data.Customerdetails.opening_balance.total_balance)){
                $scope.customerdata.viewableCustomerData.customer_previous_balance = parseFloat(data.data.Customerdetails.opening_balance.total_balance);
                if(angular.isDefined(data.data.Customerdetails.opening_balance.due_status) && 
                        data.data.Customerdetails.opening_balance.due_status === "Closed") {
                    $scope.customerdata.viewableCustomerData.balance_status = true;
                }
              }
              $scope.customerdata.Measurements = (angular.isDefined(data.data.Measurements) && data.data.Measurements !== null &&
                data.data.Measurements.length > 0) ? angular.copy(data.data.Measurements) : [];
              $scope.customerdata.Customergroupdetails = (angular.isDefined(data.data.Customergroupdetails) &&
                data.data.Customergroupdetails !== null && data.data.Customergroupdetails.length > 0) ?
                angular.copy(data.data.Customergroupdetails) : [];
              $scope.customerdata.Jobdetails = (angular.isDefined(data.data.Jobdetails) && data.data.Jobdetails !== null &&
                data.data.Jobdetails.length > 0) ? angular.copy(data.data.Jobdetails) : [];
              $scope.customerdata.Billdetails = (angular.isDefined(data.data.Billdetails) && data.data.Billdetails !== null &&
                data.data.Billdetails.length > 0) ? angular.copy(data.data.Billdetails) : [];
              $scope.customerdata.Transactiondetails = (angular.isDefined(data.data.Transactiondetails) && data.data.Transactiondetails !== null &&
                data.data.Transactiondetails.length > 0) ? angular.copy(data.data.Transactiondetails) : [];
              if (angular.isDefined(data.data.Delivery) && data.data.Delivery !== null && data.data.Delivery.length > 0) {
                setDeliverydetail(data.data.Delivery, "DELIVERY");
              }
              if (angular.isDefined(data.data.Deliveryreturn) && data.data.Deliveryreturn !== null && data.data.Deliveryreturn.length > 0) {
                setDeliverydetail(data.data.Deliveryreturn, "RETURN");
              }

              if (angular.isDefined($scope.customerdata.viewableCustomerData.gstTreatment) &&
                $scope.customerdata.viewableCustomerData.gstTreatment !== null && angular.isDefined($scope.customerdata.Gsttreatmentdetails) &&
                $scope.customerdata.Gsttreatmentdetails !== null && $scope.customerdata.Gsttreatmentdetails.length > 0) {
                angular.forEach($scope.customerdata.Gsttreatmentdetails, (gst) => {
                  if (angular.isDefined(gst._id) && gst._id === $scope.customerdata.viewableCustomerData.gstTreatment) {
                    $scope.customerdata.viewableCustomerData.gstTreatmentcopy = gst;
                  }
                });
              }

              if (angular.isDefined($scope.customerdata.Gsttreatmentdetails) && $scope.customerdata.Gsttreatmentdetails !== null &&
                $scope.customerdata.Gsttreatmentdetails.length > 0) {
                if (angular.isDefined($scope.customerdata.viewableCustomerData.gstTreatment) &&
                    $scope.customerdata.viewableCustomerData.gstTreatment !== null) {
                  angular.forEach($scope.customerdata.Gsttreatmentdetails, (gst) => {
                    if (angular.isDefined(gst._id) && gst._id === $scope.customerdata.viewableCustomerData.gstTreatment) {
                      $scope.customerdata.viewableCustomerData.gstTreatmentcopy = gst;
                    }
                  });
                }

                if (angular.isDefined($scope.customerdata.viewableCustomerData.gstTreatment) &&
                    $scope.customerdata.viewableCustomerData.gstTreatment !== null) {
                  angular.forEach($scope.customerdata.Gsttreatmentdetails, (gst) => {
                    if (angular.isDefined(gst._id) && gst._id === $scope.customerdata.viewableCustomerData.gstTreatment) {
                      $scope.customerdata.viewableCustomerData.gstTreatmentcopy = gst;
                    }
                  });
                }

                if (angular.isDefined($scope.customerdata.viewableCustomerData.placeofSupply) &&
                    $scope.customerdata.viewableCustomerData.placeofSupply !== null) {
                  $scope.customerdata.viewableCustomerData.state = angular.copy($scope.customerdata.viewableCustomerData.placeofSupply);
                  angular.forEach($scope.customerdata.Statelistdetails, (state) => {
                    if (angular.isDefined(state._id) && state._id === $scope.customerdata.viewableCustomerData.placeofSupply) {
                      $scope.customerdata.viewableCustomerData.statecopy = state;
                    }
                  });
                }
              }

              $scope.assignInvoicetransaction();

              calculateBilltotal().then((billTot) => {
                if (billTot) {
                  calculateTransactiontotal();
                }
              });

              if ($scope.customerdata.Customergroupdetails.length > 0) {
                if (angular.isDefined(data.data.Divisions) && data.data.Divisions !== null && data.data.Divisions.length > 0 &&
                    $scope.customerdata.Measurements.length > 0 && angular.isDefined($scope.customerdata.processfilters) &&
                    $scope.customerdata.processfilters.length > 0) {
                  $scope.customerdata.Measurements = $filter("orderBy")($scope.customerdata.Measurements, "_id");

                  $scope.formatDiscounts(data.data.Divisions);
                } else {
                  angular.forEach($scope.customerdata.Customergroupdetails, (group) => {
                    if (angular.isDefined(group.name) && angular.isDefined(group._id) &&
                        angular.isDefined($scope.customerdata.viewableCustomerData.group) &&
                        $scope.customerdata.viewableCustomerData.group !== null && $scope.customerdata.viewableCustomerData.group === group._id) {
                      $scope.customerdata.currentUserCustomerGroup = angular.copy(group);
                      $scope.customerdata.assignedDiscountGroupName = angular.copy(group.name);
                    }
                  });
                }
              }
            }
          } else {
            Notification.error(data.message);
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  $scope.getOrderno = function (invoiceItem, type) {
    const orderlist = _.uniq(_.flatten(_.pluck(invoiceItem, "order_no")));
    if (type === "ORDERNO") {
      return orderlist[0];
    }
    if (orderlist.length > 1) {
      return orderlist.length - 1;
    }
    return "";
  };

  $scope.assignCustomergsttreatment = function (customer) {
    if (angular.isDefined(customer.gstTreatmentcopy) && customer.gstTreatmentcopy !== null &&
        angular.isDefined(customer.gstTreatmentcopy._id) && customer.gstTreatmentcopy._id !== null) {
      customer.gstin = "";
      // if (customer.gstTreatmentcopy.name === "Overseas" || customer.gstTreatmentcopy.name === "Consumer" ||
      //     customer.gstTreatmentcopy.name === "Unregistered Business") {
      //     customer.gstin = "";
      // }
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

  $scope.assignCustomerGroupToCurrentUser = function (groupData) {
    if (groupData.default === true) {
      angular.forEach($scope.customerdata.Customergroupdetails, (groupValue) => {
        if (groupValue.default === true) {
          $scope.customerdata.selectedCustomerGroup = groupValue;
          $scope.customerdata.assignedDiscountGroupName = groupValue.name;
        }
      });
    } else {
      $scope.customerdata.selectedCustomerGroup = {};
      angular.forEach($scope.customerdata.Customergroupdetails, (groupValue) => {
        if (groupValue._id === groupData._id) {
          $scope.customerdata.selectedCustomerGroup = groupValue;
          $scope.customerdata.assignedDiscountGroupName = groupValue.name;
        }
      });
    }
  };

  $scope.assignDiscountGroupToCurrentCustomer = function (group) {
    if (angular.isUndefined(group)) {
      return true;
    }
    if (angular.isUndefined(group._id) || group._id === null || group._id === "") {
      Notification.error("Discount group not found");
      return true;
    }
    if (angular.isUndefined($scope.customerdata.viewableCustomerData) || $scope.customerdata.viewableCustomerData === null ||
        angular.isUndefined($scope.customerdata.viewableCustomerData._id) ||
        $scope.customerdata.viewableCustomerData._id === null || $scope.customerdata.viewableCustomerData._id === "") {
      Notification.error("Please select customer");
      return true;
    }
    const Obj = {};
    Obj.customerID = $scope.customerdata.viewableCustomerData._id;
    Obj.group = group._id;

    CustomerService.updateGroup(Obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          $scope.customerdata.viewableCustomerData.group = group._id;
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

  $scope.resetCurrentUserDiscountGroup = function () {
    if (angular.isDefined($scope.customerdata.group) && $scope.customerdata.group.length) {
      angular.forEach($scope.customerdata.Customergroupdetails, (groupValue) => {
        if (groupValue._id === $scope.customerdata.group) {
          $scope.customerdata.selectedCustomerGroup = groupValue;
          $scope.customerdata.assignedDiscountGroupName = groupValue.name;
        }
      });
    } else {
      angular.forEach($scope.customerdata.Customergroupdetails, (groupValue) => {
        if (groupValue.default === true) {
          $scope.customerdata.selectedCustomerGroup = groupValue;
          $scope.customerdata.assignedDiscountGroupName = groupValue.name;
        }
      });
    }
  };

  $scope.assignDefaultSelectedLedgertoSelectBox = function () {
    angular.forEach($scope.customerdata.Customergroupdetails, (groupValue) => {
      if (angular.isDefined(groupValue._id) && groupValue._id === $scope.customerdata.group) {
        $scope.customerdata.currentUserCustomerGroup = groupValue;
      }
    });
  };

  $scope.setFavourite = function (customer) {
    if (angular.isDefined(customer) && customer !== null && customer !== "" && angular.isDefined(customer._id)) {
      const obj = {};
      obj._id = angular.copy(customer._id);
      obj.is_favourite = false;
      if (angular.isDefined(customer.is_favourite) && customer.is_favourite !== null) {
        obj.is_favourite = !customer.is_favourite;
      } else if (angular.isUndefined(customer.is_favourite)) {
        obj.is_favourite = true;
      }

      CustomerService.setFavourite(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            angular.forEach($scope.customerdata.list, (cus) => {
              if (angular.isDefined(cus.customers) && cus.customers !== null && cus.customers.length > 0) {
                angular.forEach(cus.customers, (cusdata) => {
                  if (customer._id === cusdata._id) {
                    cusdata.is_favourite = angular.copy(obj.is_favourite);
                  }
                });
              }
            });

            if (angular.isDefined($scope.customerdata) && angular.isDefined($scope.customerdata.viewableCustomerData) &&
                angular.isDefined($scope.customerdata.viewableCustomerData._id) && $scope.customerdata.viewableCustomerData._id === customer._id) {
              $scope.customerdata.viewableCustomerData.is_favourite = angular.copy(obj.is_favourite);
            }
          } else {
            Notification.error(result.message);
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  $scope.paymentcardOpen = function (transaction) { // Payment Toggle Open
    angular.forEach($scope.customerdata.Transactiondetails, (trans) => {
      if (transaction === trans) {
        trans.paymentcardToggle = !trans.paymentcardToggle;
      } else {
        trans.paymentcardToggle = false;
      }
    });
    $scope.data.paymentcardToggle = true;
  };

  $scope.paymentcardClose = function (transaction) { // Payment Toggle Close
    transaction.paymentcardToggle = false;
  };

  // Fetch outwards for the selected customer
  $scope.getDelivery = function (customerID, customerData) {
    if (angular.isDefined(customerData.delivery) && angular.isDefined(customerID) && customerID !== null && customerID !== "") {
      if (customerData.viewableCustomerData.deliveryloadingData) { return; }

      if (angular.isUndefined(customerData.skipdelivery)) { customerData.skipdelivery = []; }

      if (customerData.skipdelivery.length <= 19 && customerData.skipdelivery.length > 0) { return; }

      const objs = {};
      objs.limit = $scope.data.limit;
      objs.skip = customerData.skipdelivery;
      objs.customerID = customerID;

      customerData.viewableCustomerData.deliveryloadingData = true;

      DeliveryService.getOutwardbycustomer(objs, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
            angular.forEach(result.data, (data) => {
              if (angular.isDefined(data) && data !== null && angular.isDefined(data._id)) {
                const obj = {};
                obj._id = data._id;

                customerData.skipdelivery.push(angular.copy(data._id));

                obj.order_id = data.order_id;
                obj.customer_name = data.customer_name;
                obj.order_no = data.order_no;
                obj.order_date = data.order_date;
                obj.order_status = data.order_status;
                obj.delivery_no = data.delivery_no;
                obj.delivery_date = data.delivery_date;
                obj.process = [];
                angular.forEach(data.outward_data, (owd) => {
                  if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
                    angular.forEach(owd.process, (pro) => {
                      if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                        obj.process.push(pro);
                      }
                    });
                  }
                });

                customerData.delivery.push(angular.copy(obj));
              }
            });
          }
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  $scope.customerHightlightshow = function (transData) {
    if (angular.isUndefined(transData) || transData.length === 0) {
      return false;
    }
    let showMenu = false;
    let count = 0;
    angular.forEach(transData, (trs) => {
      if (angular.isDefined(trs.transaction_id) && trs.transaction_id !== "") {
        showMenu = true;
      }
      count += 1;
    });
    if (count === transData.length) {
      return showMenu;
    }
  };

  function setTranshighlight() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Transactiondetails) && $scope.customerdata.Transactiondetails !== null &&
        $scope.customerdata.Transactiondetails.length > 0) {
      angular.forEach($scope.customerdata.Transactiondetails, (allbil, allkey) => {
        allbil.hightlighttrans = false;
        allbil.paymentcardToggle = false;
        allbil.showbill = false;
        if (allkey === $scope.customerdata.Transactiondetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function Transresethighlight(index) {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Transactiondetails) && $scope.customerdata.Transactiondetails !== null &&
        $scope.customerdata.Transactiondetails.length > 0) {
      angular.forEach($scope.customerdata.Transactiondetails, (allbil, allkey) => {
        if (angular.isDefined(allbil.transaction_type) && (allbil.transaction_type === "CREDIT" || allbil.transaction_type === "DEBIT")
                        && angular.isDefined(allbil.hightlighttrans)) {
          allbil.hightlighttrans = false;
        }
        if (index !== allkey) {
          allbil.paymentcardToggle = false;
        }
        allbil.showbill = false;
        if (allkey === $scope.customerdata.Transactiondetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function setBillhighlight(index) {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Billdetails) && $scope.customerdata.Billdetails !== null &&
        $scope.customerdata.Billdetails.length > 0) {
      angular.forEach($scope.customerdata.Billdetails, (allbil, allkey) => {
        if (angular.isDefined(allbil.hightlighttrans)) {
          allbil.hightlighttrans = false;
        }
        if (index !== allkey) {
          allbil.viewInvoice = false;
        }
        allbil.showhighlight = false;
        if (allkey === $scope.customerdata.Billdetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function Billresethighlight() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Billdetails) && $scope.customerdata.Billdetails !== null &&
        $scope.customerdata.Billdetails.length > 0) {
      angular.forEach($scope.customerdata.Billdetails, (allbil, allkey) => {
        if (angular.isDefined(allbil.hightlighttrans)) {
          allbil.hightlighttrans = false;
          allbil.viewInvoice = false;
        }
        allbil.showhighlight = false;
        if (allkey === $scope.customerdata.Billdetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  $scope.highlightTransaction = function (trans) {
    const index = $scope.customerdata.Billdetails.indexOf(trans);
    setTranshighlight().then((trns) => {
      if (trns !== null && trns) {
        setBillhighlight(index).then((bil) => {
          if (bil !== null && bil && angular.isDefined(trans.transactions)) {
            angular.forEach(trans.transactions, (trs) => {
              if (angular.isDefined(trs.transaction_id)) {
                angular.forEach($scope.customerdata.Transactiondetails, (allbil) => {
                  if (angular.isDefined(allbil.transaction_type) && (allbil.transaction_type === "CREDIT" ||
                    allbil.transaction_type === "DEBIT") && trs.transaction_id === allbil._id) {
                    trans.showhighlight = true;
                    allbil.hightlighttrans = true;
                    trans.hightlighttrans = true;
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  $scope.highlightBills = function (trans) {
    const index = $scope.customerdata.Transactiondetails.indexOf(trans);
    Billresethighlight().then((bil) => {
      if (bil !== null && bil) {
        Transresethighlight(index).then((trns) => {
          if (trns !== null && trns && angular.isDefined(trans.bills)) {
            angular.forEach(trans.bills, (trs) => {
              if (angular.isDefined(trs.bill_no)) {
                angular.forEach($scope.customerdata.Billdetails, (allbil) => {
                  if (angular.isDefined(allbil._id) && trs.bill_id === allbil._id) {
                    trans.showbill = true;
                    allbil.hightlighttrans = true;
                    trans.hightlighttrans = true;
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  $scope.restoreBills = function (trans) {
    const index = $scope.customerdata.Transactiondetails.indexOf(trans);
    angular.forEach($scope.customerdata.Billdetails, (allbil) => {
      allbil.hightlighttrans = false;
      allbil.viewInvoice = false;
    });
    angular.forEach($scope.customerdata.Transactiondetails, (allbil, allkey) => {
      allbil.hightlighttrans = false;
      if (index !== allkey) {
        allbil.paymentcardToggle = false;
      }
      allbil.showbill = false;
    });
    trans.showbill = false;
  };

  $scope.restoreTransaction = function (trans) {
    const index = $scope.customerdata.Billdetails.indexOf(trans);
    angular.forEach($scope.customerdata.Transactiondetails, (allbil) => {
      allbil.hightlighttrans = false;
      allbil.paymentcardToggle = false;
      trans.showhighlight = false;
    });
    angular.forEach($scope.customerdata.Billdetails, (allbil, allkey) => {
      allbil.hightlighttrans = false;
      if (index !== allkey) {
        allbil.viewInvoice = false;
      }
    });
    trans.showhighlight = false;
  };

  $scope.printThisinvoice = function (invoice) {
    if (angular.isDefined(invoice) && invoice !== null && angular.isDefined(invoice._id)) {
      InvoiceService.printInvoicedata(invoice._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.Invoicedata) && result.data.Invoicedata !== null && angular.isDefined(result.data.Invoicedata._id)) {
          const templateUrl = $sce.getTrustedResourceUrl("app/views/common/invoice_print.html");
          invoiceDetail = result.data;
          currency = $scope.data.currency;
          window.open(templateUrl, "_blank");
        } else {
          Notification.error("Invoice not found.");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };
  
  $scope.customerPaymentReceive = function (customerData) {
    if (angular.isDefined(customerData) && customerData !== null && angular.isDefined(customerData._id) && angular.isDefined(customerData.division_id) && 
            customerData._id !== null && customerData.division_id !== null && customerData.division_id.length>0) {
      const obj = {};
      obj.division_id = customerData.division_id[0];
      obj.customer_id = customerData._id;
      accountsService.setPaymentdetail(obj);
      $location.path(`/${angular.lowercase($rootScope.currentapp)}/accounts`);
    }
  }
  
  $scope.printCustomertransaction = function (customerData) {
    if(angular.isDefined($scope.customerdata) && $scope.customerdata !== null && angular.isDefined(customerData) && customerData !== null && 
            angular.isDefined(customerData._id) && angular.isDefined(customerData.name) && customerData.name !== null && customerData.name !== "") {
        const templateUrl = $sce.getTrustedResourceUrl("app/views/common/customer_statement.html");
        customerstatment = {};
        customerstatment.name = customerData.name;
        customerstatment.Totalorder = $scope.customerdata.Totalorder;
        customerstatment.Totalreceived = $scope.customerdata.Totalreceived;
        customerstatment.Totalspend = $scope.customerdata.Totalspend;
        customerstatment.Totalpending = $scope.customerdata.Totalpending;
        customerstatment.Transactiondetails = [];
        if (angular.isDefined($scope.customerdata.Billdetails) && $scope.customerdata.Billdetails.length>0) {
          customerstatment.Transactiondetails = customerstatment.Transactiondetails.concat($scope.customerdata.Billdetails);
        }
        if (angular.isDefined($scope.customerdata.Transactiondetails) && $scope.customerdata.Transactiondetails.length>0) {
          customerstatment.Transactiondetails = customerstatment.Transactiondetails.concat($scope.customerdata.Transactiondetails);
        }
        if (angular.isDefined($scope.customerdata.openingbalancedetails) && $scope.customerdata.openingbalancedetails.length>0) {
          customerstatment.Transactiondetails = customerstatment.Transactiondetails.concat($scope.customerdata.openingbalancedetails);
        }
        
        customerstatment.currency = $scope.data.currency;
        $timeout(() => {
           window.open(templateUrl, "_blank");
        }, 500);
    }
  }
});
