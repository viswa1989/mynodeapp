const config = require("../../app/config/settings");
const AccessControlModel = require("../../app/models/AccessControlModel");
const UserModel = require("../../app/models/UsersModel");
const CustomerModel = require("../../app/models/CustomersModel");
const commonfunction = require("../../app/middlewares/commonfunction");
const jwt = require("jsonwebtoken");

module.exports = {
  createToken(user) {
    const expirytime = commonfunction.getsessionExpirytime();
   
    const token = jwt.sign(user, config.secretKey, {expiresIn: expirytime});

    return token;
  },
  verifyToken(req, res, next) {
//       const used = process.memoryUsage();
//for (let key in used) {
//  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
//}
    const token = req.headers["x-session-token"];
    jwt.verify(token, config.secretKey, (errs, decoded) => {
      if (errs) {
        return res.status(498).send({success: false, message: "Token invalid"});
      } else if (decoded && decoded !== null && decoded.id && decoded.id !== null) {
        const query = UserModel.findOne({_id: decoded.id});
        query.exec((err, user) => {
          if (err) {
            return res.status(498).send({success: false, message: err});
          } else if (user && user !== null && user._id) {
            if ((!user.is_active || user.is_active === false) || (user.is_deleted || user.is_deleted === true)) {
              return res.status(498).send({success: false, message: "User has been removed or deactivated. Please contact your administrator."});
            }
            req.session = decoded;
            //                            global.rsession = decoded;
            next();
          } else {
            return res.status(498).send({success: false, message: "User not exist"});
          }
        });
      } else {
        return res.status(498).send({success: false, message: "Token expired"});
      }
    });
  },
  verifyClient(req, res, next) {
    const token = req.headers["x-session-token"];
    jwt.verify(token, config.secretKey, (errs, decoded) => {
      if (errs) {
        return res.status(498).send({success: false, message: "Token invalid"});
      } else if (decoded && decoded !== null && decoded.id && decoded.id !== null) {
        const query = CustomerModel.findOne({_id: decoded.id});
        query.exec((err, user) => {
          if (err) {
            return res.status(498).send({success: false, message: err});
          } else if (user && user !== null && user._id) {
            if ((!user.is_active || user.is_active === false) || (user.is_deleted || user.is_deleted === true)) {
              return res.status(498).send({success: false, message: "User has been removed or deactivated. Please contact your administrator."});
            }
            req.session = decoded;
            //                            global.rsession = decoded;
            next();
          } else {
            return res.status(498).send({success: false, message: "User not exist"});
          }
        });
      } else {
        return res.status(498).send({success: false, message: "Token expired"});
      }
    });
  },
  resetToken(req, res, next) {
    const token = req.headers["x-session-token"];

    jwt.verify(token, config.secretKey, (err, decoded) => {
      if (decoded && decoded !== null && decoded.id && decoded.id !== null) {
        req.session = decoded;
      }
      next();
    });
  },
  permission(req, res, next) {
    if (req.session.role === 1) {
      next();
    } else {
      AccessControlModel.findOne({action: req.caction, role: req.session.role}, (err, data) => {
        if (err) {
          return res.status(498).send({success: false, message: err});
        } else if (data && data.permission === 1) {
          next();
        } else {
          next();
          return false;
        }
      });
    }
  },
  generatePassword(idLength) {
    let chars = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z";
    chars = chars.split(",");
    const min = 0;
    const max = chars.length - 1;
    let id = "";
    for (let i = 0; i < idLength; i += 1) {
      id += chars[Math.floor(Math.random() * (((max - min) + 1) + min))];
    }
    return id;
  },
};
