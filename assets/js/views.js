fb.views.Shell = Backbone.View.extend({

  initialize : function() {
    this.template = _.template(fb.templateLoader.get('shell'));
    this.model.bind('add', this.render);
    this.render();
  },
  
  render : function() {
    this.$el.html(this.template(this.model.toJSON()));
    new fb.views.Login({
      model : this.model,
      el : '#login'
    });
    return this;
  },
  
  events : {
    'mousedown li' : 'mouseDown',
    'mouseup li' : 'mouseUp',
    'click .btn-login' : 'login'
  },

  mouseDown : function(e) {
    $(e.currentTarget).addClass('active');
  },
  
  mouseUp : function() {
    $('li').removeClass('active');
  },
  
  login : function() {
    $(document).trigger('login');
    return false;
  }
  
});

fb.views.Welcome = Backbone.View.extend({
  
  initialize : function() {
    var self = this;
    _.bindAll(this);
    this.fb = fb;
    this.template = _.template(fb.templateLoader.get('main'));
    this.render();

  },
  
  render : function() {
    this.$el.html(this.template());
    var autoSettings = {
      serviceUrl : '/depts',
      minChars : 1,
      delimiter : /(,|;)\s*/, // regex or character
      maxHeight : 400,
      width : 220,
      zIndex : 9999,
      deferRequestBy : 0, //miliseconds
      noCache : false, //default is false, set to true to disable caching
    };
    $(this.$el).find('#query').autocomplete(autoSettings);
    autoSettings.width = 302;
    $(this.$el).find('#prof-search').autocomplete(autoSettings);
    
    $(this.$el).find('#prof-search').tooltip();
    $(this.$el).find('#endorse').tooltip();
    $(this.$el).find('#condemn').tooltip();
    return this;
  },
  
  events : {
    'click #endorse' : 'endorse',
    'click #condemn' : 'condemn',
    'click #submitEndorse' : 'postEndorse',
    'click #submitCondemn' : 'postCondemn',
    'keypress #prof-search' : 'profSearch'
  },

  endorse : function() {
    if(window.activeSession.isAuthorized()) {
      $('#endorseModal').modal('show');
    } else {
      var config = {
        before : null,
        after : function() {
          $('#endorseModal').modal('show');
        }
      };
      window.activeSession.login(config);
    }
  },
  
  condemn : function() {
     if(window.activeSession.isAuthorized()) {
      $('#condemnModal').modal('show');
    } else {
      var config = {
        before : null,
        after : function() {
          $('#condemnModal').modal('show');
        }
      };
      window.activeSession.login(config);
    }
  },

  profSearch : function(e) {
    if(e.keyCode != 13)
      return;
    var search = $("#prof-search").val();
    var pc = new this.fb.models.ProfCollection();
    callBack = function(collection, response, options) {
      console.log(collection);
      try {
        $('#content').html(new this.fb.views.Friends({
          id: search,
          model : collection
        }).el);
      } catch (e) {
        this.showErrorPage();
      }
    };
    pc.fetch({
      data : {
        query : search
      },
      success : callBack
    });
  },

  isEmpty: function(obj, id, msg) {
    if(obj.length < 1) {
      $(id + " span").remove('.help-inline');
      $(id + " .controls").append(msg);
      $(id).addClass("error");
      return false;
    } else {
      $(id + " span").remove('.help-inline');
      $(id).removeClass("error");
      return true;
    }
  },
  
  validate: function(fields) {
    return fields.indexOf(false) < 0;
  },
  
  postEndorse : function() {
    var first = $("#first-name :input").val(),
        last = $("#last-name :input").val(), 
        dept = $("#department :input").val(), 
        note = $("#note :input").val(), 
        errorHtml = '<span class="help-inline">Please enter a value</span>',
        fields;
    
    fields = [
      this.isEmpty(first, "#first-name", errorHtml),
      this.isEmpty(last, "#last-name", errorHtml),
      this.isEmpty(dept, "#department", errorHtml)
    ];
    if(!this.validate(fields)) return;

    var data = {
      userid : window.activeSession.id,
      firstname : first,
      lastname : last,
      dept : dept,
      endorse: 1,
      condemn: 0,
      note : note
    };

    var newRating = new this.fb.models.Rating(data);
    newRating.save();
    $('#endorseModal').modal('hide');
  },
  
  postCondemn : function() {
    var first = $("#first-name-c :input").val(),
        last = $("#last-name-c :input").val(), 
        dept = $("#department-c :input").val(), 
        note = $("#note-c :input").val(), 
        errorHtml = '<span class="help-inline">Please enter a value</span>',
        fields;
    
    fields = [
      this.isEmpty(first, "#first-name-c", errorHtml),
      this.isEmpty(last, "#last-name-c", errorHtml),
      this.isEmpty(dept, "#department-c", errorHtml)
    ];
    if(!this.validate(fields)) return;

    var data = {
      userid : window.activeSession.id,
      firstname : first,
      lastname : last,
      dept : dept,
      endorse: 0,
      condemn: 1,
      note : note
    };

    var newRating = new this.fb.models.Rating(data);
    newRating.save();
    $('#condemnModal').modal('hide');
  }
  
});

//user manual login
fb.views.Login = Backbone.View.extend({

  initialize : function() {
    this.template = _.template(fb.templateLoader.get('login'));
    this.model.on("change", this.render, this);
    this.render();
  },
  
  render : function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  
  events : {
    'click .login' : 'login',
    'click .logout' : 'logout'
  },

  login : function(e) {
    var config = {
      before : null,
      after : null
    };
    window.activeSession.login(config);
    return false;
  },
  
  logout : function(e) {
    window.activeSession.logout();
    return false;
  }
  
});

//error page
fb.views.Error = Backbone.View.extend({

  initialize : function() {
    this.template = _.template(fb.templateLoader.get('error'));
    this.render();
  },
  
  render : function() {
    this.$el.html(this.template());
    return this;
  },
  
  events : {
    'click .retry' : 'retry'
  },

  retry : function() {
    Backbone.history.loadUrl(Backbone.history.fragment);
  }
  
});

//this will serve as professor
fb.views.Friends = Backbone.View.extend({
  
  initialize : function() {
    this.fb = fb;
    this.template = _.template(fb.templateLoader.get('profs'));
    this.model.on("change", this.render, this);
    this.render();
  },
  
  render : function() {
    this.$el.html(this.template({
      "id" : this.id,
      "data" : this.model.toJSON()
    }));
    $(this.$el).find('.prof-card').tooltip(
      {
        placement: 'right',
        delay: {
          show: 1500, 
          hide: 50
        }
      }
     );
    return this;
  },
  
  events : {
    'click li' : 'info',
    'click .previous' : 'previous',
  },
  //as we fetch, each note collection will be added to a prof model in the prof collection.
  info : function() {
    var prof = $(event.target).html(),
        first = prof.split(" ")[0],
        last = prof.split(" ")[1];
        
    var pc = new this.fb.models.NoteCollection();
     callBack = function(collection, response, options) {
      try {
            //these will instead be IDs
    $('.tab-content').html(new this.fb.views.Reviews({
      model : collection
    }).el);
     //why doesnt work if bounded in review?
    $('#container').masonry({
      itemSelector : '.item'
    });
      } catch (e) {
        this.showErrorPage();
      }
    };
    pc.fetch({
      data : {
        first: first,
        last: last
      },
      success : callBack
    });

   
  },
  
  previous : function() {
    $('#content').html(new this.fb.views.Welcome().el);
  },
  
  fetch : function(url) {
    var self = this;
    $.ajax({
      url : url,
      dataType : "json"
    }).done(function(response) {
      self.model.set(response);
    }).fail(function(e) {
      alert('Error fetching data');
    });
  }
  
});

fb.views.Reviews = Backbone.View.extend({

  initialize : function() {
    this.template = _.template(fb.templateLoader.get('reviews'));
    this.model.on("change", this.render, this);
    this.render();
  },
  
  render : function() {
    this.$el.html(this.template({
      "data" : this.model.toJSON()
    }));
    return this;
  }
  
});
