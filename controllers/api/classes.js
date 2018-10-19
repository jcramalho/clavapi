const client = require('../../config/database').onthology;

var Classes = module.exports

Classes.listMeta = level => {
    if (!level) { level = 1 }

    var listQuery = `
        Select
            ?id 
            ?codigo 
            ?titulo 
        Where {
            ?id rdf:type clav:Classe_N${level} ;
                    clav:classeStatus 'A';
                    clav:codigo ?codigo ;
                    clav:titulo ?titulo .
        } 
        Order by ?id 
    `;

    return client.query(listQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error(error))
}

// Devolve a metainformação de uma classe: codigo, titulo, status, desc, codigoPai?, tituloPai?, procTipo?
Classes.consulta = id => {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:titulo ?titulo;
                    clav:codigo ?codigo;
                    clav:classeStatus ?status;
                    clav:descricao ?desc.

                OPTIONAL {
                    clav:${id} clav:temPai ?pai.
                    ?pai clav:codigo ?codigoPai;
                        clav:titulo ?tituloPai.
                } 
                
                OPTIONAL {
                    clav:${id} clav:processoTransversal ?procTrans;
                        clav:processoTipoVC ?pt.
                    ?pt skos:prefLabel ?procTipo.
                }
            }`;

    return client.query(fetchQuery)
        .execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error(error))
}

// Devolve a lista de filhos de uma classe: id, codigo, titulo, nFilhos
Classes.descendencia = id => {
    var fetchQuery = `
        SELECT ?id ?codigo ?titulo (count(?sub) as ?nFilhos)
        WHERE {
            ?id clav:temPai clav:${id} ;
                    clav:codigo ?codigo ;
                    clav:titulo ?titulo .
            optional {
                ?sub clav:temPai ?id .
            }
        }Group by ?id ?codigo ?titulo
    `;

    return client.query(fetchQuery)
        .execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error(error))
}

// Devolve a lista de notas de aplicação de uma classe: idNota, nota
Classes.notasAp = id => {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:temNotaAplicacao ?idNota.
                ?idNota clav:conteudo ?nota .
            }`;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch( error => console.error(error))
}

// Devolve a lista de exemplos de notas de aplicação de uma classe: [exemplo]
Classes.exemplosNotasAp = id => {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:exemploNA ?exemplo.
            }`;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

// Devolve a lista de notas de exclusão de uma classe: idNota, nota
Classes.notasEx = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:temNotaExclusao ?idNota.
                ?idNota clav:conteudo ?nota .
            }`;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error(error))
}

// Devolve os termos de índice de uma classe: idTI, termo
Classes.ti = id => {
    var fetchQuery = `
    SELECT * WHERE { 
        ?idTI a clav:TermoIndice;
              clav:estaAssocClasse clav:c100.10.001 ;
              clav:termo ?termo
                }`;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(error => console.error(error))
}







Classes.list = function (level) {
    if (!level) { level = 1 }

    var listQuery = `
        Select
            ?id 
            ?Codigo 
            ?Titulo 
            (GROUP_CONCAT(?tp; SEPARATOR="###") AS ?TermosPesquisa)
            (COUNT(?desc) AS ?Descendencia)
        Where {
            ?id rdf:type clav:Classe_N${level} ;
                    clav:classeStatus 'A';
                    clav:codigo ?Codigo ;
                    clav:titulo ?Titulo .
            
            Optional {
                {
                    ?ti clav:estaAssocClasse ?id ;
                        clav:termo ?tp .
                } UNION {
                    ?id clav:exemploNA ?tp .
                } UNION {
                    ?id clav:temNotaAplicacao ?na.
                    ?na clav:conteudo ?tp .
                }   
            }
            
            OPTIONAL {
                ?desc clav:temPai ?id .
            }
        } Group by ?id ?Codigo ?Titulo
        Order by ?id 
    `;

    return client.query(listQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.completeData = function (classes) {
    var fetchQuery = `
        SELECT 
            ?id 
            ?Titulo 
            ?Codigo 
            ?Pai 
            ?CodigoPai 
            ?TituloPai 
            ?Status 
            ?Descricao 
            ?ProcTipo 
            ?ProcTrans 
            ?PCAcontagem
            ?PCAsubcontagem
            ?PCAvalor
            ?DFvalor
            (group_concat(distinct ?Exemplo;separator="%%") as ?Exemplos) 
            (group_concat(distinct ?Dono;separator="%%") as ?Donos) 
            (group_concat(distinct Concat(STR(?NotaA),"::",?NotaACont);separator="%%") as ?NotasA) 
            (group_concat(distinct Concat(STR(?NotaE),"::",?NotaECont);separator="%%") as ?NotasE)
            (group_concat(distinct ?Participante1;separator="%%") as ?Parts1) 
            (group_concat(distinct ?Participante2;separator="%%") as ?Parts2) 
            (group_concat(distinct ?Participante3;separator="%%") as ?Parts3) 
            (group_concat(distinct ?Participante4;separator="%%") as ?Parts4) 
            (group_concat(distinct ?Participante5;separator="%%") as ?Parts5) 
            (group_concat(distinct ?Participante6;separator="%%") as ?Parts6) 
            (group_concat(distinct ?Leg;separator="%%") as ?Diplomas) 
            (group_concat(distinct ?Rel1;separator="%%") as ?Rels1) 
            (group_concat(distinct ?Rel2;separator="%%") as ?Rels2) 
            (group_concat(distinct ?Rel3;separator="%%") as ?Rels3) 
            (group_concat(distinct ?Rel4;separator="%%") as ?Rels4) 
            (group_concat(distinct ?Rel5;separator="%%") as ?Rels5) 
            (group_concat(distinct ?Rel6;separator="%%") as ?Rels6) 
            (group_concat(distinct ?Rel7;separator="%%") as ?Rels7) 
            (CONCAT(group_concat(distinct ?CritPCA;separator="%%"),"%%",group_concat(distinct ?CritDF;separator="%%")) as ?Crits)
        FROM noInferences: WHERE {
            VALUES ?id { ${'clav:' + classes.join(' clav:')} }
            ?id clav:titulo ?Titulo;
                clav:codigo ?Codigo;
                clav:classeStatus ?Status;
                clav:descricao ?Descricao.

            OPTIONAL {
                ?id clav:temPai ?Pai.
                ?Pai clav:codigo ?CodigoPai;
                    clav:titulo ?TituloPai.
            } 
            OPTIONAL {
                ?id clav:processoTipoVC ?ProcTipo.
            } 
            OPTIONAL {
                ?id clav:processoTransversal ?ProcTrans.
            } 
            OPTIONAL {
                ?id clav:exemploNA ?Exemplo.
            }
            OPTIONAL {
                ?id clav:temDono ?Dono.
            }
            OPTIONAL {
                ?id clav:temNotaAplicacao ?NotaA.
        		?NotaA clav:conteudo ?NotaACont.
            }
            OPTIONAL {
                ?id clav:temNotaExclusao ?NotaE.
        		?NotaE clav:conteudo ?NotaECont.
            }
            OPTIONAL {
                ?id clav:temParticipanteApreciador ?Participante1.
            }
            OPTIONAL {
                ?id clav:temParticipanteAssessor ?Participante2.
            }
            OPTIONAL {
                ?id clav:temParticipanteComunicador ?Participante3.
            }
            OPTIONAL {
                ?id clav:temParticipanteDecisor ?Participante4.
            }
            OPTIONAL {
                ?id clav:temParticipanteExecutor ?Participante5.
            }
            OPTIONAL {
                ?id clav:temParticipanteIniciador ?Participante6.
            }
            OPTIONAL {
                ?id clav:temLegislacao ?Leg.
            }
            OPTIONAL {
                ?id clav:eSintetizadoPor ?Rel1.
            }
            OPTIONAL {
                ?id clav:eSinteseDe ?Rel2.
            }
            OPTIONAL {
                ?id clav:eComplementarDe ?Rel3.
            }
            OPTIONAL {
                ?id clav:eCruzadoCom ?Rel4.
            }
            OPTIONAL {
                ?id clav:eSuplementoPara ?Rel5.
            }
            OPTIONAL {
                ?id clav:eSucessorDe ?Rel6.
            }
            OPTIONAL {
                ?id clav:eAntecessorDe ?Rel7.
            }
            OPTIONAL {
                ?id clav:temPCA ?pca ;
                    clav:temDF	?df .
                
                ?pca clav:pcaFormaContagemNormalizada ?PCAcontagem ;
                     clav:pcaValor ?PCAvalor.
                optional {
                    ?pca clav:pcaSubformaContagem ?PCAsubcontagem .
                }
                
                ?df clav:dfValor ?DFvalor .
                
                ?pca clav:temJustificacao ?justPCA .
                ?df clav:temJustificacao ?justDF .
                
                ?justPCA clav:temCriterio ?CritPCA .
                ?justDF clav:temCriterio ?CritDF .
            }
        } GROUP BY ?id ?Titulo ?Codigo ?Pai ?CodigoPai ?TituloPai ?Status ?Descricao ?ProcTipo ?ProcTrans ?PCAcontagem ?PCAsubcontagem ?PCAvalor ?DFvalor
    `;

    console.log(fetchQuery);

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.childrenNew = function (id) {
    var fetchQuery = `
        SELECT
            ?id 
            ?Codigo 
            ?Titulo 
            (GROUP_CONCAT (DISTINCT ?tp; SEPARATOR="###") AS ?TermosPesquisa)
            (COUNT (?desc) as ?Descendencia)
        WHERE {
            ?id clav:temPai clav:${id} ;
                clav:classeStatus 'A';
                clav:codigo ?Codigo ;
                clav:titulo ?Titulo .
            
            Optional {
                {
                    ?ti clav:estaAssocClasse ?id ;
                        clav:termo ?tp .
                } UNION {
                    ?id clav:exemploNA ?tp .
                } UNION {
                    ?id clav:temNotaAplicacao ?na.
                    ?na clav:conteudo ?tp .
                }   
            }
            
            OPTIONAL {
                ?desc clav:temPai ?id .
            }
        } Group by ?id ?Codigo ?Titulo
        Order by ?id 
    `;

    return client.query(fetchQuery)
        .execute()
        //getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.owners = function (id) {
    var fetchQuery = `
                SELECT * WHERE { 
                    clav:${id} clav:temDono ?id.
                    {
                        ?id clav:entDesignacao ?Designacao;
                            clav:entSigla ?Sigla.
                    } UNION {
                        ?id clav:tipDesignacao ?Designacao;
                            clav:tipSigla ?Sigla .
                    }
                }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.legislation = function (id) {
    var fetchQuery = `
            SELECT * WHERE { 
                clav:${id} clav:temLegislacao ?id.
                ?id clav:diplomaNumero ?Número;
                    clav:diplomaTitulo ?Titulo;
                    clav:diplomaTipo ?Tipo;
            }`;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.related = function (id) {
    var fetchQuery = `
            select DISTINCT ?id ?Type ?Code ?Title {
                clav:${id} clav:temRelProc ?id;
                    ?Type ?id.
                
                ?id clav:codigo ?Code;
                    clav:titulo ?Title;
                    clav:classeStatus 'A'.
                
                filter (?Type!=clav:temRelProc)
            } Order by ?Type
        `;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.participants = function (id) {
    var fetchQuery = `
            select * where { 
                clav:${id} clav:temParticipante ?id ;
                    ?Type ?id .
                
                {
                    ?id clav:entDesignacao ?Designacao;
                        clav:entSigla ?Sigla .
                } UNION {
                    ?id clav:tipDesignacao ?Designacao;
                        clav:tipSigla ?Sigla .
                }
                
                filter (?Type!=clav:temParticipante && ?Type!=clav:temDono)
            }
        `;


    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error(error);
        });
}

Classes.checkCodeAvailability = function (code, level) {
    var checkQuery = `
            SELECT (count(*) AS ?Count) WHERE {
                ?c rdf:type clav:Classe_N${level} ;
                    clav:codigo '${code}' ;
                    clav:pertenceLC clav:lc1
            }
        `;

    return client.query(checkQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings[0].Count.value))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.pca = function (id) {
    var fetchQuery = `
        SELECT 
            ?SubContID
            ?SubContagem
            ?ContNormID
            ?ContagemNorm
            (GROUP_CONCAT(DISTINCT ?Nota; SEPARATOR="###") AS ?Notas)
            (GROUP_CONCAT(DISTINCT ?Valor; SEPARATOR="###") AS ?Valores)
            (GROUP_CONCAT(DISTINCT ?Criterio; SEPARATOR="###") AS ?Criterios)
        WHERE { 
            clav:${id} clav:temPCA ?pca .
            optional {
                ?pca clav:pcaSubformaContagem ?SubContID .
                ?SubContID skos:scopeNote ?SubContagem .
            }
            optional {
                ?pca clav:pcaFormaContagemNormalizada ?ContNormID .    
                ?ContNormID skos:prefLabel ?ContagemNorm .
            }
            OPTIONAL {
                ?pca clav:pcaNota ?Nota ;
            }
            OPTIONAL {
                ?pca clav:pcaValor ?Valor ;
            }
            OPTIONAL {
                ?pca clav:temJustificacao ?just .
                ?just clav:temCriterio ?Criterio
            }    
        }GROUP BY ?SubContagem ?ContagemNorm ?SubContID ?ContNormID
    `;

    return client.query(fetchQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings[0]))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.df = function (id) {
    var fetchQuery = `
        SELECT 
            ?Nota
            (GROUP_CONCAT(DISTINCT ?Valor; SEPARATOR="###") AS ?Valores)
            (GROUP_CONCAT(DISTINCT ?Criterio; SEPARATOR="###") AS ?Criterios)
        WHERE { 
            clav:${id} clav:temDF ?df .
            OPTIONAL {
                ?df clav:dfValor ?Valor ;
            }
            OPTIONAL {
                ?df clav:dfNota ?Nota ;
            }
            OPTIONAL {
                ?df clav:temJustificacao ?just .
                ?just clav:temCriterio ?Criterio
            }    
        }GROUP BY ?df ?Nota
    `;

    return client.query(fetchQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings[0]))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.criteria = function (criteria) {
    var fetchQuery = `
        SELECT
            ?id
            ?Tipo
            ?Conteudo
            (GROUP_CONCAT(CONCAT(STR(?leg),":::",?LegTipo, ":::",?LegNumero); SEPARATOR="###") AS ?Legislacao)
            (GROUP_CONCAT(CONCAT(STR(?proc),":::",?Codigo, ":::",?Titulo); SEPARATOR="###") AS ?Processos)
        WHERE { 
            VALUES ?id { ${'clav:' + criteria.join(' clav:')} }
            ?id rdf:type ?Tipo ;
                clav:conteudo ?Conteudo .

            OPTIONAL {
                ?id clav:temLegislacao ?leg .
                ?leg clav:diplomaNumero ?LegNumero ;
                    clav:diplomaTipo ?LegTipo .
            }

            OPTIONAL {
                {
                	?id clav:temProcessoRelacionado ?proc .
        		} UNION {
            		?id clav:eComplementarDe ?proc .
        		}
                ?proc clav:codigo ?Codigo ;
                      clav:titulo ?Titulo .
            }
            FILTER(?Tipo != owl:NamedIndividual && ?Tipo != clav:CriterioJustificacao && ?Tipo != clav:AtributoComposto)
        } GROUP BY ?id ?Tipo ?Conteudo
    `;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.criteriaMin = function (criteria) {
    var fetchQuery = `
        SELECT
            ?id
            ?Tipo
            ?Conteudo
            (GROUP_CONCAT(?leg; SEPARATOR="###") AS ?Legislacao)
            (GROUP_CONCAT(?proc; SEPARATOR="###") AS ?Processos)
        WHERE { 
            VALUES ?id { ${'clav:' + criteria.join(' clav:')} }
            ?id rdf:type ?Tipo ;
                clav:conteudo ?Conteudo .

            OPTIONAL {
                ?id clav:temLegislacao ?leg .
            }

            OPTIONAL {
                {
                	?id clav:temProcessoRelacionado ?proc .
        		} UNION {
            		?id clav:eComplementarDe ?proc .
        		}
            }
            FILTER(?Tipo != owl:NamedIndividual && ?Tipo != clav:CriterioJustificacao && ?Tipo != clav:AtributoComposto)
        } GROUP BY ?id ?Tipo ?Conteudo
    `;

    return client.query(fetchQuery).execute()
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.filterByOrgs = function (orgs) {
    var fetchQuery = `
        SELECT DISTINCT
            ?Avo ?AvoCodigo ?AvoTitulo 
            ?Pai ?PaiCodigo ?PaiTitulo 
            ?PN ?PNCodigo ?PNTitulo   
            (GROUP_CONCAT(CONCAT(STR(?Filho),":::",?FilhoCodigo, ":::",?FilhoTitulo); SEPARATOR="###") AS ?Filhos)
        WHERE {  
            {
                SELECT ?PN where {
                    VALUES ?org { clav:${orgs.join(' clav:')} }
                    ?org clav:eDonoProcesso ?PN .
                }
            } UNION {
                SELECT ?PN where {
                    VALUES ?org { clav:${orgs.join(' clav:')} }
                    ?org clav:participaEm ?PN .
                }
            } MINUS { 
                ?PN clav:pertenceLC ?lc
                filter( ?lc != clav:lc1 )
            }
            ?PN clav:classeStatus 'A'.
            
            ?PN clav:temPai ?Pai.
            ?Pai clav:temPai ?Avo.
            
            ?PN clav:codigo ?PNCodigo;
                clav:titulo ?PNTitulo.
            
            ?Pai clav:codigo ?PaiCodigo;
                clav:titulo ?PaiTitulo.
            
            ?Avo clav:codigo ?AvoCodigo;
                clav:titulo ?AvoTitulo.
            
            OPTIONAL {
                ?Filho clav:temPai ?PN;
                   clav:codigo ?FilhoCodigo;
                   clav:titulo ?FilhoTitulo
            }
        }
        Group By ?PN ?PNCodigo ?PNTitulo ?Pai ?PaiCodigo ?PaiTitulo ?Avo ?AvoCodigo ?AvoTitulo 
        Order By ?PN
    `;

    return client.query(fetchQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.filterNone = function () {
    var fetchQuery = `
        SELECT DISTINCT
            ?Avo ?AvoCodigo ?AvoTitulo 
            ?Pai ?PaiCodigo ?PaiTitulo 
            ?PN ?PNCodigo ?PNTitulo   
            (GROUP_CONCAT(DISTINCT(CONCAT(STR(?Filho),":::",?FilhoCodigo, ":::",?FilhoTitulo)); SEPARATOR="###") AS ?Filhos)
			(GROUP_CONCAT(CONCAT(STR(?FilhoCodigo),":::",?FilhoTi);Separator="###") AS ?TIsFilhos)
            (GROUP_CONCAT(?TermoI; SEPARATOR="###") AS ?TermosPesquisa)
        WHERE {  
            
            ?PN rdf:type clav:Classe_N3

            MINUS { 
                ?PN clav:pertenceLC ?lc
                filter( ?lc != clav:lc1 )
            }
            ?PN clav:classeStatus 'A'.
            
            ?PN clav:temPai ?Pai.
            ?Pai clav:temPai ?Avo.
            
            ?PN clav:codigo ?PNCodigo;
                clav:titulo ?PNTitulo.
            
            ?Pai clav:codigo ?PaiCodigo;
                clav:titulo ?PaiTitulo.
            
            ?Avo clav:codigo ?AvoCodigo;
                clav:titulo ?AvoTitulo.
            
            OPTIONAL {
                ?Filho clav:temPai ?PN;
                   clav:codigo ?FilhoCodigo;
                   clav:titulo ?FilhoTitulo

                OPTIONAL {
                    ?fTI clav:estaAssocClasse ?Filho;
                         clav:termo ?FilhoTi
                }
            }
            OPTIONAL {
                {
                    ?ti clav:estaAssocClasse ?PN ;
                        clav:termo ?TermoI .
                } UNION {
                    ?PN clav:exemploNA ?TermoI .
                } UNION {
                    ?PN clav:temNotaAplicacao ?pNA.
                    ?pNA clav:conteudo ?TermoI .
                }
            }
        }
        Group By ?PN ?PNCodigo ?PNTitulo ?Pai ?PaiCodigo ?PaiTitulo ?Avo ?AvoCodigo ?AvoTitulo 
        Order By ?PN
    `;

    return client.query(fetchQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.filterCommon = function () {
    var fetchQuery = `
        SELECT DISTINCT
            ?Avo ?AvoCodigo ?AvoTitulo 
            ?Pai ?PaiCodigo ?PaiTitulo 
            ?PN ?PNCodigo ?PNTitulo   
            (GROUP_CONCAT(CONCAT(STR(?Filho),":::",?FilhoCodigo, ":::",?FilhoTitulo); SEPARATOR="###") AS ?Filhos)
        WHERE {  
            ?PN rdf:type clav:Classe_N3 .
            ?PN clav:classeStatus 'A'.

            ?PN clav:processoTipoVC clav:vc_processoTipo_pc .
            
            ?PN clav:temPai ?Pai.
            ?Pai clav:temPai ?Avo.
            
            ?PN clav:codigo ?PNCodigo;
                clav:titulo ?PNTitulo.
            
            ?Pai clav:codigo ?PaiCodigo;
                clav:titulo ?PaiTitulo.
            
            ?Avo clav:codigo ?AvoCodigo;
                clav:titulo ?AvoTitulo.
            
            OPTIONAL {
                ?Filho clav:temPai ?PN;
                   clav:codigo ?FilhoCodigo;
                   clav:titulo ?FilhoTitulo
            }

            MINUS { 
                ?PN clav:pertenceLC ?lc
                filter( ?lc != clav:lc1 )
            }
        }
        Group By ?PN ?PNCodigo ?PNTitulo ?Pai ?PaiCodigo ?PaiTitulo ?Avo ?AvoCodigo ?AvoTitulo 
        Order By ?PN
    `;

    return client.query(fetchQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.filterRest = function (orgs) {
    var fetchQuery = `
        SELECT DISTINCT 
            ?Avo ?AvoCodigo ?AvoTitulo 
            ?Pai ?PaiCodigo ?PaiTitulo 
            ?PN ?PNCodigo ?PNTitulo
            (GROUP_CONCAT(CONCAT(STR(?Filho),":::",?FilhoCodigo, ":::",?FilhoTitulo); SEPARATOR="###") AS ?Filhos)
        WHERE { 
            ?PN rdf:type clav:Classe_N3 .
            ?PN clav:classeStatus 'A'.

            ?PN clav:processoTipoVC clav:vc_processoTipo_pe .
            
            MINUS { 
                ?PN clav:pertenceLC ?lc
                filter( ?lc != clav:lc1 )
            }
    `;
    if (orgs) {
        fetchQuery += `
                MINUS {
                    {
                        SELECT ?PN where {
                            VALUES ?org { clav:${orgs.join(' clav:')} }
                            ?org clav:eDonoProcesso ?PN .
                        }
                    } UNION {
                        SELECT ?PN where {
                            VALUES ?org { clav:${orgs.join(' clav:')} }
                            ?org clav:participaEm ?PN .
                        }
                    }
                }
        `;
    }
    fetchQuery += `
            ?PN clav:temPai ?Pai.
            ?Pai clav:temPai ?Avo.
            
            ?PN clav:codigo ?PNCodigo;
                clav:titulo ?PNTitulo.
            
            ?Pai clav:codigo ?PaiCodigo;
                clav:titulo ?PaiTitulo.
            
            ?Avo clav:codigo ?AvoCodigo;
                clav:titulo ?AvoTitulo.
            
            OPTIONAL {
                ?Filho clav:temPai ?PN;
                    clav:codigo ?FilhoCodigo;
                    clav:titulo ?FilhoTitulo
            }
        }
        GROUP BY ?PN ?PNCodigo ?PNTitulo ?Pai ?PaiCodigo ?PaiTitulo ?Avo ?AvoCodigo ?AvoTitulo 
        ORDER BY ?PN
    `;

    return client.query(fetchQuery).execute()
        //Getting the content we want
        .then(response => Promise.resolve(response.results.bindings))
        .catch(function (error) {
            console.error("Error in check:\n" + error);
        });
}

Classes.createClass = function (data) {
    var id = "c" + data.Code;
    var level = "Classe_N" + data.Level;

    var createQuery = `
            INSERT DATA {
                clav:${id} rdf:type owl:NamedIndividual ,
                        clav:${level} ;
                    clav:codigo "${data.Code}" ;
                    clav:classeStatus "H" ;
                    clav:descricao "${data.Description.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" ;
                    clav:pertenceLC clav:lc1 ;
                    clav:titulo "${data.Title}" .                   
        `;

    if (data.Level > 1) {
        createQuery += 'clav:' + id + ' clav:temPai clav:' + data.Parent + ' .\n';
    }

    if (data.AppNotes && data.AppNotes.length) {
        for (var i = 0; i < data.AppNotes.length; i++) {
            createQuery += `
                    clav:${data.AppNotes[i].id} rdf:type owl:NamedIndividual ,
                            clav:NotaAplicacao ;
                        clav:conteudo "${data.AppNotes[i].Note.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" .
                `;
            createQuery += 'clav:' + id + ' clav:temNotaAplicacao clav:' + data.AppNotes[i].id + ' .\n';
        }
    }

    if (data.ExAppNotes && data.ExAppNotes.length) {
        for (var i = 0; i < data.ExAppNotes.length; i++) {
            createQuery += 'clav:' + id + ' clav:exemploNA "' + data.ExAppNotes[i].replace(/\n/g, '\\n').replace(/\"/g, "\\\"") + '" .\n';
        }
    }

    if (data.DelNotes && data.DelNotes.length) {
        for (var i = 0; i < data.DelNotes.length; i++) {
            createQuery += `
                    clav:${data.DelNotes[i].id} rdf:type owl:NamedIndividual ,
                            clav:NotaExclusao ;
                        clav:conteudo "${data.DelNotes[i].Note.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" .
                `;
            createQuery += 'clav:' + id + ' clav:temNotaExclusao clav:' + data.DelNotes[i].id + ' .\n';
        }
    }

    if (data.Level >= 3 && data.Indexes && data.Indexes.length) {
        for (let [i, index] of data.Indexes.entries()) {
            createQuery += `
                clav:ti_${id}_${i + 1} rdf:type owl:NamedIndividual ,
                        clav:TermoIndice ;
                    clav:termo "${index.Note.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" ;
                    clav:estaAssocClasse clav:${id} .
            `;
        }
    }

    if (data.Level >= 3 && data.Type) {
        createQuery += 'clav:' + id + ' clav:processoTipoVC clav:vc_processoTipo_' + data.Type + ' .\n';
    }

    if (data.Level >= 3 && data.Trans) {
        createQuery += 'clav:' + id + ' clav:processoTransversal "' + data.Trans + '" .\n';
    }

    if (data.Level >= 3 && data.Owners && data.Owners.length) {
        for (let owner of data.Owners) {
            createQuery += `clav:${id} clav:temDono clav:${owner} .\n`;
        }
    }

    if (data.Level >= 3 && data.Trans == 'S' && data.Participants) {
        for (let key in data.Participants) {
            for (let part of data.Participants[key]) {
                createQuery += `clav:${id} clav:temParticipante${key} clav:${part} .\n`;
            }
        }
    }

    if (data.Level >= 3 && data.RelProcs) {
        for (let proc of data.RelProcs) {
            createQuery += `clav:${id} clav:${proc.relType} clav:${proc.id} .\n`;
        }
    }

    if (data.Legislations && data.Legislations.length) {
        for (let doc of data.Legislations) {
            createQuery += `clav:${id} clav:temLegislacao clav:${doc} .\n`;
        }
    }

    if (data.Level >= 3 && data.PCA) {
        createQuery += `
            clav:pca_${id} rdf:type owl:NamedIndividual ,
                    clav:PCA ;
                clav:pcaFormaContagemNormalizada clav:${data.PCA.count.id} ;
                clav:pcaValor '${data.PCA.dueDate}' .
            
            clav:just_pca_${id} rdf:type owl:NamedIndividual ,
                    clav:JustificacaoPCA .
            clav:pca_${id} clav:temJustificacao clav:just_pca_${id} .

            clav:${id} clav:temPCA clav:pca_${id} .
        `;

        if (data.PCA.count.id == 'vc_pcaFormaContagem_disposicaoLegal' && data.PCA.subcount.id) {
            createQuery += `clav:pca_${id} clav:pcaSubformaContagem clav:${data.PCA.subcount.id} .`;
        }

        if (data.PCA.criteria) {
            for (let [i, crit] of data.PCA.criteria.entries()) {
                let critID = `clav:crit_jpca_${id}_${i + 1}`;

                createQuery += `
                    ${critID} rdf:type owl:NamedIndividual ,
                            clav:${crit.type.value} ;
                        clav:conteudo '${crit.content.replace(/\n/g, '\\n')}' .
                    clav:just_pca_${id} clav:temCriterio ${critID} .
                `;

                if (crit.pns) {
                    for (let pn of crit.pns) {
                        createQuery += `
                            ${critID} clav:temProcessoRelacionado clav:${pn.id} .
                        `;
                    }
                }
                if (crit.leg) {
                    for (let doc of crit.leg) {
                        createQuery += `
                            ${critID} clav:temLegislacao clav:${doc.id} .
                        `;
                    }
                }
            }
        }
    }

    if (data.Level >= 3 && data.DF) {
        createQuery += `
            clav:df_${id} rdf:type owl:NamedIndividual ,
                    clav:DestinoFinal ;
                clav:dfValor '${data.DF.end}' .

            clav:just_df_${id} rdf:type owl:NamedIndividual ,
                    clav:JustificacaoDF . 
            
            clav:df_${id} clav:temJustificacao clav:just_df_${id} .

            clav:${id} clav:temDF clav:df_${id} .
        `;

        if (data.DF.criteria) {
            for (let [i, crit] of data.DF.criteria.entries()) {
                let critID = `clav:crit_just_df_${id}_${i + 1}`;

                createQuery += `
                    ${critID} rdf:type owl:NamedIndividual ,
                            clav:${crit.type.value} ;
                        clav:conteudo '${crit.content.replace(/\n/g, '\\n')}' .
                    clav:just_df_${id} clav:temCriterio ${critID} .
                `;

                if (crit.pns) {
                    for (let pn of crit.pns) {
                        createQuery += `
                            ${critID} clav:temProcessoRelacionado clav:${pn.id} .
                        `;
                    }
                }
                if (crit.leg) {
                    for (let doc of crit.leg) {
                        createQuery += `
                            ${critID} clav:temLegislacao clav:${doc.id} .
                        `;
                    }
                }
            }
        }
    }

    createQuery += '}';

    return client.query(createQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in create:\n" + error));


}

Classes.updateClass = function (dataObj) {
    function prepDelete(dataObj) {
        let deletePart = "\n";

        if (dataObj.ExAppNotes && dataObj.ExAppNotes.length) {
            deletePart += `
                clav:${dataObj.id} clav:exemploNA ?exNA .
            `;
        }
        if (dataObj.AppNotes) {
            deletePart += `
                clav:${dataObj.id} clav:temNotaAplicacao ?na .
                ?na ?naP ?naO .
            `;
        }
        if (dataObj.DelNotes) {
            deletePart += `
                clav:${dataObj.id} clav:temNotaExclusao ?ne .
                ?ne ?neP ?neO .
            `;
        }
        if (dataObj.Indexes) {
            deletePart += `
                ?ti clav:estaAssocClasse clav:${dataObj.id} .
                ?ti ?tiP ?tiO .
            `;
        }

        //relations
        if (dataObj.Owners && dataObj.Owners.Delete && dataObj.Owners.Delete.length) {
            for (var i = 0; i < dataObj.Owners.Delete.length; i++) {
                deletePart += "\tclav:" + dataObj.id + " clav:temDono clav:" + dataObj.Owners.Delete[i].id + " .\n";
            }
        }
        if (dataObj.Legs && dataObj.Legs.Delete && dataObj.Legs.Delete.length) {
            for (var i = 0; i < dataObj.Legs.Delete.length; i++) {
                deletePart += "\tclav:" + dataObj.id + " clav:temLegislacao clav:" + dataObj.Legs.Delete[i].id + " .\n";
            }
        }

        var relKeys = Object.keys(dataObj.RelProcs);

        for (var k = 0; k < relKeys.length; k++) {
            if (dataObj.RelProcs[relKeys[k]].Delete && dataObj.RelProcs[relKeys[k]].Delete.length) {
                for (var i = 0; i < dataObj.RelProcs[relKeys[k]].Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:e" + relKeys[k].replace(/ /, '') + " clav:" + dataObj.RelProcs[relKeys[k]].Delete[i].id + " .\n";
                }
            }
        }

        var partKeys = Object.keys(dataObj.Participants);

        for (var k = 0; k < partKeys.length; k++) {
            if (dataObj.Participants[partKeys[k]].Delete && dataObj.Participants[partKeys[k]].Delete.length) {
                for (var i = 0; i < dataObj.Participants[partKeys[k]].Delete.length; i++) {
                    deletePart += "\tclav:" + dataObj.id + " clav:temParticipante" + partKeys[k] + " clav:" + dataObj.Participants[partKeys[k]].Delete[i].id + " .\n";
                }
            }
        }

        if (dataObj.PCA) {
            for (let [i, critID] of dataObj.PCA.criteria.Delete.entries()) {
                deletePart += `
                    clav:just_pca_${dataObj.id} clav:temCriterio clav:${critID} .
                `;
            }
            
            for (let [i, crit] of dataObj.PCA.criteria.Change.entries()) {
                deletePart += `
                clav:just_pca_${dataObj.id} clav:temCriterio clav:${crit.id} .
                `;
            }

            if(dataObj.PCA.count){
                deletePart += `
                    clav:pca_${dataObj.id} clav:pcaSubformaContagem ?pcaSubCount .
                `;
            }
            
        }
        if (dataObj.DF) {
            for (let [i, critID] of dataObj.DF.criteria.Delete.entries()) {
                deletePart += `
                    clav:just_df_${dataObj.id} clav:temCriterio clav:${critID} .
                `;
            }
            
            for (let [i, crit] of dataObj.DF.criteria.Change.entries()) {
                deletePart += `
                clav:just_df_${dataObj.id} clav:temCriterio clav:${crit.id} .
                `;
            }
        }


        return deletePart;
    }

    function prepDelWhere(dataObj) {
        let wherePart = "\n";
        //atributes
        if (dataObj.Title) {
            wherePart += "\tclav:" + dataObj.id + " clav:titulo ?tit .\n";
        }
        if (dataObj.Status) {
            wherePart += "\tclav:" + dataObj.id + " clav:classeStatus ?status .\n";
        }
        if (dataObj.Desc) {
            wherePart += "\tclav:" + dataObj.id + " clav:descricao ?desc .\n";
        }
        if (dataObj.ProcType) {
            wherePart += "\tclav:" + dataObj.id + " clav:processoTipoVC ?ptipo .\n";
        }
        if (dataObj.ProcTrans) {
            wherePart += "\tclav:" + dataObj.id + " clav:processoTransversal ?ptrans .\n";
        }

        if (dataObj.PCA) {
            if(dataObj.PCA.value){
                wherePart += `
                    clav:pca_${dataObj.id} clav:pcaValor ?pcaVal .
                `;
            }
            if(dataObj.PCA.count){
                wherePart += `
                    clav:pca_${dataObj.id} clav:pcaFormaContagemNormalizada ?pcaCount .
                `;
            }

            for (let [i, critID] of dataObj.PCA.criteria.Delete.entries()) {
                wherePart += `
                    clav:${critID} ?pcaCritDelP${i} ?pcaCritDelO${i} .
                `;
            }
            
            for (let [i, crit] of dataObj.PCA.criteria.Change.entries()) {
                wherePart += `
                    clav:${crit.id} ?pcaCritUpdP${i} ?pcaCritUpdO${i} .
                `;
            }
        }

        if (dataObj.DF) {
            if(dataObj.DF.dest) {
                wherePart += `
                    clav:df_${dataObj.id} clav:dfValor ?dfDest .
                `;
            }

            for (let [i, critID] of dataObj.DF.criteria.Delete.entries()) {
                wherePart += `
                    clav:${critID} ?dfCritDelP${i} ?dfCritDelO${i} .
                `;
            }
            
            for (let [i, crit] of dataObj.DF.criteria.Change.entries()) {
                wherePart += `
                    clav:${crit.id} ?dfCritUpdP${i} ?dfCritUpdO${i} .
                `;
            }
        }

        return wherePart;
    }

    function prepInsert(dataObj) {
        let insertPart = "\n";

        //attributes
        if (dataObj.Title) {
            insertPart += "\tclav:" + dataObj.id + " clav:titulo '" + dataObj.Title + "' .\n";
        }
        if (dataObj.Status) {
            insertPart += "\tclav:" + dataObj.id + " clav:classeStatus '" + dataObj.Status + "' .\n";
        }
        if (dataObj.Desc) {
            insertPart += "\tclav:" + dataObj.id + " clav:descricao '" + dataObj.Desc.replace(/\n/g, '\\n').replace(/\"/g, "\\\"") + "' .\n";
        }
        if (dataObj.ProcType) {
            insertPart += "\tclav:" + dataObj.id + " clav:processoTipoVC clav:vc_processoTipo_" + dataObj.ProcType + " .\n";
        }
        if (dataObj.ProcTrans) {
            insertPart += "\tclav:" + dataObj.id + " clav:processoTransversal '" + dataObj.ProcTrans + "' .\n";
        }
        if (dataObj.ExAppNotes && dataObj.ExAppNotes.length) {
            for (var i = 0; i < dataObj.ExAppNotes.length; i++) {
                if (dataObj.ExAppNotes[i].Exemplo) {
                    insertPart += `\tclav:${dataObj.id} clav:exemploNA "${dataObj.ExAppNotes[i].Exemplo.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" .\n`;
                }
            }
        }

        //Notas de aplicação
        if (dataObj.AppNotes && dataObj.AppNotes.length) {
            for (let note of dataObj.AppNotes) {
                if (note.Nota) {
                    insertPart += `
                        clav:${note.id} rdf:type owl:NamedIndividual ,
                                clav:NotaAplicacao ;
                            clav:conteudo "${note.Nota.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" .
                        clav:${dataObj.id} clav:temNotaAplicacao clav:${note.id} .
                    `;
                }
            }
        }
        //Notas de exclusão
        if (dataObj.DelNotes && dataObj.DelNotes.length) {
            for (let note of dataObj.DelNotes) {
                if (note.Nota) {
                    insertPart += `
                        clav:${note.id} rdf:type owl:NamedIndividual ,
                                clav:NotaExclusao ;
                            clav:conteudo "${note.Nota.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" .
                        clav:${dataObj.id} clav:temNotaExclusao clav:${note.id} .
                    `;
                }
            }
        }
        //Termos de Indice
        if (dataObj.Indexes && dataObj.Indexes.length) {
            for (let ti of dataObj.Indexes) {
                if (ti.Termo) {
                    insertPart += `
                        clav:${ti.id} rdf:type owl:NamedIndividual ,
                                clav:TermoIndice ;
                            clav:termo "${ti.Termo.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}" ;
                            clav:estaAssocClasse clav:${dataObj.id} .
                    `;
                }
            }
        }
        //Donos
        if (dataObj.Owners.Add && dataObj.Owners.Add.length) {
            for (var i = 0; i < dataObj.Owners.Add.length; i++) {
                insertPart += "\tclav:" + dataObj.id + " clav:temDono clav:" + dataObj.Owners.Add[i].id + " .\n";
            }
        }
        //Legislação
        if (dataObj.Legs.Add && dataObj.Legs.Add.length) {
            for (var i = 0; i < dataObj.Legs.Add.length; i++) {
                insertPart += "\tclav:" + dataObj.id + " clav:temLegislacao clav:" + dataObj.Legs.Add[i].id + " .\n";
            }
        }
        //Relações com Processos 
        var relKeys = Object.keys(dataObj.RelProcs);

        for (var k = 0; k < relKeys.length; k++) {
            if (dataObj.RelProcs[relKeys[k]].Add && dataObj.RelProcs[relKeys[k]].Add.length) {
                for (var i = 0; i < dataObj.RelProcs[relKeys[k]].Add.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:e" + relKeys[k].replace(/ /, '') + " clav:" + dataObj.RelProcs[relKeys[k]].Add[i].id + " .\n";
                }
            }
        }
        //Participantes
        var partKeys = Object.keys(dataObj.Participants);

        for (var k = 0; k < partKeys.length; k++) {
            if (dataObj.Participants[partKeys[k]].Add && dataObj.Participants[partKeys[k]].Add.length) {
                for (var i = 0; i < dataObj.Participants[partKeys[k]].Add.length; i++) {
                    insertPart += "\tclav:" + dataObj.id + " clav:temParticipante" + partKeys[k] + " clav:" + dataObj.Participants[partKeys[k]].Add[i].id + " .\n";
                }
            }
        }

        //PCA
        if (dataObj.PCA) {
            if(dataObj.PCA.value){
                insertPart += `
                    clav:pca_${dataObj.id} clav:pcaValor '${dataObj.PCA.value}' .
                `;
            }
            if(dataObj.PCA.count){
                insertPart += `
                    clav:pca_${dataObj.id} clav:pcaFormaContagemNormalizada clav:${dataObj.PCA.count} .
                `;

                if(dataObj.PCA.count=="vc_pcaFormaContagem_disposicaoLegal"){
                    insertPart += `
                        clav:pca_${dataObj.id} clav:pcaSubformaContagem clav:${dataObj.PCA.subcount} .
                    `;
                }
            }

            for (let crit of dataObj.PCA.criteria.Add.concat(dataObj.PCA.criteria.Change)) {
                insertPart += `
                    clav:${crit.id} rdf:type owl:NamedIndividual ,
                            clav:${crit.type};
                        clav:conteudo "${crit.note.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}".
                `;

                for (let doc of crit.leg) {
                    insertPart += `
                        clav:${crit.id} clav:temLegislacao clav:${doc.id} .
                    `;
                }

                for (let pn of crit.pns) {
                    insertPart += `
                        clav:${crit.id} clav:temProcessoRelacionado clav:${pn.id} .
                    `;
                }

                insertPart += `
                    clav:just_pca_${dataObj.id} clav:temCriterio clav:${crit.id} .
                `;
            }
        }

        if (dataObj.DF) {
            if(dataObj.DF.dest) {
                insertPart += `
                    clav:df_${dataObj.id} clav:dfValor '${dataObj.DF.dest}' .
                `;
            }

            for (let crit of dataObj.DF.criteria.Add.concat(dataObj.DF.criteria.Change)) {
                insertPart += `
                    clav:${crit.id} rdf:type owl:NamedIndividual ,
                            clav:${crit.type};
                        clav:conteudo "${crit.note.replace(/\n/g, '\\n').replace(/\"/g, "\\\"")}".
                `;

                for (let doc of crit.leg) {
                    insertPart += `
                        clav:${crit.id} clav:temLegislacao clav:${doc.id} .
                    `;
                }

                for (let pn of crit.pns) {
                    insertPart += `
                        clav:${crit.id} clav:temProcessoRelacionado clav:${pn.id} .
                    `;
                }

                insertPart += `
                    clav:just_df_${dataObj.id} clav:temCriterio clav:${crit.id} .
                `;
            }
        }

        return insertPart;
    }

    function prepWhere(dataObj) {
        let retWhere = "\n";
        if (dataObj.AppNotes) {
            retWhere += `
                optional{
                    clav:${dataObj.id} clav:temNotaAplicacao ?na .
                    ?na ?naP ?naO .
                }
            `;
        }
        if (dataObj.DelNotes) {
            retWhere += `
                optional{
                    clav:${dataObj.id} clav:temNotaExclusao ?ne .
                    ?ne ?neP ?neO .
                }
            `;
        }
        if (dataObj.ExAppNotes && dataObj.ExAppNotes.length) {
            retWhere += `
                optional{
                    clav:${dataObj.id} clav:exemploNA ?exNA .
                }
            `;
        }
        if (dataObj.Indexes) {
            retWhere += `
                optional{
                    ?ti clav:estaAssocClasse clav:${dataObj.id} .
                    ?ti ?tiP ?tiO .
                }
            `;
        }
        if(dataObj.PCA && dataObj.PCA.count){
            retWhere += `
                optional{
                    clav:pca_${dataObj.id} clav:pcaSubformaContagem ?pcaSubCount .
                }
            `;
        }
        return retWhere;
    }

    var deletePart = prepDelete(dataObj);
    var insertPart = prepInsert(dataObj);
    var delwherePart = prepDelWhere(dataObj);
    var wherePart = prepWhere(dataObj);

    var updateQuery = `
        DELETE {
            ${delwherePart}
            ${deletePart}
        }
        INSERT{
            ${insertPart}
        }
        WHERE {
            ${delwherePart}
            ${wherePart}
        }
    `;
    
    
    return client.query(updateQuery).execute()
        .then(response => Promise.resolve(response))
        .catch(error => console.error("Error in update:\n" + error));
}

Classes.deleteClass = function (id) {
    /*var delQuery = `
        DELETE {
            clav:${id} ?p ?o .
            ?relS ?relP clav:${id} .
            ?na ?naP ?naO .
            ?ne ?neP ?neO .
        }
        WHERE {
            clav:${id} ?p ?o .
            OPTIONAL {
                ?relS ?relP clav:${id} .
            }
            OPTIONAL {
                clav:${id} clav:temNotaAplicacao ?na .
                ?na ?naP ?naO .
            }
            OPTIONAL{
                clav:${id} clav:temNotaExclusao ?ne .
                ?ne ?neP ?neO .
            }
        }
    `;*/

    var delQuery = `
        DELETE {
            clav:${id} clav:classeStatus ?status .
        }
        INSERT {
            clav:${id} clav:classeStatus 'I' .
        }
        WHERE {
            clav:${id} clav:classeStatus ?status .
        }
    `;

    return client.query(delQuery).execute()
        //getting the content we want
        .then(response => Promise.resolve(response))
        .catch(function (error) {
            console.error(error);
        });
}