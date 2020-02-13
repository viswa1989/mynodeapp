/* global angular */
angular.module("adminuserCtrl", []).controller("AdminuserController", ($scope, USER_ROLE, $routeParams, $location, $anchorScroll,
  UserService, commonobjectService, Notification) => { // setup admin user ctrl
  $scope.data = {};
  $scope.profile_picture = [];
  $scope.action = $routeParams.action;
  $scope.id = $routeParams.id;
  $scope.userForm = {};
  $scope.userData = {};

  $scope.userData.pageLoad = true;
  $scope.userData.contentLoad = true;
  $scope.userData.eventLoad = false;

  $scope.error = "";
  $scope.inputType = "password";
  $scope.showadminuserform = false;
  $scope.userData.roles = [];
  $scope.userData.privileges = [];
  $scope.imageloc = "Uploads/profile_picture/";
  $scope.userData.roles = USER_ROLE;

  $scope.userData.imagesrc = false;
  $scope.userData.formsubmission = false;
  $scope.userData.loadedfile = "";
  $scope.userData.userlist = [];
  $scope.userData.process = "";
  $scope.files = [];

  $scope.commonobjectService = commonobjectService;

  $scope.getPrivileges = function () {
    UserService.getPrivilegelist((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
        angular.isDefined(result.data) && result.data.length > 0) {
        $scope.userData.privileges = angular.copy(result.data);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  // Show Add user form
  $scope.addusers = function () {
    $scope.userData.formsubmission = false;
    $scope.getPrivileges();
    $scope.userData.Readall = false;
    $scope.userData.Modifyall = false;
    $scope.userData.Removeall = false;
    $scope.userForm = {};
    $scope.userData.imagesrc = false;
    $scope.userData.loadedfile = "";
    $scope.userData.process = "ADD";
    $scope.showadminuserform = true;
  };

  // On file upload display and assign to scope
  $scope.onFileSelect = function ($files) {
    if ($files !== "" && isNaN($files)) {
      $scope.files = $files;
      if ($scope.files.length > 0) {
        $scope.profile_picture = [];
        if ($scope.userData.process === "ADD") {
          angular.forEach($scope.files, (profilepics) => {
            $scope.profile_picture.push(profilepics);
            const reader = new FileReader();
            reader.readAsDataURL(profilepics);
            reader.onload = function (e) {
              $scope.$apply(() => {
                $scope.userData.loadedfile = e.target.result;
                $scope.userData.imagesrc = true;
              });
            };
          });
        } else if ($scope.userData.process === "UPDATE") {
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
    }
  };

  // User Action --->List
  $scope.list = function () {
    $scope.userData.pageLoad = true;
    UserService.getAdmins((data) => {
      if (angular.isDefined(data) && data !== null && data.length > 0) {
        $scope.userData.userlist = angular.copy(data);
      }
      $scope.userData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.userData.pageLoad = false;
    });
  };

  $scope.setReadall = function (data) {
    if (angular.isUndefined(data.Readall)) {
      data.Readall = true;
    } else {
      data.Readall = !data.Readall;
    }
    angular.forEach($scope.userData.privileges, (privilege) => {
      privilege.Read = angular.copy(data.Readall);
    });
  };

  $scope.setModifyall = function (data) {
    if (angular.isUndefined(data.Modifyall)) {
      data.Modifyall = true;
    } else {
      data.Modifyall = !data.Modifyall;
    }
    angular.forEach($scope.userData.privileges, (privilege) => {
      privilege.Modify = angular.copy(data.Modifyall);
    });
  };

  $scope.setRemoveall = function (data) {
    if (angular.isUndefined(data.Removeall)) {
      data.Removeall = true;
    } else {
      data.Removeall = !data.Removeall;
    }
    angular.forEach($scope.userData.privileges, (privilege) => {
      privilege.Remove = angular.copy(data.Removeall);
    });
  };

  $scope.list();

  // User Action --->Create
  $scope.create = function (valid) {
    $scope.userData.formsubmission = true;
    $scope.userForm.privileges = [];
    if (angular.isDefined($scope.userData.privileges) && $scope.userData.privileges.length > 0) {
      angular.forEach($scope.userData.privileges, (priv) => {
        if (angular.isDefined(priv.pid) && priv.pid !== "" && parseInt(priv.pid) > 0) {
          const privobj = {};
          privobj.privilege_master_id = priv._id;
          privobj.privilege_id = priv.privilege_id;
          privobj.Read = priv.Read;
          privobj.Modify = priv.Modify;
          privobj.Remove = priv.Remove;
          $scope.userForm.privileges.push(angular.copy(privobj));
        }
      });
    }
    if (!valid) {
      Notification.error("Please enter value for all the required fields.");
      angular.element(".viewplace.wrapper_hight")[0].scrollTop = 500;
      return false;
    }
    if (angular.isUndefined($scope.userForm.privileges) || (angular.isDefined($scope.userForm.privileges) &&
        $scope.userForm.privileges.length <= 0)) {
      Notification.error("Add privileges for the user to proceed");
      return false;
    }
    const obj = {};

    obj.userForm = $scope.userForm;
    obj.userForm.role = 1;
    obj.profile_picture = $scope.profile_picture;
    $scope.userData.eventLoad = true;

    UserService.create(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          if (angular.isDefined(result.data) && result.data !== null && angular.isDefined(result.data._id)) {
            $scope.userForm._id = angular.copy(result.data._id);
            $scope.userData.userlist.push(angular.copy($scope.userForm));
          } else {
            $scope.getPrivileges();
            $scope.list();
          }
          $scope.userData.process = "";
          $scope.showadminuserform = false;
          $scope.userForm = {};
          $scope.profile_picture = [];
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }
      $scope.userData.formsubmission = false;
      $scope.userData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.userData.formsubmission = false;
      $scope.userData.eventLoad = false;
    });
  };

  // User Action --->Fetch user details by id
  $scope.getuserbyId = function (id) {
    $scope.userData.Readall = false;
    $scope.userData.Modifyall = false;
    $scope.userData.Removeall = false;
    $scope.userData.formsubmission = false;
    UserService.getPrivilegelist((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success &&
        angular.isDefined(result.data) && result.data.length > 0) {
        $scope.userData.privileges = angular.copy(result.data);
        $scope.getuserafterprivilege(id);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.getuserafterprivilege(id);
    });
  };

  $scope.getuserafterprivilege = function (id) {
    if (id !== "") {
      $scope.userData.process = "UPDATE";
      $scope.userForm = {};
      $scope.userData.imagesrc = false;
      $scope.userData.loadedfile = "";
      $scope.showadminuserform = true;

      UserService.getById(id, (data) => {
        if (angular.isDefined(data) && data !== null && data !== "" && data.length > 0) {
          $scope.userForm = data[0];
          $scope.userForm.age = `${$scope.userForm.age}`;
          if (!angular.isUndefined($scope.userForm.profile_picture) && $scope.userForm.profile_picture !== "") {
            $scope.userData.imagesrc = true;
            $scope.userData.loadedfile = $scope.imageloc + $scope.userForm.profile_picture;
          }

          if (angular.isDefined($scope.userForm.privileges) && $scope.userForm.privileges.length > 0) {
            if (angular.isDefined($scope.userData.privileges) && $scope.userData.privileges.length > 0) {
              angular.forEach($scope.userData.privileges, (priv) => {
                if (angular.isDefined(priv.pid) && parseInt(priv.pid) > 0) {
                  angular.forEach($scope.userForm.privileges, (usrpriv) => {
                    if (angular.isDefined(usrpriv.privilege_master_id) && usrpriv.privilege_master_id === priv._id) {
                      if (angular.isDefined(usrpriv.Read)) {
                        priv.Read = angular.copy(usrpriv.Read);
                      }
                      if (angular.isDefined(usrpriv.Modify)) {
                        priv.Modify = angular.copy(usrpriv.Modify);
                      }
                      if (angular.isDefined(usrpriv.Remove)) {
                        priv.Remove = angular.copy(usrpriv.Remove);
                      }
                    }
                  });
                }
              });
            }
          }
          // Anchor Scroll down
          //                    $location.hash("common-wrapper");
          $anchorScroll();
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };

  // User Action --->Delete
  $scope.update = function (valid) {
    $scope.userData.formsubmission = true;
    $scope.userForm.privileges = [];
    if (angular.isDefined($scope.userData.privileges) && $scope.userData.privileges.length > 0) {
      angular.forEach($scope.userData.privileges, (priv) => {
        if (angular.isDefined(priv.pid) && priv.pid !== "" && parseInt(priv.pid) > 0) {
          const privobj = {};
          privobj.privilege_master_id = priv._id;
          privobj.privilege_id = priv.privilege_id;
          privobj.Read = priv.Read;
          privobj.Modify = priv.Modify;
          privobj.Remove = priv.Remove;
          $scope.userForm.privileges.push(angular.copy(privobj));
        }
      });
    }
    if (!valid) {
      Notification.error("Please enter value for all the required fields.");
      angular.element(".viewplace.wrapper_hight")[0].scrollTop = 500;
      return false;
    }
    if (angular.isUndefined($scope.userForm.privileges) || (angular.isDefined($scope.userForm.privileges) &&
        $scope.userForm.privileges.length <= 0)) {
      Notification.error("Add privileges for the user to proceed");
      return false;
    }
    const obj = {};
    obj.userForm = angular.copy($scope.userForm);
    obj.profile_picture = $scope.profile_picture;
    $scope.userData.eventLoad = true;

    UserService.update(obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success)) {
        if (result.success) {
          angular.forEach($scope.userData.userlist, (users, index) => {
            if (angular.isDefined(users) && users !== null && angular.isDefined(users._id) && users._id === obj.userForm._id) {
              $scope.userData.userlist[index] = angular.copy(obj.userForm);
            }
          });
          $scope.userData.process = "";
          $scope.showadminuserform = false;
          $scope.userForm = {};
          $scope.profile_picture = [];
          Notification.success(result.message);
        } else {
          Notification.error(result.message);
        }
      }
      $scope.userData.formsubmission = false;
      $scope.userData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.userData.formsubmission = false;
      $scope.userData.eventLoad = false;
    });
  };

  // User Action --->Delete
  $scope.delete = function (index) {
    $scope.error = "";
    const item = $scope.userData[index];
    const Obj = {};
    Obj._id = item._id;
    $scope.userData.eventLoad = true;

    UserService.delete(Obj, (success) => {
      if (angular.isDefined(success) && success !== null && success !== "") {
        Notification.success(success);
        $scope.userForm = {};
        $scope.userData.splice(index, 1);
      }
      $scope.userData.eventLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.userData.eventLoad = false;
    });
    $scope.getPrivileges();
  };

  // CLose View Form
  $scope.closeForm = function () {
    $scope.userData.process = "";
    $scope.showadminuserform = false;
    $scope.userForm = {};
    $scope.profile_picture = [];
  };

  // Show ser password
  $scope.showpassword = function (showorhide) {
    $scope.inputType = showorhide;
  };

  $scope.getPrivileges();
});
