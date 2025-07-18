var express = require("express");
var router = express.Router();
const productController = require("../controller/product");

router.post("/updatePrice", productController.updatePrice);
router.post("/getProducts", productController.getProducts);
router.post("/getHistoryProduct", productController.getHistoryProduct);

module.exports = router;
