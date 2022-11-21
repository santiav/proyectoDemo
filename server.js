const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
require('dotenv').config()
let MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const app = express()
const hbs = require('hbs');
require('./helpers/helper');

let puerto = process.env.PORT || 3000

let opciones = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
}

let almacenamientoSesiones = new MySQLStore(opciones)





// plantilla HBS

app.set('view engine', 'hbs');
app.set('views', [
  path.join(__dirname + '/views/front'), // adjuntar carpeta a "views"
  path.join('./views/back'),
  path.join('./views')
])
hbs.registerPartials(__dirname + '/views/partials');



// Middlewares
app.use(session({
  key: 'proyectoDemo',
  secret: process.env.SESSION_SECRET,
  store: almacenamientoSesiones,
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 300000} // 5 minutos

}))
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// rutas
app.use('/', require('./routes/rutas'))

app.use('/', express.static(__dirname + '/public'))



// 404
app.use(function(req, res, next) {
  res.status(404).render('404');
});

// Errores 
app.use(function(err, req, res, next) {
  console.error("ERR.STACK", err.stack);
  res.status(500).send('Hubo un error con el servidor ' + err);
});


app.listen(puerto, function() {
    console.log(`Servidor ONLINE en puerto ${puerto}`)
})