const connection = require("../database");

exports.saveMachine = (req, res) => {
  const {
    machine_name,
    machine_type,
    meterReading,
    boughtYr,
    manufactureYr,
    salaryRatePerHour,
    engineNo,
    chassis,
    machineStatus,
  } = req.body;

  console.log("y ", req.body);

  // Validate the input data (You can add more validation as needed)
  if (
    !machine_name ||
    !machine_type ||
    !meterReading ||
    !boughtYr ||
    !manufactureYr ||
    !salaryRatePerHour ||
    !engineNo ||
    !chassis ||
    !machineStatus
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Store the new machine in the database
  const createMachineQuery =
    "INSERT INTO machines (machine_name, machine_type,  meterReading, boughtYr, manufactureYr, salaryRatePerHour, engineNo, chassis, machineStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  connection.query(
    createMachineQuery,
    [
      machine_name,
      machine_type,
      meterReading,
      boughtYr,
      manufactureYr,
      salaryRatePerHour,
      engineNo,
      chassis,
      machineStatus,
    ],
    (createErr, createResult) => {
      if (createErr) {
        console.error("Error creating machine:", createErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // You can include additional machine data in the response if needed
      const newMachine = {
        machineId: createResult.insertId,
        machine_name,
        machine_type,
        meterReading,
        boughtYr,
        manufactureYr,
        salaryRatePerHour,
        engineNo,
        chassis,
        machineStatus,
      };
      res
        .status(201)
        .json({ message: "Machine saved successfully.", machine: newMachine });
    }
  );
};

exports.updateMachine = (req, res) => {
  const {
    machineId,
    machineName,
    machineType,
    meterReading,
    boughtYr,
    manufactureYr,
    salaryRatePerHour,
    engineNo,
    chasisNo,
    machineStatus,
  } = req.body;

  console.log(req.body);

  // Validate the input data (You can add more validation as needed)
  if (
    !machineId ||
    !machineName ||
    !machineType ||
    !meterReading ||
    !boughtYr ||
    !manufactureYr ||
    !salaryRatePerHour ||
    !engineNo ||
    !chasisNo ||
    !machineStatus
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Update the machine in the database
  const updateMachineQuery =
    "UPDATE machines SET machine_name = ?, machine_type = ?, meterReading = ?,  manufactureYr = ?, salaryRatePerHour = ?, boughtYr = ?, engineNo = ?, chassis = ?, machineStatus = ?  WHERE machineId = ?";
  connection.query(
    updateMachineQuery,
    [
      machineName,
      machineType,
      meterReading,
      manufactureYr,
      salaryRatePerHour,
      boughtYr,
      engineNo,
      chasisNo,
      machineStatus,
      machineId,
    ],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating machine:", updateErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Check if the machine was found and updated
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: "Machine not found." });
      }

      // You can include additional machine data in the response if needed
      const updatedMachine = {
        machineId,
        machineName,
        machineType,
        meterReading,
        boughtYr,
        manufactureYr,
        salaryRatePerHour,
        engineNo,
        chasisNo,
        machineStatus,
      };
      res.status(200).json({
        message: "Machine updated successfully.",
        machine: updatedMachine,
      });
    }
  );
};

exports.deleteMachine = (req, res) => {
  const machineId = req.params.id;

  // Delete the machine from the database
  const deleteMachineQuery = "DELETE FROM machines WHERE machineId = ?";
  connection.query(
    deleteMachineQuery,
    [machineId],
    (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting machine:", deleteErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Check if the machine was found and deleted
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: "Machine not found." });
      }

      res.json({ message: "Machine deleted successfully." });
    }
  );
};

exports.getAllMachines = (req, res) => {
  // Retrieve all machines from the database
  const getAllMachinesQuery = "SELECT * FROM machines";
  connection.query(getAllMachinesQuery, (err, results) => {
    if (err) {
      console.error("Error getting all machines:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Send the list of machines in the response
    res.json({ machines: results });
  });
};

exports.getMachineById = (req, res) => {
  const machineId = req.params.id;

  // Retrieve the machine from the database by machineId
  const getMachineByIdQuery = "SELECT * FROM machines WHERE machineId = ?";
  connection.query(getMachineByIdQuery, [machineId], (err, results) => {
    if (err) {
      console.error("Error getting machine by ID:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the machine with the specified machineId exists
    if (results.length === 0) {
      return res.status(404).json({ message: "Machine not found." });
    }

    // Send the machine data in the response
    res.json({ machine: results[0] });
  });
};
