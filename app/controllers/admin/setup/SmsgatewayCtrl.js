const commonfunction = require('../../../../app/middlewares/commonfunction');
const express = require('express');

const router = express.Router();
const SmsgatewayModel = require('../../../../app/models/SmsgatewayModel');
const errorhelper = require('../../../../app/helpers/errorhelper');
const textformathelper = require('../../../../app/helpers/dataencrypthelper');

router.get('/list', (req, res) => {
  SmsgatewayModel.findOne({ is_deleted: false }, (err, gatewaydata) => {
    if (err) {
      return res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      const data = JSON.parse(JSON.stringify(gatewaydata));
      if (data !== null && data._id) {
        data.url = textformathelper.decrypt(data.url);
        data.username = textformathelper.decrypt(data.username);
        data.password = textformathelper.decrypt(data.password);
        data.senderid = textformathelper.decrypt(data.senderid);
      }
      
      return res.send({success: true, data});
    }
  });
});

// save the customer group
router.post('/save', (req, res) => {
  SmsgatewayModel.findOne({ is_deleted: false }, (err, data) => {
    if (err) {
      return res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (data && data._id) {
      data.url = textformathelper.encrypt(req.body.smsGatewayForm.url);
      data.username = textformathelper.encrypt(req.body.smsGatewayForm.username);
      data.password = textformathelper.encrypt(req.body.smsGatewayForm.password);
      data.senderid = textformathelper.encrypt(req.body.smsGatewayForm.senderid);

      data = commonfunction.beforeSave(data, req);

      data.save((errsave, newGateway) => {
        if (errsave) {
          return res.status(499).send({message: errorhelper.getErrorMessage(errsave)});
        } else {
          const newGatewayData = JSON.parse(JSON.stringify(newGateway));
          newGatewayData.url = textformathelper.decrypt(newGatewayData.url);
          newGatewayData.username = textformathelper.decrypt(newGatewayData.username);
          newGatewayData.password = textformathelper.decrypt(newGatewayData.password);
          newGatewayData.senderid = textformathelper.decrypt(newGatewayData.senderid);
          
          return res.send({success: true, message: 'SMS Gateway details successfully saved!', data: newGatewayData});
        }
      });
    } else {
      let newgateway = new SmsgatewayModel({
        url: textformathelper.encrypt(req.body.smsGatewayForm.url),
        username: textformathelper.encrypt(req.body.smsGatewayForm.username),
        password: textformathelper.encrypt(req.body.smsGatewayForm.password),
        senderid: textformathelper.encrypt(req.body.smsGatewayForm.senderid),
      });

      newgateway = commonfunction.beforeSave(newgateway, req);

      newgateway.save((errsave, newGateway) => {
        if (errsave) {
          return res.status(499).send({message: errorhelper.getErrorMessage(errsave)});
        } else {
          const newGatewayData = JSON.parse(JSON.stringify(newGateway));
          newGatewayData.url = textformathelper.decrypt(newGatewayData.url);
          newGatewayData.username = textformathelper.decrypt(newGatewayData.username);
          newGatewayData.password = textformathelper.decrypt(newGatewayData.password);
          newGatewayData.senderid = textformathelper.decrypt(newGatewayData.senderid);
          
          return res.send({success: true, message: 'SMS Gateway details successfully saved!', data: newGatewayData});
        }
      });
    }
  });
});

module.exports = router;
