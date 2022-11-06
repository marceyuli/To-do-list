const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
const app = express();

mongoose.connect("mongodb+srv://imponicornio:Pelotillehue56@cluster0.wbm498d.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your to do list",
});
const item2 = new Item({
  name: "Hit the  + button to add a new item ",
});
const item3 = new Item({
  name: "<----Hit this to delete an item",
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({}, function (error, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Succes!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (error, foundList) {
    if (!error) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  let listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save(function () {
      res.redirect("/");
    });
  } else {
    List.findOne({ name: listName }, function (error, foundList) {
      foundList.items.push(item);
      foundList.save(function () {
        res.redirect("/" + listName);
      });
    });
  }
});
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (error) {
      if (!error) {
        console.log("Success");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/about", function (req, res) {
  res.render("about.ejs");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
