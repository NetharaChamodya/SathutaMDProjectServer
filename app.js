const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./database");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
});

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const tasksRoutes = require("./routes/task");
const machinesRoutes = require("./routes/machine");
const customerRoute = require("./routes/customer");
const mainRouter = require("./routes/main");

// Use the routes as middleware
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", tasksRoutes);
app.use("/api/machine", machinesRoutes);
app.use("/api/customer", customerRoute);
app.use("/api/main", mainRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
