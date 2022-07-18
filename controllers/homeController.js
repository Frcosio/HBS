const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const { findByIdAndDelete } = require("../models/Url");

const leerUrls = async (req, res) => {
  console.log(req.user);
  try {
    const urls = await Url.find({ user: req.user.id }).lean();
    return res.render("home", { urls: urls });
  } catch (error) {
    //console.log(error)
    //return res.send('falló algo...')
    req.flash("mensajes", [{ msg: error.message }]);
    //enviarlo a la ruta de inicio
    return res.redirect("/");
  }

  //nombre de la propiedad : el valor que contiene
};

const agregarUrl = async (req, res) => {
  const { origin } = req.body;
  try {
    const url = new Url({
      origin: origin,
      shortURL: nanoid(8),
      user: req.user.id,
    });
    await url.save();
    req.flash("mensajes", [{ msg: "Url agregada" }]);
    //console.log(url);
    return res.redirect("/");
    //res.send("agregado");
  } catch (error) {
    //console.log(error)
    //return res.send('error algo fallo')
    req.flash("mensajes", [{ msg: error.message }]);
    //enviarlo a la ruta de inicio
    return res.redirect("/");
  }
};

const eliminarUrl = async (req, res) => {
  const { id } = req.params;
  try {
    //await Url.findByIdAndDelete(id);
    const url = await Url.findById(id);
    if(!url.user.equals(req.user.id)) {
      //el throw pasa directo al catch
        throw new Error("No es tu url")
    }

    await url.remove();
    req.flash("mensajes", [{ msg: "Url eliminada" }]);
    return res.redirect("/");
  } catch (error) {
    //console.log(error)
    //return res.send('error algo fallo')
    req.flash("mensajes", [{ msg: error.message }]);
    //enviarlo a la ruta de inicio
    return res.redirect("/");
  }
};

const editarUrlForm = async (req, res) => {
  const { id } = req.params;
  try {
    const url = await Url.findById(id).lean();

    if(!url.user.equals(req.user.id)) {
      //el throw pasa directo al catch
        throw new Error("No es tu url")
    }

    //console.log(url);
    return res.render("home", { url });
  } catch (error) {
    //console.log(error)
    //return res.send('error algo fallo')
    req.flash("mensajes", [{ msg: error.message }]);
    //enviarlo a la ruta de inicio
    return res.redirect("/");
  }
};

const editarUrl = async (req, res) => {
  const { id } = req.params;
  const { origin } = req.body;
  try {
    
    //const url = await Url.findById(id).lean();
    const url = await Url.findById(id);
    if(!url.user.equals(req.user.id)) {
      //el throw pasa directo al catch
        throw new Error("No es tu url")
    }

    await url.updateOne({origin})
    req.flash("mensajes", [{ msg: "Url editada" }]);

    //await Url.findByIdAndUpdate(id, { origin: origin });
    return res.redirect("/");
  } catch (error) {
    //console.log(error)
    //return res.send('error algo fallo')
    req.flash("mensajes", [{ msg: error.message }]);
    //enviarlo a la ruta de inicio
    return res.redirect("/");
  }
};

const redireccionamiento = async (req, res) => {
  const { shortURL } = req.params;

  try {
    const urlDB = await Url.findOne({ shortURL: shortURL });
    return res.redirect(urlDB.origin);
  } catch (error) {
    //console.log(error)
    //return res.send('error algo fallo')
    req.flash("mensajes", [{ msg: "No existe esta url configurada" }]);
    //enviarlo a la ruta de inicio
    return res.redirect("/auth/login");
  }
};

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
};
