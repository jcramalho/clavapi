var express = require('express');
var router = express.Router();

var Logging = require('../../controllers/logging');
var Auth = require('../../controllers/auth.js');
var Pedidos = require('../../controllers/pedidos.js');
var Pedido = require('../../models/pedido');

// Novo pedido
router.post('/', Auth.isLoggedInAPI, function (req, res) {
    Pedidos.add(req.body, req, res);
});

// Pedidos por estado
router.get('/estado/:estado', Auth.isLoggedInAPI, function (req, res) {
    Pedido.getPedidosByState(req.params.estado, function(err, request){
        if (err) {
            console.log(err);
            res.send("Ocorreu um erro!");    
        }
        else{
            res.send(request);
        }
    });
});

// Dados de um pedido
router.get('/numero/:num', Auth.isLoggedInAPI, function (req, res) {
    Pedido.getPedidoByNumber(req.params.num, function(err, request){
        if (err) {
            console.log(err);
            res.send("Ocorreu um erro!");    
        }
        else if (!request){
            res.send("Não existe um pedido com esse número!");   
        }
        else{
            var dataObj = {
                num: request.numero,
                tipo: request.tipo,
                desc: request.descricao,
                data: request.data,
                obj: request.objetoID
            }

            res.send(dataObj);
        }
    });
});

// Pedidos por utilizador
router.get('/utilizador', Auth.isLoggedInAPI, function (req, res) {

    let user = req.user.email;

    Pedido.getPedidosByUser(user, function(err, request){
        if (err) {
            console.log(err);
            res.send("Ocorreu um erro!");    
        }
        else{
            let dataObj = request.map(
                function(a){
                    return {
                        num: a.numero,
                        tipo: a.tipo,
                        desc: a.descricao,
                        data: a.data,
                        obj: a.objetoID
                    }
                }
            )
            res.send(dataObj);
        }
    });
});


module.exports = router;