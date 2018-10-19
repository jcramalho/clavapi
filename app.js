//Basic webserver
var express = require('express'),
    app = express();

//config
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

//routes and API
app.use('/api/entidades',require('./routes/api/entidades'));
app.use('/api/tipologias',require('./routes/api/tipologias'));
app.use('/api/legislacao',require('./routes/api/leg'));
app.use('/api/classes',require('./routes/api/classes'));
//app.use('/api/tabelasSelecao',require('./routes/api/tabsSel'));
//app.use('/api/termosIndice',require('./routes/api/termosIndice'));
//app.use('/api/vocabulario',require('./routes/api/vocabulario'));

//swagger
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app; 
