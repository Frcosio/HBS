const express = require("express")
const router = express.Router()

router.get("/",(req,res) => {

    const urls = [
        {origin: "www.google.com/bluuweb1", shortUrl: "asdasd1"},
        {origin: "www.google.com/bluuweb2", shortUrl: "asdasd2"},
        {origin: "www.google.com/bluuweb3", shortUrl: "asdasd3"},
        {origin: "www.google.com/bluuweb4", shortUrl: "asdasd4"},
    ];
    res.render("home", {urls: urls});
    //nombre de la propiedad : el valor que contiene  
});

module.exports = router

