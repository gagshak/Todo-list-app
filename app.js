const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');

//connect to MongoDB by specifying port to access MongoDB server
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://admin-gagan:Test123@cluster0.xoj5f.mongodb.net/todolistDB');
  }

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const itemschema = new mongoose.Schema ({
    name: String
});
  
const Item = new mongoose.model("Item", itemschema);

const work= new Item({
    name: "Work"
});

const food= new Item({
    name: "Food"
});

const exercise= new Item({
    name: "Exercise"
});

const defaultItems= [work, food, exercise]

const listschema = new mongoose.Schema({
    name: String,
    item: [itemschema]
});

const List= new mongoose.model("List", listschema)

app.get("/", function(req,res){

    Item.find({}, function(err,items){
        if(items.length===0){

            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log("Error");
                }else{
                   console.log("Successfully added");    
                }
            });
           res.redirect("/"); 
        }else{
            res.render("list", {kindofDay: "Today", tasklist: items });
        }
    });
   
});

app.get("/:customName", function(req,res){
    const customName = _.capitalize(req.params.customName);
    
    List.findOne({name: customName}, function(err, foundList){
        if(!err){
          if(!foundList){
            const list= List({
                name : customName,
                item : defaultItems
            });
            list.save();
            res.redirect("/"+ customName)
          }else{
            res.render("list", {kindofDay: foundList.name , tasklist: foundList.item });
          }
        }
    });
});


app.post("/", function(req,res){

const itemName = req.body.task;
const kindofDay = req.body.button;

const item = new Item({
    name : itemName
});

  if(kindofDay==="Today"){
    item.save();
    res.redirect("/");
  }else{
      List.findOne({name : kindofDay}, function(err, foundList){
          foundList.item.push(item);
          foundList.save();
          res.redirect("/"+ kindofDay);
      })
  }

});


app.post("/delete", function(req,res){
    const checkedItem = req.body.checkbox;
    const kindofDay = req.body.buttonToDelete;

    if(kindofDay === "Today"){
        Item.findByIdAndRemove(checkedItem , function(err){
            if(err){
                console.log("Error");
            }
            res.redirect("/");
        });
    }else{
        List.findOneAndUpdate({name:kindofDay}, {$pull: {item: {_id: checkedItem}}} , function(err){
            if(!err){
             res.redirect("/"+ kindofDay);
            }      
        });
    }
});


app.get("/work", function(req,res){

    res.render("list", {kindofDay: "Work List" , tasklist: workitems});
})

app.get("/about", function(req,res){
     
     res.render("about");
});


app.listen(process.env.PORT||3000, function(){
    console.log("server is started on port 3000");
});