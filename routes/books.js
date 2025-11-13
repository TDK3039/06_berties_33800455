// Create a new router
const express = require("express");
const { search } = require("./main");
const router = express.Router()

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search_result', function (req, res, next) {
    //searching in the database
    let keyword = req.query.search_text;
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    db.query(sqlquery, ['%' + keyword + '%'], (err, result) => {
        if(err){
            next(err);
        } else{
            res.render("searchresult.ejs", { searchResults: result, keyword: keyword});
        };
    });
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err); // pass error to Express error handler
        } else {
            res.render("list.ejs", { availableBooks: result});
        }
    });
});

//Bargaining the books
router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("bargainbooks.ejs", { bargainBooks: result });
        }
    });
});

//Adding books
router.get('/addbook', function (req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', function (req, res, next) {
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send('This book is added to database, name: ' + req.body.name + ', price: £' + req.body.price);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router
