var express = require('express');
var router = express.Router();

var Auth = require('../../controllers/auth.js');
var Trabalhos = require('../../controllers/api/trabalhos_guardados.js');
var Trabalho = require('../../models/trabalho');

// Novo pedido
router.post('/', Auth.isLoggedInAPI, function (req, res) {
    Trabalhos.add(req.body, req, res);
});

// Trabalho guardado por utilizador
router.get('/utilizador', Auth.isLoggedInAPI, function (req, res) {

    let user = req.user.email;

    Trabalho.getTrabalhosByEmail(user, function(err, request){
        if (err) {
            console.log(err);
            res.send("Ocorreu um erro!");    
        }
        else{
            res.send(request);
        }
    });
});

module.exports = router;