const formidable = require("formidable");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

module.exports.formPerfil = async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      return res.render("perfil", { user: req.user, imagen: user.imagen });
  } catch (error) {
      req.flash("mensajes", [{ msg: "Error al leer el usuario" }]);
      return res.redirect("/perfil");
  }
};

module.exports.editarFotoPerfil = async (req, res) => {
  //console.log(req.user)
  const form = new formidable.IncomingForm();
  //form.maxFileSize = 50 * 1024 * 1024; //5MB
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("falló la subida de imagenes");
      }
      console.log(fields);
      //console.log(files)
      const file = files.myfile;

      if (file.originalFilename === "") {
        throw new Error("Por favor agrega una imagen");
      }

      // if(!(file.mimetype === 'image/jpeg' ||
      // file.mimetype === 'image/png')){
      //     throw new Error('Por favor agrega una imagen .jpeg o .png')
      // }

      const imagetypes = ["image/jpeg", "image/png"];

      if (!imagetypes.includes(file.mimetype)) {
        throw new Error("Por favor agrega una imagen .jpeg o .png");
      }

      // if (!(file.size > 50 * 1024 * 1024)) {
      //   throw new Error("Menos de 5MB porfavor");
      // }

      const extension = file.mimetype.split("/")[1];
      const dirFile = path.join(
        __dirname,
        `../public/img/perfiles/${req.user.id}.${extension}`
      );
      console.log(dirFile);

      fs.renameSync(file.filepath, dirFile);
      //console.log(dirFile);

      const image = await Jimp.read(dirFile);
      image.resize(200, 200).quality(80).writeAsync(dirFile);

      const user = await User.findById(req.user.id);
      user.imagen = `${req.user.id}.${extension}`;
      await user.save();

      req.flash("mensajes", [{ msg: "ya se subió la imagen" }]);
    } catch (error) {
      req.flash("mensajes", [{ msg: error.message }]);
    } finally {
      return res.redirect("/perfil");
    }
  });
};
