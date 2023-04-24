const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();

const saucesCtrl = require("../controllers/sauces");
const multer = require("../middlewares/multer-config");

router.get("/", auth, saucesCtrl.getSauces);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.put("/:id", auth, multer, saucesCtrl.updateSauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);

module.exports = router;
