var express = require("express");
var router  = express.Router({mergeParams: true});
var project = require("../models/project");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find project by id
    console.log(req.params.id);
    project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {project: project});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup project using ID
   project.findById(req.params.id, function(err, project){
       if(err){
           console.log(err);
           res.redirect("/projects");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               project.comments.push(comment);
               project.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/projects/' + project._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
    // find project by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("comments/edit", {project_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
           res.render("edit");
       } else {
           res.redirect("/projects/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId",middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        if(err){
            console.log("PROBLEM!");
        } else {
            res.redirect("/projects/" + req.params.id);
        }
    })
});

module.exports = router;