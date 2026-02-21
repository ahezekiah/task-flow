const express = require("express");
const router = express.Router();

let users = [];

router.get("/api/users", (req, res) => {
    res.json(users);
});

router.post("/api/user", (req, res) => {

});

module.exports = router;