const connection = require("../database");

exports.getAllData = (req, res) => {
  // join all the table to get all the data
  const getAllDataQuery = `SELECT
  tasks.taskID,
  task_details.date,
  tasks.location,
  tasks.customerID,
  tasks.assigned_userID,
  tasks.allocated_machineID,
  customers.customer_name,
  task_details.startmeter,
  task_details.endmeter,
  task_details.fuel,tasks.customerRate,
  tasks.assigned_userID,machines.salaryRatePerHour,
  SUM(task_details.endmeter - task_details.startmeter) AS totalHours,
  SUM(task_details.endmeter - task_details.startmeter) * tasks.customerRate AS totalCost,
  SUM(task_details.endmeter - task_details.startmeter) * machines.salaryRatePerHour AS totalSalary
FROM
  users
JOIN tasks ON users.userId = tasks.assigned_userID
JOIN machines ON machines.machineId = tasks.allocated_machineID
JOIN customers ON customers.customerId = tasks.customerID
JOIN task_details ON tasks.taskID = task_details.taskID
GROUP BY
  tasks.taskID,
  task_details.date,
  tasks.location,
  tasks.customerID,
  tasks.assigned_userID,
  tasks.allocated_machineID,
  customers.customer_name,
  task_details.startmeter,
  task_details.endmeter,
  task_details.fuel,tasks.customerRate,
  tasks.assigned_userID,machines.salaryRatePerHour;
`;
  connection.query(getAllDataQuery, (err, results) => {
    if (err) {
      console.error("Error getting all data:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Send the list of data in the response
    res.json({ data: results });
  });
};
