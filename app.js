

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash')
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin-magda:test123@cluster0.te97pzx.mongodb.net/blogDB", { useNewUrlParser: true });

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model('Post', postSchema);

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (_req, res) => {
  Post.find({}, (err, foundPosts) => {
    if (!err) {
      res.render("home", { pageContent: homeStartingContent, blogPosts: foundPosts });
    }
  })
})

app.get("/about", (_req, res) => {
  res.render("about", { pageContent: aboutContent });
})

app.get("/contact", (_req, res) => {
  res.render("contact", { pageContent: contactContent });
})

app.get("/compose", (_req, res) => {
  res.render("compose");
})

app.get("/post/:postId", (req, res) => {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, (err, foundPost) => {
    if (!err) {
        res.render("post", { postTitle: foundPost.title, postContent: foundPost.content, postId: requestedPostId });
    }
  }) 
})

app.post("/compose", (req, res) => {

  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  const post = new Post({
    title: postTitle,
    content: postBody
  });
  post.save();

  res.redirect("/");
})

app.post("/post/editpost", (req, res) => {
  console.log(req.body.editButton);
  const postToEditId = req.body.editButton;
  Post.findOne({ _id: postToEditId }, (err, foundPost) => {
    if (!err) {
      res.render("edit", { postTitle: foundPost.title, postContent: foundPost.content, postId: postToEditId });
    }
  })
})

app.post("/edit", (req, res) => {

  const postId = req.body.button;
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  Post.findOneAndUpdate({ _id: postId }, { $set: { title: postTitle, content: postBody } }, (err, foundPost) => {
    if (!err) {
      console.log(foundPost);
      res.redirect("/");
    }
  })
})

app.post("/post/deletepost", (req, res) => {
  const postToDeleteId = req.body.deleteButton;
  Post.findByIdAndRemove(postToDeleteId, (err) => {
    if (!err) {
      res.redirect("/");
    }
  });
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
