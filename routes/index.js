var express = require("express");
var router = express.Router();

const request = require("request");
const cheerio = require("cheerio");

const Comments = require("../models/Comments.js");
const Article = require("../models/Article.js");

router.get("/", (req, res) => {
  res.render("scrape")
})

router.get("/scraper", (req, res) => {
  request("http://www.blabbermouth.net/news/", (error, response, html) => {
    const $ = cheerio.load(html);
    // Now, we grab every h1 within an article tag, and do the following:
    $(".category-news").each(function (i, element) {
      // Save an empty result object
      const result = {}
      var a = $(element)
      // result.title = a.find("a").contents().filter(function () {
      //   return this.nodeType == 3
      // })[0].nodeValue;
      result.title = a.find("a").attr("title");
      result.summary = a.children().text();
      result.link = "http://www.blabbermouth.net" + a.find("a").attr("href");
      result.image = a.find('img').attr('src');
      console.log(article);
      Article.create(article)
        .then((data) => console.log(data))
        .catch((err) => res.json(err))
    })
    res.redirect('/articles')
  })
})

router.get('/articles', (req, res) => {
  Article.find({}).sort({ _id: 1 }).limit(20)
    .populate('comments')
    .then(data => {
      var hbsObject = { articles: data }
      res.render('home', hbsObject)
    })
    .catch(err => res.json(err))
})

router.post("/articles/:id", function (req, res) {
  Comments.create(req.body)
    .then(comment => Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: comment } }, { new: true }))
    .then(() => res.redirect('/articles'))
    .catch(err => res.json(err))
});

router.get("/comments/:id", function (req, res) {
  // Using the id passed through id parameter, query the db
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comments")
    .then(function (article) {
      // If we were able to successfully find an Article with the id, send it back to the client
      let comments = article.comments
      var hbsObject = { message: comments }
      res.render('message', hbsObject);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.get('/favorite/:id', (req, res) => {
  Article.findByIdAndUpdate(req.params.id, { $set: { isFav: true } }, { new: true })
    .then(function (update) {
      res.redirect('/articles')
    })
    .catch(function (err) {
      res.json(err);
    })
})

router.get('/remove/:id', (req, res) => {
  Article.findByIdAndUpdate(req.params.id, { $set: { isFav: false } }, { new: true })
    .then(function (update) {
      res.redirect('/articles')
    })
    .catch(function (err) {
      res.json(err);
    })
})

router.get('/saved', (req, res) => {
  Article.find({ isFav: true })
    .then(result => {
      var hbsObject = { saved: result }
      res.render('saved', hbsObject);
    })
    .catch(err => res.json(err))
})

router.get('/delete/comment/:id', (req, res) => {
  Comments.findByIdAndRemove(req.params.id)
    .then(result => res.redirect('/articles'))
    .catch(err => res.json(err))
})

router.get('/article/delete/:id', (req, res) => {
  Article.findByIdAndRemove(req.params.id)
    .then(result => res.redirect('/saved'))
})

router.get('/delete_all', (req, res) => {
  Article.deleteMany({}, response => res.redirect('/'))
})




module.exports = router;
