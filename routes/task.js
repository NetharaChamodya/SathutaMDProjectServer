const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/taskController");

router.get("/", tasksController.getAllTasks);
router.get("/:id", tasksController.getTaskById);
router.post("/", tasksController.saveTask);
router.put("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);
router.get("/operator/:id/:time", tasksController.getTaskForOperator);
router.put("/status/:id/update/:status", tasksController.updateStatusOfTask);
router.post("/meter/:type", tasksController.saveMeterReading);
router.get("/taskDetails/:id", tasksController.getTaskDetail);

module.exports = router;
