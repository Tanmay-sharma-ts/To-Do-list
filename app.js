//

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});

const itemsSchema = {
    name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name : "Welcome to your ToDO list!"
});

const item2 = new Item({
    name : "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

    Item.find()
        .then((foundItems) => {

            if(foundItems.length === 0){
                Item.insertMany(defaultItems)
                .then(() => {
                    console.log("Insert successful");
                })
                .catch((err) => {
                    console.log("Error inserting:", err);
                });

                res.redirect("/");
            }
            else{
                res.render("list", {listTitle: "Today", newListItems: foundItems});
            }
        });
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save().then(() => {
            res.redirect("/"); 
        });
    }
    else{
        List.findOne({name: listName})
            .then(foundList => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            });
    }
});

app.get("/:listName", function(req, res){
    const listName =  _.capitalize(req.params.listName);

    List.findOne({ name: listName })
        .then(foundList => {
            if (!foundList) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                });

                list.save().then(() => {
                    res.redirect("/" + listName);
                });

            } 
            else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        })
        .catch(err => {
            console.error(err);
        });


});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndDelete(checkedItemId)
            .then(() => {
                console.log("delete successful");
            })
            .catch((err) => {
                console.log("Error deleting:", err);
            });
        res.redirect("/"); 
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then(() => {
                res.redirect("/" + listName);
            })
            .catch((err) => {
                console.log("Error deleting item from custom list");
            });
    }

   
});

app.post("/work", function(req, res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(3000, function(){
    console.log("Server started at port 3000");
});
