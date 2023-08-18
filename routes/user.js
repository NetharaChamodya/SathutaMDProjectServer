const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/available/operators", userController.getAvailableOperators);
router.put("/", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/getSalaryDetails/:id/:date", userController.getSalaryDetails);

module.exports = router;
