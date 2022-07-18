const User = require("../models/User");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
  res.render("register");
};

const loginForm = (req, res) => {
  res.render("login");
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    //return res.json(errors);
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
    //con el return no continua con las sgtes validaciones
  }

  //console.log(req.body)
  //destructuración

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) throw new Error("ya existe usuario");

    user = new User({ userName, email, password, tokenConfirm: nanoid() });
    //User es un obj que viene con todos los metodos de mongoose
    //        console.log(user)
    //save es de mongoose
    await user.save();
    //  const salt = await bcrypt.genSalt(10)
    //console.log(await bcrypt.hash(user.password, salt))
    //res.json(user)

    //enviar email con la confirmacion de la cuenta
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    //transporter lo ha creado y se visualiza en la web de mailtrap
    await transport.sendMail({
      from: '"Fred Foo 👻" <frcosio@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: "verifica tu cuenta de correo", // Subject line
      //text: "Hello world?", // plain text body
      html: `<a href="${process.env.PATHHEROKU || 'http://localhost:5000'}/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta aquí</a>`, // html body
    });

    req.flash("mensajes", [
      { msg: "Revisa tu correo electronico y valida cuenta" },
    ]);
    return res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
    //return res.json({ error: error.message });
  }
  //res.json(req.body)
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ tokenConfirm: token });

    if (!user) throw new Error("No existe este usuario");

    user.cuentaConfirmada = true;
    user.tokenConfirm = null;
    //enviar email con la confirmacion de la cuenta
    await user.save();

    req.flash("mensajes", [
      { msg: "Cuenta verificada, puedes iniciar sesión" },
    ]);
    return res.redirect("/auth/login");
    //el save() es un metodo de mongoose
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // return res.json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
    //return res.json(errors.array())
    //con el return no continua con las sgtes validaciones
  }
  //los errores son antes de realizar la destructuración
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No existe este email");
    //throw no es necesario usar el return pasa directamente al catch

    if (!user.cuentaConfirmada) throw new Error("falta confirmar cuenta");

    if (!(await user.comparePassword(password)))
      throw new Error("Contraseña no correcta");

    //esta creando la session de usuario a través de passport
    req.login(user, function (err) {
      if (err) throw new Error("Error al crear la sesión");
      return res.redirect("/");
    });
  } catch (error) {
    //console.log(error);
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    //return res.send(error.message);
  }
};

const cerrarSesion = (req, res) => {
  req.logout();
  return res.redirect("/auth/login");
  /* version >=6
  req.logout(function(err) => {
    if (err) { return next(err); }
    res.redirect("/auth/login");
  });
*/
};

module.exports = {
  loginForm,
  registerUser,
  registerForm,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
