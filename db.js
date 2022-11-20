let mysql      = require('mysql');
console.log(process.env.DB_HOST)
let connection = mysql.createConnection({
	host     : process.env.DB_HOST,
	user     : process.env.DB_USER,
	password : process.env.DB_PASSWORD,
	database : process.env.DB_DATABASE,
});

connection.connect(function(err) {
    if (err) throw err 
    console.log('La DB se ha conectado');
});


module.exports = connection