const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const { create } = require("express-handlebars");
const csrf = require("csurf");
const User = require("./models/User");
require("dotenv").config();
//require("./database/db");
const clientDB = require("./database/db");

const app = express();

const corsOptions = {
  credentials: true,
  // origin: "https://uur.herokuapp.com/",
  origin: process.env.PATHHEROKU || "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "session-user",
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME,
    }),
    cookie: {
      secure: process.env.MODO === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
/*
app.get("/ruta-protegida", (req, res) => {
  res.json(req.session.usuario || "Sin sesión del usuario");
});

app.get("/crear-session", (req, res) => {
  req.session.usuario = "digital";
  res.redirect("/ruta-protegida");
});

app.get("/destruir-session", (req, res) => {
    req.session.destroy();
    res.redirect("/ruta-protegida");
});
*/

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
); //req.user

passport.deserializeUser(async (user, done) => {
  //es necesario revisar la base de datos
  const userDB = await User.findById(user.id);
  return done(null, { id: userDB._id, userName: userDB.userName });
});

app.get("/mensaje-flash", (req, res) => {
  //pintarlo es por tema de depuracion porque se destruye al instante,
  //se usa para mandar alerta al usuario
  //console.log(req.flash());
  res.json(req.flash("mensaje"));
});

app.get("/crear-mensaje", (req, res) => {
  req.flash("mensaje", "este es un mensaje de error");
  res.redirect("/mensaje-flash");
});

const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});

console.log("Hola soy backend");

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extend: true }));

app.use(csrf());
app.use(mongoSanitize());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash("mensajes");
  next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("servidor andando 😍" + PORT));
