// ====================
// Comments Routes
// ====================
var express = require("express");
var router  = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

//Comments create
router.get("/new", middleware.isLoggedIn, function(req,res){
	//find campground by id
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new",{campground:campground});
		}
	})
});

//Comments new
router.post("/", middleware.isLoggedIn, function(req,res){
	// lookup campgrounds using ID
	Campground.findById(req.params.id, function(err,campground){
		if(err){
			req.flash("error","Something went wrong!");
			console.log(err);
			res.redirect("/campgrounds");
		}else{
			Comment.create(req.body.comment, function(err,comment){
				if(err){
					console.log(err);
				}else{
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success","Successfully added comments!");
					res.redirect("/campgrounds/"+campground._id);
				}
			})
		}
	})
})

// edit comment
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}else{
			res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
		}	
	})	
});

//update comments
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
});

//Comment destroy router
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	//findByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment deleted!");
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

// middleware
/**function checkCommentOwnership(req,res,next){
	//Is user logged in
	if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id,function(err,foundComment){
				if(err){
					res.redirect("back");
				}else{
					//does user own the comment?
					if(foundComment.author.id.equals(req.user._id)){
						next();
					}
					else{
						res.redirect("back");
					}
				}
			});
	}else{
		res.redirect("back");
	}
		
};

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}**/
module.exports = router;