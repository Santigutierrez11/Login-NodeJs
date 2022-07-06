const mysql = require('mysql');
const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'loginnode'
});

conection.connect((error) => {
    if (error){
        console.log("El error eres Tú, error: " + error);
        return;
    }
    console.log("Estas conectado a la base de datos");
});
module.exports = conection;