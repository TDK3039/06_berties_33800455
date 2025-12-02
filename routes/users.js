// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = global.db;

const { check, validationResult } = require('express-validator');

//check if user is logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId){
        res.redirect('./login');
    } else {
        next();
    }
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs', { errors: [] });
})

router.post('/registered', 
    [
        check('first').notEmpty().withMessage('Your First Name is required'),
        check('last').notEmpty().withMessage('Your Last name is required'),
        check('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
        check('username').isLength({ min: 5, max: 20}).withMessage('Username has to between 5 and 20 characters'),
        check('password').isLength({ min: 8 }).withMessage('The password must be at least 8 characters long')
                       .matches(/[a-z]/).withMessage('Your password must contain at least one lowercase letter')
                       .matches(/[A-Z]/).withMessage('Your password must contain at least one uppercase letter')
                       .matches(/\d/).withMessage('Your Password must contain at least one number')
                       .matches(/[!@#$%&£*]/).withMessage('Your password must contain at least one special character'),
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            //validation fails, re-render register page with the errors
            return res.render('register.ejs', { errors: errors.array() });
        }
    // saving data in database
    //Sanitise the inputs
    const firstName = req.sanitize(req.body.first);
    const lastName = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const username = req.sanitize(req.body.username);
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword){
        if (err){
            return res.send("Error Hash password!");
        }
        const sql = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
        const values = [
            username, 
            firstName,
            lastName,
            email,
            hashedPassword
        ];

        db.query(sql, values, function(err, result){
            if (err){
                return res.send("Database error: " + err);
            }

            let response = "Hello " + firstName + " " + lastName + ", You are now registered!! ";
            response += "We will send an email to you at this email address " + email + ". ";
            response += "Your password: " + plainPassword + " and the hashed password is: " + hashedPassword;

            res.send(response);
        });
    });                                                                     
}); 
//List users route
router.get('/list', redirectLogin, function (req, res, next){
    const sql = "SELECT username, first, last, email FROM users";
    db.query(sql, (err, result) => {
        if(err){
            next(err);
        } else {
            res.render("listusers.ejs", {
                userList: result, 
                shopData: { shopName: "Bertie's Books"} 
            });
        }
    });
});
//login routes 
router.get('/login', function(req, res, next){
    res.render('login.ejs');
});

//login form submit
router.post('/loggedin', 

    [
        check('username').trim().isLength({ min: 3, max:20 }).withMessage('The Username must be 3-20 characters'),
        check('password').isLength({ min: 8 }).withMessage('The password must be at least 8 characters')
    ],
    function (req, res, next){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //validation fails, re-render the login page with the errors
            return res.status(400).render('login.ejs', { errors: errors.array() });
        }

    const username = req.body.username;
    const plainPassword = req.body.password;

    const sql = "SELECT hashedPassword FROM users WHERE username = ?";
    db.query(sql, [username], function (err, result){
        if (err) {
            return res.send("Database error: " + err);
        }

        if (result.length === 0){
            //Failed login attempt
            db.query("INSERT INTO audit (username, status) VALUES (?, ?)", [username, "FAILURE"]);
            return res.send("Login has Failed: User cannot be found.");
        }

        const hashedPassword = result[0].hashedPassword;

        bcrypt.compare(plainPassword, hashedPassword, function (err, match){
            if (err){
                return res.send("Error comparing passwords.");
            }

            if (match === true){
                db.query("INSERT INTO audit (username, status) VALUES (?, ?)", [username, "SUCCESS"]);
                req.session.userId = username; //save the user session
                res.redirect('../');   //Protect page - redirect
            }else{
                db.query("INSERT INTO audit (username, status) VALUES (?, ?)", [username, "FAILURE"]);
                res.send("Login has failed: Incorrect Password.");
            }
        });
    });
})

//Route - Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err){
            return res.redirect('./list');
        }
        res.clearCookie('connect.sid');
        res.redirect('./login');
    })
})

// Route - audit
router.get('/audit', redirectLogin, function (req, res, next){
    const sql = "SELECT username, status, timestamp FROM audit ORDER BY timestamp DESC";
    db.query(sql, (err, result) => {
        if (err){
            next(err);
        } else {
            res.render("audit.ejs", {
                auditList: result,
                shopData: { shopName: "Bertie's Books"}
            });
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;
