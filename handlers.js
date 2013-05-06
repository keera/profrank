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
    endorse: Number,
    condemn: Number,
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
    endorse: p.endorse,
    condemn: p.condemn,
    review: p.note
  });
  newRating.save(function(err){
    if(err) res.send(500, "Issue adding");
    res.send(200, "Success");
  });
  
};

exports.getProfs = function(req, res) {
  var p = req.param("query").toLowerCase();
  var group = {
    key: { name : {first: 1, last:1}, 'dept': 1 },
    cond: {dept: p},
    reduce: function ( curr, result ) {
      result.endorse += curr.endorse;
      result.condemn += curr.condemn;
    },
    initial: { endorse : 0, condemn: 0},
    finalize: function(result) {
      result.avg = result.endorse / (result.endorse + result.condemn);
    }
  };
  Rating.collection.group(group.key, group.cond, group.initial, 
    group.reduce, group.finalize, {}, {}, 
    function(err, results) {
      if(err) res.send(500, "Failed");
        console.log(results);
        res.json(results);
    });
};

exports.getReviews = function(req, res) {
  var f = req.param("first").toLowerCase(),
      l = req.param("last").toLowerCase();
  Rating.find({'name.first': f, 'name.last': l}, 'userid rating review', function(err, results){
    if(err) res.send(500, "Failed");
    res.json(results);
  });
};

exports.getSubjects = function(req, res) {
  /*{
    // Query is not required as of version 1.2.5
    query: "Unit",
    suggestions: [
        { value: "United Arab Emirates", data: "AE" },
        { value: "United Kingdom",       data: "UK" },
        { value: "United States",        data: "US" }
    ]
  }*/
  var f = req.param("query");
  
  Rating.distinct("dept").exec(
    Rating.find({"dept": { $regex : f}}), function(err, results){
      if(err) res.send(500, "Failed");
      var responseData = {query: "Unit", suggestions: []};
      console.log(results);
      for(var a in results){
        responseData.suggestions.push({value: results[a], data: ""});
      }
      res.json(responseData);
  });
 };

exports.getDepts = function(req, res) {
  Rating.distinct('dept',{}, function(err, results){
    if(err) res.send(500, "Failed");
    res.json(results);
  });
};
