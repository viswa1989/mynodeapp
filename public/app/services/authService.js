/* global angular */
angular.module("authService", [])
  .factory("AuthToken", ($window) => {
    return {
      setToken(token) {
        $window.localStorage.setItem("token", token);
        $window.localStorage.removeItem("jobcard");
        $window.localStorage.removeItem("date_format");
        // $window.sessionStorage.setItem("token", token);
        return true;
      },
      getToken() {
        return $window.localStorage.getItem("token");
        // return $window.sessionStorage.getItem("token");
      },
    };
  })
  .factory("AuthService", ($http, $window, AuthToken, $rootScope, UserService, $location, socket) => {
    let userprivileges = [];
    return {
      login(params, success, error) {
        this.getApp();
        params.userrole = $rootScope.currentapp;
        userprivileges = [];
        $http.post("/api/authenticate/login", params).success(success).error(error);
      },
      customerlogin(params, success, error) {
        this.getApp();
        params.userrole = $rootScope.currentapp;
        userprivileges = [];
        $http.post("/customerapp/authenticate/login", params).success(success).error(error);
      },
      logout() {
        $http.get("/api/authenticate/logout").success((result) => {
          AuthToken.setToken("");
          $rootScope.profileData = {};
          $rootScope.privileges = [];
          userprivileges = [];

          if (angular.isDefined($rootScope.currentapp) && $rootScope.currentapp !== "") {
            $location.path(`/${$rootScope.currentapp}/login`);
          } else {
            $location.path("/divisionadmin/login");
          }
          if (result !== null && result.id) {
            socket.emit("logout", {userId: result.id});
          } else {
            socket.connect();
          }
          $window.location.reload();
        }).error(() => {

        });
      },
      customerlogout() {
        $http.get("/customerapp/authenticate/logout").success(() => {
          AuthToken.setToken("");
          $rootScope.profileData = {};
          $rootScope.privileges = [];
          userprivileges = [];

          $location.path("/customer/login");
          socket.connect();
          $window.location.reload();
        }).error(() => {

        });
      },
      resetPassword(params, success, error) {
        this.getApp();
        params.userrole = $rootScope.currentapp;

        $http.post("/api/authenticate/resetPassword", params).success(success).error(error);
      },
      isLogged() {
        const token = AuthToken.getToken();
        if (angular.isDefined(token) && token !== null && token !== "" && token.length > 15) {
          return true;
        }
        return false;
      },
      me() {
        this.getApp();
        if ($rootScope.currentapp === "customer") {
          UserService.currentuser((data) => {
            if (angular.isDefined(data.success) && data.success && angular.isDefined(data.message) && data.message !== null &&
                angular.isDefined(data.message._id)) {
              $rootScope.profileData = data.message;
            }
            socket.connect();
            return true;
          });
        } else {
          UserService.me((data) => {
            if (angular.isDefined(data.success) && data.success && angular.isDefined(data.message) && angular.isDefined(data.message.user) &&
                angular.isDefined(data.message.user._id) && data.message.user._id !== "" && angular.isDefined(data.message.privilege)) {
              $rootScope.profileData = data.message.user;
              angular.forEach(data.message.masterprivilege, (masterpriv) => {
                angular.forEach(data.message.privilege, (priv) => {
                  if (angular.isDefined(masterpriv._id) && angular.isDefined(masterpriv.pid) && masterpriv.pid >= 0 &&
                    masterpriv._id !== "" && angular.isDefined(priv.privilege_master_id) && priv.privilege_master_id === masterpriv._id &&
                    angular.isDefined(priv.Read) && angular.isDefined(priv.Modify) && angular.isDefined(priv.Remove) &&
                    (priv.Read || priv.Modify || priv.Remove)) {
                    const obj = {};
                    obj.Privilege_id = masterpriv.privilege_id;
                    obj.Page = masterpriv.page;
                    obj.pid = masterpriv.pid;
                    obj.View = priv.Read;
                    obj.Read = priv.Read;
                    obj.Modify = priv.Modify;
                    obj.Remove = priv.Remove;
                    userprivileges.push(angular.copy(obj));
                  }
                });
              });
              angular.forEach(data.message.masterprivilege, (masterpriv) => {
                let exist = false;
                angular.forEach(userprivileges, (usrpriv) => {
                  if (usrpriv.pid === masterpriv.privilege_id && !exist) {
                    const obj = {};
                    obj.Privilege_id = masterpriv.privilege_id;
                    obj.Page = masterpriv.page;
                    obj.pid = masterpriv.pid;
                    obj.View = true;
                    obj.Read = true;
                    obj.Modify = false;
                    obj.Remove = false;
                    userprivileges.push(angular.copy(obj));
                    exist = true;
                  }
                });
              });
              const objs = {};
              objs.Privilege_id = 0;
              objs.Page = "Dashboard";
              objs.pid = 0;
              objs.View = true;
              objs.Read = true;
              objs.Modify = false;
              objs.Remove = false;
              userprivileges.push(angular.copy(objs));
            }
            socket.connect();
            return true;
          });
        }
      },
      isAuthorized() {
        const token = AuthToken.getToken();
        if (angular.isDefined(token) && token !== "" && token !== null) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace("-", "+").replace("_", "/");
          const user = JSON.parse($window.atob(base64));
          if (angular.isDefined(user.role) && user.role > 0) {
            return true;
          }
          AuthToken.setToken("");
          return false;
        }
        return true;
      },
      currentApp() {
        const token = AuthToken.getToken();

        if (token !== "" && token !== null) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace("-", "+").replace("_", "/");
          const user = JSON.parse($window.atob(base64));
          if (user.role === 1) {
            return "superadmin";
          } else if (user.role >= 2 && user.role < 8) {
            return "divisionadmin";
          } else if (user.role === 8) {
            return "customer";
          }
          return "";
        }
        return "";
      },
      getApp() {
        const pId = $location.path().split("/");
        if (pId.length > 1 && (pId[1] === "superadmin" || pId[1] === "divisionadmin" || pId[1] === "customer")) {
          $rootScope.currentapp = pId[1];
        }
      },
      canAccess(page, action) {
        if (this.currentApp() !== "superadmin" && angular.isDefined(userprivileges) && userprivileges.length > 0 && angular.isDefined(page)
                            && angular.isDefined(action)) {
          let exist = false;
          let len = 0;
          angular.forEach(userprivileges, (usrpriv) => {
            if (usrpriv.Page === page && angular.isDefined(usrpriv[action]) && usrpriv[action]) {
              exist = true;
            }
            len += 1;
          });
          if (userprivileges.length === len) {
            return exist;
          }
        } else if (this.currentApp() === "superadmin") {
          return true;
        } else if (this.currentApp() === "customer" && (page === "Dashboard" || page === "Profile" || page === "Reports")) {
          return true;
        } else {
          return false;
        }
      },
    };
  })
  .factory("JobsstorageService", ($window, $q) => {
    const jobcard = JSON.parse($window.localStorage.getItem("jobcard")) || [];

    return {
      setJobdetail(Jobdata) {
        const deferred = $q.defer();
        if (jobcard !== null && jobcard.length === 0) {
          Jobdata.order_id = 1;
          Jobdata.current_bill = true;
          Jobdata.jobstatus = "PENDING";
          Jobdata.order_type = "Normal";
          jobcard.push(Jobdata);
          $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));

          deferred.resolve(Jobdata.order_id);
        } else {
          angular.forEach(jobcard, (jobs, ind) => {
            jobcard[ind].current_bill = false;

            if (angular.isDefined(jobs.order_id) && jobs.order_id !== "" && jobcard.length - 1 === ind) {
              Jobdata.order_id = parseInt(jobs.order_id) + 1;
              Jobdata.current_bill = true;
              Jobdata.jobstatus = "PENDING";
              Jobdata.order_type = "Normal";
              jobcard.push(Jobdata);
              $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));

              deferred.resolve(Jobdata.order_id);
            }
          });
        }
        return deferred.promise;
      },
      getJobdetail() {
        const deferred = $q.defer();
        deferred.resolve(JSON.parse($window.localStorage.getItem("jobcard")));
        return deferred.promise;
      },
      updateJobdetail(Jobdata) {
        const deferred = $q.defer();
        if (jobcard !== null && jobcard.length > 0) {
          angular.forEach(jobcard, (jobs, ind) => {
            if (angular.isDefined(jobs.order_id) && jobs.order_id !== "" && Jobdata.order_id === jobs.order_id) {
              jobcard[ind] = Jobdata;
              $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
              deferred.resolve(Jobdata.order_id);
            }
          });
        }
        return deferred.promise;
      },
      selectJobdetail(Jobid) {
        const deferred = $q.defer();
        let jobdetails = {};
        if (jobcard !== null && jobcard.length > 0 && Jobid !== "") {
          angular.forEach(jobcard, (jobs, ind) => {
            jobcard[ind].current_bill = false;
            if (angular.isDefined(jobs.order_id) && jobs.order_id !== "" && Jobid === jobs.order_id) {
              jobcard[ind].current_bill = true;
              jobdetails = angular.copy(jobcard[ind]);
            }
            if (ind === jobcard.length - 1) {
              $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
              deferred.resolve(jobdetails);
            }
          });
        }
        return deferred.promise;
      },
      closeJobdetail(Jobid) {
        const deferred = $q.defer();
        const jobdetails = {};
        if (jobcard !== null && jobcard.length > 0 && Jobid !== "") {
          if (jobcard.length === 1) {
            angular.forEach(jobcard, (jobs, ind) => {
              if (ind === jobcard.length - 1 && Jobid._id === jobs._id) {
                jobcard.splice(ind, 1);
                $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
                deferred.resolve(jobdetails);
              }
            });
          } else {
            angular.forEach(jobcard, (jobs, ind) => {
              if (Jobid._id === jobs._id && ind === jobcard.length - 1) {
                jobcard[ind - 1].current_bill = true;
                jobdetails.order_id = jobcard[ind - 1].order_id;
                jobcard.splice(ind, 1);

                $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
                deferred.resolve(jobdetails);
              } else if (Jobid._id === jobs._id && ind < jobcard.length - 1) {
                jobcard[ind + 1].current_bill = true;
                jobdetails.order_id = jobcard[ind + 1].order_id;
                jobcard.splice(ind, 1);

                $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
                deferred.resolve(jobdetails);
              }
            });
          }
        }
        return deferred.promise;
      },
      closetempJobdetail(Jobid) {
        const deferred = $q.defer();
        const jobdetails = {};
        if (jobcard !== null && jobcard.length > 0 && Jobid !== "") {
          if (jobcard.length === 1) {
            angular.forEach(jobcard, (jobs, ind) => {
              if (ind === jobcard.length - 1 && Jobid.order_id === jobs.order_id) {
                jobcard.splice(ind, 1);
                $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
                deferred.resolve(jobdetails);
              }
            });
          } else {
            angular.forEach(jobcard, (jobs, ind) => {
              if (Jobid.order_id === jobs.order_id && ind === jobcard.length - 1) {
                jobcard[ind - 1].current_bill = true;
                jobdetails.order_id = jobcard[ind - 1].order_id;
                jobcard.splice(ind, 1);

                $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
                deferred.resolve(jobdetails);
              } else if (Jobid.order_id === jobs.order_id && ind < jobcard.length - 1) {
                jobcard[ind + 1].current_bill = true;
                jobdetails.order_id = jobcard[ind + 1].order_id;
                jobcard.splice(ind, 1);

                $window.localStorage.setItem("jobcard", JSON.stringify(jobcard));
                deferred.resolve(jobdetails);
              }
            });
          }
        }
        return deferred.promise;
      },
    };
  })
  .factory("DateformatstorageService", ($window, $q) => {
    // const dateformats = JSON.parse($window.localStorage.getItem("date_format")) || "";

    return {
      setformat(formatdata) {
        const deferred = $q.defer();
        if (formatdata !== null && formatdata !== "") {
          $window.localStorage.setItem("date_format", JSON.stringify(formatdata));

          deferred.resolve(formatdata);
        }
        return deferred.promise;
      },
      getformat() {
        const deferred = $q.defer();
        deferred.resolve(JSON.parse($window.localStorage.getItem("date_format")));
        return deferred.promise;
      },
    };
  })
  .factory("AuthInterceptor", ($q, AuthToken, $rootScope) => {
    const onHeader = {
      request(config) {
        const accessToken = AuthToken.getToken();
        if (accessToken) {
          config.headers["x-session-token"] = accessToken;
        }
        return config;
      },
      responseError(response) {
        if (response.status === 498) {
          $rootScope.logout();
        }
        return $q.reject(response);
      },
    };
    return onHeader;
  })
  .config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push("AuthInterceptor");
  }]);
