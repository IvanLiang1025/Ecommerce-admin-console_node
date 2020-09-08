
const Category = require("../models/category");
const errorHandler = require("../helpers/dbErrorHandler");



function findCategoryById(req, res, next, id) {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "can not find the category"
      })
    }
    req.category = category;
    next();
  })
}

function createCategory(req, res, next) {
  const category = new Category(req.body);
  category.save()
    .then(result => {
      res.json({ category: result });
    })
    .catch(err => {
      return res.status(400).json({
        error: errorHandler(err)
      })
    })
}

function findCategory(req, res) {
  res.json({
    category: req.category
  })
}


// ivan 20200507
function getAllCategory(req, res) {
  console.log(req.query);
  let { limit, page } = req.query;
  const order = "desc";
  const sortBy = "createdAt";
  // const limit = (lim && parseInt(lim)) || 6;
  // const skip = (page && parseInt(page)) || 1;
  if (!limit || !page) {
    Category.find()
      .sort([[sortBy, order]])
      .exec((err, categories) => {
        if (err) {
          res.status(500).json({});
          return;
        }
        res.json({
          status: 0,
          list: categories,
          total: categories.length
        });
      })
    return;
  }

  const lim = parseInt(limit);
  const skip = parseInt(page)

  Category.countDocuments()
    .exec((err, count) => {
      if (err) {
        res.status(500).json({});
        return;
      } else {
        Category.find()
          .sort([[sortBy, order]])
          .skip((skip - 1) * lim)
          .limit(lim)
          .exec((err, categories) => {

            if (err) {
              res.status(500).json({});
              return;
            }
            res.json({
              status: 0,
              list: categories,
              total: count
            });
          })
      }
    })
}


function addUpdateCategory(req, res) {
  const { categoryId } = req.body;

  if (categoryId) {
    Category.findOneAndUpdate({ _id: categoryId },
      req.body,
      { new: true },
    )
      .exec()
      .then(user => {
        // user.password = undefined;
        return res.json({ status: 0, data: {} });
      })
      .catch(err => {
        return res.status(500).json({})
      })
  } else {
    const category = new Category(req.body);
    category.save((error, category) => {
      if (error) {
        return res.status(500).json({})
      }
      res.json({
        status: 0,
        data: {}
      });
    })
  }
}


function deleteCategory(req, res) {
  const { categoryId } = req.body;
  if (!categoryId) {
    return res.status(400).json({})
  }

  Category.deleteOne({ _id: categoryId })
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({})
      }
      res.json({
        status: 0,
        data: {}
      })
    })
}

module.exports = {
  findCategoryById,
  createCategory,
  findCategory,


  // ivan 20200507
  getAllCategory,
  addUpdateCategory,
  deleteCategory,
};