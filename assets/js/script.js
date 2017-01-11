(function () {

  window.app = {
    Views: {},
    Extensions: {},
    Services:{},
    Router: null,

    init: function () {

      //Energy Level
      Backbone.history.eLevel = 0;

      //Create an instance of the app
      this.instance = new app.Views.App();

      //Start listening to the routes
      Backbone.history.start();

    }
  };

  $(function() {

    //Onload Run Init Function
    window.app.init();
  });



  // #### ROUTING #####

  //Routes
  app.Router = Backbone.Router.extend({
    //Two Routes
    routes: {
      'evaluate': 'evaluate',
      '': 'home'
    },

    //Call Classes For Each Route
    home: function () {
      var view = new app.Views.Home();
      app.instance.goto(view);
    },

    evaluate: function () {
      var view = new app.Views.Evaluate();
      app.instance.goto(view);
    }

  });


  // Transition Views
  app.Extensions.View = Backbone.View.extend({

    initialize: function () {
      this.router = new app.Router();
    },

    render: function(options) {

      options = options || {};

      if (options.page === true) {
        this.$el.addClass('page');
      }

      return this;

    },

    transitionIn: function (callback) {

      var view = this,
          delay


      var transitionIn = function () {
        view.$el.addClass('is-visible');
        view.$el.on('transitionend', function () {
          if (_.isFunction(callback)) {
            callback();
          }
        })
      };

      _.delay(transitionIn, 20);

    },

    transitionOut: function (callback) {

      var view = this;

      view.$el.removeClass('is-visible');
      view.$el.on('transitionend', function () {
        if (_.isFunction(callback)) {
          callback();
        };
      });

    }

  });



  app.Views.App = app.Extensions.View.extend({

    el: 'body',

    goto: function (view) {

      var previous = this.currentPage || null;
      var next = view;

      if (previous) {
        previous.transitionOut(function () {
          previous.remove();
        });
      }

      next.render({ page: true });
      this.$el.append( next.$el );
      next.transitionIn();
      this.currentPage = next;

    }

  });




  //###### SERVICES #######

  // Create a model for the services
  app.Services.Task = Backbone.Model.extend({

    // Will contain three attributes.
    // These are their default values

    defaults:{
      title: 'Nothing',
      points: 0,
      checked: false
    },

    // Helper function for checking/unchecking a service
    toggle: function(){
      this.set('checked', !this.get('checked'));
    }
  });


  // Create a collection of tasks
  app.Services.TaskList = Backbone.Collection.extend({

    // Will hold objects of the app.Service model
    model: app.Services.Default,

    // Return an array only with the checked tasks
    getChecked: function(){
      return this.where({checked:true});
    }
  });



  // Lists of tasks that make you healthier.
  var tasks = new app.Services.TaskList([
    new app.Services.Task({ title: '8 hours of sleep', points: 200}),
    new app.Services.Task({ title: 'Breakfast', points: 50}),
    new app.Services.Task({ title: 'Lunch', points: 50}),
    new app.Services.Task({ title: 'Dinner', points: 50}),
    new app.Services.Task({ title: 'Exercise', points: 250}),
    new app.Services.Task({ title: 'Less than 100 mg of caffine', points: 100}),
    new app.Services.Task({ title: 'Ate vegetables', points: 150})
  ]);



  // This view turns a Service model into HTML
  app.Views.TaskView = Backbone.View.extend({
    tagName: 'li',

    events:{
      'click': 'toggleService'
    },

    initialize: function(){

      // Set up event listeners. The change backbone event
      // is raised when a property changes (like the checked field)
      this.listenTo(this.model, 'change', this.render);
    },

    render: function(){

      // Create the HTML
      this.$el.html('<input type="checkbox" value="1" name="' + this.model.get('title') + '" /> ' + this.model.get('title') + '<span>' + this.model.get('points') + '</span>');
      this.$('input').prop('checked', this.model.get('checked'));

      // Returning the object is a good practice
      // that makes chaining possible
      return this;
    },

    toggleService: function(){
      this.model.toggle();
    }
  });


  //## HOME
  app.Views.Home = app.Extensions.View.extend({
    className: 'home',
    initialize: function(){


      // Listen for the change event on the collection.
      // This is equivalent to listening on every one of the 
      // tasks objects in the collection.
      this.listenTo(tasks, 'change', this.render);

    },
    render: function () {

      var template = _.template($('script[name=home]').html());
      this.$el.html(template());

      // Create views for every one of the tasks in the
      // collection and add them to the page
      tasks.each(function(task){

        var view = new app.Views.TaskView({ model: task });
        this.$('#tasks').append(view.render().el);

      }, this);

      // Calculate the total eLevel amount by agregating
      // the eLevel of only the checked elements
      var eLevel = 0;

      _.each(tasks.getChecked(), function(elem){
        eLevel += elem.get('points');
      });

      // Update the total eLevel
      this.$('#eLevel span').text(eLevel);

      return app.Extensions.View.prototype.render.apply(this, arguments);
    }

  });






  //## EVAULUATE
  app.Views.EvaluateShow = app.Extensions.View.extend({

    render:function (){
      var eLevel = Backbone.history.eLevel
      if(eLevel > 450){
        this.$el.html('<h1>Healthy As A Horse!!!</h1><iframe width="560" height="315" src="https://www.youtube.com/embed/PEE0cHlWU-w" frameborder="0" allowfullscreen></iframe>');
      }else{
        this.$el.html('<h1>Get it Together!!!</h1><iframe width="560" height="315" src="https://www.youtube.com/embed/UbVr0TwWaPg" frameborder="0" allowfullscreen></iframe>');
      }

      return app.Extensions.View.prototype.render.apply(this, arguments);
    }
  });


  app.Views.Evaluate = app.Extensions.View.extend({

    className: 'evaluate',

    render: function () {
      console.log("working");
      var template = _.template($('script[name=evaluate]').html());
      this.$el.html(template());
      this.subview = new app.Views.EvaluateShow();
      this.subview.setElement(this.$('#health')).render();    

      return app.Extensions.View.prototype.render.apply(this, arguments);
    }

  });




}());