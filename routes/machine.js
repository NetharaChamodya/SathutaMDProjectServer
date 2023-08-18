const express = require("express");
const router = express.Router();
const machinesController = require("../controllers/machineController");

router.get("/", machinesController.getAllMachines);
router.post("/", machinesController.saveMachine);
router.put("/", machinesController.updateMachine);
router.delete("/:id", machinesController.deleteMachine);
router.get("/:id", machinesController.getMachineById);

module.exports = router;
