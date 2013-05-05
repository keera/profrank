var express = require('express'),
    facebook = require('facebook-node-sdk'),
    handlers = require('./handlers'),
    url = require('url'),
    app = express();

app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/assets/' + 'index.html');
});

var port = process.env.PORT || 5000;
app.listen(port);
console.log("Listening on port 5000");
