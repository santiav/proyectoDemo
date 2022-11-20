let mysql      = require('mysql2');

let connection = mysql.createConnection({
	host     : process.env.DB_HOST || 'localhost',
	user     : process.env.DB_USER || 'root',
	password : process.env.DB_PASSWORD || '',
	database : process.env.DB_DATABASE || "proyectoDemo",
});

connection.connect(function(err) {
    if (err) throw err 
    console.log('La DB se ha conectado');
});


module.exports = connection