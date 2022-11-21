const axios = require('axios');
const hbs = require('hbs');


// cálculo del dolar
let dolarTurista;
let dolar;
axios.get('https://www.dolarsi.com/api/api.php?type=valoresprincipales')
    .then( function(respuesta) {
       dolar = respuesta.data[0].casa.venta // toma como string 
       dolar = dolar.replace(/,/g, '.')
       dolar = parseFloat(dolar)
    })
    .then( function() {
        const impuestoPAIS = 0.30;
        const percepcionAFIP = 0.35;
        dolarTurista = (dolar * impuestoPAIS) + (dolar * percepcionAFIP) + dolar;
        return dolarTurista
    })
    .catch( function(error) {
        console.log("error en AXIOS", error)
    })

// Helper de conversión
hbs.registerHelper('dolarApeso', function(dato) {
    
    let precioFinal = (dolarTurista * dato);
    return new Intl.NumberFormat('es-AR',{style: 'currency', currency: 'ARS'}).format(precioFinal)

})

// helper de listado características

hbs.registerHelper("listado", function(producto) {

    // Convierto en array la lista de características separadas previamente con "coma" (i3,128 ssd)
    console.log("LISTADO PRODDUCTO", producto)
    let array = producto.split(",") // [i3,128 ssd]
    console.log("ARRAY", array)
    let html = "<ul>"

    // Recorro array para que, cada valor, tenga el html "<li>"
    for (let item of array) {
        html = `${html} <li> ${item} </li>`
    }

    return html + "</ul>";
})


// FUNCION: subida de imagen
var multer  = require('multer')
var storage = multer.diskStorage({
	destination:  (req, file, cb) => {
		cb(null, './public/uploads/')
	},
	filename:  (req, file, cb) => {
		console.log("OBJETO FILE", file)
		let fileExtension = file.originalname.split('.')[1] 
		cb(null, file.originalname + '-' + Date.now() + "." + fileExtension)
	},
})

var maxSize = (1024 * 1024) * 5 // 5MB
var maxSizeMB = formatBytes(maxSize,2) 

// FUNCION: tamaño de archivo
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// FUNCION: : Manejar errores de la imagen cargada
var upload = multer({
	storage:storage, 
	limits: {
        fileSize: maxSize 
    },  
	fileFilter: (req, file, cb) => {
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || 	file.mimetype == "image/jpeg") {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Sólo los formatos .png .png, .jpg y .jpeg son los permitidos'));
        
		}
	}
}).single("rutaImagen")


module.exports = {
    upload,
    maxSizeMB,
    multer
}