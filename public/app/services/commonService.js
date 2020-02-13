/* global io */
/* global angular */
angular.module("commonService", [])
  .factory("validateField", ($window, $q) => {
    return {
      checkDefined(obj, key) {
        return obj.hasOwnProperty(key) && angular.isDefined(obj[key]);
      },
      checkNull(obj, key) {
        return obj.hasOwnProperty(key) && angular.isDefined(obj[key]) && obj[key] !== null;
      },
      checkRmpty(obj, key) {
        return obj.hasOwnProperty(key) && angular.isDefined(obj[key]) && obj[key] !== "";
      },
      checkValidnumber(obj, key) {
        return obj.hasOwnProperty(key) && angular.isDefined(obj[key]) && obj[key] !== null && obj[key] !== "" && parseFloat(obj[key]) > 0;
      },
      checkValid(obj, key) {
        return obj.hasOwnProperty(key) && angular.isDefined(obj[key]) && obj[key] !== null && obj[key] !== "";
      },
      checkLength(obj, key) {
        return obj.hasOwnProperty(key) && angular.isDefined(obj[key]) && obj[key] !== null && obj[key] !== "" && obj[key].length > 0;
      },
      checkChild(obj, key1, key2) {
        return (obj.hasOwnProperty(key1) && angular.isDefined(obj[key1]) && obj[key1] !== null) ?
          (!!((angular.isDefined(obj[key1][key2]) && obj[key1][key2] !== null && obj[key1][key2] !== ""))) : false;
      },
      validate(formData, fieldData, msgData) {
        const deferred = $q.defer();
        let validfield = "";

        // loop through all possible names
        for (let j = 0; j < fieldData.length; j += 1) {
          if (validfield === "") {
            if (fieldData[j].type !== "object" && fieldData[j].type !== "array") {
              if (!this.checkValid(formData, fieldData[j].field)) {
                validfield = msgData[fieldData[j].field];
              } else {
                validfield = ((fieldData[j].type === "numberzero" && !this.checkValidnumber(formData, fieldData[j].field)) ?
                  msgData[fieldData[j].field] : validfield);
              }
            } else if (fieldData[j].type === "object" && !this.checkChild(formData, fieldData[j].field, fieldData[j].subfield)) {
              validfield = msgData[fieldData[j].field];
            } else {
              validfield = (fieldData[j].type === "array" && !this.checkLength(formData, fieldData[j].field)) ?
                msgData[fieldData[j].field] : validfield;
            }
          }
          if (j === fieldData.length - 1) {
            deferred.resolve(validfield);
          }
        }
        return deferred.promise;
      },
      validateGroup(formData, fieldData, msgData) {
        const deferred = $q.defer();
        let validfield = "";

        // loop through all possible names
        if (angular.isDefined(formData) && formData !== null && formData.length > 0) {
          let formlength = 0;
          for (let i = 0; i < formData.length; i += 1) {
            if (validfield === "") {
              for (let j = 0; j < fieldData.length; j += 1) {
                if (validfield === "") {
                  if (fieldData[j].type !== "object" && fieldData[j].type !== "array") {
                    if (!this.checkValid(formData[i], fieldData[j].field)) {
                      validfield = msgData[fieldData[j].field];
                    } else {
                      validfield = ((fieldData[j].type === "numberzero" && !this.checkValidnumber(formData[i], fieldData[j].field)) ?
                        msgData[fieldData[j].field] : validfield);
                    }
                  } else if (fieldData[j].type === "object" && !this.checkChild(formData[i], fieldData[j].field, fieldData[j].subfield)) {
                    validfield = msgData[fieldData[j].field];
                  } else {
                    validfield = (fieldData[j].type === "array" && !this.checkLength(formData[i], fieldData[j].field)) ?
                      msgData[fieldData[j].field] : validfield;
                  }
                }
                if (j === fieldData.length - 1) {
                  formlength += 1;
                }
              }
            } else {
              formlength += 1;
            }
          }
          if (formlength === formData.length) {
            deferred.resolve(validfield);
          }
        }
        return deferred.promise;
      },
    };
  })
  .factory("commonobjectService", () => {
    return {
      getCurrencyName() {
        const temp = [
          {tag: "AFA", name: "Afghani"},
          {tag: "AFN", name: "Afghani"},
          {tag: "ALK", name: "Albanian old lek"},
          {tag: "DZD", name: "Algerian Dinar"},
          {tag: "ADF", name: "Andorran Franc"},
          {tag: "ADP", name: "Andorran Peseta"},
          {tag: "AOR", name: "Angolan Kwanza Readjustado"},
          {tag: "AON", name: "Angolan New Kwanza"},
          {tag: "ARA", name: "Argentine austral"},
          {tag: "ARS", name: "Argentine Peso"},
          {tag: "ARL", name: "Argentine peso ley"},
          {tag: "ARM", name: "Argentine peso moneda nacional"},
          {tag: "AMD", name: "Armenian Dram"},
          {tag: "AWG", name: "Aruban Guilder"},
          {tag: "AUD", name: "Australian Dollar"},
          {tag: "ATS", name: "Austrian Schilling"},
          {tag: "AZM", name: "Azerbaijani manat"},
          {tag: "AZN", name: "Azerbaijanian Manat"},
          {tag: "BSD", name: "Bahamian Dollar"},
          {tag: "BHD", name: "Bahraini Dinar"},
          {tag: "BBD", name: "Barbados Dollar"},
          {tag: "BYR", name: "Belarussian Ruble"},
          {tag: "BEC", name: "Belgian Franc (convertible)"},
          {tag: "BEF", name: "Belgian Franc (currency union with LUF)"},
          {tag: "BEL", name: "Belgian Franc (financial)"},
          {tag: "BZD", name: "Belize Dollar"},
          {tag: "BMD", name: "Bermudian Dollar"},
          {tag: "BOP", name: "Bolivian peso"},
          {tag: "BOB", name: "Boliviano"},
          {tag: "BRC", name: "Brazilian cruzado"},
          {tag: "BRB", name: "Brazilian cruzeiro"},
          {tag: "BRL", name: "Brazilian Real"},
          {tag: "BND", name: "Brunei Dollar"},
          {tag: "BGN", name: "Bulgarian Lev"},
          {tag: "BGJ", name: "Bulgarian lev A/52"},
          {tag: "BGK", name: "Bulgarian lev A/62"},
          {tag: "BGL", name: "Bulgarian lev A/99"},
          {tag: "BIF", name: "Burundi Franc"},
          {tag: "PAB", name: "Balboa"},
          {tag: "THB", name: "Baht"},
          {tag: "VEF", name: "Bolivar Fuerte"},
          {tag: "XOF", name: "CFA Franc BCEAO"},
          {tag: "XAF", name: "CFA Franc BEAC"},
          {tag: "CAD", name: "Canadian Dollar"},
          {tag: "CVE", name: "Cape Verde Escudo"},
          {tag: "KYD", name: "Cayman Islands Dollar"},
          {tag: "CLP", name: "Chilean Peso"},
          {tag: "CNX", name: "Chinese People's Bank dollar"},
          {tag: "COP", name: "Colombian Peso"},
          {tag: "KMF", name: "Comoro Franc"},
          {tag: "BAM", name: "Convertible Marks"},
          {tag: "CRC", name: "Costa Rican Colon"},
          {tag: "HRK", name: "Croatian Kuna"},
          {tag: "CUP", name: "Cuban Peso"},
          {tag: "CYP", name: "Cyprus Pound"},
          {tag: "CZK", name: "Czech Koruna"},
          {tag: "CSK", name: "Czechoslovak koruna"},
          {tag: "CSJ", name: "Czechoslovak koruna A/53"},
          {tag: "XPF", name: "CFP Franc"},
          {tag: "NIO", name: "Cordoba Oro"},
          {tag: "DKK", name: "Danish Krone"},
          {tag: "DJF", name: "Djibouti Franc"},
          {tag: "DOP", name: "Dominican Peso"},
          {tag: "GMD", name: "Dalasi"},
          {tag: "MKD", name: "Denar"},
          {tag: "DEM", name: "Deutsche Mark"},
          {tag: "STD", name: "Dobra"},
          {tag: "VND", name: "Dong"},
          {tag: "EUR", name: "Euro"},
          {tag: "XCD", name: "East Caribbean Dollar"},
          {tag: "ECS", name: "Ecuador sucre"},
          {tag: "EGP", name: "Egyptian Pound"},
          {tag: "EQE", name: "Equatorial Guinean ekwele"},
          {tag: "ETB", name: "Ethiopian Birr"},
          {tag: "DDM", name: "East German Mark of the GDR (East Germany)"},
          {tag: "CDF", name: "Franc Congolais"},
          {tag: "FKP", name: "Falkland Island Pound"},
          {tag: "FJD", name: "Fiji Dollar"},
          {tag: "FIM", name: "Finnish Markka"},
          {tag: "FRF", name: "French Franc"},
          {tag: "HUF", name: "Forint"},
          {tag: "MKN", name: "Former Yugoslav Republic of Macedonia denar A/93"},
          {tag: "GHS", name: "Ghana Cedi"},
          {tag: "GHC", name: "Ghanaian cedi"},
          {tag: "GIP", name: "Gibraltar Pound"},
          {tag: "GRD", name: "Greek Drachma"},
          {tag: "GNF", name: "Guinea Franc"},
          {tag: "GNE", name: "Guinean syli"},
          {tag: "GWP", name: "Guinea-Bissau Peso"},
          {tag: "GYD", name: "Guyana Dollar"},
          {tag: "HTG", name: "Gourde"},
          {tag: "XFO", name: "Gold-Franc"},
          {tag: "PYG", name: "Guarani"},
          {tag: "HKD", name: "Hong Kong Dollar"},
          {tag: "UAH", name: "Hryvnia"},
          {tag: "INR", name: "Indian Rupee"},
          {tag: "ISK", name: "Iceland Krona"},
          {tag: "ISJ", name: "Icelandic old krona"},
          {tag: "IRR", name: "Iranian Rial"},
          {tag: "IQD", name: "Iraqi Dinar"},
          {tag: "IEP", name: "Irish Pound (Punt in Irish language)"},
          {tag: "ILP", name: "Israeli lira"},
          {tag: "ILR", name: "Israeli old sheqel"},
          {tag: "ITL", name: "Italian Lira"},
          {tag: "JMD", name: "Jamaican Dollar"},
          {tag: "JOD", name: "Jordanian Dinar"},
          {tag: "AOA", name: "Kwanza"},
          {tag: "EEK", name: "Kroon"},
          {tag: "KES", name: "Kenyan Shilling"},
          {tag: "KWD", name: "Kuwaiti Dinar"},
          {tag: "LAK", name: "Kip"},
          {tag: "MWK", name: "Kwacha"},
          {tag: "MMK", name: "Kyat"},
          {tag: "PGK", name: "Kina"},
          {tag: "ZMK", name: "Kwacha"},
          {tag: "ALL", name: "Lek"},
          {tag: "GEL", name: "Lari"},
          {tag: "HNL", name: "Lempira"},
          {tag: "LAJ", name: "Lao kip"},
          {tag: "LVL", name: "Latvian Lats"},
          {tag: "LBP", name: "Lebanese Pound"},
          {tag: "LSL", name: "Loti"},
          {tag: "LRD", name: "Liberian Dollar"},
          {tag: "LYD", name: "Libyan Dinar"},
          {tag: "LTL", name: "Lithuanian Litas"},
          {tag: "LUF", name: "Luxembourg Franc (currency union with BEF)"},
          {tag: "SLL", name: "Leone"},
          {tag: "SZL", name: "Lilangeni"},
          {tag: "BOV", name: "Mvdol"},
          {tag: "MGA", name: "Malagasy Ariary"},
          {tag: "MGF", name: "Malagasy franc"},
          {tag: "MYR", name: "Malaysian Ringgit"},
          {tag: "MVQ", name: "Maldive rupee"},
          {tag: "MAF", name: "Mali franc"},
          {tag: "MTL", name: "Maltese Lira"},
          {tag: "MUR", name: "Mauritius Rupee"},
          {tag: "MXN", name: "Mexican Peso"},
          {tag: "MXP", name: "Mexican peso"},
          {tag: "MXV", name: "Mexican Unidad de Inversion (UDI)"},
          {tag: "MDL", name: "Moldovan Leu"},
          {tag: "MCF", name: "Monegasque franc (currency union with FRF)"},
          {tag: "MAD", name: "Moroccan Dirham"},
          {tag: "MZN", name: "Metical"},
          {tag: "MZM", name: "Mozambican metical"},
          {tag: "TMM", name: "Manat"},
          {tag: "BTN", name: "Ngultrum"},
          {tag: "NOK", name: "Norwegian Krone"},
          {tag: "NZD", name: "New Zealand Dollar"},
          {tag: "ERN", name: "Nakfa"},
          {tag: "ILS", name: "New Israeli Sheqel"},
          {tag: "KPW", name: "North Korean Won"},
          {tag: "NAD", name: "Namibia Dollar"},
          {tag: "NPR", name: "Nepalese Rupee"},
          {tag: "NLG", name: "Netherlands Guilder"},
          {tag: "ANG", name: "Netherlands Antillian Guilder"},
          {tag: "NGN", name: "Naira"},
          {tag: "PEN", name: "Nuevo Sol"},
          {tag: "RON", name: "New Leu"},
          {tag: "TWD", name: "New Taiwan Dollar"},
          {tag: "TRY", name: "New Turkish Lira"},
          {tag: "MRO", name: "Ouguiya"},
          {tag: "ARP", name: "Peso argentino"},
          {tag: "BWP", name: "Pula"},
          {tag: "MOP", name: "Pataca"},
          {tag: "PKR", name: "Pakistan Rupee"},
          {tag: "PEI", name: "Peruvian inti"},
          {tag: "PEH", name: "Peruvian sol"},
          {tag: "PHP", name: "Philippine Peso"},
          {tag: "PLZ", name: "Polish zloty A/94"},
          {tag: "PTE", name: "Portuguese Escudo"},
          {tag: "TPE", name: "Portuguese Timorese escudo"},
          {tag: "TOP", name: "Pa'anga"},
          {tag: "GBP", name: "Pound Sterling"},
          {tag: "UYU", name: "Peso Uruguayo"},
          {tag: "GTQ", name: "Quetzal"},
          {tag: "QAR", name: "Qatari Rial"},
          {tag: "KHR", name: "Riel"},
          {tag: "IDR", name: "Rupiah"},
          {tag: "ZAR", name: "Rand"},
          {tag: "MVR", name: "Rufiyaa"},
          {tag: "OMR", name: "Rial Omani"},
          {tag: "ROL", name: "Romanian leu A/05"},
          {tag: "ROK", name: "Romanian leu A/52"},
          {tag: "RUB", name: "Russian Ruble"},
          {tag: "RWF", name: "Rwanda Franc"},
          {tag: "RUR", name: "Russian rubleA/97"},
          {tag: "SVC", name: "Salvadoran colón"},
          {tag: "KGS", name: "Som"},
          {tag: "CHF", name: "Swiss Franc"},
          {tag: "YDD", name: "South Yemeni dinar"},
          {tag: "SHP", name: "Saint Helena Pound"},
          {tag: "SAR", name: "Saudi Riyal"},
          {tag: "RSD", name: "Serbian Dinar"},
          {tag: "CSD", name: "Serbian Dinar"},
          {tag: "SCR", name: "Seychelles Rupee"},
          {tag: "SGD", name: "Singapore Dollar"},
          {tag: "SKK", name: "Slovak Koruna"},
          {tag: "SIT", name: "Slovenian Tolar"},
          {tag: "SBD", name: "Solomon Islands Dollar"},
          {tag: "SOS", name: "Somali Shilling"},
          {tag: "ZAL", name: "South African financial rand (Funds code)"},
          {tag: "ESP", name: "Spanish Peseta"},
          {tag: "ESA", name: "Spanish peseta (account A)"},
          {tag: "ESB", name: "Spanish peseta (account B)"},
          {tag: "LKR", name: "Sri Lanka Rupee"},
          {tag: "SDD", name: "Sudanese Dinar"},
          {tag: "SDP", name: "Sudanese Pound"},
          {tag: "SDG", name: "Sudanese Pound"},
          {tag: "SRD", name: "Surinam Dollar"},
          {tag: "SRG", name: "Suriname guilder"},
          {tag: "SEK", name: "Swedish Krona"},
          {tag: "SYP", name: "Syrian Pound"},
          {tag: "TJS", name: "Somoni"},
          {tag: "SUR", name: "Soviet Union ruble"},
          {tag: "BDT", name: "Taka"},
          {tag: "KZT", name: "Tenge"},
          {tag: "MNT", name: "Tugrik"},
          {tag: "WST", name: "Tala"},
          {tag: "TJR", name: "Tajikistan ruble"},
          {tag: "TZS", name: "Tanzanian Shilling"},
          {tag: "TTD", name: "Trinidata and Tobago Dollar"},
          {tag: "TND", name: "Tunisian Dinar"},
          {tag: "TRL", name: "Turkish lira A/05"},
          {tag: "CLF", name: "Unidades de fomento"},
          {tag: "COU", name: "Unidad de Valor real"},
          {tag: "USD", name: "US Dollar"},
          {tag: "UGX", name: "Uganda Shilling"},
          {tag: "UGS", name: "Ugandan shilling A/87"},
          {tag: "UAK", name: "Ukrainian karbovanets"},
          {tag: "AED", name: "UAE Dirham"},
          {tag: "USN", name: "US Dollar (Next Day)"},
          {tag: "USS", name: "US Dollar (Same Day)"},
          {tag: "UYN", name: "Uruguay old peso"},
          {tag: "UYI", name: "Uruguay Peso en Unidades Indexadas"},
          {tag: "UZS", name: "Uzbekistan Sum"},
          {tag: "VUV", name: "Vatu"},
          {tag: "VEB", name: "Venezuelan Bolivar"},
          {tag: "VNC", name: "Vietnamese old dong"},
          {tag: "KRW", name: "Won"},
          {tag: "CHE", name: "WIR Euro"},
          {tag: "CHW", name: "WIR Franc"},
          {tag: "CNY", name: "Yuan Renminbi"},
          {tag: "JPY", name: "Yen"},
          {tag: "YER", name: "Yemeni Rial"},
          {tag: "YUD", name: "Yugoslav Dinar"},
          {tag: "YUM", name: "Yugoslav dinar (new)"},
          {tag: "PLN", name: "Zloty"},
          {tag: "ZRN", name: "Zairean New Zaire"},
          {tag: "ZRZ", name: "Zairean Zaire"},
          {tag: "ZWD", name: "Zimbabwe Dollar"},
          {tag: "ZWC", name: "Zimbabwe Rhodesian dollar"}];
        return temp;
      },
      getCurrency() {
        return "₹ ";
      },
    };
  }).factory("socket", ["$rootScope", "$window", function ($rootScope, $window) {
    let address = `${window.location.protocol}//${window.location.host}`;
    if (window.location.host !== "localhost") {
      address += ":3031";
    }
    let details = {reconnection: true,
	    reconnectionDelay: 5000,
	    reconnectionDelayMax : 6000,
	    reconnectionAttempts: 20,resource: (`/${window.location.pathname.split("/").slice(0, -1).join("/")}/socket.io`).substring(1)};
    let socket = null;

    return {
      connect() {
        const token = $window.localStorage.getItem("token");
        if (token !== "" && token !== null) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace("-", "+").replace("_", "/");
          const sdata = JSON.parse($window.atob(base64));

          if (angular.isDefined(sdata) && sdata !== null && sdata !== "" && angular.isDefined(sdata.id) && angular.isDefined(sdata.role)) {
            if (angular.isDefined(sdata.branch)) {
              details.query = `userId=${sdata.id}&Role=${sdata.role}&Division=${sdata.branch}`;
              details.resource = (`/${window.location.pathname.split("/").slice(0, -1).join("/")}/socket.io`).substring(1);
            } else {
              details.query = `userId=${sdata.id}&Role=${sdata.role}`;
              details.resource = (`/${window.location.pathname.split("/").slice(0, -1).join("/")}/socket.io`).substring(1);
            }
            socket = io.connect(address, details);
          }
        }
      },
      on(eventName, callback) {
        if (socket !== null) {
          socket.on(eventName, function () {
            const args = arguments;
            callback.apply(socket, args);
          });
        }
      },
      emit(eventName, data) {
        if (socket !== null) {
          socket.emit(eventName, data);
        }
      },
    };
  }]);
