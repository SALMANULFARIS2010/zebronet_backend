


const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("uploads")); // Serve uploaded images from this directory

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/procurementDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// Item Schema
const itemSchema = new mongoose.Schema({
  itemNo: { type: Number, required: true },
  itemName: { type: String, required: true },
  inventoryLocation: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  supplier: { type: String, required: true },
  stockUnit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  status: { type: String, enum: ["Enabled", "Disabled"], default: "Enabled" },
  itemImages: { type: [String], default: [] },
});

// Supplier Schema
const supplierSchema = new mongoose.Schema({
  supplierNo: Number,
  supplierName: String,
  address: String,
  taxNo: String,
  country: String,
  mobileNo: String,
  email: String,
  status: { type: String, enum: ["Active", "Inactive", "Blocked"], default: "Active" },
});

// Models
const Item = mongoose.model("Item", itemSchema);
const Supplier = mongoose.model("Supplier", supplierSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
  },
});
const upload = multer({ storage });

// API endpoint to add an item
app.post("/api/items", upload.array("itemImages"), async (req, res) => {
  console.log("Request body:", req.body); // Log the request body
  console.log("Uploaded files:", req.files); // Log the uploaded files

  const { itemNo, itemName, inventoryLocation, brand, category, supplier, stockUnit, unitPrice, status } = req.body;

  // Collect uploaded file paths
  const itemImages = req.files ? req.files.map(file => file.path) : [];

  try {
    const newItem = new Item({
      itemNo,
      itemName,
      inventoryLocation,
      brand,
      category,
      supplier,
      stockUnit,
      unitPrice,
      status,
      itemImages,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully!", item: newItem });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Error adding item", error: error.message });
  }
});

// API endpoint to get all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
});

// POST route to add a supplier
app.post('/api/suppliers', async (req, res) => {
  const supplierData = req.body;

  try {
    const newSupplier = new Supplier(supplierData);
    await newSupplier.save();
    res.status(201).send({ message: "Supplier added successfully!" });
  } catch (error) {
    console.error("Failed to add supplier:", error);
    res.status(500).send({ error: "Failed to add supplier" });
  }
});

// API endpoint to get all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    res.status(500).send({ error: "Failed to fetch suppliers" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


