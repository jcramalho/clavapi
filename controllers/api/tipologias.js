const client = require('../../config/database').onthology;

var Tipologias = module.exports

Tipologias.list = () => {
    return client.query(
        `SELECT * {
            ?id rdf:type clav:TipologiaEntidade ;
                clav:tipEstado "Ativa";
                clav:tipDesignacao ?desig ;
                clav:tipSigla ?sigla .
        }`
    )
        .execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error("Erro na listagem das tipologias(controller): " + error))
}

Tipologias.elems = id => {
    var fetchQuery = `
        SELECT * WHERE {
            ?id clav:pertenceTipologiaEnt clav:${id} .
            
            ?id clav:entEstado "Ativa";
                clav:entSigla ?sigla;
                clav:entDesignacao ?desig.
        }`
    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error("Erro na listagem dos membros da tipologia " + id + ": " + error))
}


Tipologias.consulta = id => {
    return client.query(`
        SELECT * where {
            clav:${id} clav:tipDesignacao ?Designacao ;
                clav:tipSigla ?Sigla ;
                clav:tipEstado ?Estado ;
        }`
    )
        .execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error("Erro na consulta da tipologia " + id + ": "  + error))
}

Tipologias.domain = function (id) {
    var fetchQuery = `
        SELECT * WHERE {
            ?id clav:temDono clav:${id} ;
                clav:codigo ?Code ;
                clav:titulo ?Title ;
                clav:pertenceLC clav:lc1 ;
                clav:classeStatus "A" .
        }
    `;

    return client.query(fetchQuery)
        .execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Dominio de uma tipologia: " + error);
        });
}

Tipologias.participations = function (id) {
    var fetchQuery = `
        select * where { 
            ?id clav:temParticipante clav:${id} ;
                ?Type clav:${id} ;
            
                clav:titulo ?Title ;
                clav:codigo ?Code ;
                clav:pertenceLC clav:lc1 ;
                clav:classeStatus "A" .
            
            filter (?Type!=clav:temParticipante && ?Type!=clav:temDono)
        }`
        ;

    return client.query(fetchQuery)
        .execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Participações de uma tipologia: " + error);
        });
}
