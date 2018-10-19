var Leg = require('../../controllers/api/leg.js');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    Leg.list()
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/numElems', function (req, res) {
    Leg.ultNum()
        .then(n => {
            res.send(n)
        })
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id', function (req, res) {
    Leg.stats(req.params.id).then(leg => res.send(leg))
        .catch(function (error) {
            console.error(error);
        });
})

router.get('/:id/regula', function (req, res) {
    Leg.regulates(req.params.id)
        .then(legs => res.send(legs))
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;