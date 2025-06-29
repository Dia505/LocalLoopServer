const express = require("express");
const router = express.Router();
const { findAll, save, findById } = require("../controller/gallery_controller");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "";

        switch (file.fieldname) {
            case "coverPhoto":
                folder = "gallery_cover_images";
                break;
            case "companyProfilePicture":
                folder = "gallery_company_images";
                break;
            case "galleryPhotos":
                folder = "gallery_images";
                break;
            default:
                folder = "misc_files";
        }

        cb(null, path.join(__dirname, "..", folder));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

router.get("/", findAll);
router.post(
    "/",
    upload.fields([
        { name: "coverPhoto", maxCount: 1 },
        { name: "companyProfilePicture", maxCount: 1 },
        { name: "galleryPhotos", maxCount: 20 },
    ]),
    save
);
router.get("/:id", findById);

module.exports = router;