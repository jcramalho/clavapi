var Trabalhos = module.exports

var Trabalho = require('../../models/trabalho');

Trabalhos.add = function(dataObj, req, res){
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();

    var dataT = yyyy+"/"+mm+"/"+dd;

    var newTrabalho = new Trabalho({
        tipo: dataObj.type,
        userEmail: req.user.email,

        objeto: dataObj.obj,
        objetoID: dataObj.objID, 

        data: dataT
    });
    
    Trabalho.createTrabalho(newTrabalho, function (err, request) {
        if (err) {
            console.log(err);
            req.flash('error_msg', 'Ocorreu um erro ao guardar o trabalho! Tente novamente mais tarde');
            res.send('Ocorreu um erro ao guardar o trabalho! Tente novamente mais tarde');
        
            Logging.logger.info(`Erro ao guardar trabalho ${dataObj.type}`);            
        }
        else {
            req.flash('success_msg', 'Trabalho guardado!');
        }
    });  
}

