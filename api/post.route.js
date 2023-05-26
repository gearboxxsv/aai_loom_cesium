const express = require('express')
const postRoutes = express.Router()

// Require Post model in our routes module
let Post = require('./post.model')

// Defined store route
postRoutes.route('/add').post(function (req, res) {
  let post = new Post(req.body)
  post
    .save()
    .then(() => {
      res.status(200).json({ business: 'business in added successfully' })
    })
    .catch(() => {
      res.status(400).send('unable to save to database')
    })
})

// Defined get data(index or listing) route
postRoutes.route('/').get(function (req, res) {
  Post.find()
    .then(function (posts) {
      res.json(posts)
    })
    .catch(function (err) {
      res.json(err)
    })
})

// Defined edit route
postRoutes.route('/edit/:id').get(function (req, res) {
  let id = req.params.id
  Post.findById(id)
    .then(function (post) {
      res.json(post)
    })
    .catch(function (err) {
      res.json(err)
    })
})

//  Defined update route
postRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id
  Post.findById(id).then(function (post) {
    if (!post) res.status(404).send('data is not found')
    else {
      post.title = req.body.title
      post.body = req.body.body
      post
        .save()
        .then(() => {
          res.json('Update complete')
        })
        .catch(() => {
          res.status(400).send('unable to update the database')
        })
    }
  })
})

// Defined delete | remove | destroy route
postRoutes.route('/delete/:id').delete(function (req, res) {
  Post.findByIdAndRemove({ _id: req.params.id })
    .then(() => {
      res.json('Successfully removed')
    })
    .catch((err) => {
      res.json(err)
    })
})

module.exports = postRoutes
