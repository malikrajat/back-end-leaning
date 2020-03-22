const multer = require("multer");
const uuid = require("uuid/v1");
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};
const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, "upload/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error("Invalid type");
    cb(error, isValid);
  }
});
module.exports = fileUpload;
