const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../database");

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the user exists in the database
  const query =
    "SELECT userId, username, password, role FROM users WHERE username = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];

    // Compare the provided password with the hashed password from the database
    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("Error comparing passwords:", bcryptErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Create a JWT token with a secret key and user information
      const token = jwt.sign(
        { userID: user.userID, username: user.username, role: user.role },
        "your_secret_key_here",
        { expiresIn: "1h" } // Token will expire in 1 hour
      );

      // Send the JWT token as the response
      res.json({ token, role: results[0].role, userId: results[0].userId });
    });
  });
};

exports.register = (req, res) => {
  const { username, password, first_name, last_name, role } = req.body;

  console.log(req.body);

  // Validate the input data (You can add more validation as needed)
  if (!username || !password || !first_name || !last_name || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the username already exists in the database
  const checkUsernameQuery = "SELECT username FROM users WHERE username = ?";
  connection.query(checkUsernameQuery, [username], (err, results) => {
    if (err) {
      console.error("Error checking username in the database:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Username already exists." });
    }

    // Hash the password before storing it in the database
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Error hashing password:", hashErr);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Store the new user in the database
      const createUserQuery =
        "INSERT INTO users (username, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)";
      connection.query(
        createUserQuery,
        [username, hashedPassword, first_name, last_name, role],
        (createErr, createResult) => {
          if (createErr) {
            console.error("Error creating user:", createErr);
            return res.status(500).json({ message: "Internal server error." });
          }

          // You can include additional user data in the response if needed
          const newUser = {
            id: createResult.insertId,
            username,
            first_name,
            last_name,
            role,
          };
          res
            .status(201)
            .json({ message: "User registered successfully.", user: newUser });
        }
      );
    });
  });
};
