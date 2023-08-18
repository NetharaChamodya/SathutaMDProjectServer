const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.saveCustomer);
router.put("/", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.get("/:id", customerController.getCustomerById);
router.get("/", customerController.getAllCustomers);
router.get("/generateInvoice/:id/:date", customerController.getInvoice);

module.exports = router;
