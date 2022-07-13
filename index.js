const express =  require('express')
const { create } = require("express-handlebars");

const app = express();

const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"], 
});

console.log('Hola soy backend')

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// app.get("/",(req,res) => {

//     const urls = [
//         {origin: "www.google.com/bluuweb1", shortUrl: "asdasd1"},
//         {origin: "www.google.com/bluuweb2", shortUrl: "asdasd2"},
//         {origin: "www.google.com/bluuweb3", shortUrl: "asdasd3"},
//         {origin: "www.google.com/bluuweb4", shortUrl: "asdasd4"},
//     ]
//     res.render("home", {urls: urls});
//     //nombre de la propiedad : el valor que contiene - MongoDB usu : frcosio pwd : ec2cchDYyT2FMGbF
// });


//app.use(express.static(__dirname + "/public"));
app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

app.listen(5000, () => console.log("servidor andando 😍"));

