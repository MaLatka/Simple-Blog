require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const uri = process.env.DB_URI;
mongoose.connect(uri, { useNewUrlParser: true });

//static content for home, about and contact pages
const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const commentSchema = new mongoose.Schema({
  author: String,
  content: String,
  date: {
    type: Date,
    default: Date.now(),
  },
  postId: String,
});

const Comment = mongoose.model("Comment", commentSchema);

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Post = mongoose.model("Post", postSchema);

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.get("/", (_req, res) => {
  Post.find({}, (err, foundPosts) => {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        pageContent: homeStartingContent,
        blogPosts: foundPosts,
      });
    }
  });
});

app.get("/about", (_req, res) => {
  res.render("about", { pageContent: aboutContent });
});

app.get("/contact", (_req, res) => {
  res.render("contact", { pageContent: contactContent });
});

app.get("/compose", (_req, res) => {
  res.render("compose");
});

//catching post id to render the right object on post page
app.get("/post/:postId", (req, res) => {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, (err, foundPost) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      Comment.find({ postId: requestedPostId }, (err, foundComments) => {
        if (err) {
          console.log(err);
        }
        res.render("post", {
          postTitle: foundPost.title,
          postContent: foundPost.content,
          postId: requestedPostId,
          postComments: foundComments,
        });
      });
    }
  });
});

//secret page for writing posts and saving them to DB
app.post("/compose", (req, res) => {
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  const post = new Post({
    title: postTitle,
    content: postBody,
  });
  post.save();

  res.redirect("/");
});

//post edit rout which redirects to the editing page, had to change form route
app.post("/post/editpost", (req, res) => {
  console.log(req.body.editButton);
  const postToEditId = req.body.editPostBtn;
  Post.findOne({ _id: postToEditId }, (err, foundPost) => {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postId: postToEditId,
      });
    }
  });
});

//edit route where the post gets updated in the DB
app.post("/edit", (req, res) => {
  const postId = req.body.button;
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  Post.findOneAndUpdate(
    { _id: postId },
    { $set: { title: postTitle, content: postBody } },
    (err, foundPost) => {
      err ? console.log(err) : res.redirect("/");
    }
  );
});

//deleting posts from DB
app.post("/post/deletepost", (req, res) => {
  const postToDeleteId = req.body.deletePostBtn;
  Post.findByIdAndRemove(postToDeleteId, (err) => {
    err ? console.log(err) : res.redirect("/");
  });
});

//submiting comments to seperate DB with related post ID
app.post("/post/submitcomment", (req, res) => {
  const postId = req.body.submitCommentBtn;
  const userName = req.body.userName;
  const commentText = req.body.commentText;

  const comment = Comment({
    author: userName,
    content: commentText,
    postId: postId,
  });
  comment.save();

  res.redirect(`/post/${postId}`);
});

// deleting comments from DB
app.post("/post/deletecomment", (req, res) => {
  const commentId = req.body.deleteCommentBtn;

  Comment.findByIdAndRemove(commentId, (err, foundComment) => {
    err ? console.log(err) : res.redirect("back");
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
