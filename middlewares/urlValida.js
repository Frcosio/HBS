const { URL } = require("url");
const urlValidar = (req, res, next) => {
    try {
        const { origin } = req.body;
        const urlFrontend = new URL(origin);
        if(urlFrontend.origin !== "null"){
            if(
                urlFrontend.protocol === "http:" ||
                urlFrontend.protocol === "https:" 
            ){
                return next();
            }
            throw new Error("tiene que tener https://")
        }
        throw new Error("no válida 😯")
    } catch (error) {
        if(error.message === "Invalid URL"){
            req.flash("mesanjes",[{msg:"url no valida"}])
        }else{
        //return res.redirect("/")
        //return res.send("url no válida");
        req.flash("mensajes", [{ msg: error.message }]);
        }
        //va ir a la ruta de inicio por no ser valida
        return res.redirect("/");
    }
 

}

module.exports = urlValidar