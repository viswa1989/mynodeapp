/* global angular */
angular.module("loginCtrl", []).controller("LoginController", ($rootScope, $routeParams, $scope, Notification, $location, AuthService,
  AuthToken, $window, socket) => {
  $scope.loginForm = {};
  $rootScope.profileData = {};
  $rootScope.privileges = [];
  $rootScope.profileData.name = "";
  $scope.profileData = {};
  $scope.profileData.loginerror = false;
  $scope.profileData.emptyfield = false;
  $scope.errormsg = "";
  $scope.profileData.username = "";

  $scope.onLogin = function () {
    $scope.profileData.eventLoad = true;
    $scope.profileData.emptyfield = false;
    $scope.profileData.loginerror = false;

    AuthService.login($scope.loginForm, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.token) && result.token !== "") {
            AuthService.me();
            AuthToken.setToken(result.token);
            const token = AuthToken.getToken();
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace("-", "+").replace("_", "/");
            const user = JSON.parse($window.atob(base64));
            if (user.role && user.role !== "" && AuthService.currentApp() !== "") {
              setTimeout(() => {
                socket.emit("login", user);
              }, 500);
              $rootScope.role = user.role;
              $rootScope.loginStatus = true;
              $location.path(`/${angular.lowercase($rootScope.currentapp)}/dashboard`);
            } else {
              AuthService.logout();
            }
          }
        } else {
          $scope.profileData.loginerror = true;
          $scope.errormsg = result.message;
        }
      }
      $scope.profileData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        $scope.errormsg = error.message;
      }
      $scope.profileData.emptyfield = true;
      $scope.profileData.eventLoad = false;
    });
  };

  $scope.oncustomerLogin = function () {
    $scope.profileData.eventLoad = true;
    $scope.profileData.emptyfield = false;
    $scope.profileData.loginerror = false;

    AuthService.customerlogin($scope.loginForm, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.token) && result.token !== "") {
            AuthService.me();
            AuthToken.setToken(result.token);
            const token = AuthToken.getToken();
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace("-", "+").replace("_", "/");
            const user = JSON.parse($window.atob(base64));
            if (user.role && user.role !== "" && AuthService.currentApp() !== "") {
              setTimeout(() => {
                socket.emit("login", user);
              }, 500);
              $rootScope.role = user.role;
              $rootScope.loginStatus = true;
              $location.path(`/${angular.lowercase($rootScope.currentapp)}/dashboard`);
            } else {
              AuthService.customerlogout();
            }
          }
        } else {
          $scope.profileData.loginerror = true;
          $scope.errormsg = result.message;
        }
      }
      $scope.profileData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        $scope.errormsg = error.message;
      }
      $scope.profileData.emptyfield = true;
      $scope.profileData.eventLoad = false;
    });
  };

  $scope.profileData.loginsection = true;
  $scope.profileData.forgetsection = false;

  $scope.forgotpassword = function () {
    $scope.profileData.username = "";
    $scope.errormsg = "";
    $scope.profileData.eventLoad = false;
    $scope.profileData.forgetpasswordsuccess = false;
    $scope.profileData.resetpassword = false;
    $scope.profileData.forgetpassworderror = false;
    $scope.profileData.loginsection = false;
    $scope.profileData.forgetsection = true;
  };

  $scope.requestpassword = function () {
    $scope.profileData.forgetpassworderror = false;
    $scope.errormsg = "";
    if (angular.isUndefined($scope.profileData.username) || (angular.isDefined($scope.profileData.username) && $scope.profileData.username === "")) {
      $scope.profileData.forgetpassworderror = true;
      $scope.errormsg = "Please enter your username";
    } else {
      const obj = {};
      obj.username = angular.copy($scope.profileData.username);
      $scope.profileData.eventLoad = true;

      AuthService.resetPassword(obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
          if (result.success) {
            $scope.profileData.forgetpasswordsuccess = true;
          } else {
            $scope.profileData.forgetpassworderror = true;
            $scope.errormsg = result.message;
          }
        }
        $scope.profileData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          $scope.errormsg = error.message;
        }
        $scope.profileData.eventLoad = false;
      });
    }
  };

  $scope.loginpage = function () {
    $scope.errormsg = "";
    $scope.loginForm = {};
    $scope.profileData.emptyfield = false;
    $scope.profileData.loginerror = false;
    $scope.profileData.eventLoad = false;
    $scope.profileData.loginsection = true;
    $scope.profileData.forgetsection = false;
    $scope.profileData.resetpassword = false;
  };
});
