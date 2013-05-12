var fs = require('fs'), 
    util = require('util'), 
    mongoose = require("mongoose");

var uristring = process.env.MONGOLAB_URI 
  || process.env.MONGOHQ_URL 
  || 'mongodb://localhost/profrank';

var assets_dir = "./assets";

mongoose.connect(uristring, function(err, res) {
  if(err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

var db = mongoose.connection,
    Rating, Term;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
  //ratings
  var ratingSchema = mongoose.Schema({
    name : {
      first : {
        type : String,
        trim : true,
      },
      last : {
        type : String,
        trim : true,
      }
    },
    userid : Number,
    dept : {
      type : String,
      trim : true,
    },
    endorse : Number,
    condemn : Number,
    review : String
  });
  Rating = mongoose.model('Ratings', ratingSchema);
  //terms for fast searching
  var termSchema = mongoose.Schema({
    title: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    }
  });
  Term = mongoose.model('Terms', termSchema);
});

exports.addProf = function(req, res) {
  var p = req.body;
  //add to data
  Rating.find({
    "dept" : {
      $regex : p.dept,
      $options: 'i'
    }
  }).count(function(err, count) {
    if(count < 1){
      var newDept = new Term({
        title: p.dept,
        type: "dept"
      });
      newDept.save();
    }
  });
  
  Rating.find({
    'name.first' : {
      $regex : p.firstname,
      $options: 'i'
    },
    'name.last' : {
      $regex : p.lastname,
      $options: 'i'
    }
  }).count(function(err, count) {
    if(count < 1){
      var newProf = new Term({
        title: p.firstname + " " + p.lastname,
        type: "prof"
      });
      newProf.save();
    }
  });

  var newRating = new Rating({
    name : {
      first : p.firstname,
      last : p.lastname
    },
    userid : p.userid,
    dept : p.dept,
    endorse : p.endorse,
    condemn : p.condemn,
    review : p.note
  });
  newRating.save(function(err) {
    if(err)
      res.send(204, "Add professor: failed");
    res.send(200, "Success");
  });
};

exports.getProfs = function(req, res) {
  var p = req.param("query"),
      split = p.split(" ");
  var group = {
    key : {
      name : {
        first : 1,
        last : 1
      },
      'dept' : 1
    },
    cond : {
      $or: [
        {
          dept : {
            $regex : p,
            $options: 'i'
          }
        },
        {
          'name.first': { $in: split },
          'name.last': { $in: split },
        }
      ]
    },
    reduce : function(curr, result) {
      result.endorse += curr.endorse;
      result.condemn += curr.condemn;
    },
    initial : {
      endorse : 0,
      condemn : 0
    },
    finalize : function(result) {
      result.avg = result.endorse / (result.endorse + result.condemn);
    }
  };
  Rating.collection.group(group.key, group.cond, 
    group.initial, group.reduce, 
    group.finalize, {}, 
    {}, function(err, results) {
    if(err)
      res.send(204, "Get professor: failed");
    //console.log(results);
    res.json(results);
  });
};

exports.getReviews = function(req, res) {
  var f = req.param("first"), 
      l = req.param("last");
  Rating.find({
    'name.first' : {
      $regex : f,
      $options: 'i'
    },
    'name.last' : {
      $regex : l,
      $options: 'i'
    }
  }, 'userid review condemn endorse', function(err, results) {
    if(err)
      res.send(204, "Get reviews: failed");
    res.json(results);
  });
};

exports.getDepts = function(req, res) {
  var f = req.param("query");
  /*Rating.find({
    "dept" : {
      $regex : f
    }
  }, "dept").distinct("dept", function(err, results) {
    if(err)
      res.send(204, "Get subjects: failed");
    var responseData = {
      query : "Unit",
      suggestions : []
    };
    for(var a in results) {
      responseData.suggestions.push({
        value : results[a],
        data : ""
      });
    }
    res.json(responseData);
  });*/
 Term.find({
    "title" : {
      $regex : f,
      $options: 'i'
    }
  }, "title").distinct("title", function(err, results) {
    if(err)
      res.send(204, "Get subjects: failed");
    var responseData = {
      query : "Unit",
      suggestions : []
    };
    for(var a in results) {
      responseData.suggestions.push({
        value : results[a],
        data : ""
      });
    }
    res.json(responseData);
  });
};
