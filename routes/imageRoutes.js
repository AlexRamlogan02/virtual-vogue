const express = require("express");
const router = express.Router();
const connectToMongoDB = require("../utils/mongoUtil");
const cloudinary = require("../utils/cloudinary");
const upload = require("../middleware/multer");
var db = null;

async function setupRoutes() {
  try {
    db = await connectToMongoDB(process.env.ATLAS_URI, "VirtualCloset");
    console.log("MongoDB connection established in imageRoutes");
    // Define image routes using db
  } catch (error) {
    console.error("Error setting up image routes:", error);
  }
}

setupRoutes();

// Endpoints

// Upload Image
// make file size of photos limiter and also maybe img compression
router.post("/Upload/:userId", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.userId;
    const tag = req.body.tag;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      tags: [tag],
    });

    // Save public ID to MongoDB
    //db.collection("Images").insertOne({ publicId: result.public_id });
    await db.collection("Users").updateOne(
      { _id: new ObjectId(userId) }, //userId being the object id in the MongoDb
      { $push: { Images: { publicId: result.public_id, tag: tag } } }
    );

    // Respond with success message and Cloudinary data
    res.status(200).json({
      success: true,
      message: "Uploaded!",
      data: result,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image, maybe file size too large? (Max 10 mb)",
      error: error.message,
    });
  }
});

// View a photo
// id is the public id
//<img src="https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_200,h_100,c_fill,q_100/${id}.jpg"></img>
router.get("/ViewImage/:id", async (req, res) => {
  const photoId = req.params.id;

  try {
    // Get image and construct the link using cloudinary
    const result = await cloudinary.api.resource(photoId);

    // if (image) then send URL as a response
    if (result) {
      const imageUrl = result.secure_url;
      res.status(200).json({
        success: true,
        imageUrl,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving image",
      error: error.message,
    });
  }
});

// fetch ALL the images associated to a user
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId; // Get user ID from URL parameter
  const tag = req.params.tag; // Get tag from URL parameter

  try {
    // Retrieve user's images from MongoDB
    const user = await db
      .collection("Users")
      .findOne({ _id: new ObjectId(userId) });

    // If the user doesn't exist or has no images, return an empty response
    if (!user || !user.Images || user.Images.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No images found for the user." });
    }
    // Extract public IDs of images
    const imageIds = user.Images.map((image) => image.publicId);

    // Fetch images from Cloudinary using public IDs
    const { resources } = await cloudinary.api.resources_by_ids(imageIds, {
      tags: true,
    });

    // Extract image URLs or other relevant data
    const imageUrls = resources.map((image) => image.secure_url);

    // Respond with the images
    res.status(200).json({ success: true, images: imageUrls });
  } catch (error) {
    console.error("Error fetching images for user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images for user",
      error: error.message,
    });
  }
});

// fetch all the images by specific tag
router.get("/:userId/:tag", async (req, res) => {
  const userId = req.params.userId; // Get user ID from URL parameter
  const tag = req.params.tag; // Get tag from URL parameter

  try {
    // Retrieve user's images with the specified tag from MongoDB
    const user = await db
      .collection("Users")
      .findOne({ _id: new ObjectId(userId) });

    // If the user doesn't exist or has no images associated with the tag, return an empty response
    if (
      !user ||
      !user.Images ||
      user.Images.length === 0 ||
      !user.Images.some((image) => image.tag === tag)
    ) {
      return res.status(404).json({
        success: false,
        message: "No images found for the specified tag.",
      });
    }
    const filteredImages = user.Images.filter((image) => image.tag === tag);

    // Extract public IDs of filtered images
    const imageIds = filteredImages.map((image) => image.publicId);

    // Fetch images from Cloudinary using public IDs
    const { resources } = await cloudinary.api.resources_by_ids(imageIds, {
      tags: true,
    });

    // Extract image URLs or other relevant data
    const imageUrls = resources.map((image) => image.secure_url);

    // Respond with the images
    res.status(200).json({ success: true, images: imageUrls });
  } catch (error) {
    console.error("Error fetching images by user ID and tag:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images by user ID and tag",
      error: error.message,
    });
  }
});

// Delete Image from a specific user using their objectId and imageId
router.post("/DeletePhoto/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const imageId = req.body.id;

    // actually delete the photo from cloudinary
    await cloudinary.uploader.destroy(req.body.id);

    // delete from db
    const deleteResult = await db.collection("Users").updateOne(
      { _id: new ObjectId(userId) }, //userId being the object id in the MongoDb
      { $pull: { Images: { publicId: imageId } } }
    );

    if (deleteResult.modifiedCount === 0) {
      throw new Error("Image not found in the database");
    }

    // response
    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
});

// Delete all photos off of a user

// Function to delete images associated with a user from Cloudinary
async function deleteImagesFromCloudinary(imageIds) {
  try {
    // Delete images from Cloudinary using their public IDs
    const deleteResults = await cloudinary.api.delete_resources(imageIds);

    // Return the delete results
    return deleteResults;
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
    throw error;
  }
}

// Endpoint to delete a user (and associated images) from the system
router.delete("/DeleteUser/:userId", async (req, res) => {
  const userId = req.params.userId; // Get user ID from URL parameter

  try {
    // Retrieve user's images from MongoDB
    const user = await db
      .collection("Users")
      .findOne({ _id: new ObjectId(userId) });

    // If the user doesn't exist, return a 404 Not Found response
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // If the user exists and has images, delete them from Cloudinary
    if (user.Images && user.Images.length > 0) {
      const imageIds = user.Images.map((image) => image.publicId);
      await deleteImagesFromCloudinary(imageIds);
    }

    // Delete the user's document from MongoDB
    await db.collection("Users").deleteOne({ _id: new ObjectId(userId) });

    // Respond with success message
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
});

module.exports = router;
