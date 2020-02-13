/* global angular */
function dateformatFilter($filter) {
  return function (input, format) {
    if (!angular.isUndefined(input)) {
      const date = new Date(input);
      const datelocale = date.toLocaleString();
      //            return date.toLocaleString();
      let tempFormat = "dd MMM yyyy h:mma";
      if (format === "dmyt") {
        return $filter("date")(new Date(datelocale), tempFormat); // newValue;
      }
      if (format === "dmye") {
        tempFormat = "dd MMM yyyy, EEE";
        return $filter("date")(new Date(datelocale), tempFormat); // newValue;
      }
    }
  };
}
function getdateformatFilter($filter) {
  return function (utcDateString, format) {
    // return if input date is null or undefined
    if (!utcDateString) {
      return;
    }

    // append "Z" to the date string to indicate UTC time if the timezone isn't already specified
    if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
      utcDateString += 'Z';
    }

    const date = new Date(utcDateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

    const datelocale = date.toLocaleString();
    // convert and format date using the built in angularjs date filter
    return $filter("date")(datelocale, format);
  };
}
function accountbalanceFilter() {
  return function (input, ledger, branch) {
    let total = 0;
    if (angular.isUndefined(branch)) {
      return total;
    }
    if (angular.isUndefined(ledger) || (angular.isDefined(ledger) && ledger === null) ||
        (angular.isDefined(ledger) && ledger !== null && ledger.length === 0)) {
      return total;
    }

    angular.forEach(ledger, (val) => {
      if (angular.isDefined(val) && angular.isDefined(val.division_id) && val.division_id === branch &&
        angular.isDefined(val.current_balance) && val.current_balance !== "" &&
                    val.current_balance !== null) {
        total += parseFloat(val.current_balance);
      }
    });

    return total;
  };
}
function branchnameFilter() {
  return function (input, ledger, branch) {
    let name = "";
    if (angular.isUndefined(branch)) {
      return name;
    }
    if (angular.isUndefined(ledger) || (angular.isDefined(ledger) && ledger === null) ||
        (angular.isDefined(ledger) && ledger !== null && ledger.length === 0)) {
      return name;
    }

    angular.forEach(ledger, (val) => {
      if (angular.isDefined(val) && angular.isDefined(val._id) && val._id === branch &&
        angular.isDefined(val.name) && val.name !== "" && val.name !== null) {
        name = `at ${val.name}`;
      }
    });

    return name;
  };
}
function subcategoryFilter() {
  return function (modelval, enablefilter, input, codes, menu) {
    if (enablefilter && angular.isDefined(menu) && menu !== "" && menu !== null &&
        (angular.isDefined(codes.customers) || angular.isDefined(codes.items))) {
      let category = codes.customers;
      const filtered = modelval;

      if (menu === "Item Details") {
        category = codes.items;
      } else if (menu === "Services") {
        category = codes.services;
      }


      if (angular.isUndefined(category) || (angular.isDefined(category) && category === null) ||
        (angular.isDefined(category) && category !== null && category.length === 0)) {
        return filtered;
      }
      if (angular.isUndefined(input) || (angular.isDefined(input) && input === null) ||
        (angular.isDefined(input) && input !== null && input.length === 0)) {
        return filtered;
      }
      const subcategory = [];

      angular.forEach(category, (caval) => {
        if (angular.isDefined(caval.subcategorylist) && caval.subcategorylist !== null && caval.subcategorylist.length > 0) {
          angular.forEach(caval.subcategorylist, (suval) => {
            suval.selected = false;
          });
        }
      });

      angular.forEach(category, (caval) => {
        if (angular.isDefined(caval.subcategory) && caval.subcategory !== null && caval.subcategory.length > 0) {
          angular.forEach(caval.subcategory, (suval) => {
            if (angular.isDefined(suval._id) && suval._id !== "") {
              subcategory.push(suval._id);
            }
          });
        }
      });

      angular.forEach(subcategory, (selectcat) => {
        angular.forEach(category, (caval) => {
          if (angular.isDefined(caval.subcategorylist) && caval.subcategorylist !== null && caval.subcategorylist.length > 0) {
            angular.forEach(caval.subcategorylist, (suval) => {
              if (angular.isDefined(suval._id) && angular.isDefined(selectcat) && selectcat === suval._id) {
                suval.selected = true;
              }
            });
          }
        });
      });

      if (angular.isDefined(filtered)) {
        angular.forEach(filtered, (flval) => {
          flval.disabled = true;

          angular.forEach(input, (inval) => {
            if (angular.isDefined(flval.model) && flval.model !== null && angular.isDefined(flval.model.selected) &&
                flval.model.selected === true && angular.isDefined(flval.checked) && flval.checked === false) {
              flval.disabled = true;
            } else if (angular.isDefined(inval._id) && angular.isDefined(flval.model) && flval.model !== null &&
                angular.isDefined(flval.model.parent_id) && flval.model.parent_id !== null &&
                angular.isDefined(flval.model.parent_id._id) && flval.model.parent_id._id === inval._id) {
              flval.disabled = false;
            }
          });
        });
      }
      return filtered;
    }
  };
}
function codestatusFilter() {
  return function (modelval, codes, type) {
    const filtered = modelval;
    if (angular.isDefined(filtered) && filtered.length > 0) {
      if (type === "items") {
        angular.forEach(filtered, (itm) => {
          if (angular.isDefined(itm._id)) {
            itm.checked = false;
            angular.forEach(codes, (code) => {
              if (angular.isDefined(code.itemgiven_id) && itm._id === code.itemgiven_id) {
                itm.checked = true;
              }
            });
          }
        });
      } else if (type === "complaints") {
        angular.forEach(filtered, (itm) => {
          if (angular.isDefined(itm._id)) {
            itm.checked = false;
            angular.forEach(codes, (code) => {
              if (angular.isDefined(code.complaint_id) && itm._id === code.complaint_id) {
                itm.checked = true;
              }
            });
          }
        });
      }
    }
    return filtered;
  };
}

function pendingbydivision() {
  return function (modelval, id) {
    let filtered = 0;
    if(angular.isUndefined(modelval.pending_detail) || modelval.pending_detail === null || modelval.pending_detail.length === 0){
      return `₹ ${filtered.toFixed(2)}`;
    }
    if (angular.isDefined(id) && id === "") {
      filtered = modelval.total_pendingamount;
    } else {
      angular.forEach(modelval.pending_detail, (data) => {
        if (angular.isDefined(data.division_id) && data.division_id === id) {
          filtered += data.pending_amount;
        }
      });
    }
    return `₹ ${filtered.toFixed(2)}`;
  };
}

function pendingrolls() {
  return function (modelval) {
    let filtered = 0;

    angular.forEach(modelval, (data) => {
      if (angular.isDefined(data.rolls) && data.rolls !== "" && data.rolls !== null && parseInt(data.rolls) > 0) {
        filtered += parseInt(data.rolls);
      }
    });

    return filtered;
  };
}

function ledgerBalance() {
  return function (modelval) {
    let filtered = '';
    if (angular.isDefined(modelval) && modelval !== null) {
      let totalinvoice = modelval.total_invoiceamount;
      if (modelval.paidinvoice_total) {
        totalinvoice += modelval.paidinvoice_total;
      }
      if (modelval.payment_received > totalinvoice) {
        const ledgerbal = modelval.payment_received - totalinvoice;
        filtered = `₹ ${ledgerbal.toFixed(2)}`;
      }
    }
    return filtered;
  };
}

function getProcesscostFilter() {
  return function (modelval, id) {
    let cost = 0.00;
    if (angular.isDefined(modelval) && modelval.length > 0) {
      if (angular.isDefined(id) && id !== null && id !== "") {
        angular.forEach(modelval, (itm) => {
          if (angular.isDefined(itm.measurement_id) && angular.isDefined(itm.cost) && itm.cost !== null &&
            parseFloat(itm.cost) > 0 && itm.measurement_id === id) {
            cost = itm.cost;
          }
        });
      }
    }
    return cost;
  };
}

function processselectionFilter() {
  return function (modelval, processselected) {
    if (angular.isDefined(modelval) && modelval !== null && modelval.length > 0) {
      angular.forEach(modelval, (process) => {
        if (angular.isDefined(process) && angular.isDefined(process._id)) {
          process.checked = false;
          if (angular.isDefined(processselected) && processselected !== null && processselected.length > 0 &&
          angular.isDefined(processselected[processselected.length - 1]) && processselected[processselected.length - 1] !== null &&
          angular.isDefined(processselected[processselected.length - 1].process) &&
          processselected[processselected.length - 1].process !== null && processselected[processselected.length - 1].process !== "" &&
          processselected[processselected.length - 1].process.length > 0) {
            angular.forEach(processselected[processselected.length - 1].process, (data) => {
              if (angular.isDefined(data) && angular.isDefined(data.process_id) && process._id === data.process_id) {
                process.checked = true;
              }
            });
          }
        }
      });
    }
    return modelval;
  };
}

function processselectioneditFilter() {
  return function (modelval, processselected) {
    if (angular.isDefined(modelval) && modelval !== null && modelval.length > 0) {
      angular.forEach(modelval, (process) => {
        if (angular.isDefined(process) && angular.isDefined(process._id)) {
          process.checked = false;
          if (angular.isDefined(processselected) && processselected !== null && angular.isDefined(processselected.process) &&
          processselected.process !== null && processselected.process !== "" && processselected.process.length > 0) {
            angular.forEach(processselected.process, (data) => {
              if (angular.isDefined(data) && angular.isDefined(data.process_id) && process._id === data.process_id) {
                process.checked = true;
              }
            });
          }
        }
      });
    }
    return modelval;
  };
}

function orderEmpty() {
  return function (array, key, type) {
    let result;

    if (!angular.isArray(array)) { return; }

    const present = array.filter((item) => {
      return item[key];
    });

    const empty = array.filter((item) => {
      return !item[key];
    });

    switch (type) {
      case 'toBottom':
        result = present.concat(empty);
        break;
      case 'toTop':
        result = empty.concat(present);
        break;
      default:
        result = array;
        break;
    }
    return result;
  };
}

function sumByKey() {
  return function(data, key) {
    if (typeof(data) === 'undefined' || typeof(key) === 'undefined') {
        return '-';
    }

    var sum = 0;
    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i][key]) {
        sum += parseFloat(data[i][key]);
      }
    }
    if (sum>0) {
      sum = sum.toFixed(2)
    } else {
      sum = '-';
    }
    return sum;
  };
}

function ordersumByKey($filter) {
  return function(orData, key, id) {
    var sum = 0;
    if (typeof(orData) === 'undefined' || typeof(key) === 'undefined') {
        sum = sum.toFixed(3);
        return sum;
    }
    var data = $filter("filter")(orData, {customer_id: id })
    for (var i = data.length - 1; i >= 0; i--) {
      for (var j = 0; j < data[i].inwards[0].inward_data.length; j++) {
        if (data[i].inwards[0].inward_data[j][key]) {
          sum += parseFloat(data[i].inwards[0].inward_data[j][key]);
        }
      }      
    }
    if (sum>0) {
      sum = sum.toFixed(3);
    } else {
      sum = sum.toFixed(3);
    }
    return sum;
  };
}

function deliverysumByKey($filter) {
  return function(orData, key, id) {
    var sum = 0;
    if (typeof(orData) === 'undefined' || typeof(key) === 'undefined') {
        sum = sum.toFixed(3);
        return sum;
    }
    var data = $filter("filter")(orData, {customer_id: id })
    for (var i = data.length - 1; i >= 0; i--) {
      for (var j = 0; j < data[i].outward_data.length; j++) {
        if (data[i].outward_data[j][key]) {
          sum += parseFloat(data[i].outward_data[j][key]);
        }
      }      
    }
    if (sum>0) {
      sum = sum.toFixed(3);
    } else {
      sum = sum.toFixed(3);
    }
    return sum;
  };
}

angular.module("ramnathFilter", []).filter("dateformatFilter", dateformatFilter)
  .filter("getdateformatFilter", getdateformatFilter)
  .filter("accountbalanceFilter", accountbalanceFilter)
  .filter("branchnameFilter", branchnameFilter)
  .filter("subcategoryFilter", subcategoryFilter)
  .filter("codestatusFilter", codestatusFilter)
  .filter("getProcesscostFilter", getProcesscostFilter)
  .filter("processselectionFilter", processselectionFilter)
  .filter("processselectioneditFilter", processselectioneditFilter)
  .filter("pendingbydivision", pendingbydivision)
  .filter("ledgerBalance", ledgerBalance)
  .filter("orderEmpty", orderEmpty)
  .filter("pendingrolls", pendingrolls)
  .filter("sumByKey", sumByKey)
  .filter("ordersumByKey", ordersumByKey)
  .filter("deliverysumByKey", deliverysumByKey);
