const connection = require("../database");

exports.saveTask = (req, res) => {
  const {
    taskName,
    customerID,
    machineID,
    operatorID,
    location,
    estimatedHours,
    ratePerHour,
    status,
    assignedBy,
  } = req.body;

  // Validate the input data (You can add more validation as needed)
  if (
    !taskName ||
    !location ||
    !assignedBy ||
    !operatorID ||
    !machineID ||
    !customerID ||
    !status ||
    !estimatedHours ||
    !ratePerHour
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Store the new task in the database
  const createTaskQuery =
    "INSERT INTO tasks (task_name, assigned_userID, created_by_userID, allocated_machineID, customerID, status, location, estimateHours, customerRate ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const updateUserQuery = "UPDATE users SET status = 'busy' WHERE userID = ?";
  const updateMachineQuery =
    "UPDATE machines SET machineStatus = 'Working' WHERE machineID = ?";

  const isUserUpdated = connection.query(
    updateUserQuery,
    [operatorID],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating user:", updateErr);
        return res.status(500).json({ message: "Internal server error." });
      } else {
        return true;
      }
    }
  );

  const isMachineUpdated = connection.query(
    updateMachineQuery,
    [machineID],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating machine:", updateErr);
        return res.status(500).json({ message: "Internal server error." });
      } else {
        return true;
      }
    }
  );
  if (isMachineUpdated && isUserUpdated) {
    connection.query(
      createTaskQuery,
      [
        taskName,
        operatorID,
        assignedBy,
        machineID,
        customerID,
        status,
        location,
        estimatedHours,
        ratePerHour,
      ],
      (createErr, createResult) => {
        if (createErr) {
          console.error("Error creating task:", createErr);
          return res.status(500).json({ message: "Internal server error." });
        }

        const newTask = {
          taskID: createResult.insertId,
          taskName,
          operatorID,
          assignedBy,
          machineID,
          customerID,
          status,
          location,
          estimatedHours,
          ratePerHour,
        };
        res
          .status(201)
          .json({ message: "Task saved successfully.", task: newTask });
      }
    );
  }
};

exports.updateTask = (req, res) => {
  let {
    taskId,
    taskName,
    customerID,
    machineID,
    operatorID,
    location,
    estimateHours,
    ratePerHour,
    status,
    newCustomerId,
    newOperatorId,
    newMachineId,
  } = req.body;

  // Validate the input data (You can add more validation as needed)
  if (
    !taskId ||
    !taskName ||
    !location ||
    !operatorID ||
    !machineID ||
    !customerID ||
    !status ||
    !estimateHours ||
    !ratePerHour
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (newCustomerId) {
    customerID = newCustomerId;
  }
  const isMachineUpdated = () => {
    if (newMachineId) {
      const updateMachineQuery =
        "UPDATE machines SET machineStatus = 'Not Working' WHERE machineID = ?";
      connection.query(
        updateMachineQuery,
        [newMachineId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating machine:", updateErr);
            return res.status(500).json({ message: "Internal server error." });
          }
        }
      );
      machineID = newMachineId;
      const updateMachineQuery2 =
        "UPDATE machines SET machineStatus = 'Working' WHERE machineID = ?";
      connection.query(
        updateMachineQuery2,
        [machineID],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating machine:", updateErr);
            return res.status(500).json({ message: "Internal server error." });
          }
        }
      );
    }
    return true;
  };

  const isUserUpdated = () => {
    if (newOperatorId) {
      const updateUserQuery =
        "UPDATE users SET status = 'available' WHERE userID = ?";
      connection.query(
        updateUserQuery,
        [operatorID],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating user:", updateErr);
            return res.status(500).json({ message: "Internal server error." });
          }
        }
      );
      operatorID = newOperatorId;
      const updateUserQuery2 =
        "UPDATE users SET status = 'busy' WHERE userID = ?";
      connection.query(
        updateUserQuery2,
        [operatorID],

        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating user:", updateErr);
            return res.status(500).json({ message: "Internal server error." });
          }
        }
      );
    }
    return true;
  };

  // Update the task in the database
  const updateTaskQuery =
    "UPDATE tasks SET task_name = ?, assigned_userID = ?, allocated_machineID = ?, customerID = ?, status = ?, location = ?,  estimateHours = ? , customerRate = ? WHERE taskID = ?";
  if (isMachineUpdated() && isUserUpdated()) {
    connection.query(
      updateTaskQuery,
      [
        taskName,
        operatorID,
        machineID,
        customerID,
        status,
        location,
        estimateHours,
        ratePerHour,
        taskId,
      ],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating task:", updateErr);
          return res.status(500).json({ message: "Internal server error." });
        }

        // Check if the task was found and updated
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: "Task not found." });
        }

        // You can include additional task data in the response if needed
        const updatedTask = {
          taskName,
          operatorID,
          machineID,
          customerID,
          status,
          location,
          estimateHours,
          ratePerHour,
          taskId,
        };
        res.json({
          message: "Task updated successfully.",
          task: updatedTask,
        });
      }
    );
  }
};

exports.deleteTask = (req, res) => {
  const taskId = req.params.id;

  // Fetch the task from the database based on taskID
  const getTaskByIdQuery = "SELECT * FROM tasks WHERE taskID = ?";
  connection.query(getTaskByIdQuery, [taskId], (queryErr, task) => {
    if (queryErr) {
      console.error("Error getting task:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the task with the given taskId exists
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }
    // update user status
    const updateUserQuery =
      "UPDATE users SET status = 'available' WHERE userID = ?";
    connection.query(
      updateUserQuery,
      [task[0].assigned_userID],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating user:", updateErr);
          return res.status(500).json({ message: "Internal server error." });
        }
      }
    );

    //update machine status
    const updateMachineQuery =
      "UPDATE machines SET machineStatus = 'Not Working' WHERE machineID = ?";
    connection.query(
      updateMachineQuery,
      [task[0].allocated_machineID],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating machine:", updateErr);
          return res.status(500).json({ message: "Internal server error." });
        }
      }
    );
  });

  // Delete the task from the database
  const deleteTaskQuery = "DELETE FROM tasks WHERE taskID = ?";
  connection.query(deleteTaskQuery, [taskId], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error("Error deleting task:", deleteErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the task was found and deleted
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ message: "Task deleted successfully." });
  });
};

exports.getAllTasks = (req, res) => {
  // Fetch all tasks from the database
  const getAllTasksQuery = "SELECT * FROM tasks";
  connection.query(getAllTasksQuery, (queryErr, tasks) => {
    if (queryErr) {
      console.error("Error getting tasks:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    res.json({ tasks });
  });
};

exports.getTaskById = (req, res) => {
  const taskId = req.params.id;

  // Fetch the task from the database based on taskID
  const getTaskByIdQuery = "SELECT * FROM tasks WHERE taskID = ?";
  connection.query(getTaskByIdQuery, [taskId], (queryErr, task) => {
    if (queryErr) {
      console.error("Error getting task:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the task with the given taskId exists
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ task: task[0] });
  });
};

exports.getTaskForOperator = (req, res) => {
  const userId = req.params.id;
  const time = req.params.time;

  console.log("task id", userId);

  // Fetch the task from the database based on taskID
  const getTaskByIdQuery =
    time === "current"
      ? "SELECT tasks.*, users.*, machines.*, tasks.status AS taskStatus FROM tasks INNER JOIN users ON tasks.assigned_userID = users.userId " +
        "INNER JOIN machines ON tasks.allocated_machineID = machines.machineId WHERE assigned_userID = ? AND tasks.status IN ('Not Started', 'In Progress')"
      : "SELECT tasks.*, users.*, machines.*, tasks.status AS taskStatus FROM tasks INNER JOIN users ON tasks.assigned_userID = users.userId " +
        "INNER JOIN machines ON tasks.allocated_machineID = machines.machineId WHERE assigned_userID = ? AND tasks.status IN ('Completed')";
  connection.query(getTaskByIdQuery, [userId], (queryErr, tasks) => {
    if (queryErr) {
      console.error("Error getting task:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the task with the given taskId exists
    if (tasks.length === 0) {
      return res.status(200).json({ tasks: [] });
    }

    res.json({ tasks: tasks });
  });
};

exports.updateStatusOfTask = (req, res) => {
  const taskId = req.params.id;
  const status = req.params.status;

  // Fetch the task from the database based on taskID
  const getTaskByIdQuery = "SELECT * FROM tasks WHERE taskID = ?";
  connection.query(getTaskByIdQuery, [taskId], (queryErr, task) => {
    if (queryErr) {
      console.error("Error getting task:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the task with the given taskId exists
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }
    const updateTaskStatusQuery =
      "UPDATE tasks SET status = ? WHERE taskID = ?";
    connection.query(
      updateTaskStatusQuery,
      [status, taskId],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating task:", updateErr);
          return res.status(500).json({ message: "Internal server error." });
        }

        // Check if the task was found and updated
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: "Task not found." });
        }

        // You can include additional task data in the response if needed
        const updatedTask = {
          status,
          taskId,
        };
        res.json({
          message: "Task updated successfully.",
          task: updatedTask,
        });
      }
    );
    // update user status
    const updateUserQuery =
      status === "Completed"
        ? "UPDATE users SET status = 'available' WHERE userID = ?"
        : "UPDATE users SET status = 'busy' WHERE userID = ?";
    connection.query(
      updateUserQuery,
      [task[0].assigned_userID],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating user:", updateErr);
          return res.status(500).json({ message: "Internal server error." });
        }
      }
    );

    //update machine status
    const updateMachineQuery =
      status === "Completed"
        ? "UPDATE machines SET machineStatus = 'Not Working' WHERE machineID = ?"
        : "UPDATE machines SET machineStatus = 'Working' WHERE machineID = ?";
    connection.query(
      updateMachineQuery,
      [task[0].allocated_machineID],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating machine:", updateErr);
          return res.status(500).json({ message: "Internal server error." });
        }
      }
    );
  });
};

exports.saveMeterReading = (req, res) => {
  const type = req.params.type;
  const { taskId, meterReading, date, fuel,machineId } = req.body;

  

  // Validate the input data (You can add more validation as needed)
  if (!taskId || !date ) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (type == "start") {
    // Store the new task in the database
    const createMeterReadingQuery =
      "INSERT INTO task_details (taskID, date, startmeter, endmeter) VALUES (?, ?, ?, ?)";
    connection.query(
      createMeterReadingQuery,
      [taskId, date, meterReading, meterReading],
      (createErr, createResult) => {
        if (createErr) {
          console.error("Error creating meter reading:", createErr);
          return res.status(500).json({ message: "Internal server error." });
        }
        const updateMachineQuery =
        "UPDATE machines SET meterReading = ? WHERE machineId = ?";
      connection.query(
        updateMachineQuery,
        [meterReading, machineId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating machine:", updateErr);
            return res
              .status(500)
              .json({ message: "Internal server error." });
          }
        }
      );

        res.status(201).json({
          message: "Meter reading (start) saved successfully.",
        });
      }
    );
  } else if (type === "end") {
    const createMeterReadingQuery =
      "UPDATE task_details SET endmeter = ? WHERE taskID = ? AND date = ?";
    connection.query(
      createMeterReadingQuery,
      [meterReading, taskId, date],
      (createErr, createResult) => {
        if (createErr) {
          console.error("Error creating meter reading:", createErr);
          return res.status(500).json({ message: "Internal server error." });
        }
        // insert meter reading to machine table
        const updateMachineQuery =
          "UPDATE machines SET meterReading = ? WHERE machineId = ?";
        connection.query(
          updateMachineQuery,
          [meterReading, machineId],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("Error updating machine:", updateErr);
              return res
                .status(500)
                .json({ message: "Internal server error." });
            }
          }
        );
        res.status(201).json({
          message: "Meter reading (stop) saved successfully.",
        });
      }
    );
  } else if (type === "fuel") {
    const createMeterReadingQuery =
      "UPDATE task_details SET fuel = ? WHERE taskID = ? AND date = ?";
    connection.query(
      createMeterReadingQuery,
      [fuel, taskId, date],
      (createErr, createResult) => {
        if (createErr) {
          console.error("Error creating meter reading:", createErr);
          return res.status(500).json({ message: "Internal server error." });
        }

        res.status(201).json({
          message: "Meter reading (fuel) saved successfully.",
        });
      }
    );
  }
};

exports.getTaskDetail = (req, res) => {
  const taskId = req.params.id;
  console.log(taskId);

  // Fetch the task from the database based on taskID

  const getTaskDetailQuery = "SELECT * FROM task_details WHERE taskID = ?";
  connection.query(getTaskDetailQuery, [taskId], (queryErr, taskDetails) => {
    if (queryErr) {
      console.error("Error getting task:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the task with the given taskId exists
    if (taskDetails.length === 0) {
      return res.status(404).json({ message: "Task Detail not found." });
    }
    res.json({ taskDetails: taskDetails });
  });
};
