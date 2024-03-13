const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../middleware/multer");

router.post("/upload", upload.single("image"), async (req, res) => {
  cloudinary.uploader.upload(req.file.path, function (err, result) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error",
      });
    }

    res.status(200).json({
      success: true,
      message: "Uploaded!",
      data: result,
    });
  });
});

/*// Handle image upload
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
});*/

module.exports = router;
