// Index - show all campgrounds
var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

router.get("/", function(req,res){
	// Get all campgrounds from DB
	Campground.find({},function(err,allcampgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/index",{campgrounds:allcampgrounds});
		}
	});
})

// Create
router.post("/",middleware.isLoggedIn, function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name , price: price , image: image, description: description, author: author};
	//Create a new campground and save to database
	Campground.create(newCampground,function(err,newlyCreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	})	
})

router.get("/new",middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new")
})

// Show - shows more info about one campground
router.get("/:id",function(req,res){
	//find campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}else{
			//render show template with that campground
			res.render("campgrounds/show",{campgrounds : foundCampground});
		}
	});
})

// Edit Campground Route
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		res.render("campgrounds/edit",{campground:foundCampground});
	});
});
	
// Update Campground Route
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	// find and update the correct campgrounds
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
	// redirect somewhere	
});

// Destroy Campground Route
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndDelete(req.params.id,function(err){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds");
		};
	});
});

// middleware
/**function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

function checkCampgroundOwnership(req,res,next){
	//Is user logged in
	if(req.isAuthenticated()){
			Campground.findById(req.params.id,function(err,foundCampground){
				if(err){
					res.redirect("back");
				}else{
					//does user own the campgrounds?
					if(foundCampground.author.id.equals(req.user._id)){
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
		
};**/

module.exports = router;