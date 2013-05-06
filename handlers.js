var fs = require('fs'), 
    util = require('util'),
    mongoose = require("mongoose"); // The reason for this demo.

var uristring = 
    process.env.MONGOLAB_URI || 
    process.env.MONGOHQ_URL || 
    'mongodb://localhost/profrank';

var assets_dir = "./assets";

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var db = mongoose.connection;
//references to collections
var Rating;
    
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(){
  //ratings
  var ratingSchema = mongoose.Schema({
    name: {
      first: {type: String, trim: true, lowercase:true},
      last: {type: String, trim: true, lowercase:true}
      },
    userid: Number,
    dept: {type: String, trim: true, lowercase:true},
    rating: Number,
    review: String
  });
  Rating = mongoose.model('Ratings', ratingSchema);
});
//get default texts. These will go into mongodb later. HC'd for now.

exports.addProf = function(req, res) {
  var p = req.body;
      
  var newRating = new Rating({
    name: {
      first: p.firstname,
      last: p.lastname
    },
    userid: p.userid,
    dept: p.dept,
    rating: p.rating,
    review: p.note
  });
  newRating.save(function(err){
    if(err) res.send(500, "Issue adding");
    res.send(200, "Success");
  });
  
}

exports.getProfs = function(req, res) {
  var p = req.param("query").toLowerCase();
  
  Rating.find({dept: p}, 'name.first name.last', function(err, results){
    if(err) res.send(500, "Failed");
    res.json(results);
  });
}

exports.getReviews = function(req, res) {
  var f = req.param("first").toLowerCase(),
      l = req.param("last").toLowerCase();
  Rating.find({'name.first': f, 'name.last': l}, 'rating review', function(err, results){
    if(err) res.send(500, "Failed");
    res.json(results);
  });
}

exports.getDepts = function(req, res) {
  Rating.distinct('dept',{}, function(err, results){
    if(err) res.send(500, "Failed");
    res.json(results);
  });
}
