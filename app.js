const express = require('express');
const app = express();
const res = require('express/lib/response');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const session = require('express-session');
const conection = require('./database/db');
const { resetWatchers } = require('nodemon/lib/monitor/watch');

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

// Rutas

app.get('/login', (req, res) => {
    res.render('login');       
});

app.get('/registrar', (req, res) => {
    res.render('registrar');
});

// Registrar
app.post('/registrar', async (req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.password;
    let passwordHassh = await bcryptjs.hash(pass, 8);
    conection.query('INSERT INTO users SET ?', {user:user, name:name, rol:rol, pass:passwordHassh}, async(error, result) => {
        if(error) {
            console.log(error);
        }else{
            res.render('login', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "Registro Correcto",
                alertIcon: "success",
                showConfirmButton: true,
                timer: 2000,
                ruta: 'login'
            });
        }
    });

}); 

app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.password;
    let passwordHassh = await bcryptjs.hash(pass, 8);
    if (user && pass){
        conection.query('SELECT * FROM users WHERE user = ?', [user], async(error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert: true,
                    alertTitle: "error",
                    alertMessage: "Usuario y/o Contraseña incorrecta",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: 2000,
                    ruta: 'login'
                });
            }else {
                req.session.loggedin = true;
                req.session.name = results[0].name;
                res.render('login', {
                    alert: true,
                    alertTitle: "Bienvenido",
                    alertMessage: "Login Correcto",
                    alertIcon: "success",
                    showConfirmButton: true,
                    timer: 2000,
                    ruta: '/'
                });
            }
        });
    }else {
        res.render('login', {
        alert: true,
        alertTitle: "Advertencia",
        alertMessage: "Por favor ingrese un Usuario y/o Constraseña",
        alertIcon: "warning",
        showConfirmButton: true,
        timer: 2000,
        ruta: 'login'
        });
    }
});

// Roles de Usuario y Ruta principal
app.get('/', (req, res) => {
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.name
        });
    }else {
        res.render('index', {
            login: false,
            name: 'Debes iniciar sesión'
        });
    }
}); 

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(5000, () => {
    console.log("Servidor Corriendo en https://localhost:5000");
});