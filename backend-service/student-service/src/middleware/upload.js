import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "assignments", // Files will be stored in a folder named "assignments"
    allowed_formats: ["pdf", "docx", "jpg", "png"],
  },
});

const upload = multer({ storage });

export default upload;
