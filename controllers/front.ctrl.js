require('dotenv').config()
const db = require('../db')

// para recibir emails 
let nodemailer = require('nodemailer');


// INICIO:GET 
const inicioGET = function (req, res) {

    /* console.log("SESIÓN", req.session)
    console.log("SESIÓN", req.session.id)
    req.session.visita = req.session.visita ? req.session.visita + 1 : 1;
    res.send(`Visita nro ${req.session.visita}`)  */

    
    let sql = 'SELECT * FROM productos'
    db.query(sql, function(err,data) {
        if (err) throw err;
        console.log(data)
        res.render('index', {
            titulo: "Mi emprendimiento",
            logueado: req.session.logueado,
            usuario: req.session.nombreUsuario,
            productos: data
        })
    }) 

}

const contactoGET = function (req, res) {
    res.render('contacto', {
        titulo: "Contacto",
        logueado: req.session.logueado,
        usuario: req.session.nombreUsuario,
    })
}

const contactoPOST = function (req, res) {
    // Definimos el transporter
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "683bb9e3393240",
            pass: "99a59f1999facb"
        }
    })
    // Definimos el e-mail
    console.log("BODY: ", req.body)
    let data = req.body
    let mailOptions = {
        from: data.nombre, // de: "Santi"
        to: "santiago.acosta@bue.edu.ar",
        subject: data.asunto,
        html: `<p> ${data.mensaje}</p>`
    }
    // enviar email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            res.status(500, error.message)
            res.status(500).render('contacto', {
                mensaje: `Ha ocurrido el siguiente error ${error.message}`,
                mostrar: true,
                clase: 'danger'
            })
        } else {
            console.log('E-mail enviado')
            res.status(200).render('contacto', {
                mensaje: "Mail enviado correctamente",
                mostrar: true,
                clase: 'success'
            })
        }
    })
}

const comoComprarGET = function (req, res) {
    res.render('como-comprar', {
        titulo: "Como comprar",
        logueado: req.session.logueado,
        usuario: req.session.nombreUsuario,
    })
}

const detalleProductoGET_ID = function (req, res) {
   
    let id = req.params.id // Toma de la URL el valor indicado por el parámetro ej "detalle-producto/1", entonces obtendrá el 1.
    let sql = "SELECT * FROM productos WHERE id = ?" // Seleccionar de la tabla productos, DONDE el registro tenga el ID 
    db.query(sql, id, function(err, data) {
        console.log("DATA -->", data[0])
        if (err) throw err;
        if (data == "") { // Si no encuentra el ID, entonces obtendrá un vacio

            res.status(404).render('404', {
                mensaje: `Producto con ID ${id} no existe`
            })
        } else {
            res.render('detalle-producto', {
                producto: data[0],
                titulo: `Producto ${data[0].nombre}`,
                logueado: req.session.logueado,
                usuario: req.session.nombreUsuario,
            })
        }
    })
    


}

const sobreNosotrosGET = function (req, res) {
    res.render('sobre-nosotros', {
        titulo: "Sobre Nosotros",
        logueado: req.session.logueado,
        usuario: req.session.nombreUsuario,
    })
}

module.exports = {
    inicioGET,
    contactoGET,
    contactoPOST,
    comoComprarGET,
    detalleProductoGET_ID,
    sobreNosotrosGET
}