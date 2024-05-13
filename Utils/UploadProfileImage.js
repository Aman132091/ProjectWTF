const multer = require("multer");
const upload = require("../../Middleware/Multer");

exports.uploadProfileImage = async (req, res) => {
  try {
    const user = await userProfileModel.findById(req.user);

    if (!user) {
      return res
        .status(404)
        .send({ status: "failed", message: "User not found" });
    }

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .send({ status: "failed", message: "File upload error" });
      }

      if (!req.file) {
        return res
          .status(400)
          .send({ status: "failed", message: "No file uploaded" });
      }

      user.profileImage = req.file.filename;

      await user.save();

      res.send({
        status: "success",
        message: "Profile image updated successfully",
        filename: req.file.filename,
      });
    });
  } catch (error) {
    res.status(500).send({ status: "failed", message: error.message });
  }
};
