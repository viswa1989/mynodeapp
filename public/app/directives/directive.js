/* global _ */
/* global parseFloat */
/* global google */
/* global k2 */
/* global angular */
/* global $ */
angular.module("ramnathDirective", [])
  .directive("resize", ($window) => {
    return function (scope) {
      const w = angular.element($window);
      scope.getWindowDimensions = function () {
        return {
          h: w.height(),
          w: w.width(),
        };
      };

      scope.$watch(scope.getWindowDimensions, (newValue) => {
        scope.windowHeight = newValue.h;
        scope.windowWidth = newValue.w;
        const headerHeight = $(".header").height();
        scope.style = function () {
          return {
            height: `${newValue.h - headerHeight}px`,
            // "width": (newValue.w - 100) + "px"
          };
        };
      }, true);

      w.bind("resize", () => {
        scope.$apply();
      });
    };
  })
  .directive("scrollSpy", () => { // SCROLL SPY
    return {
      restrict: "A",
      link(scope, elem, attr) {
        let offset = parseInt(attr.scrollOffset, 0);
        if (!offset) {
          offset = 0;
        }
      },
    };
  })
  .directive("preventDefault", () => {
    return function (scope, element) {
      jQuery(element).click((event) => {
        event.preventDefault();
      });
    };
  })
  .directive("combineAddress", ($compile) => {
    return {
      scope: true,
      restrict: "A",
      link(scope, elem, attrs) {
        function checkIfExistingValue(obj, key) {
          return obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== "";
        }

        attrs.$observe("combineAddress", (newValue) => {
          let address = "";
          if (angular.isDefined(newValue) && newValue !== null && newValue !== "") {
            newValue = JSON.parse(newValue);
            if (attrs.deliveryaddress) {
              const nameArray = ["delivery_address_line", "delivery_city", "delivery_state", "delivery_pincode"];

              // loop through all possible names
              for (let i = 0; i < nameArray.length; i += 1) {
                if (checkIfExistingValue(newValue, nameArray[i])) {
                  if (address === "") {
                    address = newValue[nameArray[i]];
                  } else {
                    address = `${address}, ${newValue[nameArray[i]]}`;
                  }
                }
              }
              if (address !== "") {
                address += ". ";
              }
            } else {
              const nameArray = ["billing_company_name", "billing_address_line", "billing_area", "billing_city", "billing_state", "billing_pincode",
                "billing_landmark", "billing_contact_no", "billing_gstin"];

              // loop through all possible names
              for (let i = 0; i < nameArray.length; i += 1) {
                if (checkIfExistingValue(newValue, nameArray[i]) && newValue[nameArray[i]] !== null && newValue[nameArray[i]] !== "") {
                  if (nameArray[i] === "billing_company_name" || nameArray[i] === "billing_gstin") {
                    if (attrs.billGstin || attrs.billCompanyname) {
                      if (attrs.billCompanyname && nameArray[i] === "billing_company_name") {
                        address = newValue[nameArray[i]];
                      }
                      if (attrs.billGstin && nameArray[i] === "billing_gstin") {
                        address = `${address}, <br>GSTIN : ${newValue.billing_gstin}`;
                      }
                    }
                  } else if (address === "") {
                    address = newValue[nameArray[i]];
                  } else {
                    address = `${address}, ${newValue[nameArray[i]]}`;
                  }
                }
              }
              address += ".";
            }
          }

          elem.html(address);
          if (attrs.deliveryto) {
            const elmnt = $compile("<a ng-click='changedeliveryaddress()'>Change</a>")(scope);
            elem.append(elmnt);
          }
        });
      },
    };
  })
  .directive("contractAddress", ($compile) => {
    return {
      scope: true,
      restrict: "A",
      link(scope, elem, attrs) {
        function checkIfExistingValue(obj, key) {
          return obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== "";
        }

        attrs.$observe("contractAddress", (newValue) => {
          let address = "";
          if (angular.isDefined(newValue) && newValue !== null && newValue !== "") {
            newValue = JSON.parse(newValue);

            const nameArray = ["contractor_address1", "contractor_address2", "contractor_pincode", "gstin_number"];

            // loop through all possible names
            for (let i = 0; i < nameArray.length; i += 1) {
              if (checkIfExistingValue(newValue, nameArray[i]) && newValue[nameArray[i]] !== null && newValue[nameArray[i]] !== "") {
                if (nameArray[i] === "billing_company_name" || nameArray[i] === "gstin_number") {
                  if (attrs.billGstin || attrs.billCompanyname) {
                    if (attrs.billCompanyname && nameArray[i] === "billing_company_name") {
                      address = newValue[nameArray[i]];
                    }
                    if (attrs.billGstin && nameArray[i] === "gstin_number") {
                      address = `${address}, <br>GSTIN : ${newValue.gstin_number}`;
                    }
                  }
                } else if (address === "") {
                  address = newValue[nameArray[i]];
                } else {
                  address = `${address}, ${newValue[nameArray[i]]}`;
                }
              }
            }
            address += ".";
          }
          elem.html(address);
        });
      },
    };
  })
  .directive("displayAddress", ($compile) => {
    return {
      scope: true,
      restrict: "A",
      link(scope, elem, attrs) {
        function checkIfExistingValue(obj, key) {
          return obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== "";
        }

        attrs.$observe("displayAddress", (newValue) => {
          let address = "";
          if (angular.isDefined(newValue) && newValue !== null && newValue !== "") {
            newValue = JSON.parse(newValue);
            const nameArray = ["address_line", "area", "city", "state", "pincode", "landmark", "contact_no"];

            // loop through all possible names
            for (let i = 0; i < nameArray.length; i += 1) {
              if (checkIfExistingValue(newValue, nameArray[i])) {
                if (address === "") {
                  address = newValue[nameArray[i]];
                } else {
                  address = `${address}, ${newValue[nameArray[i]]}`;
                }
              }
            }
            address += ".";
          }

          elem.html(address);
        });
      },
    };
  })
  .directive("combineProcess", () => {
    return {
      restrict: "A",
      link(scope, elem, attrs) {
        attrs.$observe("combineProcess", (newValue) => {
          let process = "";
          if (angular.isDefined(newValue) && newValue !== null && newValue !== "") {
            newValue = JSON.parse(newValue);
            // loop through all possible names
            for (let i = 0; i < newValue.length; i += 1) {
              if (newValue[i] && angular.isDefined(newValue[i].process_name) && newValue[i].process_name !== null &&
                  newValue[i].process_name !== "") {
                if (process === "") {
                  process = newValue[i].process_name;
                } else {
                  process = `${process}, ${newValue[i].process_name}`;
                }
              }
            }
          }
          elem.html(process);
        });
      },
    };
  })
  .directive("scrollTo", ["$window", function ($window) { // SCROLL SPY
    return {
      restrict: "AC",
      compile() {
        function scrollInto(elementId) {
          if (!elementId) { $window.scrollTo(0, 0); }
          // check if an element can be found with id attribute
          const el = document.getElementById(elementId);
          if (el) { el.scrollIntoView(); }
        }
        return function (scope, element, attr) {
          element.bind("click", () => {
            scrollInto(attr.scrollTo);
          });
        };
      },
    };
  }])
  .directive("dateTimePicker", ($compile, $filter) => {
    function _byDefault(value, defaultValue) {
      function _isSet(val) {
        return !(val === null || angular.isUndefined(val) || val === "");
      }
      return _isSet(value) ? value : defaultValue;
    }
    return {
      restrict: "E",
      scope: {
        format: "@",
        ngModel: "=",
        todayBtn: "@",
        weekStart: "@",
        minuteStep: "@",
        autoclose: "@",
        todayHighlight: "@",
        startView: "@",
        minView: "@",
        maxView: "@",
        forceParse: "@",
        showMeridian: "@",
        container: "@",
        updateScope: "&",
        pickerPosition: "@",
        startDate: "@",
        realValue: "=",
        initialDate: "@",
        setDate: "@",
      },
      template: '<div class="input-append date form_datetime">' +
                 '   <input size="16" type="text" ng-model="picker_date" style="margin-bottom:0px;" readonly>' +
                 '<span class="add-on date_icon"></span>' +
                 '</div>',
      link(scope, element, attrs, ngModel) {
        const $element = element;
        const options = {
          format: _byDefault(scope.format, "yyyy-MM-dd"),
          weekStart: _byDefault(scope.weekStart, "1"),
          todayBtn: _byDefault(scope.todayBtn, "true") === "true",
          minuteStep: parseInt(_byDefault(scope.minuteStep, "5")),
          autoclose: parseInt(_byDefault(scope.autoclose, "1")),
          todayHighlight: parseInt(_byDefault(scope.todayHighlight, "1")),
          startView: parseInt(_byDefault(scope.startView, "2")),
          forceParse: parseInt(_byDefault(scope.forceParse, "0")),
          showMeridian: parseInt(_byDefault(scope.showMeridian, "1")),
          startDate: _byDefault(scope.startDate, ""),
          endDate: _byDefault(scope.endDate, ""),
          daysOfWeekDisabled: _byDefault(scope.daysOfWeekDisabled, []),
          minView: parseInt(_byDefault(scope.minView, 0)),
          maxView: parseInt(_byDefault(scope.maxView, 4)),
          pickerPosition: _byDefault(scope.pickerPosition, "bottom-left"),
          container: _byDefault(scope.container, ""),
          formName: _byDefault(scope.formName, ""),
          initialDate: _byDefault(scope.initialDate, new Date()),
          setDate: _byDefault(scope.setDate, new Date()),
        };
        if (angular.isDefined(scope.initialDate) && scope.initialDate.length) {
          $element.datetimepicker("update", new Date());
        }

        $element.datetimepicker(options).on("changeDate", (ev) => {
          scope.$apply(() => {
            scope.ngModel = $filter("date")(new Date(ev.date), "yyyy-MM-dd HH:mm:ss", "UTC");
            scope.realValue = $filter("date")(new Date(ev.date), "yyyy-MM-dd HH:mm:ss", "UTC");

            if (angular.isDefined(scope.updateScope())) {
              const realValue = $filter("date")(new Date(ev.date), "yyyy-MM-dd HH:mm:ss", "UTC");
              scope.updateScope()(realValue);
            }
          });
        });

        scope.$watch("ngModel", (newValue) => {
          let tempFormat = "yyyy-MM-dd";
          tempFormat = scope.format.indexOf("HH") >= 0 ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd";

          if (angular.isUndefined(scope.ngModel)) {
            if (angular.isUndefined(newValue)) {
              newValue = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
            }
            scope.picker_date = $filter("date")(new Date(newValue), tempFormat);
            scope.ngModel = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
            scope.realValue = $filter("date")(new Date(newValue), "yyyy-MM-dd HH:mm:ss", "UTC");
          } else {
            if (scope.ngModel === "") {
              scope.ngModel = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
              scope.realValue = $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss", "UTC");
            } else {
              scope.realValue = $filter("date")(new Date(scope.ngModel), "yyyy-MM-dd HH:mm:ss", "UTC");
            }
            scope.picker_date = $filter("date")(new Date(scope.ngModel), scope.format); // newValue;
          }
          $element.datetimepicker("update", new Date(newValue));
        });
      },
    };
  })
  .directive("manualdateTimePicker", ($compile, $filter, $timeout) => {
    function _byDefault(value, defaultValue) {
      function _isSet(val) {
        return !(val === null || angular.isUndefined(val) || val === "");
      }
      return _isSet(value) ? value : defaultValue;
    }
    return {
      restrict: "E",
      scope: {
        format: "@",
        ngModel: "=",
        todayBtn: "@",
        weekStart: "@",
        minuteStep: "@",
        autoclose: "@",
        todayHighlight: "@",
        startView: "@",
        minView: "@",
        maxView: "@",
        forceParse: "@",
        showMeridian: "@",
        container: "@",
        updateScope: "&",
        pickerPosition: "@",
        startDate: "@",
        realValue: "=",
        initialDate: "@",
        setDate: "@",
        atttab: '=tabattr',
      },
      template: '<div class="input-append date form_datetime">' +
                 '   <input size="16" type="text" mask="99/99/2029" restrict="reject" clean="true" ng-model="picker_date" ng-blur="updateJobData()"' +
                 'placeholder="dd/mm/yyyy" tabindex="{{atttab}}"> <span class="add-on date_icon"></span>' +
                 '</div>',
      link(scope, element, attrs, ngModel) {
        const $element = element;
        const options = {
          format: _byDefault(scope.format, "yyyy-MM-dd"),
          weekStart: _byDefault(scope.weekStart, "1"),
          todayBtn: _byDefault(scope.todayBtn, "true") === "true",
          minuteStep: parseInt(_byDefault(scope.minuteStep, "5")),
          autoclose: parseInt(_byDefault(scope.autoclose, "1")),
          todayHighlight: parseInt(_byDefault(scope.todayHighlight, "1")),
          startView: parseInt(_byDefault(scope.startView, "2")),
          forceParse: parseInt(_byDefault(scope.forceParse, "0")),
          showMeridian: parseInt(_byDefault(scope.showMeridian, "1")),
          startDate: _byDefault(scope.startDate, ""),
          endDate: _byDefault(scope.endDate, ""),
          daysOfWeekDisabled: _byDefault(scope.daysOfWeekDisabled, []),
          minView: parseInt(_byDefault(scope.minView, 0)),
          maxView: parseInt(_byDefault(scope.maxView, 4)),
          pickerPosition: _byDefault(scope.pickerPosition, "bottom-left"),
          container: _byDefault(scope.container, ""),
          formName: _byDefault(scope.formName, ""),
          initialDate: _byDefault(scope.initialDate, new Date()),
          setDate: _byDefault(scope.setDate, new Date()),
        };
        const dpElement = $element.find('span');
        const ipElement = $element.find('input');
        if (angular.isDefined(scope.initialDate) && scope.initialDate.length) {
          dpElement.datetimepicker("update", new Date());
        }

        dpElement.datetimepicker(options).on("changeDate", (ev) => {
          scope.$apply(() => {
            scope.ngModel = $filter("date")(new Date(ev.date), "yyyy-MM-dd");

            $timeout(() => {
              scope.updateScope();
            }, 100);
          });
        });

        ipElement.on('change', () => {
          if (scope.picker_date && scope.picker_date !== null && scope.picker_date !== "") {
            const dtp = ["m", "m/", "d", "d/", "y", "y", "y", "y"];
            _.map(scope.picker_date, (value, key) => {
              if (key === 0) {
                dtp[2] = value;
              }
              if (key === 1) {
                dtp[3] = `${value}/`;
              }
              if (key === 2) {
                dtp[0] = value;
              }
              if (key === 3) {
                dtp[1] = `${value}/`;
              }
              if (key > 3) {
                dtp[key] = value;
              }
            });
            const joindt = dtp.join('');

            if (joindt !== "" && joindt.length === 10) {
              const timestamp = Date.parse(joindt);
              if (isNaN(timestamp) === false) {
                scope.$apply(() => {
                  scope.ngModel = $filter("date")(new Date(timestamp), "yyyy-MM-dd");
                  $timeout(() => {
                    scope.updateScope();
                  }, 100);
                });
              } else {
                  scope.ngModel = "";
                  $timeout(() => {
                    scope.updateScope();
                  }, 100);
              }
            }
          }
        });

        scope.$watch("ngModel", (newValue) => {
          if ((!scope.ngModel || scope.ngModel === "") && angular.isUndefined(attrs.manualdt)) {
            scope.ngModel = $filter("date")(new Date(), "yyyy-MM-dd");
          }
          scope.picker_date = $filter("date")(new Date(scope.ngModel), "dd/MM/yyyy"); // newValue;
          dpElement.datetimepicker("update", newValue);
        });
      },
    };
  })
  .directive("validNumber", () => {
    return {
      require: "ngModel",
      restrict: "",
      link(scope, element, attr, ctrl) {
        if (!ctrl) {
          return "";
        }
        ctrl.$parsers.push((val) => {
          if (angular.isUndefined(val)) {
            val = "";
          }
          // parse value
          let clean = val.replace(/[^0-9\.]/g, "");
          const decimalCheck = clean.split(".");
          if (!angular.isUndefined(decimalCheck[1])) {
            decimalCheck[1] = decimalCheck[1].slice(0, 2);
            clean = `${decimalCheck[0]}.${decimalCheck[1]}`;
          }
          // method 1
          if (val !== clean) {
            ctrl.$setViewValue(clean);
            ctrl.$render();
          }
          return clean;
        });

        element.bind("blur", () => {
          let clean = element.val();
          if (clean === "") {
            clean = 0;
          }
          clean = parseFloat(clean).toFixed(2);
          ctrl.$setViewValue(clean);
          ctrl.$render();
        });
      },
    };
  })
  .directive("validNumeral", () => {
    return {
      require: "?ngModel",
      link(scope, element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }

        ngModelCtrl.$parsers.push((val) => {
          if (angular.isUndefined(val)) {
            val = "";
          }
          let clean = val.replace(/[^0-9\.]/g, "");
          const decimalCheck = clean.split(".");

          if (!angular.isUndefined(decimalCheck[1])) {
            decimalCheck[1] = decimalCheck[1].slice(0, 3);
            clean = `${decimalCheck[0]}.${decimalCheck[1]}`;
          }

          if (val !== clean) {
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
          }
          return clean;
        });

        element.bind("keypress", (event) => {
          if (event.keyCode === 32) {
            event.preventDefault();
          }
        });
      },
    };
  })
  .directive("isolateForm", [function () {
    return {
      restrict: "A",
      require: "?form",
      link(scope, elm, attrs, ctrl) {
        if (!ctrl) {
          return;
        }

        // Do a copy of the controller
        const ctrlCopy = {};
        angular.copy(ctrl, ctrlCopy);

        // Get the parent of the form
        const parent = elm.parent().controller("form");
        // Remove parent link to the controller
        parent.$removeControl(ctrl);

        // Replace form controller with a "isolated form"
        const isolatedFormCtrl = {
          $setValidity(validationToken, isValid, control) {
            ctrlCopy.$setValidity(validationToken, isValid, control);
            parent.$setValidity(validationToken, true, ctrl);
          },
          $setDirty() {
            elm.removeClass("ng-pristine").addClass("ng-dirty");
            ctrl.$dirty = true;
            ctrl.$pristine = false;
          },
        };
        angular.extend(ctrl, isolatedFormCtrl);
      },
    };
  }])
  .directive("validNumber3", () => {
    return {
      require: "ngModel",
      restrict: "",
      link(scope, element, attr, ctrl) {
        if (!ctrl) {
          return "";
        }
        ctrl.$parsers.push((val) => {
          if (angular.isUndefined(val)) {
            val = "";
          }
          // parse value
          let clean = val.replace(/[^0-9\.]/g, "");
          const decimalCheck = clean.split(".");
          if (!angular.isUndefined(decimalCheck[1])) {
            decimalCheck[1] = decimalCheck[1].slice(0, 3);
            clean = `${decimalCheck[0]}.${decimalCheck[1]}`;
          }
          // method 1
          if (val !== clean) {
            ctrl.$setViewValue(clean);
            ctrl.$render();
          }
          return clean;
        });

        element.bind("blur", () => {
          let clean = element.val();
          if (clean === "") {
            clean = 0;
          }
          clean = parseFloat(clean).toFixed(3);
          ctrl.$setViewValue(clean);
          ctrl.$render();
        });
      },
    };
  })
  .directive("lowerThan", () => {
    const link = function ($scope, $element, $attrs, ctrl) {
      const validate = function (viewValue) {
        const comparisonModel = $attrs.lowerThan;
        if (!viewValue || !comparisonModel) {
          // It's valid because we have nothing to compare against
          ctrl.$setValidity("lowerThan", true);
        }
        // It's valid if model is lower than the model we're comparing against
        ctrl.$setValidity("lowerThan", parseInt(viewValue, 10) <= parseInt(comparisonModel, 10));
        return viewValue;
      };
      ctrl.$parsers.unshift(validate);
      ctrl.$formatters.push(validate);
      $attrs.$observe("lowerThan", () => {
        return validate(ctrl.$viewValue);
      });
    };
    return {
      require: "ngModel",
      link,
    };
  })
  .directive("higherThan", () => {
    const link = function ($scope, $element, $attrs, ctrl) {
      const validate = function (viewValue) {
        const comparisonModel = $attrs.higherThan;
        if (!viewValue || !comparisonModel) {
          // It's valid because we have nothing to compare against
          ctrl.$setValidity("higherThan", true);
        }
        // It's valid if model is lower than the model we're comparing against
        ctrl.$setValidity("higherThan", parseInt(viewValue, 10) >= parseInt(comparisonModel, 10));
        return viewValue;
      };
      ctrl.$parsers.unshift(validate);
      ctrl.$formatters.push(validate);
      $attrs.$observe("higherThan", () => {
        return validate(ctrl.$viewValue);
      });
    };
    return {
      require: "ngModel",
      link,
    };
  })
  .directive("validOnlynumber", () => {
    return {
      require: "?ngModel",
      link(scope, element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }

        ngModelCtrl.$parsers.push((val) => {
          const clean = val.replace(/[^0-9]+/g, "");
          if (val !== clean) {
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
          }
          return clean;
        });

        element.bind("keypress", (event) => {
          if (event.keyCode === 32) {
            event.preventDefault();
          }
        });
      },
    };
  })
  .directive("myMap", () => {
    // directive link function
    const link = function (scope, element) {
      let map;
      let infoWindow;
      const markers = [];

      // map config
      const mapOptions = {
        center: new google.maps.LatLng(50, 2),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
      };

        // init the map
      function initMap() {
        if (map === void 0) {
          map = new google.maps.Map(element[0], mapOptions);
        }
      }

      // place a marker
      function setMarker(map, position, title, content) {
        const markerOptions = {
          position,
          map,
          title,
          icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        };

        const marker = new google.maps.Marker(markerOptions);
        markers.push(marker); // add marker to array

        google.maps.event.addListener(marker, "click", () => {
          // close window if not undefined
          if (infoWindow !== void 0) {
            infoWindow.close();
          }
          // create new window
          const infoWindowOptions = {
            content,
          };
          infoWindow = new google.maps.InfoWindow(infoWindowOptions);
          infoWindow.open(map, marker);
        });
      }
      // show the map and place some markers
      initMap();

      setMarker(map, new google.maps.LatLng(51.508515, -0.125487), "London", "Just some content");
      setMarker(map, new google.maps.LatLng(52.370216, 4.895168), "Amsterdam", "More content");
      setMarker(map, new google.maps.LatLng(48.856614, 2.352222), "Paris", "Text here");
    };

    return {
      restrict: "A",
      template: '<div id="gmaps"></div>',
      replace: true,
      link,
    };
  })
  .directive("ngOptionsDisabled", ["$parse", function ($parse) {
    const disableOptions = function (scope, oldval, data, formname) {
      // disabled options in the select element.
      let fname = "";
      let fdata = "";
      if (formname === "stockform") {
        fname = scope.grnstockForm.stock_details;
        fdata = scope.grnstockData;
      } else if (formname === "itemform") {
        fname = scope.itemstockForm;
        fdata = scope.itemstockData;
      }
      if (fname !== "" && fdata !== "") {
        angular.forEach(fname, (stock, index) => {
          angular.forEach(fdata[index].itemlist, (itemstock, itemindex) => {
            angular.forEach(fname, (stocklist) => {
              const el = angular.element(`.itemrand${index}`);
              const option = el.find("option");
              const ele = angular.element(option[itemindex + 1]);
              if (!angular.isUndefined(stocklist.item_id) && stocklist.item_id === itemstock._id && stocklist.item_id !== stock.item_id) {
                if (ele.val() !== "") {
                  ele.attr("disabled", true);
                }
              }
              if (angular.isUndefined(stocklist.item_id) && !angular.isUndefined(oldval) && oldval !== "" &&
                itemstock._id === oldval && data === "old") {
                ele.removeAttr("disabled");
              }
            });
          });
        });
      }
    };

    return {
      priority: 0,
      require: "ngModel",
      link(scope, el, attrs, ctrl) {
        const expElements = attrs.ngOptionsDisabled.match(
          /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
        const attrToWatch = expElements[3];
        scope.$watch(attrToWatch, (newValue) => {
          disableOptions(scope, newValue, "new", attrs.stock);
        }, true);
        // handle model updates properly
        scope.$watch(attrs.ngModel, (newValue, oldValue) => {
          disableOptions(scope, oldValue, "old", attrs.stock);
        });
      },
    };
  }])
  .directive("fallbackSrc", () => {
    const fallbackSrc = {
      link: function postLink(scope, iElement, iAttrs) {
        iElement.bind("error", function () {
          let imgsrc = "";
          if (iAttrs.fallbackSrc === "profile") {
            imgsrc = "Uploads/profile_picture/profile.png";
          } else if (iAttrs.fallbackSrc === "product") {
            imgsrc = "Uploads/item_picture/Preview.png";
          }
          angular.element(this).attr("src", imgsrc);
        });
      },
    };
    return fallbackSrc;
  })
  .directive("notyRemove", ($compile, $filter, dialogs) => {
    return {
      restrict: "A",
      scope: {
        notyScope: "=",
        notyIndex: "@",
        notyStyle: "@",
        notyUpdate: "&",
        notyContent: "@",
        notyDisabled: "@",
      },
      link(scope, element, attrs) {
        const $element = element;
        $element.bind("click", (event) => {
          event.preventDefault();
          const msg = attrs.notyContent;
          if (angular.isDefined(attrs.notyConfirm)) {
            const dlg = dialogs.confirm("confirmation", msg);
            dlg.result.then(() => {
              scope.confirmed = 'You confirmed "Yes."';
              if (angular.isDefined(scope.notyUpdate())) {
                if (scope.notyStyle === 1 || scope.notyStyle === "1") {
                  scope.notyUpdate()(scope.notyIndex, scope.notyScope);
                } else if (scope.notyStyle === 2 || scope.notyStyle === "2") {
                  scope.notyUpdate()(event, scope.notyScope);
                }
              }
            }, (btn) => {
              scope.confirmed = 'You confirmed "No."';
            });
          } else {
            const dlg = dialogs.remove("confirmation", msg);
            dlg.result.then((btn) => {
              scope.confirmed = 'You confirmed "Yes."';
              if (angular.isDefined(scope.notyUpdate())) {
                if (scope.notyStyle === 1 || scope.notyStyle === "1") {
                  scope.notyUpdate()(scope.notyIndex, scope.notyScope);
                } else if (scope.notyStyle === 2 || scope.notyStyle === "2") {
                  scope.notyUpdate()(event, scope.notyScope);
                }
              }
            }, () => {
              scope.confirmed = 'You confirmed "No."';
            });
          }
        });
      },
    };
  })
  .directive("notyDisable", ($compile, $filter, dialogs) => {
    return {
      restrict: "A",
      scope: {
        notyScope: "=",
        notyIndex: "@",
        notyStyle: "@",
        notyUpdate: "&",
        notyContent: "@",
        notyDisabled: "@",
      },
      link(scope, element, attrs) {
        const $element = element;
        $element.bind("click", (event) => {
          event.preventDefault();
          const msg = attrs.notyContent;
          const dlg = dialogs.disable("confirmation", msg);
          dlg.result.then(() => {
            scope.confirmed = 'You confirmed "Yes."';
            if (angular.isDefined(scope.notyUpdate())) {
              if (scope.notyStyle === 1 || scope.notyStyle === "1") {
                scope.notyUpdate()(scope.notyIndex, scope.notyScope);
              } else if (scope.notyStyle === 2 || scope.notyStyle === "2") {
                scope.notyUpdate()(event, scope.notyScope);
              }
            }
          }, (btn) => {
            scope.confirmed = 'You confirmed "No."';
          });
        });
      },
    };
  })
  .directive("notyEnable", ($compile, $filter, dialogs) => {
    return {
      restrict: "A",
      scope: {
        notyScope: "=",
        notyIndex: "@",
        notyStyle: "@",
        notyUpdate: "&",
        notyContent: "@",
        notyDisabled: "@",
      },
      link(scope, element, attrs) {
        const $element = element;
        $element.bind("click", (event) => {
          event.preventDefault();
          const msg = attrs.notyContent;
          const dlg = dialogs.enable("confirmation", msg);
          dlg.result.then(() => {
            scope.confirmed = 'You confirmed "Yes."';
            if (angular.isDefined(scope.notyUpdate())) {
              if (scope.notyStyle === 1 || scope.notyStyle === "1") {
                scope.notyUpdate()(scope.notyIndex, scope.notyScope);
              } else if (scope.notyStyle === 2 || scope.notyStyle === "2") {
                scope.notyUpdate()(event, scope.notyScope);
              }
            }
          }, (btn) => {
            scope.confirmed = 'You confirmed "No."';
          });
        });
      },
    };
  })
  .directive("draggable", () => {
    return {
      // A = attribute, E = Element, C = Class and M = HTML Comment
      restrict: "A",
      link(scope, element, attrs) {
        element.draggable({
          revert: true,
        });
      },
    };
  })
  .value("uiSortableConfig", {
    items: "> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]",
  })
  .directive("uiSortable", [
    "uiSortableConfig", "$timeout", "$log",
    function (uiSortableConfig, $timeout, $log) {
      return {
        require: "?ngModel",
        scope: {
          ngModel: "=",
          uiSortable: "=",
          // //Expression bindings from html.
          create: "&uiSortableCreate",
          // helper:"&uiSortableHelper",
          start: "&uiSortableStart",
          activate: "&uiSortableActivate",
          // sort:"&uiSortableSort",
          // change:"&uiSortableChange",
          // over:"&uiSortableOver",
          // out:"&uiSortableOut",
          beforeStop: "&uiSortableBeforeStop",
          update: "&uiSortableUpdate",
          remove: "&uiSortableRemove",
          receive: "&uiSortableReceive",
          deactivate: "&uiSortableDeactivate",
          stop: "&uiSortableStop",
        },
        link(scope, element, attrs, ngModel) {
          let savedNodes;
          let helper;

          function combineCallbacks(first, second) {
            const firstIsFunc = typeof first === "function";
            const secondIsFunc = typeof second === "function";
            if (firstIsFunc && secondIsFunc) {
              return function () {
                first.apply(this, arguments);
                second.apply(this, arguments);
              };
            } else if (secondIsFunc) {
              return second;
            }
            return first;
          }

          function getSortableWidgetInstance(element) {
            const data = element.data("ui-sortable");
            if (data && typeof data === "object" && data.widgetFullName === "ui-sortable") {
              return data;
            }
            return null;
          }

          function patchSortableOption(key, value) {
            if (callbacks[key]) {
              if (key === "stop") {
                value = combineCallbacks(
                  value, () => { scope.$apply(); });

                value = combineCallbacks(value, afterStop);
              }
              value = combineCallbacks(callbacks[key], value);
            } else if (wrappers[key]) {
              value = wrappers[key](value);
            }

            if (!value && (key === "items" || key === "ui-model-items")) {
              value = uiSortableConfig.items;
            }

            return value;
          }

          function patchUISortableOptions(newVal, oldVal, sortableWidgetInstance) {
            function addDummyOptionKey(value, key) {
              if (!(key in opts)) {
                opts[key] = null;
              }
            }
            angular.forEach(callbacks, addDummyOptionKey);

            let optsDiff = null;

            if (oldVal) {
              let defaultOptions;
              angular.forEach(oldVal, (oldValue, key) => {
                if (!newVal || !(key in newVal)) {
                  if (key in directiveOpts) {
                    if (key === "ui-floating") {
                      opts[key] = "auto";
                    } else {
                      opts[key] = patchSortableOption(key, undefined);
                    }
                    return;
                  }

                  if (!defaultOptions) {
                    defaultOptions = angular.element.ui.sortable().options;
                  }
                  let defaultValue = defaultOptions[key];
                  defaultValue = patchSortableOption(key, defaultValue);

                  if (!optsDiff) {
                    optsDiff = {};
                  }
                  optsDiff[key] = defaultValue;
                  opts[key] = defaultValue;
                }
              });
            }

            // update changed options
            angular.forEach(newVal, (value, key) => {
              if (key in directiveOpts) {
                if (key === "ui-floating" && (value === false || value === true) && sortableWidgetInstance) {
                  sortableWidgetInstance.floating = value;
                }

                opts[key] = patchSortableOption(key, value);
                return;
              }

              value = patchSortableOption(key, value);

              if (!optsDiff) {
                optsDiff = {};
              }
              optsDiff[key] = value;
              opts[key] = value;
            });

            return optsDiff;
          }

          function getPlaceholderElement(element) {
            const placeholder = element.sortable("option", "placeholder");

            if (placeholder && placeholder.element && typeof placeholder.element === "function") {
              let result = placeholder.element();
              result = angular.element(result);
              return result;
            }
            return null;
          }

          function getPlaceholderExcludesludes(element, placeholder) {
            const notCssSelector = opts["ui-model-items"].replace(/[^,]*>/g, "");
            const excludes = element.find(`[class="${placeholder.attr('class')}"]:not(${notCssSelector})`);
            return excludes;
          }

          function hasSortingHelper(element, ui) {
            const helperOption = element.sortable("option", "helper");
            return helperOption === "clone" || (typeof helperOption === "function" && ui.item.sortable.isCustomHelperUsed());
          }

          function getSortingHelper(element, ui/* , savedNodes */) {
            let result = null;
            if (hasSortingHelper(element, ui) &&
                element.sortable("option", "appendTo") === "parent") {
              result = helper;
            }
            return result;
          }

          function isFloating(item) {
            return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
          }

          function getElementContext(elementScopes, element) {
            for (let i = 0; i < elementScopes.length; i += 1) {
              const c = elementScopes[i];
              if (c.element[0] === element[0]) {
                return c;
              }
            }
          }

          function afterStop(e, ui) {
            ui.item.sortable._destroy();
          }

          function getItemIndex(item) {
            return item.parent()
              .find(opts["ui-model-items"])
              .index(item);
          }

          let opts = {};

          let directiveOpts = {
            "ui-floating": undefined,
            "ui-model-items": uiSortableConfig.items,
          };

          let callbacks = {
            create: null,
            start: null,
            activate: null,
            // sort: null,
            // change: null,
            // over: null,
            // out: null,
            beforeStop: null,
            update: null,
            remove: null,
            receive: null,
            deactivate: null,
            stop: null,
          };

          let wrappers = {
            helper: null,
          };

          angular.extend(opts, directiveOpts, uiSortableConfig, scope.uiSortable);

          if (!angular.element.fn || !angular.element.fn.jquery) {
            $log.error("ui.sortable: jQuery should be included before AngularJS!");
            return;
          }

          function wireUp() {
            scope.$watchCollection("ngModel", () => {
              $timeout(() => {
                if (getSortableWidgetInstance(element)) {
                  element.sortable("refresh");
                }
              }, 0, false);
            });

            callbacks.start = function (e, ui) {
              if (opts["ui-floating"] === "auto") {
                const siblings = ui.item.siblings();
                const sortableWidgetInstance = getSortableWidgetInstance(angular.element(e.target));
                sortableWidgetInstance.floating = isFloating(siblings);
              }

              const index = getItemIndex(ui.item);
              ui.item.sortable = {
                model: ngModel.$modelValue[index],
                index,
                source: element,
                sourceList: ui.item.parent(),
                sourceModel: ngModel.$modelValue,
                cancel() {
                  ui.item.sortable._isCanceled = true;
                },
                isCanceled() {
                  return ui.item.sortable._isCanceled;
                },
                isCustomHelperUsed() {
                  return !!ui.item.sortable._isCustomHelperUsed;
                },
                _isCanceled: false,
                _isCustomHelperUsed: ui.item.sortable._isCustomHelperUsed,
                _destroy() {
                  angular.forEach(ui.item.sortable, (value, key) => {
                    ui.item.sortable[key] = undefined;
                  });
                },
                _connectedSortables: [],
                _getElementContext(element) {
                  return getElementContext(this._connectedSortables, element);
                },
              };
            };

            callbacks.activate = function (e, ui) {
              const isSourceContext = ui.item.sortable.source === element;
              const savedNodesOrigin = isSourceContext ?
                ui.item.sortable.sourceList :
                element;
              const elementContext = {
                element,
                scope,
                isSourceContext,
                savedNodesOrigin,
              };
              ui.item.sortable._connectedSortables.push(elementContext);

              savedNodes = savedNodesOrigin.contents();
              helper = ui.helper;

              const placeholder = getPlaceholderElement(element);
              if (placeholder && placeholder.length) {
                const excludes = getPlaceholderExcludesludes(element, placeholder);
                savedNodes = savedNodes.not(excludes);
              }
            };

            callbacks.update = function (e, ui) {
              if (!ui.item.sortable.received) {
                ui.item.sortable.dropindex = getItemIndex(ui.item);
                const droptarget = ui.item.parent().closest("[ui-sortable], [data-ui-sortable], [x-ui-sortable]");
                ui.item.sortable.droptarget = droptarget;
                ui.item.sortable.droptargetList = ui.item.parent();

                const droptargetContext = ui.item.sortable._getElementContext(droptarget);
                ui.item.sortable.droptargetModel = droptargetContext.scope.ngModel;

                element.sortable("cancel");
              }

              const sortingHelper = !ui.item.sortable.received && getSortingHelper(element, ui, savedNodes);
              if (sortingHelper && sortingHelper.length) {
                savedNodes = savedNodes.not(sortingHelper);
              }
              const elementContext = ui.item.sortable._getElementContext(element);
              savedNodes.appendTo(elementContext.savedNodesOrigin);

              if (ui.item.sortable.received) {
                savedNodes = null;
              }

              if (ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
                scope.$apply(() => {
                  ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0,
                    ui.item.sortable.moved);
                });
                scope.$emit("ui-sortable:moved", ui);
              }
            };

            callbacks.stop = function (e, ui) {
              const wasMoved = ("dropindex" in ui.item.sortable) &&
                              !ui.item.sortable.isCanceled();

              if (wasMoved && !ui.item.sortable.received) {
                scope.$apply(() => {
                  ngModel.$modelValue.splice(
                    ui.item.sortable.dropindex, 0,
                    ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
                });
                scope.$emit("ui-sortable:moved", ui);
              } else if (!wasMoved &&
                         !angular.equals(element.contents().toArray(), savedNodes.toArray())) {
                const sortingHelper = getSortingHelper(element, ui, savedNodes);
                if (sortingHelper && sortingHelper.length) {
                  savedNodes = savedNodes.not(sortingHelper);
                }
                const elementContext = ui.item.sortable._getElementContext(element);
                savedNodes.appendTo(elementContext.savedNodesOrigin);
              }

              savedNodes = null;
              helper = null;
            };

            callbacks.receive = function (e, ui) {
              ui.item.sortable.received = true;
            };

            callbacks.remove = function (e, ui) {
              if (!("dropindex" in ui.item.sortable)) {
                element.sortable("cancel");
                ui.item.sortable.cancel();
              }

              if (!ui.item.sortable.isCanceled()) {
                scope.$apply(() => {
                  ui.item.sortable.moved = ngModel.$modelValue.splice(
                    ui.item.sortable.index, 1)[0];
                });
              }
            };

            angular.forEach(callbacks, (value, key) => {
              callbacks[key] = combineCallbacks(callbacks[key],
                function () {
                  const attrHandler = scope[key];
                  let attrHandlerFn;
                  if (typeof attrHandler === "function" &&
                      (`uiSortable${key.substring(0, 1).toUpperCase()}${key.substring(1)}`).length &&
                      typeof (attrHandlerFn = attrHandler()) === "function") {
                    attrHandlerFn.apply(this, arguments);
                  }
                });
            });

            wrappers.helper = function (inner) {
              if (inner && typeof inner === "function") {
                return function (e, item) {
                  const oldItemSortable = item.sortable;
                  const index = getItemIndex(item);
                  item.sortable = {
                    model: ngModel.$modelValue[index],
                    index,
                    source: element,
                    sourceList: item.parent(),
                    sourceModel: ngModel.$modelValue,
                    _restore() {
                      angular.forEach(item.sortable, (value, key) => {
                        item.sortable[key] = undefined;
                      });

                      item.sortable = oldItemSortable;
                    },
                  };

                  const innerResult = inner.apply(this, arguments);
                  item.sortable._restore();
                  item.sortable._isCustomHelperUsed = item !== innerResult;
                  return innerResult;
                };
              }
              return inner;
            };

            scope.$watchCollection("uiSortable", (newVal, oldVal) => {
              const sortableWidgetInstance = getSortableWidgetInstance(element);
              if (sortableWidgetInstance) {
                const optsDiff = patchUISortableOptions(newVal, oldVal, sortableWidgetInstance);

                if (optsDiff) {
                  element.sortable("option", optsDiff);
                }
              }
            }, true);

            patchUISortableOptions(opts);
          }

          function init() {
            if (ngModel) {
              wireUp();
            } else {
              //              $log.info("ui.sortable: ngModel not provided!", element);
            }

            element.sortable(opts);
          }

          function initIfEnabled() {
            if (scope.uiSortable && scope.uiSortable.disabled) {
              return false;
            }

            init();

            initIfEnabled.cancelWatcher();
            initIfEnabled.cancelWatcher = angular.noop;

            return true;
          }

          initIfEnabled.cancelWatcher = angular.noop;

          if (!initIfEnabled()) {
            initIfEnabled.cancelWatcher = scope.$watch("uiSortable.disabled", initIfEnabled);
          }
        },
      };
    },
  ])
  .directive("droppable", () => {
    return {
      restrict: "A",
      link(scope, element, attrs) {
        // This makes an element Droppable
        element.droppable({
          drop(event, ui) {
            const dragIndex = angular.element(ui.draggable).data("index");
            const reject = angular.element(ui.draggable).data("reject");
            const dragEl = angular.element(ui.draggable).parent();
            const dropEl = angular.element(this);

            if (dragEl.hasClass("list1") && !dropEl.hasClass("list1") && reject !== true) {
              scope.list2.push(scope.list1[dragIndex]);
              scope.list1.splice(dragIndex, 1);
            } else if (dragEl.hasClass("list2") && !dropEl.hasClass("list2") && reject !== true) {
              scope.list1.push(scope.list2[dragIndex]);
              scope.list2.splice(dragIndex, 1);
            }
            scope.$apply();
          },
        });
      },
    };
  })
  .directive("applystatus", () => {
    return {
      restrict: "A",
      link(scope, elem, attrs) {
        attrs.$observe("applystatus", (val) => {
          if (val === "New Order") {
            elem.addClass("white");
          } else if (val === "In Progress") {
            elem.addClass("blue");
          } else if (val === "Completed") {
            elem.addClass("green");
          } else if (val === "Invoice and Delivery") {
            elem.addClass("yellow");
          } else {
            elem.addClass("white");
          }
        });
      },
    };
  })
  .directive("mygeoMaps", () => {
    return {
      restrict: "EA",
      require: "?ngModel",
      scope: {
        myModel: "=ngModel",
        locate: "=",
      },
      link(scope, element, attrs, ngModel) {
        let mapOptions;
        let googleMap;
        let searchMarker;
        let searchLatLng;

        ngModel.$render = function () {
          searchLatLng = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);

          mapOptions = {
            center: searchLatLng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
          };

          googleMap = new google.maps.Map(element[0], mapOptions);

          searchMarker = new google.maps.Marker({
            position: searchLatLng,
            map: googleMap,
            draggable: true,
          });

          google.maps.event.addListener(searchMarker, "dragend", () => {
            scope.$apply(() => {
              scope.myModel.latitude = searchMarker.getPosition().lat();
              scope.myModel.longitude = searchMarker.getPosition().lng();
            });
          });
        };

        scope.$watch("myModel", () => {
          const myPosition = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);

          const lat = scope.myModel.latitude;
          const long = scope.myModel.longitude;
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&sensor=false`;
          $.get(url).success((data) => {
            const loc1 = data.results[0];
            const locationbase = scope.locate.address;
            $.each(loc1, (k1, v1) => {
              if (k1 === "address_components") {
                for (let i = 0; i < v1.length; i += 1) {
                  for (k2 in v1[i]) {
                    if (k2 === "types") {
                      const types = v1[i][k2];

                      if (types[0] === "sublocality_level_1" && types[1] === "sublocality" && types[2] === "political") {
                        const street = v1[i].long_name;
                        scope.$apply(() => {
                          scope.myModel.street = street;
                          locationbase.address_line = street;
                        });
                      }

                      if (types[0] === "locality" && types[1] === "political") {
                        const city = v1[i].long_name;
                        scope.$apply(() => {
                          scope.myModel.city = city;
                          locationbase.city = city;
                        });
                      }

                      if (types[0] === "administrative_area_level_1" && types[1] === "political") {
                        const state = v1[i].long_name;
                        scope.$apply(() => {
                          scope.myModel.state = state;
                          locationbase.state = state;
                        });
                      }

                      if (types[0] === "postal_code") {
                        const postal_code = v1[i].long_name;
                        scope.$apply(() => {
                          scope.myModel.postal_code = postal_code;
                          locationbase.pincode = postal_code;
                        });
                      }
                      locationbase.latitude = lat;
                      locationbase.longitude = long;
                    }
                  }
                }
              }
            });
            // / End of Address_components
          });
          searchMarker.setPosition(myPosition);
        }, true);
      },
    };
  })
  .directive("scrollTrigger", ($window) => {
    return {
      link(scope, element, attrs) {
        const offset = parseInt(attrs.threshold) || 0;
        const e = jQuery(element[0]);
        const doc = jQuery(document);

        angular.element(document).bind("scroll", () => {
          if (doc.scrollTop() + $window.innerHeight + offset > e.offset().top) {
            scope.$apply(attrs.scrollTrigger);
          }
        });
      },
    };
  })
  .directive("orderDirective", () => {
    return {
      link(scope, element, attributes) {
        attributes.$observe("dyeingName", (value) => {
          if (angular.isDefined(value) && value !== null && value.length > 0) {
            const str = angular.fromJson(value);
            let dyeing_name = _(str).pluck("dyeing_name");
            dyeing_name = _(dyeing_name).uniq();
            dyeing_name = dyeing_name.map((elem) => {
              return elem;
            }).join(", ");
            element.html(dyeing_name);
          }
        });

        attributes.$observe("dyeingDc", (value) => {
          if (angular.isDefined(value) && value !== null && value.length > 0) {
            const str = angular.fromJson(value);
            let dyeing_dc_no = _(str).pluck("dyeing_dc_no");
            dyeing_dc_no = _(dyeing_dc_no).uniq();
            dyeing_dc_no = dyeing_dc_no.map((elem) => {
              return elem;
            }).join(", ");
            element.html(dyeing_dc_no);
          }
        });

        attributes.$observe("processName", (value) => {
          if (angular.isDefined(value) && value !== null && value.length > 0) {
            const str = angular.fromJson(value);
            let process_name = _(str).pluck("process_name");
            process_name = _(process_name).uniq();
            process_name = process_name.map((elem) => {
              return elem;
            }).join(", ");
            element.html(process_name);
          }
        });

        attributes.$observe("orderNo", (value) => {
          if (angular.isDefined(value) && value !== null && value.length > 0) {
            const str = angular.fromJson(value);
            let order_no = _(str).pluck("order_no");
            order_no = _(order_no).uniq();
            let ordno = order_no[0];
            if (order_no.length > 1) {
              ordno = `${ordno} ${order_no.length}` - 1;
            }

            element.html(ordno);
          }
        });
      },
    };
  })
  .directive("selectedLink", ["$location", function (location) {
    return {
      restrict: "A",
      scope: {
        selectedLink: "=",
      },
      link(scope, element, attrs, controller) {
        const level = scope.selectedLink;
        const path = attrs.ngHref;
        //            path = path.substring(1); //hack because path does not return including hashbang
        scope.location = location;
        scope.$watch("location.path()", (newPath) => {
          let i = 0;
          const p = path.split("/");
          const n = newPath.split("/");

          for (i; i < p.length; i += 1) {
            if (angular.isUndefined(p[i]) || angular.isUndefined(n[i]) || (p[i] !== n[i])) { break; }
          }

          if ((i - 1) >= level) {
            element.addClass("selected");
          } else {
            element.removeClass("selected");
          }
        });
      },
    };
  }])
  .directive('focus', ($timeout, $parse) => {
    return {
      link(scope, element, attrs) {
        const model = $parse(attrs.focus);
        scope.$watch(model, (value) => {
          if (value === true) {
            $timeout(() => {
              element[0].focus();
            }, 200);
          }
        });
      },
    };
  })
  .directive('ngEnter', () => {
    return function (scope, element, attrs) {
      element.bind("keydown", (event) => {
        if (event.which === 13) {
          scope.$apply(() => {
            scope.$eval(attrs.ngEnter);
          });
          event.stopPropagation();
        }
      });
    };
  })
  .directive('ngSel', () => {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", (event) => {
        if (event.which === 13) {
          scope.$apply(() => {
            scope.$eval(attrs.ngSel);
          });
          event.preventDefault();
        }
      });
    };
  })
  .directive('negativeDecimalconv', ($compile) => {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: { model: '=ngModel', negativeDecimalconv: '@' },
      link(scope, element, attrs, ngModelCtrl) {
        let position = scope.negativeDecimalconv;
        element.bind('blur', (event) => {
          let value = element.val();
          if (angular.isUndefined(position) || position === '') {
            position = 2;
          }
          if (value === '' || value.length === 0 || isNaN(parseFloat(value))) {
            scope.model = '';
          } else {
            value = parseFloat(value).toFixed(position);
            scope.model = value;
          }
        });
      },
    };
  })
  .directive('negativedecimal', () => {
    return {
      require: '?ngModel',
      link(scope, element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }

        ngModelCtrl.$parsers.push((val) => {
          if (angular.isUndefined(val)) {
            val = '';
          }

          let clean = val.replace(/[^-0-9\.]/g, '');
          const negativeCheck = clean.split('-');
          const decimalCheck = clean.split('.');
          if (!angular.isUndefined(negativeCheck[1])) {
            negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
            clean = `${negativeCheck[0]}-${negativeCheck[1]}`;
            if (negativeCheck[0].length > 0) {
              clean = negativeCheck[0];
            }
          }

          if (!angular.isUndefined(decimalCheck[1])) {
            decimalCheck[1] = decimalCheck[1].slice(0, 2);
            clean = `${decimalCheck[0]}.${decimalCheck[1]}`;
          }

          if (val !== clean) {
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
          }
          return clean;
        });

        element.bind('keypress', (event) => {
          if (event.keyCode === 32) {
            event.preventDefault();
          }
        });
      },
    };
  })
  .directive('scrollToTop', function() {
    return function(scope, element, attrs) {
      var container = angular.element(element);
      container.bind("scroll", function(evt) {
          if (container[0].scrollTop > 100) {
                $('.scroll-top-display').fadeIn();
          } else {
                $('.scroll-top-display').fadeOut();
          }
      });
    };
  })
  .directive('scrollToId', function($window) {
    return {
      link: function(scope, element, attrs) {
        var value = attrs.scrollToId;
        element.click(function() {
          scope.$apply(function() {
            var selector = "[scroll-to-top='"+ value +"']";
            var elem = $(selector);
            if(elem.length){
                angular.element(elem).animate({scrollTop:0}, "slow");
            }
          });
        });
      }
    };
  });
function closeNoty(random) {
  $.noty.close(random);
  return false;
}
