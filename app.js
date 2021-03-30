
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});

const itemschema= new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemschema);

const item1 = new Item({
  name:"welcome to To do list"
});

const item2 = new Item({
  name:"press '+' button to add new task "
});

const defaultitem = [item1,item2]; //for the list only

//adding items to our database , it is commented to prevent it from getting added again

// Item.insertMany([item1,item2],function(err){
//   if(err){
//     console.log(err);
//   } else {
//     console.log("success");
//   }
// })

//list

const listschema= new mongoose.Schema({
  name:String,
  items:[itemschema]
});

const List=mongoose.model("List",listschema)// here List is the model name

const workItems = [];


app.get("/", function(req, res) {

Item.find({},function(err,itemfound){
  if(err){
    console.log(err);
  } else {
    if (itemfound.length==0) {
      Item.insertMany([item1,item2],function(err){
        if(err){
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/");
    }
    else {
        res.render("list", {listTitle: "Today", newListItems: itemfound });
    }

  }
})


});

app.post("/", function(req, res){

  const newitem = req.body.newItem;
  const listName=req.body.list;// tell us in which cuustom list the submit button is pressed i.e work,home,lunch etc

  const nitem=new Item({
    name:newitem
  });

  if(listName=="Today"){
    nitem.save();
    res.redirect("/");

  }
  else {
    List.findOne({name:listName},function(err,foundlist){
      if(!err){
        foundlist.items.push(nitem);
        foundlist.save();
        res.redirect("/"+listName);
      }
    })
  }

});

app.post("/delete",function(req,res){
  let checkeditem = req.body.checkbox;
  let listname=req.body.listname;
  if(listname=="Today"){
    Item.findByIdAndRemove(checkeditem,function(err){
      if(err){
        console.log(err);
      }
      else {
        console.log("successfully deleted item");
      }
    })
    res.redirect("/");

  }else {
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditem}}},function(err,foundlist){
      console.log("successfully deleted item from custom list");
      res.redirect("/"+listname);



    })
  }
  })

app.get("/:user",function(req,res){

  var customlistname=_.capitalize(req.params.user);
  List.findOne({name:customlistname},function(err,foundlist){
    if (!err) {
      if (!foundlist) {
        //create new list

        const newlist = new List({
          name:customlistname,
          items:defaultitem
        });
        newlist.save();
        res.redirect("/"+customlistname);

      }
      else {
        //show exsisting list
          res.render("list", {listTitle: customlistname, newListItems: foundlist.items })
      }

    }


  })


});
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
