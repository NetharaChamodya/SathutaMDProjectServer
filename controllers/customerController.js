const connection = require("../database");
const { generateInvoice } = require("./reportController");

exports.saveCustomer = (req, res) => {
  const {
    customerName: customer_name,
    contact_name,
    email,
    phone,
    address,
  } = req.body;

  console.log(req.body);

  // Validate the input data (You can add more validation as needed)
  if (!customer_name || !contact_name || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Store the new customer in the database
  const createCustomerQuery =
    "INSERT INTO customers (customer_name, contact_name, email, phone, address) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    createCustomerQuery,
    [customer_name, contact_name, email, phone, address],
    (createErr, createResult) => {
      if (createErr) {
        console.error("Error creating customer:", createErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // You can include additional customer data in the response if needed
      const newCustomer = {
        customerId: createResult.insertId,
        customer_name,
        contact_name,
        email,
        phone,
        address,
      };
      res.status(201).json({
        message: "Customer saved successfully.",
        customer: newCustomer,
      });
    }
  );
};

exports.updateCustomer = (req, res) => {
  const { customerId, customer_name, contact_name, email, phone, address } =
    req.body;

  // Validate the input data (You can add more validation as needed)
  if (!customer_name || !contact_name || !email || !phone || !address) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Update the customer in the database
  const updateCustomerQuery =
    "UPDATE customers SET customer_name = ?, contact_name = ?, email = ?, phone = ?, address = ? WHERE customerId = ?";
  connection.query(
    updateCustomerQuery,
    [customer_name, contact_name, email, phone, address, customerId],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating customer:", updateErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Check if the customer was found and updated
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: "Customer not found." });
      }

      // You can include additional customer data in the response if needed
      const updatedCustomer = {
        customerId,
        customer_name,
        contact_name,
        email,
        phone,
        address,
      };
      res.json({
        message: "Customer updated successfully.",
        customer: updatedCustomer,
      });
    }
  );
};

exports.deleteCustomer = (req, res) => {
  const customerId = req.params.id;

  // Delete the customer from the database
  const deleteCustomerQuery = "DELETE FROM customers WHERE customerId = ?";
  connection.query(
    deleteCustomerQuery,
    [customerId],
    (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting customer:", deleteErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Check if the customer was found and deleted
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: "Customer not found." });
      }

      res.json({ message: "Customer deleted successfully." });
    }
  );
};

exports.getAllCustomers = (req, res) => {
  // Retrieve all customers from the database
  const getAllCustomersQuery = "SELECT * FROM customers";
  connection.query(getAllCustomersQuery, (err, results) => {
    if (err) {
      console.error("Error getting all customers:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Send the list of customers in the response
    res.json({ customers: results });
  });
};

exports.getCustomerById = (req, res) => {
  const customerId = req.params.id;
  console.log(customerId);

  // Retrieve the customer from the database by customerId
  const getCustomerByIdQuery = "SELECT * FROM customers WHERE customerId = ?";
  connection.query(getCustomerByIdQuery, [customerId], (err, results) => {
    if (err) {
      console.error("Error getting customer by ID:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if the customer with the specified customerId exists
    if (results.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Send the customer data in the response
    res.json({ customer: results[0] });
  });
};

exports.getInvoice = (req, res) => {
  let customerId = req.params.id;
  let month = req.params.date.split("-")[1];
  let year = req.params.date.split("-")[0];

  console.log(month, year);

  // write customer get query
  const sqlQueryCustomer = `SELECT * FROM customers WHERE customerId = ?`;

  const sqlQuery = `
  SELECT
    m.machineId,
    m.machine_name,
    DATE(td.date) AS work_date,
    SUM(endmeter-startmeter) AS working_hours,
    t.customerRate as RatePerHour,
    SUM(endmeter-startmeter) * t.customerRate AS total_working_hours
  FROM
    machines m
  JOIN tasks t ON m.machineId = t.allocated_machineID
  JOIN task_details td ON t.taskID = td.taskID
  WHERE
    t.customerID = ? AND MONTH(td.date) = ? AND YEAR(td.date) = ?
  GROUP BY
    m.machineId, m.machine_name, work_date, RatePerHour;
`;

  // Retrieve the customer from the database by customerId
  connection.query(sqlQueryCustomer, [customerId], (err, customer) => {
    if (err) {
      console.error("Error executing the SQL query:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Execute the SQL query with customer ID, month, and year as parameters
    connection.query(sqlQuery, [customerId, month, year], (err, tasks) => {
      if (err) {
        console.error("Error executing the SQL query:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      const doc = generateInvoice(customer[0], tasks); // Pipe the PDF to the response to trigger the download
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="invoice.pdf"'
      );
      doc.pipe(res);
      doc.end();
    });
  });
};
