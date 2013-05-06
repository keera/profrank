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
var Prof, 
    Dept, 
    User, 
    Rating;
    
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(){
  //professors
  var profSchema = mongoose.Schema({
    name: {
      first: {type: String, trim: true},
      last: {type: String, trim: true}
      },
    dept: mongoose.Schema.Types.ObjectId
  });
  Prof = mongoose.model('Profs', profSchema);
  //departments
  var deptSchema = mongoose.Schema({name: String});
  Dept = mongoose.model('Depts', deptSchema);
  //users
  var userSchema = mongoose.Schema({
    name: {
      first: {type: String, trim: true},
      last: {type: String, trim: true}
      },
    userid: Number
  });
  User = mongoose.model('Users', userSchema);
  //ratings
  var ratingSchema = mongoose.Schema({
    userid: Number,
    profid: mongoose.Schema.Types.ObjectId,
    rating: Number,
    review: String
  });
  Rating = mongoose.model('Ratings', userSchema);
  
});
//get default texts. These will go into mongodb later. HC'd for now.

exports.addProf = function(req, res) {
  var p = req.body,
      userid = p.userid,
      first = p.firstname,
      last = p.lastname,
      dept = p.dept,
      review = p.note;
      
  Prof.count({'name.first':first, 'name.last':last}, function(err, count){
    if (err) res.send(404, "Error");
    if (count < 1) {
      Dept.count({'name' : dept}, function(err, count){
        if (count < 1) {
          var objId = new mongoose.Types.ObjectId;
          var newDept = new Dept({_id: objId, name : dept});
          newDept.save(function(err, dept){
            if(err) res.send(404, "Failed adding dept");
            var newProf = new Prof({name: {first: first, last: last}, dept: objId});
            newProf.save(function(err, prof){
              if(err) res.send(404, "Failed adding prof");
              res.send(200, "PROF ADDED!");
            });
          });
        } else {
          //get the objectid and save the new prof
        }
      })
    } else {
      Prof.findOne({'name.first': first, 'name.last':last}, function(err, prof){
        if (err) res.send(404, "Error finding existing prof");
        var deptId = prof.dept,
            profid = prof._id;
            console.log(profid);
        Rating.count({'userid': userid, 'profid': profid}, function(err, count){
          if(count < 1) {
            var newRating = new Rating({
              //userid: userid,
              rating: 1,
              review: review
            });
            newRating.save(function(err, rating){
              if(err) res.send(404, "failed adding rating");
              res.send(200, "Rating added");
            })  
          } else {
            res.send(300, "Rating exists");
          }
        })    
      })

    }
    //at this point, we can move on to ratings
  });
  //res.send(200, "YO");
}
