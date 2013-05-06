var express = require('express'),
    handlers = require('./handlers'),
    url = require('url'),
    app = express(),
    mongoose = require("mongoose"); // The reason for this demo.

var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/profrank';

app.use(express.static(__dirname + '/assets'));

//connect to mongodb, async
mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(){
  var profSchema = mongoose.Schema({
    name: {
      first: {type: String, trim: true},
      last: {type: String, trim: true}
      },
    dept: mongoose.Schema.Types.ObjectId
  });

  var Prof = mongoose.model('Profs', profSchema);

  var testUser = new Prof ({
    name: {first: 'Alan', last: 'Lin'},
    dept: new mongoose.Types.ObjectId
  });
  console.log(testUser.name.first);

  //insert the user
  testUser.save(function(err){
    if(err)
      console.log("uh oh");
  });

});


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/assets/' + 'index.html');
});

var port = process.env.PORT || 5000;
app.listen(port);
console.log("Listening on port 5000");
