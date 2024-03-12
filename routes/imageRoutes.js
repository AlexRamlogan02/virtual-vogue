const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  secure: true,
});

// Handle image upload
router.post("/saveimage", async (req, res) => {
  try {
    const { file } = req.body; // Assuming you're sending the image file in the request body

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: "test",
    });

    // Save the public ID to the database
    const image = {
      publicId: result.public_id,
      // other fields you want to save
    };

    // Assuming you have a collection named "Images" in your MongoDB database
    const collection = dbo.collection("Images");

    // Insert the image document into the database
    await collection.insertOne(image);

    res
      .status(201)
      .json({ success: true, message: "Image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
});

module.exports = router;
