const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/home/aman/Desktop/profileImages");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + Date.now());
  },
});

// const upload = multer({ storage: storage });

function createMulterMiddleware(fieldNames) {
  return multer({ storage: storage }).fields(fieldNames);
}

module.exports = createMulterMiddleware;
