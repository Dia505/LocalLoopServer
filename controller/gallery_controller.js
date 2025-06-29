const Gallery = require("../model/gallery");

const findAll = async (req, res) => {
    try {
        const gallery = await Gallery.find();
        res.status(200).json(gallery);
    }
    catch (e) {
        res.json(e)
    }
}

const save = async (req, res) => {
    try {
        const {
            eventTitle,
            companyName,
            companySocialMediaLinks
        } = req.body;

        const coverPhoto = req.files?.coverPhoto?.[0]?.originalname;
        const companyProfilePicture = req.files?.companyProfilePicture?.[0]?.originalname || "default_profile_img.png";
        const galleryPhotos = req.files?.galleryPhotos?.map(photo => photo.originalname) || [];

        if (!eventTitle || !coverPhoto || !galleryPhotos.length || !companyName) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const gallery = new Gallery({
            eventTitle,
            coverPhoto,
            galleryPhotos,
            companyName,
            companyProfilePicture,
            companySocialMediaLinks
        });

        await gallery.save();

        res.status(201).json({ message: "Gallery saved successfully.", gallery });
    } catch (error) {
        console.error("Error saving gallery:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const findById = async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id)
        res.status(200).json(gallery);
    }
    catch (e) {
        res.json(e)
    }
}

module.exports = {
    findAll,
    save,
    findById
}
