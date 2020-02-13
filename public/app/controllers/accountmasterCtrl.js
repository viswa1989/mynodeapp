/* global parseFloat */
/* global angular */
angular.module("accountmasterCtrl", []).controller("AccountmasterController", ($scope, CategoryService, TaxService, AccountcategoryService,
  payrollHelper, Notification, $timeout, $q) => { // Setup account ctrl
  $scope.accountData = {};

  $scope.accountData.accountView = "ACCOUNTS";
  $scope.accountData.pageLoad = true;
  $scope.accountData.contentLoad = true;
  $scope.accountData.eventLoad = false;

  $scope.taxForm = {};

  $scope.taxForm.details = [];

  $scope.accountsloader = true;
  $scope.accountsupdateloader = false;

  $scope.pagenames = "AccountsCategory";
  $scope.modify = "Modify";
  $scope.remove = "Remove";

  $scope.data = {};
  $scope.clientdata = {};
  $scope.clientdata.showCategory = "income";
  $scope.clientdata.treeGridData = [];
  $scope.clientdata.makeUpTaxClass = [];
  $scope.clientdata.billGroup = angular.copy(payrollHelper.getBillGroup());

  $scope.treeGridGenerator = function () {
    let tree;
    // Tree Data
    $scope.clientdata.treeGridData = [{
      treeFname: "New Category",
      treeSname: "New Group",
      DemographicId: 1,
      ParentId: null,
    }, {
      treeFname: "New Category",
      treeSname: "New Group",
      DemographicId: 2,
      ParentId: 1,
    }, {
      treeFname: "New Category",
      treeSname: "New Group",
      DemographicId: 3,
      ParentId: 1,
    }];

    /* Tree Function Dont Modify */
    function getTree(data, primaryIdName, parentIdName) {
      if (!data || data.length === 0 || !primaryIdName || !parentIdName) {
        return [];
      }
      tree = [];
      let parent;
      let parentId;
      const rootIds = [];
      let item = data[0];
      let primaryKey = item[primaryIdName];
      const treeObjs = {};
      const len = data.length;
      let i = 0;
      while (i < len) {
        item = data[i];
        i += 1;
        primaryKey = item[primaryIdName];
        treeObjs[primaryKey] = item;
        parentId = item[parentIdName];
        if (parentId) {
          parent = treeObjs[parentId];
          if (parent.children) {
            parent.children.push(item);
          } else {
            parent.children = [item];
          }
        } else {
          rootIds.push(primaryKey);
        }
      }
      for (let j = 0; j < rootIds.length; j += 1) {
        tree.push(treeObjs[rootIds[j]]);
      }
      return tree;
    }

    const myTreeData = getTree($scope.clientdata.treeGridData, "DemographicId", "ParentId");
    $scope.tree_data = myTreeData;
    $scope.my_tree = {};
    tree = {};

    $scope.expanding_property = {
      field: "treeFname",
      displayName: "Category",
      sortable: true,
      filterable: true,
    };

    $scope.col_defs = [{
      field: "treeSname",
      displayName: "Group",
      sortable: true,
      sortingType: "string",
    }];
  };

  $scope.treeGridGenerator();

  // if Fresh Time We Can Create 2 Default Category , Now We Can Assign That Category To This
  $scope.createFreshCaregory = function (category) {
    const temp = [];
    //        var DemographicId = 1;
    const random1 = Math.random() + 12345678910;
    const random2 = Math.random() + 12345;
    const random3 = Math.random() + 678910;
    //        var ParentId = 0;
    temp.push({
      DemographicId: 1,
      ParentId: null,
      category_name: "Bills",
      children: [
        {
          DemographicId: 2,
          groupname: category[0].groupname,
          groupunique: category[0].groupunique,
          category_name: category[0].category_name,
          category_id: category[0].category_id,
          category_unique: category[0].category_unique,
          DEFAULT: category[0].DEFAULT,
          level: "2",
          parent_uid: random1,
          uid: random2,
        },
        {
          DemographicId: 3,
          groupname: category[1].groupname,
          groupunique: category[1].groupunique,
          category_name: category[1].category_name,
          category_id: category[1].category_id,
          category_unique: category[1].category_unique,
          DEFAULT: category[1].DEFAULT,
          level: "2",
          parent_uid: random1,
          uid: random3,
        }],
      level: "1",
      uid: random1,
    });
    return temp;
  };

  /* This function Update Tree Data */
  $scope.updateIncomeTreeGridDatas = function (typesOfCategories) {
    $scope.accountsupdateloader = true;
    const treeGrid = $scope.getCategoryDatabaseFormat();
    const Obj = {};
    Obj.treeGrid = treeGrid;
    Obj.typesOfCategories = typesOfCategories;

    AccountcategoryService.update(Obj, (result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
        $scope.initialize("income");
        Notification.success(result.message);
      }
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
    });
  };

  $scope.changeIncomingToExpense = function (incomeExpense) {
    let temp = null;
    if (incomeExpense === "INCOMING") {
      $scope.clientdata.showCategory = "income";
      $scope.treeGridGenerator();
      temp = angular.copy($scope.clientdata.makeUpCategoryIncoming);
      const treeGridStructure = $scope.createTreeData(temp);
      $scope.tree_data = treeGridStructure;
    } else if (incomeExpense === "EXPENSE") {
      $scope.clientdata.showCategory = "expense";
      $scope.treeGridGenerator();
      temp = angular.copy($scope.clientdata.makeUpCategoryExpensecoming);
      const treeGridStructure1 = $scope.createTreeData(temp);
      $scope.tree_data = treeGridStructure1;
    } else if (incomeExpense === "TAX") {
      $scope.list();
      $scope.clientdata.showCategory = "tax";
      temp = angular.copy($scope.taxForm.details);
      const treeGridStructure2 = $scope.createTreeData(temp);
      $scope.tree_data_tax = treeGridStructure2;
    }
    $scope.accountsloader = false;
  };

  // TREE GRID LOOP GENERATER FUNCTION
  // Initialize To get all Details
  $scope.initialize = function (view_category) {
    $scope.accountData.pageLoad = true;
    //        var Obj = {};

    AccountcategoryService.get((data) => {
      $scope.accountsloader = false;
      $scope.accountsupdateloader = false;
      $scope.clientdata.disabled_uid = [];
      if (data) {
        const makeUpCategoryIncoming = [];
        const makeUpCategoryExpensecoming = [];
        if (data.length === 2) {
          const getBasicTreeStructure = $scope.createFreshCaregory(data);
          $scope.treeGridDataStorage = getBasicTreeStructure;
          $scope.clientdata.makeUpCategoryIncoming = [];
          $scope.clientdata.makeUpCategoryExpensecoming = [];
          $scope.clientdata.makeUpTaxClass = [];
          $scope.tree_data = getBasicTreeStructure;
          $scope.clientdata.showCategory = view_category;
          $timeout(() => {
            $scope.updateIncomeTreeGridDatas("INCOMING");
          }, 2000);
        } else {
          const makeUpTaxClass = [];
          angular.forEach(data, (tValue) => {
            // get Disabled uid
            if (angular.isDefined(tValue) && angular.isDefined(tValue.nodeDisabled) && (tValue.nodeDisabled === "true" ||
                tValue.nodeDisabled === true) && angular.isDefined(tValue.uid)) {
              $scope.clientdata.disabled_uid.push(tValue.uid);
            }

            if (angular.isDefined(tValue) && angular.isDefined(tValue.parent_uid) && $scope.clientdata.disabled_uid.indexOf(tValue.parent_uid) >= 0) {
              $scope.clientdata.disabled_uid.push(tValue.uid);
              $scope.clientdata.disabled_uid.push(tValue.parent_uid);
            }

            if (!angular.isUndefined(tValue.categoryType)) {
              const temp1 = tValue;
              if (tValue.categoryType === "INCOMING") {
                temp1.category_id = tValue.category_id;
                makeUpCategoryIncoming.push(temp1);
              } else if (tValue.categoryType === "EXPENSE") {
                temp1.category_id = tValue.category_id;
                makeUpCategoryExpensecoming.push(temp1);
              } else if (tValue.categoryType === "TAX") {
                temp1.category_id = tValue.category_id;
                temp1.brand_tax_avail = tValue.brand_tax_avail;
                temp1.tax_class_percent = parseFloat(tValue.profiledata.tax_class_percent).toFixed(2);
                makeUpTaxClass.push(temp1);
              }
            }
          });
          $scope.clientdata.makeUpCategoryIncoming = makeUpCategoryIncoming;
          $scope.clientdata.makeUpCategoryExpensecoming = makeUpCategoryExpensecoming;
          $scope.clientdata.makeUpTaxClass = makeUpTaxClass;
          $scope.changeIncomingToExpense("INCOMING");
          // var temp = angular.copy($scope.clientdata.makeUpCategoryIncoming);
          // var treeGridStructure = $scope.createTreeData(temp);
          // $scope.tree_data = treeGridStructure;
          $scope.clientdata.showCategory = view_category;
        }
      }
      $scope.accountData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.accountData.pageLoad = false;
    });
  };
  $scope.initialize("income");

  // tax calculation section begins..
  $scope.newTaxBox = function () {
    $scope.taxForm.details.push({tax_name: "", "tax_percentage ": "", tax_description: ""});
  };

  function validateTaxclass(taxform) {
    const deferred = $q.defer();
    let valid = true;
    angular.forEach(taxform, (taxdata, index) => {
      if (valid) {
        if (angular.isDefined(taxdata) && taxdata !== null) {
          if (angular.isUndefined(taxdata.tax_name) || taxdata.tax_name === null || taxdata.tax_name === "") {
            valid = false;
          }
          if (valid && (angular.isUndefined(taxdata.tax_percentage) || taxdata.tax_percentage === null || taxdata.tax_percentage === "")) {
            valid = false;
          } else {
            taxdata.tax_percentage = parseFloat(taxdata.tax_percentage);
          }
        } else {
          valid = false;
        }
      }
      if (index === taxform.length - 1) {
        deferred.resolve(valid);
      }
    });
    return deferred.promise;
  }

  $scope.removeCurrentBrand = function (e, r) {
    if (angular.isDefined(r.level) && r.level == 1 && angular.isDefined(r.uid) && r.uid.length) {
      $scope.clientdata.disabled_uid.push(r.uid);
    }
    if (angular.isDefined(r.level) && r.level == 2 && angular.isDefined(r.uid) && r.uid.length) {
      $scope.clientdata.disabled_uid.push(r.uid);
    }
    if (angular.isDefined(r.level) && r.level == 3 && angular.isDefined(r.uid) && r.uid.length) {
      $scope.clientdata.disabled_uid.push(r.uid);
    }
    if (angular.isDefined(r.children)) {
      angular.forEach(r.children, (e, r) => {
        if (angular.isDefined(e.uid)) {
          $scope.clientdata.disabled_uid.push(e.uid);
        }
        if (angular.isDefined(e.parent_uid)) {
          $scope.clientdata.disabled_uid.push(e.parent_uid);
        }
      });
    }
    r.nodeDisabled = !0;
  };

  $scope.updateTax = function () {
    if (angular.isDefined($scope.taxForm.details) && $scope.taxForm.details !== null && $scope.taxForm.details !== "" &&
        $scope.taxForm.details.length > 0) {
      validateTaxclass($scope.taxForm.details).then((valid) => {
        if (valid) {
          const Obj = {};
          Obj.tax_class = angular.copy($scope.taxForm.details);
          if ($scope.clientdata.loader_button_start) {
            return false;
          }
          $scope.accountData.eventLoad = true;

          TaxService.update(Obj, (result) => {
            if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
              $scope.initialize("tax");
              $scope.changeIncomingToExpense("TAX");
              Notification.success(result.message);
            }
            $scope.accountData.eventLoad = false;
          }, (error) => {
            if (error !== null && angular.isDefined(error.message)) {
              Notification.error(error.message);
            }
            $scope.accountData.eventLoad = false;
          });
        } else {
          Notification.error("Please fill tax name and percentage on each row to update.");
        }
      });
    } else {
      Notification.error("Please enter atleast one tax column to update.");
    }
  };

  $scope.removeCurrentTax = function (tax) {
    const index = $scope.taxForm.details.indexOf(tax);
    if (index > -1) {
      if (angular.isDefined(tax) && angular.isDefined(tax._id)) {
        const Obj = {};
        Obj._id = tax._id;
        Obj.is_deleted = true;
        $scope.accountData.eventLoad = true;

        TaxService.delete(Obj, (result) => {
          $scope.initialize("tax");
          if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
            $scope.changeIncomingToExpense("TAX");
            $scope.taxForm.details.splice(index, 1);
            Notification.success(result.message);
          }
          $scope.accountData.eventLoad = false;
        }, (error) => {
          if (error !== null && angular.isDefined(error.message)) {
            Notification.error(error.message);
          }
          $scope.accountData.eventLoad = false;
        });
      } else {
        $scope.taxForm.details.splice(index, 1);
      }
    }
  };
  $scope.percent_decimal_update = function (tax) {
    tax.tax_class_percent = parseFloat(tax.tax_class_percent).toFixed(2);
  };

  // Update Treeg grid Categorys
  $scope.getCategoryDatabaseFormat = function () {
    const getCategory = [];
    angular.forEach($scope.treeGridDataStorage, (tValue) => {
      if (tValue.branch) {
        const branch = tValue.branch;
        getCategory.push({
          _id: angular.isUndefined(branch._id) ? "" : branch._id,
          DemographicId: angular.isUndefined(branch.DemographicId) ? "" : branch.DemographicId,
          DEFAULT: angular.isUndefined(branch.DEFAULT) ? "" : branch.DEFAULT,
          ParentId: angular.isUndefined(branch.ParentId) ? "" : branch.ParentId,
          category_name: angular.isUndefined(branch.category_name) ? "" : branch.category_name,
          category_unique: angular.isUndefined(branch.category_unique) ? "" : branch.category_unique,
          category_id: angular.isUndefined(branch.category_id) ? "" : branch.category_id,
          groupname: angular.isUndefined(branch.groupname) ? "" : branch.groupname,
          groupIndex: angular.isUndefined(branch.groupIndex) ? "" : branch.groupIndex,
          groupunique: angular.isUndefined(branch.groupunique) ? "" : branch.groupunique,
          level: angular.isUndefined(branch.level) ? "" : branch.level,
          uid: angular.isUndefined(branch.uid) ? "" : branch.uid,
          parent_uid: angular.isUndefined(branch.parent_uid) ? "" : branch.parent_uid,
          nodeDisabled: angular.isUndefined(branch.nodeDisabled) ? "" : branch.nodeDisabled,
        });
      }
    });
    return getCategory;
  };

  // TREE GRID LOOP GENERATER FUNCTION
  $scope.createTreeData = function (category) {
    const treeList = angular.copy(category);
    const getParentNodeOnly = [];
    angular.forEach(treeList, (treeValue) => {
      treeValue.children = $scope.createCategoryChildren(treeValue, treeList);
      treeValue.nodeDisabled = $scope.checkTrueorFalse(treeValue.nodeDisabled);
      if (treeValue.level === "1") {
        getParentNodeOnly.push(treeValue);
      }
    });
    return getParentNodeOnly;
  };

  $scope.checkTrueorFalse = function (value) {
    if (angular.isUndefined(value)) {
      return false;
    }
    if (value === "true") {
      return true;
    } else if (value === true) {
      return true;
    } else if (value === "false") {
      return false;
    }
    return false;
  };

  $scope.createCategoryChildren = function (nodeCategory, categoryList) {
    let temp = [];
    temp = $scope.uidBaseReturnChildren(nodeCategory.uid, categoryList);
    return temp;
  };

  $scope.uidBaseReturnChildren = function (uid, categoryList) {
    const catList = [];
    const getUnIncludeCategoryList = categoryList;
    for (let i = 0; i < getUnIncludeCategoryList.length; i += 1) {
      const nodeValue = getUnIncludeCategoryList[i];
      if (nodeValue.parent_uid === uid && !nodeValue.include) {
        nodeValue.include = true;
        catList.push(nodeValue);
      }
    }
    return catList;
  };

  // Toggle tax
  $scope.list = function () {
    $scope.accountData.pageLoad = true;
    $scope.taxForm.details = [];

    TaxService.get((result) => {
      if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null && result.data.length > 0) {
        $scope.taxForm.details = angular.copy(result.data);
      }
      $scope.accountData.pageLoad = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.accountData.pageLoad = false;
    });
  };

  // Toggle Account / Tax  view
  $scope.toggleaccountview = function (accountview) {
    if (accountview === "TAX") {
      $scope.list();
    } else if (accountview === "ACCOUNTS") {
      $scope.initialize();
    }
    $scope.accountData.accountView = accountview;
  };

  // Push new tax input elements
  $scope.addNewtax = function () {
    const obj = {};
    obj.tax_name = "";
    obj.tax_percentage = 0;
    $scope.taxForm.details.push(obj);
  };

  // Category Action --->Delete
  $scope.delete = function (id, index) {
    if (!angular.isUndefined(id) && id !== "") {
      $scope.error = "";
      const item = $scope.taxForm.details[index];
      const Obj = {};
      Obj._id = item._id;
      Obj.is_deleted = true;
      $scope.accountData.eventLoad = true;

      TaxService.delete(Obj, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.success) && result.success) {
          $scope.taxForm.details.splice(index, 1);
          Notification.error(result.message);
        }
        $scope.accountData.eventLoad = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        $scope.accountData.eventLoad = false;
      });
    } else {
      $scope.taxForm.details.splice(index, 1);
    }
  };
});
