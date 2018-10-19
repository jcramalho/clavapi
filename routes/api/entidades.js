var Entidades = require('../../controllers/api/entidades.js');

var express = require('express');
var router = express.Router();

router.get('/erro', (req, res) => res.jsonp({cod: "Código do Erro", mensagem: "Mensagem de erro."}))

router.get('/', (req, res) => {
    Entidades.list()
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na listagem das entidades: " + erro}))
})

router.get('/:id', (req, res) => {
    Entidades.consulta(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta da entidade "+req.params.id+": " + erro}))
})

router.get('/:id/tipologias', (req, res) => {
    Entidades.inTipols(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta das tipologias a que "+req.params.id+" pertence: " + erro}))
})

router.get('/:id/intervencao/dono', (req, res) => {
    Entidades.domain(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta dos PNs em que "+req.params.id+" é dono: " + erro}))
})

router.get('/:id/intervencao/participante', (req, res) => {
    Entidades.participations(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na query sobre as participações da entidade "+req.params.id+": " + erro}))
})

module.exports = router;