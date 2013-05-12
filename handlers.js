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
    Rating;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
  //ratings
  var ratingSchema = mongoose.Schema({
    name : {
      first : {
        type : String,
        trim : true,
        lowercase: true
      },
      last : {
        type : String,
        trim : true,
        lowercase: true
      }
    },
    userid : Number,
    dept : {
      type : String,
      trim : true,
      lowercase: true
    },
    endorse : Number,
    condemn : Number,
    review : String
  });
  Rating = mongoose.model('Ratings', ratingSchema);

});

exports.addProf = function(req, res) {
  var p = req.body;

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
  Rating.find({
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
  });

};

exports.getAny = function(req, res) {
  var f = req.param("query"),
      responseData = {
        query : "Unit",
        suggestions : []
      },
      group,
      a;

  group = {
    key : {
      name : {
        first : 1,
        last : 1
      }
    },
    cond : {
      $or : [{
        'name.first' : {
          $regex : f,
          $options : 'i'
        }
      }, {
        'name.last' : {
          $regex : f,
          $options : 'i'
        }
      }],
    },
    reduce : function(curr, result) {
      result.a = 0;
    },
    initial : {
      a : 0
    },
    finalize : {}
  };

  Rating.find({
    "dept" : {
      $regex : f
    }
  }, "dept").distinct("dept", function(err, results) {
    if(err)
      res.send(204, "Get subjects: failed");

    for(a in results) {
      responseData.suggestions.push({
        value : results[a],
        data : ""
      });
    }

    Rating.collection.group(group.key, group.cond, 
      group.initial, group.reduce, 
      group.finalize, 
      {}, {}, function(err, results) {
      if(err)
        res.send(204, "Get names: failed");
        
      for(a in results) {
        responseData.suggestions.push({
          value : results[a].name.first + " " + results[a].name.last,
          data : ""
        });
      }
      res.json(responseData);
    });
  });

};
