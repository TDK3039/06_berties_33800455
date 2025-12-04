var express = require('express');
var router = express.Router();

//book route
router.get('/books', function (req, res, next){
    const { search, minprice, max_price, sort } = req.query;

    let sql = "SELECT * FROM books";
    const params = [];
    const whereClauses = [];

// Search
    if (search && search.trim() !== ''){
        whereClauses.push ("LOWER(name) LIKE ?");
        params.push(`%${search.toLowerCase()}%`);
    }

// Price
    if (minprice){
        whereClauses.push("price >= ?");
        params.push(Number(minprice));
    }
    if (max_price){
        whereClauses.push("price <= ?");
        params.push(Number(max_price));
    }

    if(whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
    }

    // Sorting
    if (sort ===  'name'){
        sql += " ORDER BY name ASC";
    } else if (sort === 'price'){
        sql += " ORDER BY price ASC";
    }

    db.query(sql, params, (err, result) => {
        if (err){
            res.json(err);
            return next(err);
        } 
            res.json(result);
       })
    });

module.exports = router;