var Tipologias = require('../../controllers/api/tipologias.js');

var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    Tipologias.list()
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na listagem das tipologias: " + erro}))
})

router.get('/:id', (req, res) => {
    Tipologias.consulta(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta da tipologia "+req.params.id+": " + erro}))
})

router.get('/:id/elementos', (req, res) => {
    Tipologias.elems(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta dos elementos da tipologia "+req.params.id+": " + erro}))
})

router.get('/:id/intervencao/dono', (req, res) => {
    Tipologias.domain(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta dos processos em que a tipologia "+req.params.id+" é dono: " + erro}))
})

router.get('/:id/intervencao/participante', (req, res) => {
    Tipologias.participations(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({cod: "408", mensagem: "Erro na consulta dos processos em que a tipologia "+req.params.id+" é participante: " + erro}))
})

module.exports = router