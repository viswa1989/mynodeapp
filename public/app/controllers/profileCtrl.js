/* global angular */
angular.module("profileCtrl", []).controller("ProfileController", ($scope, USER_ROLE, $routeParams, $location, UserService, Notification) => {
  $scope.profile_picture = [];
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.userForm = {};
  $scope.userData = {};

  $scope.userData.pageLoad = true;
  $scope.userData.contentLoad = true;
  $scope.userData.eventLoad = false;

  $scope.inputType = "password";
  $scope.showadminuserform = false;

  $scope.userData.roles = [];

  $scope.imageloc = "Uploads/profile_picture/";

  $scope.userData.roles = USER_ROLE;

  $scope.userData.imagesrc = false;
  $scope.userData.loadedfile = "";

  $scope.files = [];

  // User Action --->Fetch user details by id
  $scope.getuserDetail = function () {
    UserService.userprofile((result) => {
      if (result !== null && angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
        $scope.userForm = angular.copy(result.data);
        if (angular.isDefined($scope.userForm.profile_picture) && $scope.userForm.profile_picture !== "") {
          $scope.userData.imagesrc = true;
          $scope.userData.loadedfile = $scope.imageloc + $scope.userForm.profile_picture;
        }
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.getuserDetail();

  // On file upload display and assign to scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files)) {
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.profile_picture = [];

        angular.forEach($scope.files, (profilepics) => {
          $scope.profile_picture.push(profilepics);
          const reader = new FileReader();
          reader.readAsDataURL(profilepics);
          reader.onload = function (e) {
            $scope.$apply(() => {
              $scope.userData.imagesrc = true;
              const obj = {};
              obj.userForm = $scope.userForm;
              if ($scope.profile_picture.length > 0) {
                obj.profile_picture = $scope.profile_picture;
              }

              UserService.updatePicture(obj, (result) => {
                if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
                  if (result.success) {
                    if (angular.isDefined(result.filename)) {
                      $scope.userForm.profile_picture = result.filename;
                      angular.forEach($scope.userData.userlist, (user) => {
                        if (!angular.isUndefined(user._id) && !angular.isUndefined($scope.userForm._id) && user._id === $scope.userForm._id) {
                          user.profile_picture = $scope.userForm.profile_picture;
                        }
                      });
                    }
                    $scope.userData.loadedfile = e.target.result;
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
            });
          };
        });
      }
    }
  };

  // User Action --->Update
  $scope.update = function (valid) {
    if (!valid) {
      return false;
    }
    if (angular.isUndefined($scope.userForm._id) || $scope.userForm._id === "") {
      Notification.error("Oops! Something happened please try again or contact your Administrator");
      return false;
    }
    if (!$scope.checkPasswordRetypePasswordmatch()) {
      return false;
    }
    delete $scope.userForm.password_confirm;
    const obj = {};
    obj.userForm = angular.copy($scope.userForm);
    // obj.userForm.role = 2;
    obj.profile_picture = $scope.profile_picture;
    $scope.userData.eventLoad = true;

    UserService.updateProfile(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }
      $scope.userData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.userData.eventLoad = false;
    });
  };

  $scope.checkPasswordRetypePasswordmatch = function () {
    let valid = true;
    $scope.userForm.matchError = false;
    if ($scope.userForm.password !== $scope.userForm.password_confirm) {
      $scope.userForm.matchError = true;
      valid = false;
    }
    $scope.userForm.alphanumeric = false;

    if (angular.isDefined($scope.userForm.password) && $scope.userForm.password !== "") {
      const pattern = new RegExp("^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$");
      const check = pattern.test($scope.userForm.password.toLowerCase());
      if ($scope.userForm.password.length < 6) {
        Notification.error("Your password must contain atleast 6 characters");
        valid = false;
      }
      if (!check) {
        $scope.userForm.alphanumeric = "Alpha numeric password needed";
        Notification.error("Your password must be an alphanumeric character");
        valid = false;
      }
    }
    return valid;
  };

  // Show user password
  $scope.showpassword = function (showorhide) {
    $scope.inputType = showorhide;
  };
});
