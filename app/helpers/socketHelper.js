const async = require("async");
const UserstatusModel = require("../../app/models/UserstatusModel");
const StockModel = require("../../app/models/StockModel");
let connectedUsers = [];

module.exports = {
  cleanSocketusers(callback) {
    connectedUsers = [];
    callback(null);
  },
  addSocketId(data, callback) {
    connectedUsers.push(data);
    callback(null, data);
  },
  updateSocketId(data, callback) {
    connectedUsers.push(data);
    callback(null, data);
  },
  disconnectUser(userSocketId, callback) {
    let usrindx = -1;
    let inc = 0;
    let selectedUsers = {};
    async.forEachSeries(connectedUsers, (usr, calbk) => {        
      if (usr && usr !== null && usr.socketId === userSocketId) {
        usrindx = inc;
        inc += 1;
        selectedUsers = usr;
        calbk(null);
      } else {
        inc += 1;
        calbk(null);
      }
    }, (err, result) => {
        
      if (usrindx > -1) {
        connectedUsers.splice(usrindx,1);
        callback(null, selectedUsers);
      } else {
        callback(null);
      }
    });
  },
  logout(userID, callback) {
    let usrindx = -1;
    let inc = 0;
    let selectedUsers = {};
    async.forEachSeries(connectedUsers, (usr, calbk) => {        
      if (usr && usr !== null && usr.socketId === userID) {
        usrindx = inc;
        inc += 1;
        selectedUsers = usr;
        calbk(null);
      } else {
        inc += 1;
        calbk(null);
      }
    }, (err, result) => {
      if (usrindx > -1) {
        connectedUsers.splice(usrindx,1);
        callback(null, selectedUsers);
      }
      callback(null);
    });
  },
  getDivisionuser(callback) {
    let divisionUsers = [];
    async.forEachSeries(connectedUsers, (usr, calbk) => {        
      if (usr && usr !== null && usr.division_id && usr.division_id !== null && usr.division_id !== "") {
        divisionUsers.push(usr.division_id)
        calbk(null);
      } else {
        calbk(null);
      }
    }, (err, result) => {
      callback(null, divisionUsers);
    });
  },
  getStockdetails(data, callback) {
    const cond = { division_id: data, is_active: true, is_deleted: false };
    const sel = "division_id product_id quantity";
    StockModel.find(cond, sel).populate('product_id', "maximum_stock minimum_stock product_name").exec((error, result) => {
      callback(error, result);
    });
  },
  getActiveuser(data, callback) {
    const query = data;
    query.online = "Y";
    UserstatusModel.find(query).distinct('socketId', (error, result) => {
      callback(error, result);
    });
  },
  getSuperuser(callback) {
    let superUsers = [];
    async.forEachSeries(connectedUsers, (usr, calbk) => {        
      if (usr && usr !== null && usr.role === "1") {
        superUsers.push(usr)
        calbk(null);
      } else {
        calbk(null);
      }
    }, (err, result) => {
      callback(null, superUsers);
    });
  },
};
