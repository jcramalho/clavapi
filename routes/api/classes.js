var Classes = require('../../controllers/api/classes.js');

var express = require('express');
var router = express.Router();

// Devolve a lista de classes de nível 1: id, codigo, titulo
router.get('/', (req, res) => {
    Classes.listMeta(null)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({id: dados[i].id.value, codigo: dados[i].codigo.value, 
                                titulo: dados[i].titulo.value})
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na listagem das classes de nível 1 (omisso na query): " + erro}))
})

// Devolve a lista de classes de nível n [1..4]: [id, codigo, titulo]
router.get('/nivel/:n', (req, res) => {
    Classes.listMeta(req.params.n)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({id: dados[i].id.value, codigo: dados[i].codigo.value, 
                                titulo: dados[i].titulo.value})
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na listagem das classes de nível "+req.params.n+": " + erro}))
})

// Devolve a metainformação de uma classe: codigo, titulo, status, desc, codigoPai?, tituloPai?, procTrans?, procTipo?
router.get('/:id', function (req, res) {
    Classes.consulta(req.params.id)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({codigo: dados[i].codigo.value, titulo: dados[i].titulo.value, 
                                status: dados[i].status.value, desc: dados[i].desc.value})
                if(dados[i].codigoPai) resultado[0]['codigoPai'] = dados[i].codigoPai.value
                if(dados[i].tituloPai) resultado[0]['tituloPai'] = dados[i].tituloPai.value
                if(dados[i].procTrans) resultado[0]['procTrans'] = dados[i].procTrans.value
                if(dados[i].procTipo) resultado[0]['procTipo'] = dados[i].procTipo.value
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na consulta da classe "+req.params.id+": " + erro}))
})

// Devolve a lista de filhos de uma classe: id, codigo, titulo, nFilhos
router.get('/:id/descendencia', function (req, res) {
    Classes.descendencia(req.params.id)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({id: dados[i].id.value, codigo: dados[i].codigo.value, 
                                titulo: dados[i].titulo.value, nFilhos: dados[i].nFilhos.value})
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na consulta da descendência da classe "+req.params.id+": " + erro}))
})

// Devolve a lista de notas de aplicação de uma classe: idNota, nota
router.get('/:id/notasAp', (req, res) => {
    Classes.notasAp(req.params.id)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({idNota: dados[i].idNota.value, nota: dados[i].nota.value})
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na consulta das notas de aplicação da classe "+req.params.id+": " + erro}))
})

// Devolve a lista de exemplos das notas de aplicação de uma classe: [exemplo]
router.get('/:id/exemplosNotasAp', (req, res) => {
    Classes.exemplosNotasAp(req.params.id)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push(dados[i].exemplo.value)
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na consulta dos exemplos das notas de aplicação da classe "+req.params.id+": " + erro}))
})

// Devolve a lista de notas de exclusão de uma classe: idNota, nota
router.get('/:id/notasEx', (req, res) => {
    Classes.notasEx(req.params.id)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({idNota: dados[i].idNota.value, nota: dados[i].nota.value})
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na consulta das notas de exclusão da classe "+req.params.id+": " + erro}))
})

// Devolve os termos de índice de uma classe: idTI, termo
router.get('/:id/ti', (req, res) => {
    Classes.ti(req.params.id)
        .then(dados => {
            var resultado = []
            for(var i=0; i < dados.length; i++){
                resultado.push({idTI: dados[i].idTI.value, termo: dados[i].termo.value})
            }
            res.jsonp(resultado)
        })
        .catch(erro => res.jsonp({cod: "404", mensagem: "Erro na consulta dos termos de índice da classe "+req.params.id+": " + erro}))
})




router.get('/filtrar/comuns', function (req, res) {
    Classes.filterCommon()
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/filtrar/restantes/(:tipols)?', function (req, res) {
    if(req.params.tipols){
        var orgs = req.params.tipols.split(',');
    }

    Classes.filterRest(orgs)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/filtrar/:orgs', function (req, res) {
    Classes.filterByOrgs(req.params.orgs.split(','))
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/descendenciaIndex', function (req, res) {
    Classes.childrenNew(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/donos', function (req, res) {
    Classes.owners(req.params.id)
        .then(owners => res.send(owners))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/legislacao', function (req, res) {
    Classes.legislation(req.params.id)
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/relacionados', function (req, res) {
    Classes.related(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/participantes', function (req, res) {
    Classes.participants(req.params.id)
        .then(list => res.send(list))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/pca', function (req, res) {
    Classes.pca(req.params.id)
        .then(function (data) {
            let criteria = data.Criterios.value.split("###");
            criteria = criteria.map(a => a.replace(/[^#]+#(.*)/, '$1'));

            Classes.criteria(criteria)
                .then(function (criteriaData) {

                    data.Criterios.type = "array";
                    data.Criterios.value = criteriaData;

                    res.send(data);
                })
                .catch(error=>console.error(error));
        })
        .catch(error=>console.error(error));
})

router.get('/:id/df', function (req, res) {
    Classes.df(req.params.id)
        .then(function (data) {
            let criteria = data.Criterios.value.split("###");
            criteria = criteria.map(a => a.replace(/[^#]+#(.*)/, '$1'));

            Classes.criteria(criteria)
                .then(function (criteriaData) {
                    data.Criterios.type = "array";
                    data.Criterios.value = criteriaData;

                    res.send(data);
                })
                .catch(error=>console.error(error));
        })
        .catch(error=>console.error(error));
})

router.get('/:code/check/:level', function (req, res) {
    Classes.checkCodeAvailability(req.params.code, req.params.level)
        .then(function (count) {
            res.send(count);
        })
        .catch(error=>console.error(error));
})

module.exports = router;
