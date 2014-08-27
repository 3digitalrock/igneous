// load requirements
var express = require('express'),
    module = require('./modules/videos'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express();
    
app.use(cors());
app.use(bodyParser.json());  
app.get('/v0/videos', module.findAll);  
app.get('/v0/videos/:id', module.findById);  
app.post('/v0/videos', module.create);  
app.delete('/v0/videos/:id', module.delete);  
app.put('/v0/videos/:id', module.update);

//var router = express.Router();

app.listen(3001);  
console.log('Listening on port 3001...');  