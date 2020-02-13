const errorhelper = require("../../../app/helpers/errorhelper");
const express = require("express");

const router = express.Router();
const VehicledetailModel = require("../../../app/models/VehicledetailModel");
const DriverdetailModel = require("../../../app/models/DriverdetailModel");

router.get("/getVehicles/:id", (req, res) => {
  const regex = new RegExp(req.params.id, "i");
  const query = VehicledetailModel.find({vehicle_no: regex}, "vehicle_no").sort({vehicle_no: 1}).limit(8);
  query.exec((err, vehicleData) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, data: vehicleData});
  });
});

router.get("/getDriverdata/:id", (req, res) => {
  const regex = new RegExp(req.params.id, "i");
  const query = DriverdetailModel.find({driver_name: regex}, "driver_name driver_no").sort({driver_name: 1}).limit(8);
  query.exec((err, driverData) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, data: driverData});
  });
});

module.exports = router;
