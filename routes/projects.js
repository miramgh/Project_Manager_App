var express = require("express");
var router  = express.Router();
var project = require("../models/project");
var middleware = require("../middleware");


//INDEX - show all projects
router.get("/", function(_req, res){
    // Get all projects from DB
    project.find({}, function(err, allprojects){
       if(err){
           console.log(err);
       } else {
          res.render("projects/index",{projects :allprojects});
       }
    });
});

//CREATE - add new project to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to projects array
    var name = req.body.name;
    var committee = req.body.committee;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newProject = {name: name, committee:committee , image: image, description: desc, author:author}
    // Create a new project and save to DB
    project.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to projects page
            console.log(newlyCreated);
            res.redirect("/projects");
        }
    });
});

//NEW - show form to create new project
router.get("/new", middleware.isLoggedIn, function(_req, res){
   res.render("projects/new"); 
});

// SHOW - shows more info about one project
router.get("/:id", function(req, res){
    //find the projects with provided ID
    project.findById(req.params.id).populate("comments").exec(function(err, foundProject){
        if(err){
            console.log(err);
        } else {
            console.log(foundProject)
            //render show template with that project 
            res.render("projects/show", {project: foundProject});
        }
    });
});

// EDIT PROJECTS ROUTE
router.get("/:id/edit", middleware.checkProjectOwnership, function(req, res){    
    project.findById(req.params.id, function(_err, foundProject){
        res.render("projects/edit", {project: foundProject});
    });
});

// UPDATE PROJECT ROUTE
router.put("/:id",middleware.checkProjectOwnership, function(req, res){
    // find and update the correct project
    project.findByIdAndUpdate(req.params.id, req.body.project, function(err, _updatedProject){
       if(err){
           res.redirect("/projects");
       } else {
           //redirect somewhere(show page)
           res.redirect("/projects/" + req.params.id);
       }
    });
});

// DESTROY PROJECT ROUTE
router.delete("/:id",middleware.checkProjectOwnership, function(req, res){
    project.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/projects");
      } else {
          res.redirect("/projects");
      }
   });
});


module.exports = router;

