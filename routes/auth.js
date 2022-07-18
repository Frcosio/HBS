const express = require("express");
const { body } = require("express-validator");

const {
  registerForm,
  registerUser,
  confirmarCuenta,
  loginForm,
  loginUser,
  cerrarSesion,
} = require("../controllers/authController");

const router = express.Router();

router.get("/register", registerForm);
router.post(
  "/register",
  //escape() para que solo mande caracter si manda h1 lo interpreta
  //como un string
  [
    body("userName", "Ingrese un nombre válido").trim().notEmpty().escape(),
    body("email", "Ingrese un email válido")
    .trim().
    isEmail().
    normalizeEmail(),
    body("password", "Contraseña minimo de 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        //console.log(req.body.repassword);
        if (value !== req.body.repassword) {
          throw new Error("No coinciden las contraseñas");
        }else{
            return value;
        }
        
      }),
  ],
  registerUser
);
router.get("/confirmar/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post("/login",[
    body("email", "Ingrese un email válido")
    .trim().
    isEmail().
    normalizeEmail(),
    body("password", "Contraseña minimo de 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape()
], 
loginUser);

router.get("/logout", cerrarSesion);

module.exports = router;
