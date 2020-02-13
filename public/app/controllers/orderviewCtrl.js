/* global parseFloat */
/* global _ */
/* global angular */
angular.module("orderviewCtrl", []).controller("OrderviewController", ($scope, $rootScope, $routeParams, $filter, $sce, Notification,
  commonobjectService, OrderService, InwardService, ActivityService, orderviewService, InvoiceService, $timeout, $q, validateField,
  DateformatstorageService, ContractorService, DATEFORMATS, $location) => {
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.commonObject = commonobjectService;
  $scope.dateformats = {};
  $scope.dateformats = DATEFORMATS;

  // Codes scope variables
  $scope.orderviewData = {};
  $scope.orderviewData.currency = commonobjectService.getCurrency();
  $scope.orderviewData.pageLoader = true;
  $scope.orderviewData.orderDetail = {};
  $scope.orderviewData.orderForm = {};
  $scope.orderviewData.inwardForm = [];
  $scope.orderviewData.order_status = [];
  $scope.orderviewData.outward_status = [{color:"blue", name:"In Progress"},{color:"green", name:"Completed"}];
  $scope.orderviewData.outwardForm = {};
  $scope.orderviewData.contractoutwardForm = {};
  $scope.orderviewData.contractinwardForm = {};
  $scope.orderviewData.invoiceForm = {};
  $scope.orderviewData.labReportlist = [];
  $scope.orderviewData.labReportsummarylist = [];
  $scope.orderviewData.labReport = {};
  $scope.orderviewData.labReportsummary = {};
  $scope.orderviewData.specialPrice = [];
  $scope.orderviewData.editreport = -1;
  $scope.orderviewData.editsummary = -1;

  $scope.orderviewData.pageLoad = true;
  $scope.orderviewData.contentLoad = false;
  $scope.orderviewData.eventLoad = false;

  $scope.orderviewData.currentMenu = "";
  $scope.orderviewData.card = "";

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

  function setSpecialpricedata(priceDetails) {
    if (angular.isDefined($scope.orderviewData.measurement) && $scope.orderviewData.measurement !== null &&
        $scope.orderviewData.measurement.length > 0) {
      angular.forEach($scope.orderviewData.inwardForm, (inwardData) => {
        if (angular.isDefined(inwardData) && inwardData !== null && angular.isDefined(inwardData.inward_data)) {
          angular.forEach(inwardData.inward_data, (inward) => {
            if (angular.isDefined(inward) && inward !== null && angular.isDefined(inward.process) && inward.process !== null &&
                inward.process.length > 0) {
              angular.forEach(inward.process, (data) => {
                if (angular.isDefined(data) && data !== null && angular.isDefined(data.process_id) && angular.isDefined(data.process_name)) {
                  const results = $filter("filter")($scope.orderviewData.specialPrice, {process_id: data.process_id}, true);
                  if (results && results.length === 0) {
                    const obj = {};
                    obj.process_id = angular.copy(data.process_id);
                    obj.process_name = angular.copy(data.process_name);
                    obj.units = [];
                    angular.forEach($scope.orderviewData.measurement, (units, index) => {
                      let pricelen = 0;

                      const measure = {};
                      measure.measurement_id = angular.copy(units._id);
                      measure.qty = "";
                      measure.price = "";
                      angular.forEach(priceDetails, (existPrice, eind) => {
                        if (angular.isDefined(units) && units !== null && angular.isDefined(units._id) && angular.isDefined(units.fabric_measure)) {
                          if (angular.isDefined(existPrice) && existPrice !== null && angular.isDefined(existPrice._id) &&
                            data.process_id === existPrice.process_id && units._id === existPrice.measurement_id) {
                            measure._id = angular.copy(existPrice._id);
                            measure.qty = angular.copy(parseFloat(existPrice.qty).toFixed(2));
                            measure.price = angular.copy(parseFloat(existPrice.price).toFixed(2));
                          }
                          if (eind === priceDetails.length - 1) {
                            obj.units.push(measure);
                          }
                        }
                        pricelen += 1;
                      });
                      if (index === $scope.orderviewData.measurement.length - 1 && pricelen === priceDetails.length) {
                        $scope.orderviewData.specialPrice.push(obj);
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    }
  }

  function setSpecialpriceempty() {
    if (angular.isDefined($scope.orderviewData.measurement) && $scope.orderviewData.measurement !== null &&
        $scope.orderviewData.measurement.length > 0) {
      angular.forEach($scope.orderviewData.inwardForm, (inwardData) => {
        if (angular.isDefined(inwardData) && inwardData !== null && angular.isDefined(inwardData.inward_data)) {
          angular.forEach(inwardData.inward_data, (inward) => {
            if (angular.isDefined(inward) && inward !== null && angular.isDefined(inward.process) && inward.process !== null &&
                inward.process.length > 0) {
              angular.forEach(inward.process, (data) => {
                if (angular.isDefined(data) && data !== null && angular.isDefined(data.process_id) && angular.isDefined(data.process_name)) {
                  const results = $filter("filter")($scope.orderviewData.specialPrice, {process_id: data.process_id}, true);
                  if (results && results.length === 0) {
                    const obj = {};
                    obj.process_id = angular.copy(data.process_id);
                    obj.process_name = angular.copy(data.process_name);
                    obj.units = [];
                    angular.forEach($scope.orderviewData.measurement, (units, index) => {
                      if (angular.isDefined(units) && units !== null && angular.isDefined(units._id) && angular.isDefined(units.fabric_measure)) {
                        const measure = {};
                        measure.measurement_id = angular.copy(units._id);
                        measure.qty = "";
                        measure.price = "";
                        obj.units.push(measure);
                      }
                      if (index === $scope.orderviewData.measurement.length - 1) {
                        $scope.orderviewData.specialPrice.push(obj);
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    }
  }

  function getoutwards(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.orderviewData.orderDetail.inwards[0].inward_data, (inward) => {
      inward.deliveredrolls = 0;
      inward.deliveredweight = 0;
      if (angular.isUndefined($scope.orderviewData.orderDetail.inwards[0].total_delivered_weight)) {
        $scope.orderviewData.orderDetail.inwards[0].total_delivered_weight = 0;
      }
      if (angular.isUndefined($scope.orderviewData.orderDetail.inwards[0].total_delivered_roll)) {
        $scope.orderviewData.orderDetail.inwards[0].total_delivered_roll = 0;
      }
      if (angular.isDefined(outwards) && outwards.length > 0) {
        angular.forEach(outwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) &&
            outdata.inward_id === $scope.orderviewData.orderDetail.inwards[0]._id &&
            outdata.inward_data_id === inward._id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.delivery_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.delivery_roll)) {
            inward.deliveredrolls = parseInt(inward.deliveredrolls) + parseInt(outdata.delivery_roll);
            inward.deliveredweight = parseFloat(inward.deliveredweight) + parseFloat(outdata.delivery_weight);
            $scope.orderviewData.orderDetail.inwards[0].total_delivered_roll += parseInt(outdata.delivery_roll);
            $scope.orderviewData.orderDetail.inwards[0].total_delivered_weight += parseFloat(outdata.delivery_weight);
          }
          if (odx === outwards.length - 1) {
            outwardCount += 1;
          }
        });
      } else {
        outwardCount += 1;
      }
    });

    if (outwardCount === $scope.orderviewData.orderDetail.inwards[0].inward_data.length) {
      deferred.resolve($scope.orderviewData.orderDetail.inwards[0].inward_data);
    }

    return deferred.promise;
  }

  function getDeliverylist(outwards) {
    const deferred = $q.defer();
    const deliverylist = [];
    let outwardCount = 0;
    const inwardDetails = $scope.orderviewData.orderDetail.inwards[0];
    angular.forEach(inwardDetails.inward_data, (inward) => {
      if (angular.isDefined(inward.weight)) {
        let recweight = parseFloat(inward.weight);
        if (angular.isDefined(outwards) && outwards.length > 0) {
          angular.forEach(outwards, (outdata, odx) => {
            if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) && outdata.inward_id === inwardDetails._id &&
              outdata.inward_data_id === inward._id && angular.isDefined(inward.weight) &&
              angular.isDefined(outdata.delivery_weight)) {
              recweight -= parseFloat(outdata.delivery_weight);
              const obj = outdata;
              obj.datesort = outdata;
              obj.balance_weight = recweight;

              deliverylist.push(obj);
            }
            if (odx === outwards.length - 1) {
              outwardCount += 1;
            }
          });
        } else {
          outwardCount += 1;
        }
      }
    });

    if (outwardCount === inwardDetails.inward_data.length) {
      deferred.resolve(deliverylist);
    }

    return deferred.promise;
  }

  function getreturns(outwards) {
    const deferred = $q.defer();
    let outwardCount = 0;
    angular.forEach($scope.orderviewData.orderDetail.inwards[0].inward_data, (inward) => {
      inward.returnrolls = 0;
      inward.returnweight = 0;
      if (angular.isUndefined($scope.orderviewData.orderDetail.inwards[0].total_delivered_weight)) {
        $scope.orderviewData.orderDetail.inwards[0].total_delivered_weight = 0;
      }
      if (angular.isUndefined($scope.orderviewData.orderDetail.inwards[0].total_delivered_roll)) {
        $scope.orderviewData.orderDetail.inwards[0].total_delivered_roll = 0;
      }
      if (angular.isDefined(outwards) && outwards.length > 0) {
        angular.forEach(outwards, (outdata, odx) => {
          if (angular.isDefined(outdata.inward_id) && angular.isDefined(outdata.inward_data_id) &&
            outdata.inward_id === $scope.orderviewData.orderDetail.inwards[0]._id &&
            outdata.inward_data_id === inward._id && angular.isDefined(inward.weight) &&
            angular.isDefined(outdata.delivery_weight) && angular.isDefined(inward.rolls) && angular.isDefined(outdata.delivery_roll)) {
            inward.returnrolls = parseInt(inward.returnrolls) + parseInt(outdata.delivery_roll);
            inward.returnweight = parseFloat(inward.returnweight) + parseFloat(outdata.delivery_weight);
            $scope.orderviewData.orderDetail.inwards[0].total_delivered_roll += parseInt(outdata.delivery_roll);
            $scope.orderviewData.orderDetail.inwards[0].total_delivered_weight += parseFloat(outdata.delivery_weight);
          }
          if (odx === outwards.length - 1) {
            outwardCount += 1;
          }
        });
      } else {
        outwardCount += 1;
      }
    });

    if (outwardCount === $scope.orderviewData.orderDetail.inwards[0].inward_data.length) {
      deferred.resolve($scope.orderviewData.orderDetail.inwards[0].inward_data);
    }

    return deferred.promise;
  }
  
  $scope.getOrderdetail = function () {
    let specialPrice = [];
    const orderDetail = angular.copy(orderviewService.getOrder());
    const users = angular.copy(orderviewService.getUsers());
    let outwardList = [];
    let returnList = [];
    let deliveryDetails = [];

    if (orderDetail !== null && angular.isDefined(orderDetail._id)) {
      orderviewService.setOrder({});
      orderviewService.setUsers([]);
      $scope.orderviewData.contractoutwardForm = {};
      $scope.orderviewData.contractinwardForm = {};
      $scope.orderviewData.outwardForm = {};
      
      let orderdelivery = angular.copy(orderDetail.outward_delivery);
      const retundel = angular.copy(orderDetail.return_delivery);
      orderdelivery = orderdelivery.concat(retundel);

      angular.forEach(orderdelivery, (delivery) => {
        if (angular.isDefined(delivery) && delivery !== null && angular.isDefined(delivery._id) && angular.isDefined(delivery.outward_data) &&
                angular.isDefined(delivery.delivery_date) && delivery.outward_data.length > 0) {
          angular.forEach(delivery.outward_data, (outwards) => {
            const odata = outwards;
            odata.delivery_id = delivery._id;
            odata.delivery_date = delivery.delivery_date;
            odata.delivery_no = delivery.delivery_no;
            odata.is_return = delivery.is_return;
            deliveryDetails.push(odata);
          });
        }
      });

      $scope.orderviewData.followpUserlist = [];
      $scope.orderviewData.orderDetail = orderDetail;
      $scope.orderviewData.orderDetail.order_id = orderDetail._id;
      $scope.orderviewData.order_delivery = [];
      $scope.orderviewData.contract_outward = [];
      $scope.orderviewData.contract_inward = [];

      $scope.orderviewData.order_status = angular.copy(orderviewService.getOrderstatus());
      $scope.orderviewData.measurement = angular.copy(orderviewService.getMeasurement());
      $scope.orderviewData.invoiceForm = angular.copy(orderviewService.getInvoice());
      $scope.orderviewData.contract_outward = angular.copy(orderviewService.getOutwards());
      $scope.orderviewData.contract_inward = angular.copy(orderviewService.getInwards());
      $scope.orderviewData.customerDetail = angular.copy(orderviewService.getCustomer());
      specialPrice = angular.copy(orderviewService.getSpecialprice());
      
      if (angular.isDefined(orderDetail.outward_delivery) && orderDetail.outward_delivery !== null && orderDetail.outward_delivery.length > 0) {
        outwardList = _.flatten(_.pluck(orderDetail.outward_delivery, "outward_data"));
      }
      if (angular.isDefined(orderDetail.return_delivery) && orderDetail.return_delivery !== null && orderDetail.return_delivery.length > 0) {
        returnList = _.flatten(_.pluck(orderDetail.return_delivery, "outward_data"));
      }

      deliveryDetails = $filter('orderBy')(deliveryDetails, 'delivery_date');
      
      if (returnList === null || returnList === "" || returnList.length === 0) {
        getoutwards(outwardList).then((outwardDara) => {

        });
      } else if (outwardList === null || outwardList === "" || outwardList.length === 0) {
        getreturns(returnList).then((returnDara) => {

        });
      } else {
        getoutwards(outwardList).then((outwardDara) => {
          getreturns(returnList).then((returnDara) => {

          });
        });
      }
      getDeliverylist(deliveryDetails).then((dellist) => {
        if (angular.isDefined(dellist) && dellist !== null && dellist.length > 0) {
          $scope.orderviewData.order_delivery = angular.copy(dellist);
        }
      });

      if (angular.isDefined(orderDetail.inwards) && orderDetail.inwards !== null && orderDetail.inwards.length > 0) {
        $scope.orderviewData.inwardForm.push(orderDetail.inwards[0]);
        if (angular.isDefined(specialPrice) && specialPrice !== null && specialPrice.length > 0) {
          specialPrice = setSpecialpricedata(specialPrice);
        } else {
          specialPrice = setSpecialpriceempty();
        }
      }

      if ($scope.orderviewData.selectedmenu === "OUTWARDRETURN") {
        $scope.selectDeliveryreturn("");
      } else {
        $scope.selectDelivery("");
      }
            
      $scope.selectOutward("");
      $scope.selectInward("");
      
      if (angular.isDefined($scope.orderviewData.orderDetail.division_id) && $scope.orderviewData.orderDetail.division_id !== null &&
        $scope.orderviewData.orderDetail.division_id !== "" && angular.isDefined(users) && users !== null && users !== "" &&
        users.length > 0) {
        angular.forEach(users, (user) => {
          if (user !== null && angular.isDefined(user._id) && user._id !== null && user._id !== "" &&
            angular.isDefined(user.division) && user.division !== null && user.division !== "" &&
            user.division === $scope.orderviewData.orderDetail.division_id) {
            const obj = {};
            obj.user_id = user._id;
            obj.name = user.name;
            obj.mobile_no = user.mobile_no;
            $scope.orderviewData.followpUserlist.push(angular.copy(obj));
          }
        });
      }
      
      orderviewService.setOrderstatus();
      orderviewService.setMeasurement();
      orderviewService.setInvoice();
      orderviewService.setOutwards();
      orderviewService.setInwards();
      orderviewService.setSpecialprice();
    }
  };

  $scope.printThisbill = function () {
    orderData = {};
    const templateUrl = $sce.getTrustedResourceUrl("app/views/common/order_print.html");
    orderData = $scope.orderviewData.orderDetail;
    orderData.inwardData = $scope.orderviewData.inwardForm[0].inward_data;
    orderData.customerDetail = $scope.orderviewData.customerDetail;
    currency = $scope.orderviewData.currency;
    window.open(templateUrl, "_blank");
  };
  
  $scope.printThisorder = function () {
    jobData = {};
    const templateprintUrl = $sce.getTrustedResourceUrl("app/views/common/jobcard_print.html");
    jobData.orderData = angular.copy($scope.orderviewData.orderDetail);
    jobData.inwardData = angular.copy($scope.orderviewData.inwardForm[0]);
    jobData.deliveryData = angular.copy($scope.orderviewData.order_delivery);
    currency = $scope.orderviewData.currency;
    window.open(templateprintUrl, "_blank");
  };
  
  $scope.editOrderflag =  function () {
    if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null && 
            angular.isDefined($scope.orderviewData.orderDetail._id)) {
      if (angular.isDefined($scope.orderviewData.contract_outward) && $scope.orderviewData.contract_outward.length>0) {
        return false;
      }
      if ((angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) && $scope.orderviewData.orderDetail.outward_delivery.length>0) || 
              (angular.isDefined($scope.orderviewData.orderDetail.return_delivery) && $scope.orderviewData.orderDetail.return_delivery.length>0)) {
        return false;
      } 
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  
  $scope.editThisbill = function () {
    if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null && 
            angular.isDefined($scope.orderviewData.orderDetail._id)) {
      if (angular.isDefined($scope.orderviewData.contract_outward) && $scope.orderviewData.contract_outward.length>0) {
        return false;
      }
      if ((angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) && $scope.orderviewData.orderDetail.outward_delivery.length>0) || 
              (angular.isDefined($scope.orderviewData.orderDetail.return_delivery) && $scope.orderviewData.orderDetail.return_delivery.length>0)) {
        return false;
      } 
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        if ($scope.orderviewData.orderDetail.order_status === "In Progress") {
          Notification.error("You cannot edit the order in In Progress status");
        } else {          
          $location.path(`/divisionadmin/orderedit/${$scope.orderviewData.orderDetail._id}`);
        }
      }
    } else {
      return false;
    }
  }
  
  $scope.deliveryFlag = function (outward) {
    if (angular.isDefined(outward) && outward !== null && angular.isDefined(outward._id)) {
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }  
  
  $scope.editThisdelivery = function () {
    if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null && 
            angular.isDefined($scope.orderviewData.orderDetail._id)) {
      if (angular.isUndefined($scope.orderviewData.outwardForm) || $scope.orderviewData.outwardForm === null || 
              angular.isUndefined($scope.orderviewData.outwardForm._id)) {
        return false;
      }
      
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        if ($scope.orderviewData.selectedmenu === "OUTWARD") {
          $location.path(`/divisionadmin/deliveryedit/${$scope.orderviewData.outwardForm._id}`);
        } else {
          $location.path(`/divisionadmin/returnedit/${$scope.orderviewData.outwardForm._id}`);
        }
      }
    } else {
      return false;
    }
  }
  
  $scope.outwardFlag = function (outward) {
    if (angular.isDefined(outward) && outward !== null && angular.isDefined(outward._id)) {
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery" || 
              outward.outward_status !== "In Progress") {
        return false;
      } else {
        if (angular.isDefined($scope.orderviewData.contract_inward) && $scope.orderviewData.contract_inward !== null && 
                $scope.orderviewData.contract_inward.length>0) {
          const outwardData = $filter("filter")($scope.orderviewData.contract_inward, {outward_id: outward._id });
          if (outwardData === null || outwardData.length ===0) {
            return true;  
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  }
  
  $scope.editThisoutward = function () {
    if (angular.isDefined($scope.orderviewData.contractoutwardForm) && $scope.orderviewData.contractoutwardForm !== null && 
            angular.isDefined($scope.orderviewData.contractoutwardForm._id)) {
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        if (angular.isDefined($scope.orderviewData.contract_inward) && $scope.orderviewData.contract_inward !== null && 
                $scope.orderviewData.contract_inward.length>0) {
          const outwardData = $filter("filter")($scope.orderviewData.contract_inward, {outward_id: $scope.orderviewData.contractoutwardForm._id });
          if (outwardData === null || outwardData.length ===0) {
            $location.path(`/divisionadmin/contract/outwardedit/${$scope.orderviewData.contractoutwardForm._id}`);
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  }
  
  $scope.inwardFlag = function (outward) {
    if (angular.isDefined(outward) && outward !== null && angular.isDefined(outward._id)) {
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        if (angular.isDefined($scope.orderviewData.contract_outward) && $scope.orderviewData.contract_outward !== null && 
                $scope.orderviewData.contract_outward.length>0) {
          const outwardData = $filter("filter")($scope.orderviewData.contract_outward, {_id: outward.outward_id });
          
          if (outwardData !== null && outwardData.length === 1 && outwardData[0].outward_status === "In Progress") {
            return true;  
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  
  $scope.editThisinward = function () {
    if (angular.isDefined($scope.orderviewData.contractinwardForm) && $scope.orderviewData.contractinwardForm !== null && 
            angular.isDefined($scope.orderviewData.contractinwardForm._id)) {
      if ($scope.orderviewData.orderDetail.order_status === "Completed" || $scope.orderviewData.orderDetail.order_status === "Invoice and Delivery") {
        return false;
      } else {
        if (angular.isDefined($scope.orderviewData.contract_outward) && $scope.orderviewData.contract_outward !== null && 
                $scope.orderviewData.contract_outward.length>0) {
          const outwardData = $filter("filter")($scope.orderviewData.contract_outward, {_id: $scope.orderviewData.contractinwardForm.outward_id });
          if (outwardData !== null && outwardData.length === 1 && outwardData[0].outward_status === "In Progress") {
            $location.path(`/divisionadmin/contract/inwardedit/${$scope.orderviewData.contractinwardForm._id}`);
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  
  $scope.printThisinvoice = function (invoice) {
    if (angular.isDefined(invoice) && invoice !== null && angular.isDefined(invoice._id)) {
      InvoiceService.printInvoicedata(invoice._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.Invoicedata) && result.data.Invoicedata !== null && angular.isDefined(result.data.Invoicedata._id)) {
          const templateUrl = $sce.getTrustedResourceUrl("app/views/common/invoice_print.html");
          invoiceDetail = result.data;
          currency = $scope.orderviewData.currency;
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

  $scope.printThisdelivery = function () {
    const prData = {};
    prData._id = $scope.orderviewData.outwardForm._id;
    if (angular.isDefined($scope.orderviewData.outwardForm.vehicle_no)) {
      prData.vehicle_no = $scope.orderviewData.outwardForm.vehicle_no;
    }
    prData.customer_name = $scope.orderviewData.outwardForm.customer_name;
    prData.customer_mobile_no = $scope.orderviewData.outwardForm.customer_mobile_no;
    
    prData.billing_address_line = $scope.orderviewData.outwardForm.billing_address_line;
    prData.billing_area = $scope.orderviewData.outwardForm.billing_area;
    prData.billing_city = $scope.orderviewData.outwardForm.billing_city;
    prData.billing_pincode = $scope.orderviewData.outwardForm.billing_pincode;
    prData.billing_state = $scope.orderviewData.outwardForm.billing_state;
    prData.delivery_company_name = angular.isDefined($scope.orderviewData.outwardForm.delivery_company_name) ? $scope.orderviewData.outwardForm.delivery_company_name : "";
    if (angular.isDefined($scope.orderviewData.outwardForm.delivery_address_line)) {
      prData.delivery_address_line = $scope.orderviewData.outwardForm.delivery_address_line;
      prData.delivery_city = $scope.orderviewData.outwardForm.delivery_city;
      prData.delivery_company_name = $scope.orderviewData.outwardForm.delivery_company_name;
      prData.delivery_pincode = $scope.orderviewData.outwardForm.delivery_pincode;
      prData.delivery_state = $scope.orderviewData.outwardForm.delivery_state;
    }
    prData.outwardData = $scope.orderviewData.outwardForm.outward_data;
    prData.dyeing = $scope.orderviewData.orderDetail.dyeing;
    prData.dyeing_dc_no = $scope.orderviewData.orderDetail.dyeing_dc_no;
    prData.customer_dc_no = $scope.orderviewData.orderDetail.customer_dc_no;
    prData.order_no = $scope.orderviewData.orderDetail.order_no;
    currency = $scope.orderviewData.currency;

    if ($scope.orderviewData.selectedmenu === "OUTWARD") {
      const templateUrl = $sce.getTrustedResourceUrl("app/views/common/order_delivery.html");
      delData = {};
      delData = prData;
      delData.delivery_no = $scope.orderviewData.outwardForm.delivery_no;
      delData.delivery_date = $scope.orderviewData.outwardForm.delivery_date;
      delData.customerDetail = $scope.orderviewData.customerDetail;
      window.open(templateUrl, "_blank");
    }
    if ($scope.orderviewData.selectedmenu === "OUTWARDRETURN") {
      const templateUrlret = $sce.getTrustedResourceUrl("app/views/common/order_return.html");
      retData = {};
      retData = prData;
      retData.delivery_no = $scope.orderviewData.outwardForm.delivery_no;
      retData.delivery_date = $scope.orderviewData.outwardForm.delivery_date;
      retData.customerDetail = $scope.orderviewData.customerDetail;
      window.open(templateUrlret, "_blank");
    }
  };
  
  $scope.printThisoutward = function () {
    const tempUrl = $sce.getTrustedResourceUrl("app/views/common/contractor_outward.html");
    outData = $scope.orderviewData.contractoutwardForm;
    outData.outwardData = $scope.orderviewData.contractoutwardForm.outward_data;
    outData.customerDetail = $scope.orderviewData.customerDetail;
    window.open(tempUrl, "_blank");
  };
  
  $scope.printThisinward = function () {
    const tUrl = $sce.getTrustedResourceUrl("app/views/common/contractor_inward.html");
    inData = $scope.orderviewData.contractinwardForm;
    inData.inwardData = $scope.orderviewData.contractinwardForm.inward_data;
    inData.customerDetail = $scope.orderviewData.customerDetail;
    
    window.open(tUrl, "_blank");
  };

  $scope.updateOrderfollowup = function (orderdata) {
    if (angular.isDefined(orderdata) && orderdata !== "" && angular.isDefined(orderdata.order_id) &&
        angular.isDefined(orderdata.followupPerson) && orderdata.followupPerson !== null &&
        angular.isDefined(orderdata.followupPerson.user_id)) {
      const obj = {};
      obj._id = angular.copy(orderdata.order_id);
      obj.followupPerson = angular.copy(orderdata.followupPerson);
      $scope.orderviewData.followuploader = true;

      OrderService.updateOrderfollowup(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            Notification.success(result.message);
          } else {
            Notification.error(result.message);
          }
        }
        $scope.orderviewData.followuploader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.orderviewData.followuploader = false;
      });
    }
  };

  $scope.selectDelivery = function () {
    if (angular.isDefined($scope.orderviewData.selectedmenu) && $scope.orderviewData.selectedmenu === "OUTWARD" &&
        $scope.orderviewData.orderDetail !== null && angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) &&
        $scope.orderviewData.orderDetail.outward_delivery.length > 0) {
      $scope.orderviewData.outwardForm = {};
      if (angular.isDefined($scope.orderviewData.currentdelivery) && $scope.orderviewData.currentdelivery !== null &&
        $scope.orderviewData.currentdelivery !== "") {
        angular.forEach($scope.orderviewData.orderDetail.outward_delivery, (delivery) => {
          if (angular.isDefined(delivery) && delivery !== null && angular.isDefined(delivery._id) &&
            $scope.orderviewData.currentdelivery === delivery._id) {
            $scope.orderviewData.outwardForm = angular.copy(delivery);
          }
        });
      } else {
        $scope.orderviewData.outwardForm = angular.copy($scope.orderviewData.orderDetail.outward_delivery[0]);
      }
    }
  };

  $scope.selectDeliveryreturn = function () {
    if (angular.isDefined($scope.orderviewData.selectedmenu) && $scope.orderviewData.selectedmenu === "OUTWARDRETURN" &&
        $scope.orderviewData.orderDetail !== null && angular.isDefined($scope.orderviewData.orderDetail.return_delivery) &&
        $scope.orderviewData.orderDetail.return_delivery.length > 0) {
      $scope.orderviewData.outwardForm = {};
      if (angular.isDefined($scope.orderviewData.currentdelivery) && $scope.orderviewData.currentdelivery !== null &&
        $scope.orderviewData.currentdelivery !== "") {
        angular.forEach($scope.orderviewData.orderDetail.return_delivery, (delivery) => {
          if (angular.isDefined(delivery) && delivery !== null && angular.isDefined(delivery._id) &&
            $scope.orderviewData.currentdelivery === delivery._id) {
            $scope.orderviewData.outwardForm = angular.copy(delivery);
          }
        });
      } else {
        $scope.orderviewData.outwardForm = angular.copy($scope.orderviewData.orderDetail.return_delivery[0]);
      }
    }
  };
  
  $scope.selectOutward = function () {
    if (angular.isDefined($scope.orderviewData.selectedmenu) && $scope.orderviewData.selectedmenu === "CONTRACTOUTWARD" &&
        angular.isDefined($scope.orderviewData.contract_outward) && $scope.orderviewData.contract_outward !== null &&
        $scope.orderviewData.contract_outward.length > 0) {
      $scope.orderviewData.contractoutwardForm = {};
      if (angular.isDefined($scope.orderviewData.currentoutward) && $scope.orderviewData.currentoutward !== null &&
        $scope.orderviewData.currentoutward !== "") {
        angular.forEach($scope.orderviewData.contract_outward, (delivery) => {
          if (angular.isDefined(delivery) && delivery !== null && angular.isDefined(delivery._id) &&
            $scope.orderviewData.currentoutward === delivery._id) {
            $scope.orderviewData.contractoutwardForm = angular.copy(delivery);
          }
        });
      } else {
        $scope.orderviewData.contractoutwardForm = angular.copy($scope.orderviewData.contract_outward[0]);
      }
    }
  };
  
  
  $scope.selectInward = function () {
    if (angular.isDefined($scope.orderviewData.selectedmenu) && $scope.orderviewData.selectedmenu === "CONTRACTINWARD" &&
        angular.isDefined($scope.orderviewData.contract_inward) && $scope.orderviewData.contract_inward !== null &&
        $scope.orderviewData.contract_inward.length > 0) {
      $scope.orderviewData.contractinwardForm = {};
      if (angular.isDefined($scope.orderviewData.currentinward) && $scope.orderviewData.currentinward !== null &&
        $scope.orderviewData.currentinward !== "") {
        angular.forEach($scope.orderviewData.contract_inward, (delivery) => {
          if (angular.isDefined(delivery) && delivery !== null && angular.isDefined(delivery._id) &&
            $scope.orderviewData.currentinward === delivery._id) {
            $scope.orderviewData.contractinwardForm = angular.copy(delivery);
          }
        });
      } else {
        $scope.orderviewData.contractinwardForm = angular.copy($scope.orderviewData.contract_inward[0]);
      }
    }
  };

  $scope.viewDelivery = function (delivery) {
    if (angular.isDefined(delivery) && angular.isDefined(delivery._id)) {
      $scope.orderviewData.selectedmenu = "OUTWARD";
      $scope.orderviewData.currentdelivery = angular.copy(delivery._id);
      $scope.selectDelivery();
    }
  };

  $scope.viewDeliveryreturn = function (delivery) {
    if (angular.isDefined(delivery) && angular.isDefined(delivery._id)) {
      $scope.orderviewData.selectedmenu = "OUTWARDRETURN";
      $scope.orderviewData.currentdelivery = angular.copy(delivery._id);
      $scope.selectDeliveryreturn();
    }
  };
  
  $scope.viewContractoutward = function (delivery) {
    if (angular.isDefined(delivery) && angular.isDefined(delivery._id)) {
      $scope.orderviewData.selectedmenu = "CONTRACTOUTWARD";
      $scope.orderviewData.currentMenu = "CONTRACTOUTWARD";
      $scope.orderviewData.currentoutward = angular.copy(delivery._id);
      $scope.selectOutward();
    }
  };
  
  $scope.viewContractinward = function (delivery) {
    if (angular.isDefined(delivery) && angular.isDefined(delivery._id)) {
      $scope.orderviewData.selectedmenu = "CONTRACTINWARD";
      $scope.orderviewData.currentMenu = "CONTRACTINWARD";
      $scope.orderviewData.currentinward = angular.copy(delivery._id);
      $scope.selectInward();
    }
  };
    
  $scope.viewDeliverybylink = function (delivery, deliverytype) {
    $scope.orderviewData.currentMenu = deliverytype;
    if (deliverytype === "OUTWARD") {
      $scope.orderviewData.selectedmenu = "OUTWARD";
      $scope.orderviewData.currentdelivery = angular.copy(delivery.delivery_id);
      $scope.selectDelivery();
    } else {
      $scope.orderviewData.selectedmenu = "OUTWARDRETURN";
      $scope.orderviewData.currentdelivery = angular.copy(delivery.delivery_id);
      $scope.selectDeliveryreturn();
    }
  };

  function setCurrentdelivery() {
    if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null &&
        ((angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) &&
        $scope.orderviewData.orderDetail.outward_delivery.length > 0) || (angular.isDefined($scope.orderviewData.orderDetail.return_delivery) &&
        $scope.orderviewData.orderDetail.return_delivery.length > 0))) {
      if (angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) && $scope.orderviewData.orderDetail.outward_delivery.length > 0) {
        $scope.viewDelivery($scope.orderviewData.orderDetail.outward_delivery[0]);
      } else {
        $scope.viewDeliveryreturn($scope.orderviewData.orderDetail.return_delivery[0]);
      }
    }
  }
  
  function setCurrentoutward() {
    if (angular.isDefined($scope.orderviewData.contract_outward) && $scope.orderviewData.contract_outward !== null &&
        $scope.orderviewData.contract_outward.length > 0) {
      $scope.viewContractoutward($scope.orderviewData.contract_outward[0]);
    }
  }
  
  function setCurrentinward() {
    if (angular.isDefined($scope.orderviewData.contract_inward) && $scope.orderviewData.contract_inward !== null &&
        $scope.orderviewData.contract_inward.length > 0) {
      $scope.viewContractinward($scope.orderviewData.contract_inward[0]);
    }
  }
  
  function setCurrentdelivery() {
    if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null &&
        ((angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) &&
        $scope.orderviewData.orderDetail.outward_delivery.length > 0) || (angular.isDefined($scope.orderviewData.orderDetail.return_delivery) &&
        $scope.orderviewData.orderDetail.return_delivery.length > 0))) {
      if (angular.isDefined($scope.orderviewData.orderDetail.outward_delivery) && $scope.orderviewData.orderDetail.outward_delivery.length > 0) {
        $scope.viewDelivery($scope.orderviewData.orderDetail.outward_delivery[0]);
      } else {
        $scope.viewDeliveryreturn($scope.orderviewData.orderDetail.return_delivery[0]);
      }
    }
  }

  $scope.getLabreport = function (id) {
    if (angular.isDefined(id) && id !== null) {
      if ($rootScope.currentapp === "customer") {
        OrderService.vieworderLabreport(id, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data._id)) {
            if (angular.isDefined(result.data.labReport) && result.data.labReport !== null && angular.isDefined(result.data.labReport.length > 0)) {
              $scope.orderviewData.labReportlist = angular.copy($filter("filter")(result.data.labReport, {is_deleted: false }));
            } else {
              $scope.orderviewData.labReportlist = [];
            }
            if (angular.isDefined(result.data.labReportsummary) && result.data.labReportsummary !== null &&
                angular.isDefined(result.data.labReportsummary.length > 0)) {
              $scope.orderviewData.labReportsummarylist = angular.copy($filter("filter")(result.data.labReportsummary, {is_deleted: false }));
            } else {
              $scope.orderviewData.labReportsummarylist = [];
            }
          }
          $scope.orderviewData.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.orderviewData.pageLoader = false;
        });
      } else {
        OrderService.viewLabreport(id, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data._id)) {
            if (angular.isDefined(result.data.labReport) && result.data.labReport !== null && angular.isDefined(result.data.labReport.length > 0)) {
              $scope.orderviewData.labReportlist = angular.copy(result.data.labReport);
            } else {
              $scope.orderviewData.labReportlist = [];
            }
            if (angular.isDefined(result.data.labReportsummary) && result.data.labReportsummary !== null &&
                angular.isDefined(result.data.labReportsummary.length > 0)) {
              $scope.orderviewData.labReportsummarylist = angular.copy(result.data.labReportsummary);
            } else {
              $scope.orderviewData.labReportsummarylist = [];
            }
          }
          $scope.orderviewData.pageLoader = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.orderviewData.pageLoader = false;
        });
      }
    }
  };

  $scope.getOrderactivity = function (id) {
    $scope.orderviewData.activitylist = [];
    if (angular.isDefined(id) && id !== null) {
      $scope.orderviewData.pageLoad = true;
      if ($rootScope.currentapp === "customer") {
        ActivityService.vieworderActivity(id, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
            $scope.orderviewData.activitylist = angular.copy(result.data);
          }
          $scope.orderviewData.pageLoad = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.orderviewData.pageLoad = false;
        });
      } else {
        ActivityService.viewActivity(id, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
            $scope.orderviewData.activitylist = angular.copy(result.data);
          }
          $scope.orderviewData.pageLoad = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.orderviewData.pageLoad = false;
        });
      }
    } else {
      $scope.orderviewData.pageLoad = false;
    }
  };

  $scope.openJob = function () {
    $scope.orderviewData.pageLoad = true;
    $scope.orderviewData.orderDetail = {};
    $scope.orderviewData.customerDetail = {};
    $scope.orderviewData.inwardForm = [];
    $scope.orderviewData.invoiceForm = {};
    $scope.orderviewData.outwardForm = {};
    $scope.orderviewData.specialPrice = [];
    $scope.orderviewData.order_status = [];
    const type = orderviewService.getMenu();
    const myEl = angular.element(document.querySelector(".in_order_process"));
    myEl.removeClass("open");

    if (angular.isDefined(type) && type !== null) {
      $scope.orderviewData.currentMenu = type;      
      s_orderview_link();
      switch (true) {
        case $scope.orderviewData.currentMenu === "INWARD":
          $scope.orderviewData.card = "INWARD";
          break;
        case $scope.orderviewData.currentMenu === "ORDER":
          $scope.orderviewData.card = "ORDER";
          break;
        case $scope.orderviewData.currentMenu === "INVOICE":
          $scope.orderviewData.card = "ORDER";
          break;
        case $scope.orderviewData.currentMenu === "OUTWARD":
          $scope.orderviewData.currentdelivery = orderviewService.getSelectedid();
          $scope.orderviewData.selectedmenu = "OUTWARD";
          $scope.orderviewData.card = "ORDER";
          break;
        case $scope.orderviewData.currentMenu === "OUTWARDRETURN":
          $scope.orderviewData.currentdelivery = orderviewService.getSelectedid();
          $scope.orderviewData.selectedmenu = "OUTWARDRETURN";
          $scope.orderviewData.card = "ORDER";
          break;
        case $scope.orderviewData.currentMenu === "CONTRACTOUTWARD":
          $scope.orderviewData.currentoutward = orderviewService.getSelectedid();
          $scope.orderviewData.selectedmenu = "CONTRACTOUTWARD";
          $scope.orderviewData.card = "ORDER";
          break;
        case $scope.orderviewData.currentMenu === "CONTRACTINWARD":
          $scope.orderviewData.currentinward = orderviewService.getSelectedid();
          $scope.orderviewData.selectedmenu = "CONTRACTINWARD";
          $scope.orderviewData.card = "ORDER";
          break;
        default:
          $scope.orderviewData.card = "ORDER";
          break;
      }
      $scope.getOrderdetail();
    }
    $rootScope.clientData.orderView = true;
  };

  $scope.$on("openJob", () => {
    $scope.openJob();
  });

  $scope.selectOrdermenu = function (menu) {
    if (angular.isDefined(menu)) {
      $scope.orderviewData.currentMenu = menu;
      if ($scope.orderviewData.currentMenu === "REPORT") {
        if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null &&
            angular.isDefined($scope.orderviewData.orderDetail.order_id)) {
          $scope.getLabreport($scope.orderviewData.orderDetail.order_id);
          $scope.orderviewData.pageLoad = false;
        }
      }
      if ($scope.orderviewData.currentMenu === "ACTIVITY") {
        if (angular.isDefined($scope.orderviewData.orderDetail) && $scope.orderviewData.orderDetail !== null &&
            angular.isDefined($scope.orderviewData.orderDetail.order_id)) {
          $scope.getOrderactivity($scope.orderviewData.orderDetail.order_id);
        }
      }
      if ($scope.orderviewData.currentMenu === "OUTWARD" || $scope.orderviewData.currentMenu === "OUTWARDRETURN") {
        setCurrentdelivery();
      }
      if ($scope.orderviewData.currentMenu === "CONTRACTOUTWARD") {
        setCurrentoutward();
      }
      if ($scope.orderviewData.currentMenu === "CONTRACTINWARD") {
        setCurrentinward();
      }
      if ($scope.orderviewData.currentMenu === "INVOICE" && (angular.isUndefined($scope.orderviewData.invoiceForm) ||
        $scope.orderviewData.invoiceForm === null || angular.isUndefined($scope.orderviewData.invoiceForm._id))) {
        $scope.orderviewData.invoiceForm = {};
        $scope.orderviewData.invoiceItems = {};
        $scope.orderviewData.invoiceForm.items = [];
        $scope.orderviewData.spares = [];
        $scope.orderviewData.taxes = [];
        $scope.orderviewData.Statelistdetails = [];
        $scope.orderviewData.Gsttreatmentdetails = [];
        $scope.orderviewData.Processdetails = [];
        $scope.orderviewData.Processtax = [];
        $scope.orderviewData.currentitems = {};
        $scope.orderviewData.itemlist = {};
        $scope.orderviewData.Joblist = [];
        $scope.orderviewData.selectedIndex = -1;
        $scope.orderviewData.invoiceForm.enableInvoice = false;
      }
    }
  };

  $scope.selectStatus = function (stat) {
    if (stat !== null && angular.isDefined(stat.name) && stat.name !== "" &&
        angular.isDefined($scope.orderviewData.orderDetail.order_id) && $scope.orderviewData.orderDetail.order_id !== "") {
      const obj = {};
      obj.order_status = angular.copy(stat.name);
      obj._id = angular.copy($scope.orderviewData.orderDetail.order_id);

      OrderService.updateStatus(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && result.data._id !== "") {
              Notification.success("Order status updated successfully");
              $scope.orderviewData.orderDetail.order_status = angular.copy(stat.name);
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
  
  $scope.selectoutwardStatus = function(stat) {
    if (stat !== null && angular.isDefined(stat.name) && stat.name !== "" &&
        angular.isDefined($scope.orderviewData.contractoutwardForm._id) && $scope.orderviewData.contractoutwardForm._id !== "") {
      const obj = {};
      obj.outward_status = angular.copy(stat.name);
      obj._id = angular.copy($scope.orderviewData.contractoutwardForm._id);

      ContractorService.updateStatus(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && result.data._id !== "") {
              Notification.success("Outward status updated successfully");
              if(obj._id === $scope.orderviewData.contractoutwardForm._id) {
                $scope.orderviewData.contractoutwardForm.outward_status = angular.copy(stat.name);
              } else {
                angular.forEach($scope.orderviewData.contract_outward, function (coutwd) {
                  if(angular.isDefined(coutwd) && angular.isDefined(coutwd._id) && coutwd._id === obj._id)  {
                    coutwd.outward_status = angular.copy(stat.name);
                  }
                });
              }
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
  }
  
  $scope.getInwarddetail = function (id) {
    if (angular.isDefined(id) && id !== null) {
      InwardService.viewInward(id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data._id)) {
          const cusData = ["customer_dc_no", "dyeing_dc_no", "dyeing_name", "billing_address_line", "billing_area",
            "billing_city", "billing_pincode", "billing_state"];
          // loop through all possible names
          for (let i = 0; i < cusData.length; i += 1) {
            if (validateField.checkDefined(result.data, cusData[i])) {
              $scope.orderviewData.orderDetail[cusData[i]] = angular.copy(result.data[cusData[i]]);
            }
          }
          $scope.orderviewData.inwardForm.push(angular.copy(result.data));
        }
        $rootScope.clientData.orderView = true;
        $scope.orderviewData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $rootScope.clientData.orderView = true;
        $scope.orderviewData.pageLoader = false;
      });
    }
  };

  $scope.closeJob = function () {
    iframeResizeDiv();
    s_mainwindow_link();
    $scope.orderviewData = {};
  };

  function setDelivery(Deliverydetails, items) {
    const deferred = $q.defer();
    let index = 0;
    const delivery = angular.copy($filter("filter")(Deliverydetails, {is_return: false }));
    
    angular.forEach(delivery, (ord) => {
      if (angular.isDefined(ord) && angular.isDefined(ord.outward_data) && ord.outward_data !== null && ord.outward_data.length > 0) {
        angular.forEach(ord.outward_data, (outdata) => {
          const processlist = _.flatten(_.pluck(outdata.process, "process_name"));
          outdata.process = angular.copy(outdata.process);
          outdata.processes = processlist.join(", ");
          outdata.order_id = ord.order_id;
          outdata.division_id = ord.division_id;
          outdata.delivery_no = ord.delivery_no;
          outdata.delivery_date = ord.delivery_date;
          outdata.order_no = ord.order_no;
          outdata.order_date = angular.copy(items.order_date);
          outdata.inward_id = angular.copy(outdata.inward_id);
          outdata.inward_date = angular.copy(outdata.inward_date);
          outdata.order_reference_no = angular.copy(items.order_reference_no);
          outdata.followupPerson = angular.isDefined(items.followupPerson) ? angular.copy(items.followupPerson) : {};
          outdata.contactperson = angular.copy(items.contactperson);
          outdata.customer_dc_no = angular.copy(items.customer_dc_no);
          outdata.customer_dc_date = angular.copy(items.customer_dc_date);
          outdata.dyeing = angular.copy(items.dyeing);
          outdata.dyeing_dc_no = angular.copy(items.dyeing_dc_no);
          outdata.dyeing_dc_date = angular.copy(items.dyeing_dc_date);
          outdata.measurement = angular.copy(outdata.measurement);
          if (angular.isUndefined(outdata.inward_weight)) {
            outdata.inward_weight = outdata.weight;
          }
          angular.forEach(outdata.process, (pro, prindex) => {
            pro.price = 0;
            pro.specialprice = 0;
            pro.discountprice = 0;
            pro.baseprice = 0;
            pro.subtotal = 0;
            pro.total = 0;
            if (prindex === outdata.process.length - 1) {
              $scope.orderviewData.invoiceForm.items.push(angular.copy(outdata));
              index += 1;
            }
          });
          
          if (angular.isDefined($scope.orderviewData.prevOrder)) {
            const prev = {};
            prev._id = angular.copy(ord.order_id);
            prev.status = "Invoice and Delivery";
            $scope.orderviewData.prevOrder.push(angular.copy(prev));
          }

          if (index === ord.outward_data.length) {
            deferred.resolve($scope.orderviewData.invoiceForm.items);
          }
        });
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setReturn(Returndetails, items) {
    const deferred = $q.defer();
    
    let returneddata = angular.copy($filter("filter")(Returndetails, {is_return: true }));
    const returnedList = _.flatten(_.pluck(returneddata, "outward_data"));
    
    if (angular.isDefined(returnedList) && returnedList !== null && returnedList.length > 0) {
      angular.forEach($scope.orderviewData.invoiceForm.items, (outdata, outindex) => {      
        if (angular.isUndefined(outdata.inward_weight)) {
            outdata.inward_weight = outdata.weight;
        }
        angular.forEach(returnedList, (rdata, index) => {            
          if (angular.isDefined(rdata.inward_id) && angular.isDefined(rdata.inward_data_id) && angular.isDefined(outdata.inward_id) && 
                  angular.isDefined(outdata.inward_data_id) && rdata.inward_id === outdata.inward_id && 
                  rdata.inward_data_id === outdata.inward_data_id && outdata.weight) {            
            outdata.inward_weight -= parseFloat(rdata.delivery_weight);
          }

          if (index === returnedList.length-1 && outindex === returnedList.length-1) {
            deferred.resolve($scope.orderviewData.invoiceForm.items);
          }
        });
      });
    } else {
      deferred.resolve($scope.orderviewData.invoiceForm.items);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setInvoiceoption() {
    const deferred = $q.defer();
    let index = 0;
    angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
      angular.forEach(items.process, (pro, proindex) => {
        pro.invoice_option = "Delivery Weight";
        angular.forEach($scope.orderviewData.Processtax, (pr, prindex) => {
          if (angular.isDefined(pr.process_id) && pr.process_id === pro.process_id && angular.isDefined(pr.invoice_option) && 
                  pr.invoice_option !== "") {
              pro.invoice_option = pr.invoice_option;
          }
          if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processtax.length - 1) {
            index += 1;
          }
        });
      });
      if (index === $scope.orderviewData.invoiceForm.items.length) {
        deferred.resolve($scope.orderviewData.invoiceForm.items);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setInwardweight() {
     const deferred = $q.defer();
    let indexcnt = 0;
    angular.forEach($scope.orderviewData.invoiceForm.items, (items, indx) => {      
      angular.forEach(items.process, (pro, proindex) => {
        if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
          let procexist = false;
          let totaldelivered = parseFloat(items.inward_weight);
          let prcnt = 0;
          angular.forEach($scope.orderviewData.invoiceForm.items, (pritems, index) => {
            if (angular.isDefined(pritems.inward_data_id) && angular.isDefined(pritems.inward_id) && 
                    pritems.inward_data_id === items.inward_data_id && pritems.inward_id === items.inward_id) {
                angular.forEach(pritems.process, (prodata, prsind) => {
                  if (prodata.process_id === pro.process_id) {
                    if (index > indx) {
                      procexist = true;
                    }
                    if (index < indx) {
                      totaldelivered -= parseFloat(pritems.delivery_weight);
                    }
                  }
                  if (prsind === pritems.process.length-1){
                    prcnt += 1;
                    if (procexist) {
                      items.received_weight = parseFloat(items.delivery_weight);
                    } else {
                      items.received_weight = parseFloat(totaldelivered);
                    }
                    if (proindex === items.process.length-1 && prcnt === $scope.orderviewData.invoiceForm.items.length) {
                      indexcnt += 1;
                    }
                  }
                });
            } else {
              prcnt += 1;
              if (prcnt === $scope.orderviewData.invoiceForm.items.length) {
                indexcnt += 1;
              }
            }
          });
        } else {
          if (proindex === items.process.length-1) {
            indexcnt += 1;
          }
        }
      });
      if (indexcnt === $scope.orderviewData.invoiceForm.items.length) {
        deferred.resolve($scope.orderviewData.invoiceForm.items);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setinvoiceweight() {
    const deferred = $q.defer();
    let index = 0;
    angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
      angular.forEach(items.process, (pro, proindex) => {
        angular.forEach($scope.orderviewData.Processtax, (pr, prindex) => {
          if (angular.isDefined(pr.division_id) && angular.isDefined(pr.process_id) && 
                  pr.division_id === items.division_id && pr.process_id === pro.process_id && 
                  angular.isDefined(pr.invoice_option) && pr.invoice_option !== "" && pr.invoice_option !== null) {
            pro.invoice_option = pr.invoice_option;
          }
          if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processdetails.length - 1) {
            index += 1;
          }
        });
      });
      if (index === $scope.orderviewData.invoiceForm.items.length) {
        deferred.resolve(true);
      }
    });

    // async call, resolved after ajax request completes
    return deferred.promise;
  }
  
  function setSpecialprice() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.orderviewData.specialprice) && angular.isDefined($scope.orderviewData.invoiceForm.items) &&
        $scope.orderviewData.specialprice.length > 0 && $scope.orderviewData.invoiceForm.items.length > 0) {
      let index = 0;
      angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
        angular.forEach(items.process, (pro, proindex) => {
          angular.forEach($scope.orderviewData.specialprice, (spl, splindex) => {
            if (angular.isDefined(spl.division_id) && angular.isDefined(spl.measurement_id) && angular.isDefined(spl.order_id) &&
                angular.isDefined(spl.price) && parseFloat(spl.price) > 0 && angular.isDefined(spl.process_id) &&
                spl.division_id === items.division_id && spl.measurement_id === items.measurement._id &&
                spl.process_id === pro.process_id && spl.order_id === items.order_id) {
              if (angular.isDefined(spl.price) && angular.isDefined(spl.qty) && parseFloat(spl.qty) > 0) {
                pro.specialprice = parseFloat(spl.price) / parseFloat(spl.qty);
              } else {
                pro.specialprice = 0;
              }
              pro.price = parseFloat(pro.specialprice).toFixed(2);
              if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
                pro.subtotal = parseFloat(pro.price) * parseFloat(items.received_weight);
              } else {
                pro.subtotal = parseFloat(pro.price) * parseFloat(items.delivery_weight);
              }
            }
            if (proindex === items.process.length - 1 && splindex === $scope.orderviewData.specialprice.length - 1) {
              index += 1;
            }
          });
        });
        if (index === $scope.orderviewData.invoiceForm.items.length) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function setDiscountprice() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.orderviewData.customerDiscount) && angular.isDefined($scope.orderviewData.invoiceForm.items) &&
        $scope.orderviewData.customerDiscount.length > 0 && $scope.orderviewData.invoiceForm.items.length > 0) {
      let index = 0;
      angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
        angular.forEach(items.process, (pro, proindex) => {
          angular.forEach($scope.orderviewData.customerDiscount, (grp, grpindex) => {
            if (angular.isDefined(grp.division_id) && angular.isDefined(grp.measurement_id) && angular.isDefined(grp.discount_price) &&
                parseFloat(grp.discount_price) > 0 && angular.isDefined(grp.process_id) && grp.division_id === items.division_id &&
                grp.measurement_id === items.measurement._id && grp.process_id === pro.process_id) {
              if (parseFloat(pro.price) === 0) {
                pro.price = parseFloat(grp.discount_price).toFixed(2);
                if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
                  pro.subtotal = parseFloat(grp.discount_price) * parseFloat(items.received_weight);
                } else {
                  pro.subtotal = parseFloat(grp.discount_price) * parseFloat(items.delivery_weight);
                }
              }
              pro.discountprice = parseFloat(grp.discount_price);
            }
            if (proindex === items.process.length - 1 && grpindex === $scope.orderviewData.customerDiscount.length - 1) {
              index += 1;
            }
          });
        });
        if (index === $scope.orderviewData.invoiceForm.items.length) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function setBaseprice() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.orderviewData.Processdetails) && angular.isDefined($scope.orderviewData.invoiceForm.items) &&
        $scope.orderviewData.Processdetails.length > 0 && $scope.orderviewData.invoiceForm.items.length > 0) {
      let index = 0;
      angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
        angular.forEach(items.process, (pro, proindex) => {
          angular.forEach($scope.orderviewData.Processdetails, (pr, prindex) => {
            if (angular.isDefined(pr.division_id) && angular.isDefined(pr.measurement_id) && angular.isDefined(pr.cost) &&
                parseFloat(pr.cost) > 0 && angular.isDefined(pr.process_id) && pr.division_id === items.division_id &&
                pr.measurement_id === items.measurement._id && pr.process_id === pro.process_id) {
              pro.baseprice = angular.isDefined(pr.cost) ? parseFloat(pr.cost) : 0;
              if (parseFloat(pro.price) === 0) {
                pro.price = parseFloat(pro.baseprice).toFixed(2);
                if (angular.isDefined(pro.invoice_option) && pro.invoice_option === "Received Weight") {
                  pro.subtotal = parseFloat(pro.baseprice) * parseFloat(items.received_weight);
                } else {
                  pro.subtotal = parseFloat(pro.baseprice) * parseFloat(items.delivery_weight);
                }
              }
            }
            if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processdetails.length - 1) {
              index += 1;
            }
          });
        });
        if (index === $scope.orderviewData.invoiceForm.items.length) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }

    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function calculateInvoicetotal() {
    $scope.orderviewData.invoiceForm.tax_data = [];
    $scope.orderviewData.invoiceForm.subtotal = 0;
    $scope.orderviewData.invoiceForm.total = 0;
    $scope.orderviewData.invoiceForm.roundoff = "0.00";
    const deferred = $q.defer();
    if ($scope.orderviewData.invoiceForm.items.length === 0) {
      deferred.resolve(true);
    }

    if (angular.isDefined($scope.orderviewData.divisionplaceofSupply) && angular.isDefined($scope.orderviewData.invoiceForm.placeofSupply) &&
        $scope.orderviewData.invoiceForm.items.length > 0) {
      let index = 0;
      let totinv = 0;
      if ($scope.orderviewData.invoiceForm.placeofSupply === $scope.orderviewData.divisionplaceofSupply) { // intra state tax calculation
        angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
          angular.forEach(items.process, (pro, proindex) => {
            pro.totaltax = 0;
            pro.total = angular.copy(pro.subtotal);
            pro.tax_class = [];
            $scope.orderviewData.invoiceForm.subtotal = parseFloat($scope.orderviewData.invoiceForm.subtotal) + parseFloat(pro.subtotal);
            totinv = parseFloat(totinv) + parseFloat(pro.subtotal);

            if (angular.isDefined($scope.orderviewData.Processtax) && $scope.orderviewData.Processtax.length > 0) {
              angular.forEach($scope.orderviewData.Processtax, (pr, prindex) => {
                if (angular.isDefined(pr.division_id) && angular.isDefined(pr.process_id) && pr.division_id === items.division_id &&
                    pr.process_id === pro.process_id && angular.isDefined(pr.tax_class) && pr.tax_class.length > 0) {
                  angular.forEach(pr.tax_class, (tax, txind) => {
                    if (angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage) && parseFloat(tax.tax_percentage) > 0) {
                      const tx = angular.copy(tax);
                      tx.taxamount = (parseFloat(pro.subtotal) / 100) * parseFloat(tax.tax_percentage);
                      totinv = parseFloat(totinv) + parseFloat(tx.taxamount);

                      if ($scope.orderviewData.invoiceForm.tax_data.length > 0) {
                        let exist = false;
                        _.each($scope.orderviewData.invoiceForm.tax_data, (key, ind) => {
                          if ($scope.orderviewData.invoiceForm.tax_data[ind]._id === tax._id && !exist) {
                            exist = true;
                            const tottx = parseFloat($scope.orderviewData.invoiceForm.tax_data[ind].taxamount) + tx.taxamount;
                            $scope.orderviewData.invoiceForm.tax_data[ind].taxamount = tottx;
                          }
                          if (ind === $scope.orderviewData.invoiceForm.tax_data.length - 1 && !exist) {
                            $scope.orderviewData.invoiceForm.tax_data.push(angular.copy(tx));
                          }
                        });
                      } else {
                        $scope.orderviewData.invoiceForm.tax_data.push(angular.copy(tx));
                      }
                      pro.totaltax = parseFloat(pro.totaltax) + parseFloat(tx.taxamount);
                      pro.total = parseFloat(pro.total) + parseFloat(pro.totaltax);
                      pro.tax_class.push(angular.copy(tx));
                    }
                    if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processtax.length - 1 &&
                        txind === pr.tax_class.length - 1) {
                      index += 1;
                    }
                  });
                } else if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processtax.length - 1) {
                  index += 1;
                }
              });
            } else if (proindex === items.process.length - 1) {
              index += 1;
            }
          });
          if (index === $scope.orderviewData.invoiceForm.items.length) {
            const roundtotal = Math.round(totinv);
            const rounddiff = parseFloat(roundtotal) - parseFloat(totinv);
            $scope.orderviewData.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

            $scope.orderviewData.invoiceForm.total = parseFloat(roundtotal).toFixed(2);
            deferred.resolve(true);
          }
        });
      } else { // inter state tax calculation
        angular.forEach($scope.orderviewData.invoiceForm.items, (items) => {
          angular.forEach(items.process, (pro, proindex) => {
            pro.totaltax = 0;
            pro.total = angular.copy(pro.subtotal);
            pro.tax_class = [];
            $scope.orderviewData.invoiceForm.subtotal = parseFloat($scope.orderviewData.invoiceForm.subtotal) + parseFloat(pro.subtotal);
            totinv = parseFloat(totinv) + parseFloat(pro.subtotal);

            if (angular.isDefined($scope.orderviewData.Processtax) && $scope.orderviewData.Processtax.length > 0) {
              angular.forEach($scope.orderviewData.Processtax, (pr, prindex) => {
                if (angular.isDefined(pr.division_id) && angular.isDefined(pr.process_id) && pr.division_id === items.division_id &&
                    pr.process_id === pro.process_id && angular.isDefined(pr.inter_tax_class) && pr.inter_tax_class.length > 0) {
                  angular.forEach(pr.inter_tax_class, (tax, txind) => {
                    if (angular.isDefined(tax.tax_name) && angular.isDefined(tax.tax_percentage) && parseFloat(tax.tax_percentage) > 0) {
                      const tx = angular.copy(tax);
                      tx.taxamount = (parseFloat(pro.subtotal) / 100) * parseFloat(tax.tax_percentage);
                      totinv = parseFloat(totinv) + parseFloat(tx.taxamount);

                      if ($scope.orderviewData.invoiceForm.tax_data.length > 0) {
                        let exist = false;
                        _.each($scope.orderviewData.invoiceForm.tax_data, (key, ind) => {
                          if ($scope.orderviewData.invoiceForm.tax_data[ind]._id === tax._id && !exist) {
                            exist = true;
                            const taxtot = parseFloat($scope.orderviewData.invoiceForm.tax_data[ind].taxamount) + tx.taxamount;
                            $scope.orderviewData.invoiceForm.tax_data[ind].taxamount = taxtot;
                          }
                          if (ind === $scope.orderviewData.invoiceForm.tax_data.length - 1 && !exist) {
                            $scope.orderviewData.invoiceForm.tax_data.push(angular.copy(tx));
                          }
                        });
                      } else {
                        $scope.orderviewData.invoiceForm.tax_data.push(angular.copy(tx));
                      }
                      pro.totaltax = parseFloat(pro.totaltax) + parseFloat(tx.taxamount);
                      pro.total = parseFloat(pro.total) + parseFloat(tx.taxamount);
                      pro.tax_class.push(angular.copy(tx));
                    }
                    if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processtax.length - 1 &&
                        txind === pr.inter_tax_class.length - 1) {
                      index += 1;
                    }
                  });
                } else if (proindex === items.process.length - 1 && prindex === $scope.orderviewData.Processtax.length - 1) {
                  index += 1;
                }
              });
            } else if (proindex === items.process.length - 1) {
              index += 1;
            }
          });
          if (index === $scope.orderviewData.invoiceForm.items.length) {
            const roundtotal = Math.round(totinv);
            const rounddiff = parseFloat(roundtotal) - parseFloat(totinv);
            $scope.orderviewData.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

            $scope.orderviewData.invoiceForm.total = parseFloat(roundtotal).toFixed(2);
            deferred.resolve(true);
          }
        });
      }
    }
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  function calculateOtheritem() {
    const deferred = $q.defer();
    if (angular.isUndefined($scope.orderviewData.invoiceForm.tax_data)) {
      $scope.orderviewData.invoiceForm.tax_data = [];
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.subtotal)) {
      $scope.orderviewData.invoiceForm.subtotal = 0;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.total)) {
      $scope.orderviewData.invoiceForm.total = 0;
      $scope.orderviewData.invoiceForm.roundoff = "0.00";
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.otheritems) || $scope.orderviewData.invoiceForm.otheritems.length === 0) {
      deferred.resolve(true);
    }
    let index = 0;
    let totinv = 0;
    angular.forEach($scope.orderviewData.invoiceForm.otheritems, (items) => {
      $scope.orderviewData.invoiceForm.subtotal = parseFloat($scope.orderviewData.invoiceForm.subtotal) + parseFloat(items.pretotal);
      totinv = parseFloat(totinv) + parseFloat(items.pretotal);
      if (angular.isDefined(items.tax_class) && items.tax_class.length > 0) {
        angular.forEach(items.tax_class, (tax, txind) => {
          if (angular.isDefined(tax.display_name) && angular.isDefined(tax.tax_percentage) && parseFloat(tax.tax_percentage) > 0 &&
            angular.isDefined(tax.taxamount) && parseFloat(tax.taxamount) > 0) {
            const tx = angular.copy(tax);
            tx.taxamount = parseFloat(tax.taxamount);
            totinv = parseFloat(totinv) + parseFloat(tx.taxamount);

            if ($scope.orderviewData.invoiceForm.tax_data.length > 0) {
              let exist = false;
              _.each($scope.orderviewData.invoiceForm.tax_data, (key, ind) => {
                if ($scope.orderviewData.invoiceForm.tax_data[ind]._id === tax._id && !exist) {
                  exist = true;
                  const txtot = parseFloat($scope.orderviewData.invoiceForm.tax_data[ind].taxamount) + tx.taxamount;
                  $scope.orderviewData.invoiceForm.tax_data[ind].taxamount = txtot;
                }
                if (ind === $scope.orderviewData.invoiceForm.tax_data.length - 1 && !exist) {
                  $scope.orderviewData.invoiceForm.tax_data.push(angular.copy(tx));
                }
              });
            } else {
              $scope.orderviewData.invoiceForm.tax_data.push(angular.copy(tx));
            }
          }
          if (txind === items.tax_class.length - 1) {
            index += 1;
          }
        });
      } else {
        index += 1;
      }
      if (index === $scope.orderviewData.invoiceForm.otheritems.length) {
        const roundtotal = Math.round(totinv);
        const rounddiff = parseFloat(roundtotal) - parseFloat(totinv);
        $scope.orderviewData.invoiceForm.roundoff = parseFloat(rounddiff).toFixed(2);

        $scope.orderviewData.invoiceForm.total = parseFloat(roundtotal).toFixed(2);
        deferred.resolve(true);
      }
    });
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  $scope.calculateSumInvoice = function (process, item) {
    if (process !== null && angular.isDefined(process.price) && process.price !== null && process.price !== "" &&
        angular.isDefined(item.delivery_weight) && item.delivery_weight !== null && item.delivery_weight !== "") {
      if (angular.isDefined(process.invoice_option) && process.invoice_option === "Received Weight") {
        process.subtotal = parseFloat(process.price) * parseFloat(item.received_weight);
      } else {
        process.subtotal = parseFloat(process.price) * parseFloat(item.delivery_weight);
      }
      calculateInvoicetotal().then((invoicetotal) => {
        if (invoicetotal !== null && invoicetotal) {
          calculateOtheritem().then((otheritemtotal) => {

          });
        }
      });
    }
  };

  $scope.enableInvoice = function (orderdata) {
    if (angular.isDefined(orderdata) && orderdata !== null && angular.isDefined(orderdata._id) &&
        angular.isDefined(orderdata.division_id) && angular.isDefined(orderdata.customer_id)) {
      $scope.orderviewData.invoiceForm.customer_id = "";
      $scope.orderviewData.invoiceForm.customer_name = "";
      $scope.orderviewData.invoiceForm.customer_mobile_no = "";
      $scope.orderviewData.customeraddress = [];
      $scope.orderviewData.invoiceForm.billing_address = {};
      $scope.orderviewData.invoiceForm.default_address = {};
      $scope.orderviewData.invoiceForm.gstTreatment = "";
      $scope.orderviewData.invoiceForm.gstin = "";
      $scope.orderviewData.invoiceForm.placeofSupply = "";
      $scope.orderviewData.invoiceForm.customerGroup = "";
      $scope.orderviewData.invoiceForm.items = [];
      $scope.orderviewData.customerDiscount = [];
      $scope.orderviewData.divisionplaceofSupply = "";
      $scope.orderviewData.deliveredList = [];
      $scope.orderviewData.Gsttreatmentdetails = [];
      $scope.orderviewData.Processdetails = [];
      $scope.orderviewData.Processtax = [];
      $scope.orderviewData.taxes = [];

      if (angular.isDefined($scope.orderviewData.jobselected)) {
        $scope.orderviewData.jobselected = undefined;
      }

      $scope.orderviewData.pageLoader = true;
      const obj = {};
      obj.order = angular.copy(orderdata._id);
      obj.division = angular.copy(orderdata.division_id);
      obj.customer = angular.copy(orderdata.customer_id);

      OrderService.initializeInvoice(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null) {
              if (angular.isDefined(result.data.Customerdetails) && result.data.Customerdetails !== null &&
                angular.isDefined(result.data.Customerdetails._id)) {
                $scope.orderviewData.invoiceForm.customer_id = angular.copy(result.data.Customerdetails._id);
                $scope.orderviewData.invoiceForm.customer_name = angular.copy(result.data.Customerdetails.name);
                $scope.orderviewData.invoiceForm.gstTreatment = angular.copy(result.data.Customerdetails.gstTreatment);
                $scope.orderviewData.invoiceForm.gstin = angular.copy(result.data.Customerdetails.gstin);
                $scope.orderviewData.invoiceForm.placeofSupply = angular.copy(result.data.Customerdetails.placeofSupply);
                $scope.orderviewData.invoiceForm.customerGroup = angular.copy(result.data.Customerdetails.group);

                if (angular.isDefined(result.data.Customerdetails.mobile_no) && result.data.Customerdetails.mobile_no !== null &&
                    result.data.Customerdetails.mobile_no !== "") {
                  $scope.orderviewData.invoiceForm.customer_mobile_no = angular.copy(result.data.Customerdetails.mobile_no);
                }

                if (angular.isDefined(result.data.Customerdetails.address) && result.data.Customerdetails.address !== null &&
                    result.data.Customerdetails.address.length > 0) {
                  const ob = {};
                  const defadr = {};
                  angular.forEach(result.data.Customerdetails.address, (adr, indx) => {
                    if (angular.isDefined(adr) && adr !== null && angular.isDefined(adr._id) && angular.isDefined(adr.is_invoice) && adr.is_invoice) {
                      ob.billing_address_line = angular.isDefined(adr.address_line) ? angular.copy(adr.address_line) : "";
                      ob.billing_area = angular.isDefined(adr.area) ? angular.copy(adr.area) : "";
                      ob.billing_city = angular.isDefined(adr.city) ? angular.copy(adr.city) : "";
                      ob.billing_state = angular.isDefined(adr.state) ? angular.copy(adr.state) : "";
                      ob.billing_pincode = angular.isDefined(adr.pincode) ? angular.copy(adr.pincode) : "";
                      ob.billing_landmark = angular.isDefined(adr.landmark) ? angular.copy(adr.landmark) : "";
                      ob.billing_contact_no = angular.isDefined(adr.contact_no) ? angular.copy(adr.contact_no) : "";
                      ob.billing_company_name = angular.isDefined(adr.company_name) ? angular.copy(adr.company_name) : "";
                      ob.billing_gstin = angular.isDefined(adr.gstin) ? angular.copy(adr.gstin) : "";
                    }
                    if (angular.isDefined(adr) && adr !== null && angular.isDefined(adr._id) && angular.isDefined(adr.is_default) && adr.is_default) {
                      defadr.billing_address_line = angular.isDefined(adr.address_line) ? angular.copy(adr.address_line) : "";
                      defadr.billing_area = angular.isDefined(adr.area) ? angular.copy(adr.area) : "";
                      defadr.billing_city = angular.isDefined(adr.city) ? angular.copy(adr.city) : "";
                      defadr.billing_state = angular.isDefined(adr.state) ? angular.copy(adr.state) : "";
                      defadr.billing_pincode = angular.isDefined(adr.pincode) ? angular.copy(adr.pincode) : "";
                      defadr.billing_landmark = angular.isDefined(adr.landmark) ? angular.copy(adr.landmark) : "";
                      defadr.billing_contact_no = angular.isDefined(adr.contact_no) ? angular.copy(adr.contact_no) : "";
                      defadr.billing_company_name = angular.isDefined(adr.company_name) ? angular.copy(adr.company_name) : "";
                      defadr.billing_gstin = angular.isDefined(adr.gstin) ? angular.copy(adr.gstin) : "";
                    }
                    if (indx === result.data.Customerdetails.address.length - 1) {
                      $scope.orderviewData.invoiceForm.default_address = defadr;
                      if (angular.isDefined(ob.billing_address_line)) {
                        $scope.orderviewData.invoiceForm.billing_address = ob;
                      } else {
                        $scope.orderviewData.invoiceForm.billing_address = defadr;
                      }
                    }
                    $scope.orderviewData.customeraddress.push(angular.copy(adr));
                  });
                }
              }

              if (angular.isDefined(result.data.Invoice) && angular.isDefined(result.data.Invoice.invoice) &&
                angular.isDefined(result.data.Invoice.invoice.prefix) && angular.isDefined(result.data.Invoice.invoice.serial_no) &&
                result.data.Invoice.invoice.prefix !== "" && result.data.Invoice.invoice.serial_no !== "") {
                if (angular.isDefined(result.data.Invoiceledger) && angular.isDefined(result.data.Invoiceledger._id) &&
                                        result.data.Invoiceledger._id !== "") {
                  const invprefix = angular.copy(result.data.Invoice.invoice.prefix);
                  const invserialno = angular.copy(result.data.Invoice.invoice.serial_no);
                  $scope.orderviewData.invoiceForm.division_id = angular.copy(orderdata.division_id);
                  $scope.orderviewData.invoiceForm.ledger_id = angular.copy(result.data.Invoiceledger._id);
                  $scope.orderviewData.invoiceForm.serial_no = invserialno;
                  $scope.orderviewData.invoiceForm.prefix = invprefix;
                  $scope.orderviewData.invoiceForm.invoice_no = `${invprefix}_${invserialno}`;
                } else {
                  Notification.error("Invoice Receivable ledger not found");
                }
              }

              $scope.orderviewData.Statelistdetails = (angular.isDefined(result.data.Statelistdetails) && result.data.Statelistdetails !== null &&
                result.data.Statelistdetails.length > 0) ? angular.copy(result.data.Statelistdetails) : [];
              if (angular.isDefined(result.data.Gsttreatmentdetails) && result.data.Gsttreatmentdetails !== null &&
                result.data.Gsttreatmentdetails.length > 0) {
                $scope.orderviewData.Gsttreatmentdetails = angular.copy(result.data.Gsttreatmentdetails);
              } else {
                $scope.orderviewData.Gsttreatmentdetails = [];
              }

              if (angular.isDefined(result.data.Divisiondetails) && result.data.Divisiondetails !== null &&
                angular.isDefined(result.data.Divisiondetails.placeofSupply)) {
                $scope.orderviewData.divisionplaceofSupply = angular.copy(result.data.Divisiondetails.placeofSupply);
              } else {
                $scope.orderviewData.divisionplaceofSupply = "";
              }


              if (angular.isDefined(result.data.Process) && result.data.Process !== null && result.data.Process !== "" &&
                result.data.Process.length > 0) {
                angular.forEach(result.data.Process, (process) => {
                  if (process !== null && angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                    angular.forEach(process.measurement, (units) => {
                      const objs = {};
                      objs.division_id = process.division_id;
                      objs.process_id = process._id;
                      if (angular.isDefined(process.invoice_option)) {
                        objs.invoice_option = process.invoice_option;
                      }
                      objs.cost = units.cost;
                      objs.measurement_id = units.measurement_id;
                      objs.qty = units.qty;
                      $scope.orderviewData.Processdetails.push(objs);
                    });
                    const tx = {};
                    tx.process_id = process._id;
                    if (angular.isDefined(process.invoice_option)) {
                      tx.invoice_option = process.invoice_option;
                    }
                    tx.division_id = process.division_id;
                    tx.inter_tax_class = process.inter_tax_class;
                    tx.tax_class = process.tax_class;
                    $scope.orderviewData.Processtax.push(tx);
                  }
                });
              }

              if (angular.isDefined(result.data.Tax) && result.data.Tax !== null && result.data.Tax !== "" && result.data.Tax.length > 0) {
                angular.forEach(result.data.Tax, (taxes) => {
                  if (angular.isDefined(taxes._id) && angular.isDefined(taxes.tax_name) && angular.isDefined(taxes.tax_percentage) &&
                    taxes.tax_percentage > 0) {
                    const spobj = {};
                    spobj._id = taxes._id;
                    spobj.tax_name = taxes.tax_name;
                    spobj.display_name = `${parseFloat(taxes.tax_percentage)}% ${taxes.tax_name}`;
                    spobj.tax_percentage = parseFloat(taxes.tax_percentage);
                    $scope.orderviewData.taxes.push(spobj);
                  }
                });
              }
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data.Deliverydetails) &&
                result.data.Deliverydetails !== null && result.data.Deliverydetails.length > 0) {
                $scope.orderviewData.deliveredList = result.data.Deliverydetails;
                setTimeout(() => {
                  setDelivery($scope.orderviewData.deliveredList, orderdata).then((data) => {
                    if (angular.isDefined(data) && data.length > 0) {
                      setReturn($scope.orderviewData.deliveredList, orderdata).then((retdata) => {
                        if (angular.isDefined(retdata) && retdata.length > 0) {
                          setInvoiceoption().then((invdata) => {
                            if (angular.isDefined(invdata) && invdata.length > 0) { 
                                setInwardweight().then((inwdt) => {
                                  if (angular.isDefined(inwdt) && inwdt.length > 0) { 
                                    setSpecialprice().then((splprice) => {
                                      if (splprice !== null && splprice) {
                                        setDiscountprice().then((discprice) => {
                                          if (discprice !== null && discprice) {
                                            setBaseprice().then((baseprice) => {
                                              if (baseprice !== null && baseprice) {
                                                calculateInvoicetotal().then((invoicetotal) => {
                                                  if (invoicetotal !== null && invoicetotal) {
                                                    calculateOtheritem().then((otheritemtotal) => {
                                                      if (otheritemtotal !== null && otheritemtotal) {
                                                        $scope.orderviewData.pageLoader = false;
                                                        $scope.orderviewData.invoiceForm.enableInvoice = true;
                                                      }
                                                    });
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                            }
                          });
                        }
                      });
                    }
                  });
                }, 500);
              } else {
                Notification.warning("No Delivery detail found for this order.");
              }
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.orderviewData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.orderviewData.pageLoader = false;
      });
    }
  };

  function getOrderlist() {
    const deferred = $q.defer();
    const orderlist = _.uniq(_.flatten(_.pluck($scope.orderviewData.invoiceForm.items, "order_id")));
    deferred.resolve(orderlist);
    // async call, resolved after ajax request completes
    return deferred.promise;
  }

  $scope.saveInvoice = function () {
    if (angular.isDefined($scope.orderviewData.invoiceForm._id) && angular.isDefined($scope.orderviewData.invoiceForm.job_id)) {
      Notification.error("Cant update jobcard invoice");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.items) || (angular.isDefined($scope.orderviewData.invoiceForm.items) &&
                $scope.orderviewData.invoiceForm.items.length === 0)) {
      Notification.error("Please add items to create / update invoice");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.customer_id) || (angular.isDefined($scope.orderviewData.invoiceForm.customer_id) &&
                ($scope.orderviewData.invoiceForm.customer_id === "" || $scope.orderviewData.invoiceForm.customer_id === null))) {
      Notification.error("Please select customer");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.billing_address) ||
        $scope.orderviewData.invoiceForm.billing_address === null || $scope.orderviewData.invoiceForm.billing_address === "") {
      Notification.error("Please select address of the customer");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.billing_address.billing_address_line) ||
        (angular.isDefined($scope.orderviewData.invoiceForm.billing_address.billing_address_line) &&
        ($scope.orderviewData.invoiceForm.billing_address.billing_address_line === "" ||
        $scope.orderviewData.invoiceForm.billing_address.billing_address_line === null))) {
      Notification.error("Please select address of the customer");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.ledger_id) || (angular.isDefined($scope.orderviewData.invoiceForm.ledger_id) &&
                ($scope.orderviewData.invoiceForm.ledger_id === "" || $scope.orderviewData.invoiceForm.ledger_id === null))) {
      Notification.error("Please select the ledger");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.division_id) || (angular.isDefined($scope.orderviewData.invoiceForm.division_id) &&
                ($scope.orderviewData.invoiceForm.division_id === "" || $scope.orderviewData.invoiceForm.division_id === null))) {
      Notification.error("Please select the branch");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.customer_name) || (angular.isDefined($scope.orderviewData.invoiceForm.customer_name) &&
                ($scope.orderviewData.invoiceForm.customer_name === "" || $scope.orderviewData.invoiceForm.customer_name === null))) {
      Notification.error("Please select the customer");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.total) || (angular.isDefined($scope.orderviewData.invoiceForm.total) &&
                ($scope.orderviewData.invoiceForm.total === "" || $scope.orderviewData.invoiceForm.total === null ||
                parseFloat($scope.orderviewData.invoiceForm.total) <= 0))) {
      Notification.error("Invalid invoice total amount");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.invoiceForm.gstTreatment) || (angular.isDefined($scope.orderviewData.invoiceForm.gstTreatment) &&
                ($scope.orderviewData.invoiceForm.gstTreatment === "" || $scope.orderviewData.invoiceForm.gstTreatment === null))) {
      Notification.error("Please add the gst treatment for this customer.");
      return false;
    }

    const obj = {};
    obj.invoiceForm = angular.copy($scope.orderviewData.invoiceForm);
    obj.invoiceForm.type = "INVOICE";
    obj.invoiceForm.bill_type = "Manual";

    getOrderlist().then((orders) => {
      if (angular.isDefined(orders) && orders !== null && orders.length > 0) {
        obj.orderList = orders;

        InvoiceService.create(obj, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id) && result.data._id !== "") {
                $scope.orderviewData.invoiceForm = angular.copy(result.data);
                Notification.success("Invoice successfully saved");
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
    });
  };

  $scope.savePrice = function (process, units) {
    if (angular.isDefined($scope.orderviewData.orderDetail) && angular.isDefined($scope.orderviewData.orderDetail.order_id) &&
        $scope.orderviewData.orderDetail.order_id !== "" && angular.isDefined($scope.orderviewData.orderDetail.division_id) &&
        $scope.orderviewData.orderDetail.division_id !== "" && angular.isDefined($scope.orderviewData.orderDetail.customer_id) &&
        $scope.orderviewData.orderDetail.customer_id !== "" && angular.isDefined(process) && angular.isDefined(process.process_id) &&
        angular.isDefined(units) && angular.isDefined(units.qty) && angular.isDefined(units.price) && units.qty !== "" &&
        units.price !== "" && parseFloat(units.qty) >= 0 && parseFloat(units.price) >= 0) {
      const obj = {};
      obj._id = angular.isDefined(units._id) ? angular.copy(units._id) : "";
      obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
      obj.division_id = angular.copy($scope.orderviewData.orderDetail.division_id);
      obj.customer_id = angular.copy($scope.orderviewData.orderDetail.customer_id);
      obj.process_id = angular.copy(process.process_id);
      obj.measurement_id = angular.copy(units.measurement_id);
      obj.qty = angular.copy(units.qty);
      obj.price = angular.copy(units.price);

      $scope.orderviewData.pageLoader = true;

      OrderService.updateSpecialprice(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data._id)) {
          Notification.success(`Price for the process ${process.process_name} updated successfully`);
          units._id = result.data._id;
        }
        $scope.orderviewData.pageLoader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.orderviewData.pageLoader = false;
      });
    }
  };

  $scope.addfabricreport = function () {
    if (angular.isUndefined($scope.orderviewData.orderDetail.order_id) || $scope.orderviewData.orderDetail.order_id === null ||
        $scope.orderviewData.orderDetail.order_id === "") {
      Notification.error("No order has been found");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.labReport.KDia) || angular.isUndefined($scope.orderviewData.labReport.BW) ||
        angular.isUndefined($scope.orderviewData.labReport.AW) || angular.isUndefined($scope.orderviewData.labReport.L) ||
        angular.isUndefined($scope.orderviewData.labReport.W) || angular.isUndefined($scope.orderviewData.labReport.BWGSM) ||
        angular.isUndefined($scope.orderviewData.labReport.AWGSM)) {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    if ($scope.orderviewData.labReport.KDia === null || $scope.orderviewData.labReport.BW === null ||
        $scope.orderviewData.labReport.AW === null || $scope.orderviewData.labReport.L === null ||
        $scope.orderviewData.labReport.W === null || $scope.orderviewData.labReport.BWGSM === null ||
        $scope.orderviewData.labReport.AWGSM === null || $scope.orderviewData.labReport.colour === "" ||
        $scope.orderviewData.labReport.fabric === "" || $scope.orderviewData.labReport.KDia === "" ||
        $scope.orderviewData.labReport.BW === "" || $scope.orderviewData.labReport.AW === "" ||
        $scope.orderviewData.labReport.L === "" || $scope.orderviewData.labReport.W === "" ||
        $scope.orderviewData.labReport.BWGSM === "" || $scope.orderviewData.labReport.AWGSM === "") {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    const obj = {};
    obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
    obj.labReport = angular.copy($scope.orderviewData.labReport);

    OrderService.addLabreport(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && angular.isDefined(result.data.labReport) &&
            result.data.labReport !== null && result.data.labReport.length > 0) {
            $scope.orderviewData.labReportlist = angular.copy(result.data.labReport);
            Notification.success("Lab Report updated successfully");
          }
          $scope.orderviewData.labReport = {};
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

  $scope.updatefabricreport = function (reports) {
    if (angular.isUndefined($scope.orderviewData.orderDetail.order_id) || $scope.orderviewData.orderDetail.order_id === null ||
        $scope.orderviewData.orderDetail.order_id === "") {
      Notification.error("No order has been found");
      return false;
    }
    if (angular.isUndefined(reports.KDia) || angular.isUndefined(reports.BW) || angular.isUndefined(reports.AW) || angular.isUndefined(reports.L)
                || angular.isUndefined(reports.W) || angular.isUndefined(reports.BWGSM) || angular.isUndefined(reports.AWGSM)) {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    if (reports.KDia === null || reports.BW === null || reports.AW === null || reports.L === null || reports.W === null || 
            reports.BWGSM === null || reports.AWGSM === null || reports.colour === "" || reports.fabric === "" || reports.KDia === "" || 
            reports.BW === "" || reports.AW === "" || reports.L === "" || reports.W === "" || reports.BWGSM === "" || reports.AWGSM === "") {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    const obj = {};
    obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
    obj.labReport = angular.copy(reports);

    OrderService.updateLabreport(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && angular.isDefined(result.data.labReport) &&
            result.data.labReport !== null && result.data.labReport.length > 0) {
            $scope.orderviewData.labReportlist = angular.copy(result.data.labReport);
            Notification.success("Lab Report updated successfully");
            $scope.orderviewData.editreport = -1;
          }
          $scope.orderviewData.labReport = {};
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

  $scope.removefabricreport = function (reports) {
    if (angular.isUndefined($scope.orderviewData.orderDetail.order_id) || $scope.orderviewData.orderDetail.order_id === null ||
        $scope.orderviewData.orderDetail.order_id === "") {
      Notification.error("No order has been found");
      return false;
    }
    if (angular.isUndefined(reports) || angular.isUndefined(reports._id) || reports._id === null || reports._id === "") {
      Notification.error("Lab report record not found. PLease try again later.");
      return false;
    }
    const obj = {};
    obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
    obj.labReport = angular.copy(reports);
    obj.labReport.is_deleted = true;

    OrderService.deleteLabreport(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && angular.isDefined(result.data.labReport) &&
            result.data.labReport !== null && result.data.labReport.length > 0) {
            $scope.orderviewData.labReportlist = angular.copy(result.data.labReport);
            Notification.success("Lab Report data removed successfully");
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
  };

  $scope.addfabricsummary = function () {
    if (angular.isUndefined($scope.orderviewData.orderDetail.order_id) || $scope.orderviewData.orderDetail.order_id === null ||
        $scope.orderviewData.orderDetail.order_id === "") {
      Notification.error("No order has been found");
      return false;
    }
    if (angular.isUndefined($scope.orderviewData.labReportsummary.compdia) ||
        angular.isUndefined($scope.orderviewData.labReportsummary.afwash) ||
        angular.isUndefined($scope.orderviewData.labReportsummary.shrinklength) ||
        angular.isUndefined($scope.orderviewData.labReportsummary.shrinkwidth) ||
        angular.isUndefined($scope.orderviewData.labReportsummary.gsmbw) ||
        angular.isUndefined($scope.orderviewData.labReportsummary.gsmaw)) {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    if ($scope.orderviewData.labReportsummary.compdia === null || $scope.orderviewData.labReportsummary.afwash === null ||
        $scope.orderviewData.labReportsummary.shrinklength === null || $scope.orderviewData.labReportsummary.shrinkwidth === null ||
        $scope.orderviewData.labReportsummary.gsmbw === null || $scope.orderviewData.labReportsummary.gsmaw === null ||
        $scope.orderviewData.labReportsummary.compdia === "" || $scope.orderviewData.labReportsummary.afwash === "" ||
        $scope.orderviewData.labReportsummary.shrinklength === "" || $scope.orderviewData.labReportsummary.shrinkwidth === "" ||
        $scope.orderviewData.labReportsummary.gsmbw === "" || $scope.orderviewData.labReportsummary.gsmaw === "") {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    const obj = {};
    obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
    obj.labReportsummary = angular.copy($scope.orderviewData.labReportsummary);

    OrderService.addLabreportsummary(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && angular.isDefined(result.data.labReportsummary) &&
            result.data.labReportsummary !== null && result.data.labReportsummary.length > 0) {
            $scope.orderviewData.labReportsummarylist = angular.copy(result.data.labReportsummary);
            Notification.success("Lab Report updated successfully");
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.orderviewData.labReportsummary = {};
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.updatefabricsummary = function (summary) {
    if (angular.isUndefined($scope.orderviewData.orderDetail.order_id) || $scope.orderviewData.orderDetail.order_id === null ||
        $scope.orderviewData.orderDetail.order_id === "") {
      Notification.error("No order has been found");
      return false;
    }
    if (angular.isUndefined(summary.compdia) || angular.isUndefined(summary.afwash) || angular.isUndefined(summary.shrinklength)
                || angular.isUndefined(summary.shrinkwidth) || angular.isUndefined(summary.gsmbw) || angular.isUndefined(summary.gsmaw)) {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    if (summary.compdia === null || summary.afwash === null || summary.shrinklength === null ||
                summary.shrinkwidth === null || summary.gsmbw === null || summary.gsmaw === null ||
                summary.compdia === "" || summary.afwash === "" || summary.shrinklength === "" ||
                summary.shrinkwidth === "" || summary.gsmbw === "" || summary.gsmaw === "") {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    const obj = {};
    obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
    obj.labReportsummary = angular.copy(summary);

    OrderService.updateLabreportsummary(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && angular.isDefined(result.data.labReportsummary) &&
            result.data.labReportsummary !== null && result.data.labReportsummary.length > 0) {
            $scope.orderviewData.labReportsummarylist = angular.copy(result.data.labReportsummary);
            Notification.success("Lab Report updated successfully");
            $scope.orderviewData.editsummary = -1;
          }
          $scope.orderviewData.labReportsummary = {};
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

  $scope.removefabricsummary = function (summary) {
    if (angular.isUndefined($scope.orderviewData.orderDetail.order_id) || $scope.orderviewData.orderDetail.order_id === null ||
        $scope.orderviewData.orderDetail.order_id === "") {
      Notification.error("No order has been found");
      return false;
    }
    if (angular.isUndefined(summary) || angular.isUndefined(summary._id) || summary._id === null || summary._id === "") {
      Notification.error("Please fill all the fields and then add.");
      return false;
    }
    const obj = {};
    obj.order_id = angular.copy($scope.orderviewData.orderDetail.order_id);
    obj.labReportsummary = angular.copy(summary);
    obj.labReportsummary.is_deleted = true;

    OrderService.deleteLabreportsummary(obj, (result) => {
      if (result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && angular.isDefined(result.data._id) && angular.isDefined(result.data.labReportsummary) &&
            result.data.labReportsummary !== null && result.data.labReportsummary.length > 0) {
            $scope.orderviewData.labReportsummarylist = angular.copy(result.data.labReportsummary);
            Notification.success("Lab Report data removed successfully");
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
  };

  $scope.editthisreport = function (report) {
    if ($scope.orderviewData.labReportlist.indexOf(report) > -1) {
      $scope.orderviewData.editreport = $scope.orderviewData.labReportlist.indexOf(report);
      $scope.orderviewData.labReport = {};
    }
  };

  $scope.editthissummary = function (summary) {
    if ($scope.orderviewData.labReportsummarylist.indexOf(summary) > -1) {
      $scope.orderviewData.editsummary = $scope.orderviewData.labReportsummarylist.indexOf(summary);
      $scope.orderviewData.labReportsummary = {};
    }
  };
});
