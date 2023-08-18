const connection = require("../database");

exports.getAllUsers = (req, res) => {
  // Fetch all users from the database
  const getAllUsersQuery =
    "SELECT userId, username, first_name, last_name, role,status FROM users";
  connection.query(getAllUsersQuery, (queryErr, users) => {
    if (queryErr) {
      console.error("Error getting users:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    res.json({ users });
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id;

  // Fetch the user from the database based on userId
  const getUserByIdQuery =
    "SELECT userId, username, first_name, last_name, role FROM users WHERE userId = ?";
  connection.query(getUserByIdQuery, [userId], (queryErr, user) => {
    if (queryErr) {
      console.error("Error getting user:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the user with the given userId exists
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user: user[0] });
  });
};

exports.updateUser = (req, res) => {
  const { userId, username, first_name, last_name, status, role } = req.body;

  // Validate the input data (You can add more validation as needed)
  if (!username || !first_name || !last_name || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Update the user in the database
  const updateUserQuery =
    "UPDATE users SET username = ?, first_name = ?, last_name = ?, role = ?, status = ? WHERE userId = ?";
  connection.query(
    updateUserQuery,
    [username, first_name, last_name, role, status, userId],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating user:", updateErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Check if the user was found and updated
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      // You can include additional user data in the response if needed
      const updatedUser = {
        userId,
        username,
        first_name,
        last_name,
        role,
        status,
      };
      res.json({
        message: "User updated successfully.",
        user: updatedUser,
      });
    }
  );
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  // Delete the user from the database
  const deleteUserQuery = "DELETE FROM users WHERE userId = ?";
  connection.query(deleteUserQuery, [userId], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error("Error deleting user:", deleteErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the user was found and deleted
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  });
};

exports.getAvailableOperators = (req, res) => {
  // Fetch the available operators from the database based on status
  const getAvailableOperatorsQuery =
    "SELECT userId, first_name, last_name FROM users WHERE status = 'available' AND role = 'operator'";

  connection.query(getAvailableOperatorsQuery, (queryErr, operators) => {
    if (queryErr) {
      console.error("Error getting available operators:", queryErr);
      return res.status(500).json({ message: "Internal server error." });
    }

    res.json({ operators });
  });
};

exports.getSalaryDetails = (req, res) => {
  const userId = req.params.id;
  const date = req.params.date;
  let month = date.split("-")[1];
  let year = date.split("-")[0];

  // Fetch the user from the database based on userId
  const getSalaryDetailsQuery = `
    SELECT task_details.date, SUM(task_details.endmeter- task_details.startmeter) AS totalHours,
    machines.salaryRatePerHour,
        SUM(task_details.endmeter- task_details.startmeter) * machines.salaryRatePerHour As totalSalary
         FROM users JOIN tasks ON users.userId = tasks.assigned_userID
          JOIN machines ON machines.machineId = tasks.allocated_machineID 
          JOIN task_details ON task_details.taskId = tasks.taskId 
          WHERE users.userId = ? AND MONTH(task_details.date) = ? 
          AND YEAR(task_details.date) = ? Group By task_details.date , machines.salaryRatePerHour;
      `;
  connection.query(
    getSalaryDetailsQuery,
    [userId, month, year],
    (err, results) => {
      if (err) {
        console.error("Error getting salary details:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Send the list of data in the response
      res.json({ data: results });
    }
  );
};
