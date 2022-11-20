const express = require('express')
const session = require('express-session')
require('dotenv').config()
let MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const app = express()
require('./helpers/helper');

let puerto = process.env.PORT || 3000

let opciones = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
}

let almacenamientoSesiones = new MySQLStore(opciones)


app.use(session({
    key: 'proyectoDemo',
    secret: process.env.SESSION_SECRET,
    store: almacenamientoSesiones,
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge: 300000} // 5 minutos

}))


// Middlewares
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(express.static('public'));



// plantilla HBS
const hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', [
  path.join('./views/front'), // adjuntar carpeta a "views"
  path.join('./views/back'),
  path.join('./views')
])
hbs.registerPartials(__dirname + '/views/partials');


// rutas
app.use('/', require('./routes/rutas'))

// 404
app.use(function(req, res, next) {
  res.status(404).render('404');
});


app.listen(puerto, function() {
    console.log(`Servidor ONLINE en puerto ${puerto}`)
})