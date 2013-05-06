var express = require('express'),
    handlers = require('./handlers'),
    url = require('url'),
    app = express();
    
app.use(express.static(__dirname + '/assets'));
app.use(express.bodyParser());

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/assets/' + 'index.html');
});

app.post('/prof', function(req, res) {
  handlers.addProf(req, res);
});

var port = process.env.PORT || 5000;
app.listen(port);
console.log("Listening on port 5000");
