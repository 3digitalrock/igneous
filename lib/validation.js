module.exports.doesExist = function(fields, requested, callback){
    var index, failed = [];
    // iterate through the required fields
    for (index=0;index<fields.length;++index){
        // check to see if required field was defined
        if(typeof requested[fields[index]] === 'undefined'){
            failed.push(fields[index]);
        }
    }
    
    if (failed.length > 0){
        return callback(false, failed);
    } else {
        return callback(true, null);
    }
};

module.exports.isArray = function(field){
    if(Array.isArray(field)){
        return true;
    } else {
        return false;
    }
};

module.exports.isInt = function(input){
    var regexInt = /^(?:-?(?:0|[1-9][0-9]*))$/;
    if(regexInt.test(input)){
        return true;
    } else {
        return false;
    }
};