const fs = require('fs');
const db = require('../db')
const { upload, maxSizeMB, multer } = require('../helpers/helper')




const loginGET = function (req, res) {
    res.render('login', { 
        error: req.query.error
    })
}

const loginPOST = function (req, res) {

    let usuario = req.body.username
    let clave = req.body.password

    if (usuario && clave) { // Chequea que NO esté vacio, es decir, si son true ambos.
        let sql = 'SELECT * FROM cuentas WHERE usuario = ? AND clave = ?'
        db.query(sql, [usuario, clave], function (err, data) {
            console.log("LONGITUD DATA", data.length)
            if (data.length > 0) {
                req.session.logueado = true; // Creamos una propiedad llamada "logueado" para que el objeto session almacene el valor "TRUE", es para que solo se pueda acceder si se ha logueado
                req.session.nombreUsuario = usuario
                res.redirect('/admin')
            } else {
                res.render('login', {
                    titulo: "Login",
                    error: "Nombre de usuario o contraseña incorrecto(s)"
                })
            }
        })
    } else {
        res.redirect('/login' + "?error=Por favor escribe un nombre de usuario y contraseña")
       // res.render("login", { titulo: "Login", error: "Por favor escribe un nombre de usuario y contraseña" })
    }


}

const adminGET = function (req, res) {

    if (req.session.logueado) { // Chequeará si es true de cuando hicimos el login
        let sql = "SELECT * FROM productos"
        db.query(sql, function (err, data) {
            if (err) throw err

           // console.log("usuario", req.session)
            res.render('admin', {
                titulo: "Panel de control",
                logged: true,
                usuario: req.session.nombreUsuario,
                productos: data
            })

        })

    } else {
        // res.render('login', {
        //     titulo: "Login",
        //     error: "Nombre de usuario o contraseña incorrecto(s)"
        // })
        res.redirect('/login' + "?error=Nombre de usuario o contraseña incorrecto(s)")
    }





}

const agregarProductoGET = function (req, res) {
    if (req.session.logueado) {
        res.render('agregar-producto', {
            titulo: "Agregar producto",
            logged: true,
            usuario: req.session.nombreUsuario
        })
    } else {
        // res.render('login', {
        //     titulo: "Login",
        //     error: "Por favor loguearse para ver ésta página"
        // })
        res.redirect('/login' + "?error=Por favor loguearse para ver ésta página")
    }

}

const agregarProductoPOST = function (req, res) {

    upload(req, res, function (err) {
        // Manejo de ERRORES de multer
        if (err instanceof multer.MulterError) {
            // Error de Multer al subir imagen
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).render('agregar-producto', { error: `Imagen muy grande, por favor ahicar a ${maxSizeMB}` });
            }
            return res.status(400).render('agregar-producto', { error: err.code });
        } else if (err) {
            // Ocurrió un error desconocido al subir la imagen
            return res.status(400).render('agregar-producto', { error: err });
        }

        // SI TODO OK
        const detalleProducto = req.body; // Solo toma los TEXTOS
        console.log("FILE --->", req.file) // Toma los datos sobre la imagen subida
        const nombreImagen = req.file.filename; // Tomo el nombre del archivo de la imagen
        detalleProducto.rutaImagen = nombreImagen // Adjunto la info de la imagen { rutaImagen: "Lenovo X200"}
        console.log("DETALLE DEL PRODUCTO  --> ", detalleProducto)

        // consulta de base de datos
        let sql = "INSERT INTO productos SET ?"

        db.query(sql, detalleProducto, function (err, data) {
            if (err) throw err;
            console.log("Producto agregado")
            res.render('agregar-producto', {
                mensaje: "Producto agregado correctamente",
                titulo: 'Agregar producto'
            })
        })

    })

}

const editarProducto_ID = function (req, res) {

    if (req.session.logueado) {
        let id = req.params.id
        let sql = "SELECT * FROM productos WHERE id = ?"
        db.query(sql, id, function (err, data) {
            if (err) throw err;

            if (data == "") {
                res.send(`
                <h1>no existe producto con id ${id}</h1>
                <a href="./admin/">Ver listado de productos</a>    
            `)
            } else {
                res.render('editar-producto', {
                    titulo: "Editar producto",
                    logged: true,
                    usuario: req.session.nombreUsuario,
                    producto: data[0]
                })
            }
        })
    } else {
        res.redirect('/login' + "?error=Por favor loguearse para ver ésta página")
    }




}

const editarProductoPOST_ID = function (req, res) {

    // Usar función de multer
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Error de Multer al subir imagen
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(418).render('agregar', { error: `Imagen muy grande, por favor ahicar a ${maxSizeMB}`});
            }
            return res.status(418).render('agregar', { error: err.code});
        } else if (err) {
            // Ocurrió un error desconocido al subir la imagen
            return res.status(418).render('agregar', { error: err});
        }
        
        // todo OK continuando
        const id = req.params.id;
        const productoDetalles=req.body;
        
        // chequear si la edición incluyó cambio de imagen
        if (req.hasOwnProperty("file")) {
            
            console.log("Producto Detalles (cambió la imagen): ", productoDetalles)

            console.log("FILE en EDITAR -->", req.file)
            const nombreImagen = req.file.filename;
            productoDetalles.rutaImagen = nombreImagen	
            
            // Se procede a borrar la imagen del servidor
            var borrarImagen = 'SELECT rutaImagen FROM productos WHERE id = ?';
            db.query(borrarImagen, [id], function (err, data) {
                console.log("DATA -->", data)
                if (err) res.send(`Ocurrió un error ${err.code}`)
                
                fs.unlink('public/uploads/' + data[0].rutaImagen, (err) => {
                    if (err) res.send(`Ocurrió un error ${err.code}`)
                    
                    var sql = `UPDATE productos SET ? WHERE id= ?`;
                    
                    db.query(sql, [productoDetalles, id], function (err, data) {
                        if (err) throw err;
                        console.log(data.affectedRows + " registro(s) actualizado(s)");
                    });
                });		
            });	
        } 
        
        // Insertar datos modificados (sin haber cambiado la imagen)
        var sql = `UPDATE productos SET ? WHERE id= ?`;
        
        db.query(sql, [productoDetalles, id], function (err, data) {
            if (err) res.send(`Ocurrió un error ${err.code}`);
            console.log(data.affectedRows + " registro(s) actualizado(s)");
            res.redirect('/admin');
        });
        
    
    })

    
}

const borrarProducto_ID = function (req, res) {

    var id= req.params.id;

    // Borrar fisicamente la imagen relacionada al producto
    var borrarImagen = 'SELECT rutaImagen FROM productos WHERE id = ?';
    db.query(borrarImagen, [id], function (err, data) {
        console.log(data[0].rutaImagen)
        if (err) res.send(`Ocurrió un error ${err.code}`);
        fs.unlink('public/uploads/' + data[0].rutaImagen, (err) => {
            if (err) res.send(`Ocurrió un error ${err.code}`);
            console.log('Archivo borrado');
        });
    });
    
    // Borrar el registro de la base de datos
    var sql = 'DELETE FROM productos WHERE id = ?';
    db.query(sql, [id], function (err, data) {      
        if (err) res.send(`Ocurrió un error ${err.code}`);
        console.log(data.affectedRows + " registro(s) borrado(s)");
    });
    
    res.redirect('/admin');


}


const logout = function (req, res) {

    req.session.destroy(function (err) {
        console.log(`Error en el logout ${err}`)
    })

    // Al finalizar sesión vuelve al inicio
    let sql = 'SELECT * FROM productos';
    db.query(sql, function (err, data) {
        if (err) throw err;

        res.render('index', {
            titulo: "Mi emprendimiento",
            data
        })
    });

}

module.exports = {
    adminGET,
    agregarProductoGET,
    loginGET,
    loginPOST,
    agregarProductoPOST,
    editarProducto_ID,
    borrarProducto_ID,
    editarProductoPOST_ID,
    logout
}