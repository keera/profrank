var fb = new Application();

fb.Router = Backbone.Router.extend({

  routes : {
    "" : "main",
  },

  initialize : function() {
    //cache?
    this.welcomeView = new fb.views.Welcome();
  },
  
  main : function() {
    $('#content').html(this.welcomeView.el);
  },
  
  showErrorPage : function() {
    $('#content').append(new fb.views.Error().el);
  }
});

$(document).on('ready', function() {
  var templates = [
    'shell', 
    'main', 
    'login', 
    'profs',
    'error',
    'reviews',
   ];
  fb.templateLoader.load(templates, function() {
    fb.shell = new fb.views.Shell({
      el : "#shell",
      model : window.activeSession
    });
    fb.router = new fb.Router();
    Backbone.history.start();
  });
});
