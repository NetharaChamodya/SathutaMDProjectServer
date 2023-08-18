const fs = require("fs");
const PDFDocument = require("pdfkit");
const connection = require("../database");

// Function to generate the PDF invoice
exports.generateInvoice = (customer, tasks) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Add header "Sathuta Industry (PVT LTD)"
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("Sathuta Industry (PVT LTD)", { align: "center" });
  doc.moveDown();

  // Add subheading "Machine Work Invoice"
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Machine Work Invoice", { align: "center" });
  doc.moveDown();

  // Pipe the document to a writable stream and save as a PDF file
  const filePath = "invoice.pdf";
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Add customer information to the document
  doc.fontSize(14).text(customer.customer_name);
  doc.fontSize(12).text(`Contact: ${customer.contact_name}`);
  doc.fontSize(12).text(`Email: ${customer.email}`);
  doc.fontSize(12).text(`Phone: ${customer.phone}`);
  doc.moveDown();

  // Group tasks by machine name
  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.machine_name] = acc[task.machine_name] || [];
    acc[task.machine_name].push(task);
    return acc;
  }, {});

  // Iterate over the grouped tasks and draw separate tables for each machine
  Object.entries(groupedTasks).forEach(
    ([machineName, tasksForMachine], index) => {
      // Calculate the position for the table
      const tableTop = index === 0 ? doc.y : doc.y + 30;
      const rowHeight = 30;
      const fontSize = 10;

      // Create a new table for the current machine
      const table = {
        subHeaders: ["Machine Name"],
        headers: ["Date", "Working hours", "Rate per hour", "Total cost"],
        rows: tasksForMachine.map((task) => [
          new Date(task.work_date).toLocaleDateString(),
          task.working_hours,
          task.RatePerHour,
          task.total_working_hours,
        ]),
      };

      // Draw sub-header and headers for the table
      doc.font("Helvetica-Bold").fontSize(fontSize);
      doc.text(machineName, 50, tableTop); // Draw machine name as the sub-header
      table.headers.forEach((header, colIndex) => {
        const xPos = 50 + colIndex * 120;
        doc.text(header, xPos, tableTop + fontSize + 5); // Add some space below the sub-header
      });

      // Draw table rows
      table.rows.forEach((row, rowIndex) => {
        const yPos = tableTop + (rowIndex + 1) * rowHeight + fontSize + 5; // Add some space below the sub-header
        row.forEach((cell, colIndex) => {
          const xPos = 50 + colIndex * 120;
          doc.text(cell, xPos, yPos);
        });
      });

      // Calculate machine-wise total hours and total payment
      const totalHours = tasksForMachine.reduce(
        (sum, task) => sum + Number(task.working_hours),
        0
      );
      const totalPayment = tasksForMachine.reduce(
        (sum, task) => sum + Number(task.total_working_hours),
        0
      );

      // Draw machine-wise total hours and total payment at the bottom of the table
      const totalHoursXPos = 50;
      const totalPaymentXPos = 50 + 3 * 120; // Assuming total_payment is the 4th column in the table
      const totalsYPos = tableTop + (table.rows.length + 2) * rowHeight + 5; // Add some space below the table

      doc.font("Helvetica-Bold").fontSize(fontSize);
      doc.text(`Total Hours: ${totalHours}`, totalHoursXPos, totalsYPos);
      doc.text(`Total Payment: ${totalPayment}`, totalPaymentXPos, totalsYPos);

      // Draw a line below the table
      const tableBottom = tableTop + (table.rows.length + 1) * rowHeight + 10;
      doc.moveTo(50, tableBottom).lineTo(550, tableBottom).stroke();

      // Move the cursor to the bottom of the table
      doc.moveDown(2);
    }
  );

  // Draw signature and date at the bottom
  const signatureXPos = doc.page.width - 200; // X position for the signature (right side)
  const dateXPos = 50; // X position for the date (left side)
  const signatureYPos = doc.page.height - 100; // Y position for the signature and date

  doc.fontSize(12).text("Date: _____________", dateXPos, signatureYPos);
  doc
    .fontSize(12)
    .text("Signature: _________", signatureXPos - 100, signatureYPos, {
      align: "right",
    });

  return doc;
};
