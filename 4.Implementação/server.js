'use strict';

// ================================================================
// get all the tools we need
// ================================================================
const dotenv = require('dotenv');
const result = dotenv.config()
if (result.error) {
  console.log('RESUL ERROR HERE', result.error);
}

const express = require('express');
const session = require('express-session');
const log4js = require('log4js');
log4js.configure({
  appenders: { logsDoSistema: { type: "file", filename: "logs/logsDoSistema.txt" } },
  categories: {
    default: { appenders: ["logsTrace"], level: "trace" },
  }
});


const routes = require('./routes/index.js');
const routesLog = require('./routes/logs.js');
const routesJogos = require('./routes/jogos');
const routesJogador = require('./routes/jogador');
const routesUsuario = require('./routes/usuario');
const routesAuth = require('./routes/auth.js');

const loggerError = log4js.getLogger('logsDoSistema');
const loggerTrace = log4js.getLogger('logsTrace');

const port = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({ extended: false }))

app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhhH, very secret'
}));

// Session-persisted message middleware

app.use(function (req, res, next) {
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

const restrict = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Acesso negado!';
    res.redirect('/login');
  }
}


// ================================================================
// setup our express application
// ================================================================
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');


// ================================================================
// setup routes
// ================================================================
routesAuth(app, loggerError, loggerTrace);
routesLog(app, restrict, loggerError, loggerTrace);
routesJogos(app, restrict, loggerError, loggerTrace);
routesJogador(app, restrict, loggerError, loggerTrace);
routesUsuario(app, restrict, loggerError, loggerTrace);
routes(app, restrict, loggerError, loggerTrace);

// ================================================================
// start our server
// ================================================================
app.listen(port, function () {
  console.log('Server listening on port ' + port + '...');
});