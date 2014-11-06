var Knox = require('knox');

var client = Knox.createClient({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET_NAME
});

module.exports.s3DeleteService = function(files, callback){
    client.deleteMultiple(files, function(err, res){
        if(res.statusCode!==204){
            callback(err,res.statusCode);
        } else {
            callback(null,null);
        }
    });
};