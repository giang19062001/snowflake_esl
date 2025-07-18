var express = require("express");
var router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        res.render("pages/home", {
            title: "Home",
            message: "Welcome",
        });
    } catch (err) {
        next(err); 
    }
});


module.exports = router;
