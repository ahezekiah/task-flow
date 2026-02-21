const express = require("express");
const router = express.Router();

let users = [];

router.get("/", (req, res) => {
    res.json(users);
});

router.post("/", (req, res) => {

});

module.exports = router;