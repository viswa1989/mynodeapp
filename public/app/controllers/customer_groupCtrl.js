/* global parseFloat */
/* global angular */
angular.module("customergroupCtrl", []).controller("CustomergroupController", ($scope, $routeParams, CustomergroupService,
  Notification, DivisionService, manageProcessService, $filter, commonobjectService) => { // Setup customer group ctrl
  $scope.data = {};
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.error = "";

  $scope.parseFloat = parseFloat;
  // Customer scope variables
  $scope.customergroupForm = {};
  $scope.customergroupData = {};
  $scope.customergroupData.currency = commonobjectService.getCurrency();
  $scope.customergroupData.pageLoad = true;
  $scope.customergroupData.contentLoad = true;
  $scope.customergroupData.eventLoad = false;
  $scope.customergroupData.manage_discount_details = "";
  $scope.customergroupData.manage_discount_details_view = "flat";
  $scope.manage_discount_form = {};
  $scope.customergroupForm.customergroups = [];
  $scope.customergroupForm.divisions = [];
  $scope.customergroupForm.process = [];
  $scope.customergroupForm.discountview = [];
  $scope.customergroupForm.measurement = [];

  // Customer group Action --->List
  $scope.list = function () {
    $scope.customergroupData.pageLoad = true;

    CustomergroupService.get((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null) {
            if (angular.isDefined(result.data.divisions) && result.data.divisions !== null && angular.isDefined(result.data.process) &&
                result.data.process !== null && angular.isDefined(result.data.measurement) && result.data.measurement !== null) {
              angular.forEach(result.data.measurement, (measurement, key) => {
                if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure)) {
                  const obj = {};
                  obj.measurement_id = measurement._id;
                  obj.measurement_name = measurement.fabric_measure;
                  $scope.customergroupForm.measurement.push(obj);
                }
                if (key === result.data.measurement.length - 1) {
                  $scope.customergroupForm.measurement = $filter("orderBy")($scope.customergroupForm.measurement, "measurement_id");
                }
              });

              angular.forEach(result.data.divisions, (division) => {
                if (angular.isDefined(division._id) && angular.isDefined(division.name)) {
                  const divisiondata = {};
                  divisiondata.division_id = division._id;
                  divisiondata.division_name = division.name;
                  angular.forEach(result.data.process, (process) => {
                    if (angular.isDefined(process._id) && angular.isDefined(process.process_name) && angular.isDefined(process.division_id) &&
                                                process.division_id === division._id) {
                      const obj = {};
                      obj.process_id = process._id;
                      obj.process_name = process.process_name;
                      obj.division_id = process.process_name;
                      $scope.customergroupForm.process.push(obj);
                    }
                  });
                  $scope.customergroupForm.divisions.push(divisiondata);

                  angular.forEach(result.data.process, (process) => {
                    if (angular.isDefined(process._id) && angular.isDefined(process.process_name) && angular.isDefined(process.division_id) &&
                                                process.division_id === division._id) {
                      const obj = {};
                      if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                        obj.division_id = division._id;
                        obj.division_name = division.name;
                        obj.process_id = process._id;
                        obj.process_name = process.process_name;
                        obj.measurements = [];

                        let unitloop = 0;
                        angular.forEach(result.data.measurement, (measurement) => {
                          if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure)) {
                            const measure = {};
                            measure.measurement_id = measurement._id;
                            measure.measurement_name = measurement.fabric_measure;
                            measure.discount_price = 0.00;
                            measure.discount_percentage = 0.00;
                            let count = 0;
                            angular.forEach(process.measurement, (processcost, index) => {
                              if (angular.isDefined(processcost.measurement_id) && angular.isDefined(processcost.cost) &&
                                                                    processcost.measurement_id === measurement._id) {
                                measure.cost = processcost.cost;
                                obj.measurements.push(measure);
                              }
                              if (index === process.measurement.length - 1 && angular.isUndefined(measure.cost)) {
                                measure.cost = 0.00;
                                obj.measurements.push(measure);
                              }
                              count += 1;
                            });
                            if (count === process.measurement.length) {
                              unitloop += 1;
                            }
                          }
                        });
                        if (unitloop === result.data.measurement.length) {
                          obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
                          $scope.customergroupForm.discountview.push(obj);
                        }
                      } else {
                        obj.division_id = division._id;
                        obj.division_name = division.name;
                        obj.process_id = process._id;
                        obj.process_name = process.process_name;
                        obj.measurements = [];
                        angular.forEach($scope.customergroupForm.measurement, (measurement, key) => {
                          if (angular.isDefined(measurement.measurement_id) && angular.isDefined(measurement.measurement_name)) {
                            const measure = {};
                            measure.measurement_id = measurement.measurement_id;
                            measure.measurement_name = measurement.fabric_measure;
                            measure.cost = 0.00;
                            measure.discount_price = 0.00;
                            measure.discount_percentage = 0.00;
                            obj.measurements.push(measure);
                          }
                          if (key === $scope.customergroupForm.measurement.length - 1) {
                            obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
                            $scope.customergroupForm.discountview.push(obj);
                          }
                        });
                      }
                    }
                  });
                }
              });
            }

            if (angular.isDefined(result.data.groups) && result.data.groups !== null) {
              $scope.customergroupForm.customergroups = angular.copy(result.data.groups);
            }
          }
        } else {
          Notification.error(result.message);
        }
      }
      $scope.customergroupData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.customergroupData.pageLoad = false;
    });
  };
  $scope.list();

  // Customer group Action --->Add
  $scope.addCustomergroup = function () {
    const Obj = {};
    Obj.name = "";
    $scope.customergroupForm.customergroups.push(Obj);
  };

  // Customer group Action --->Add/Update
  $scope.updateCustomergroup = function (name, id, index) {
    let obj = {};
    if (!angular.isUndefined(id) && id !== "") {
      obj.name = name;
      obj._id = id;
      $scope.customergroupData.eventLoad = true;

      CustomergroupService.update(obj, (result) => {
        obj = null;
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              $scope.customergroupForm.customergroups[index] = result.data;
              Notification.success(result.message);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.customergroupData.eventLoad = false;
      }, (error) => {
        obj = null;
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.customergroupData.eventLoad = false;
      });
    } else {
      obj.name = name;
      $scope.customergroupData.eventLoad = true;

      CustomergroupService.create(obj, (result) => {
        obj = null;
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
              $scope.customergroupForm.customergroups[index] = result.data;
              Notification.success(result.message);
            }
          } else {
            Notification.error(result.message);
          }
        }
        $scope.customergroupData.eventLoad = false;
      }, (error) => {
        obj = null;
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.customergroupData.eventLoad = false;
      });
    }
  };

  // Customer group Action --->Delete
  $scope.delete = function (id, index) {
    if (!angular.isUndefined(id) && id !== "") {
      $scope.error = "";
      const item = $scope.customergroupForm.customergroups[index];
      const Obj = {};
      Obj._id = item._id;
      Obj.is_deleted = true;
      $scope.customergroupData.eventLoad = true;

      CustomergroupService.delete(Obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
          $scope.customergroupForm.customergroups.splice(index, 1);
          Notification.success(result.message);
        }
        $scope.customergroupData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.customergroupData.eventLoad = false;
      });
    } else {
      $scope.customergroupForm.customergroups.splice(index, 1);
    }
  };

  $scope.manageDiscount = function (customer_group) {
    $scope.customergroupForm.currentdivision = 0;
    if (angular.isDefined(customer_group) && $scope.customergroupForm.customergroups.indexOf(customer_group) > -1) {
      if (angular.isDefined(customer_group.group_discount) && customer_group.group_discount !== null) {
        const groups = angular.copy(customer_group);
        groups.group_discount = [];
        angular.forEach($scope.customergroupForm.discountview, (group, index) => {
          const obj = {};
          obj.division_id = group.division_id;
          obj.division_name = group.division_name;
          obj.process_id = group.process_id;
          obj.process_name = group.process_name;
          obj.measurements = group.measurements;
          obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
          obj.discount_price = group.discount_price;
          obj.cost = group.cost;
          obj.discount_percentage = group.discount_percentage;

          if (customer_group.group_discount.length > 0) {
            angular.forEach(group.measurements, (measure, key) => {
              angular.forEach(customer_group.group_discount, (grp, ind) => {
                if (angular.isDefined(grp) && grp !== null && angular.isDefined(grp.division_id) && angular.isDefined(grp.process_id) &&
                    angular.isDefined(grp.discount_price) && grp.discount_price !== null && grp.division_id === group.division_id &&
                    grp.process_id === group.process_id && angular.isDefined(grp.measurement_id) && grp.measurement_id === measure.measurement_id) {
                  measure.discount_price = grp.discount_price;
                  $scope.discountApply(measure, "PAGE");
                }
                if (key === group.measurements.length - 1 && ind === customer_group.group_discount.length - 1) {
                  groups.group_discount.push(obj);
                }
              });
            });

            if (index === $scope.customergroupForm.discountview.length - 1) {
              $scope.manage_discount_form = groups;
              $scope.customergroupData.manage_discount_details = $scope.customergroupForm.customergroups.indexOf(customer_group);
              $scope.customergroupData.defaultCustomerGroup = "price";
            }
          } else {
            angular.forEach(obj.measurements, (measure) => {
              $scope.discountApply(measure, "PAGE");
            });
            customer_group.group_discount.push(obj);


            if (index === $scope.customergroupForm.discountview.length - 1) {
              $scope.manage_discount_form = customer_group;
              $scope.customergroupData.manage_discount_details = $scope.customergroupForm.customergroups.indexOf(customer_group);
            }
            $scope.customergroupData.defaultCustomerGroup = "price";
          }
        });
      }
    }
  };

  $scope.discountApply = function (measurement, discountBy) {
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

  $scope.updateCustomerGroupdata = function (group) {
    if (angular.isDefined(group) && group !== null && angular.isDefined(group._id) && angular.isDefined(group.group_discount) &&
        group.group_discount !== null && group.group_discount.length > 0) {
      const customergroup = {};
      customergroup._id = angular.copy(group._id);
      customergroup.group_discount = [];
      let len = 0;
      angular.forEach(group.group_discount, (grp) => {
        if (angular.isDefined(grp.division_id) && angular.isDefined(grp.process_id) && angular.isDefined(grp.measurements) &&
            grp.measurements !== null && grp.measurements.length > 0) {
          angular.forEach(grp.measurements, (measure, indx) => {
            if (angular.isDefined(measure.measurement_id) && angular.isDefined(measure.discount_price) &&
                measure.discount_price !== null && measure.discount_price !== "") {
              const obj = {};
              obj.division_id = grp.division_id;
              obj.process_id = grp.process_id;
              obj.measurement_id = measure.measurement_id;
              obj.discount_price = parseFloat(measure.discount_price);
              customergroup.group_discount.push(obj);
              if (indx === grp.measurements.length - 1) {
                len += 1;
              }
            }
          });
        }
      });
      if (len === group.group_discount.length && customergroup.group_discount.length > 0) {
        $scope.customergroupData.eventLoad = true;

        CustomergroupService.updateDiscount(customergroup, (result) => {
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
            if (result.success) {
              Notification.success(result.message);
            } else {
              Notification.error(result.message);
            }
          }
          $scope.customergroupData.eventLoad = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.customergroupData.eventLoad = false;
        });
      }
    }
  };
});
