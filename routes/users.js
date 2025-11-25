// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = global.db;

//check if user is logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId){
        res.redirect('/users/login');
    } else {
        next();
    }
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    // saving data in database
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword){
        if (err){
            return res.send("Error Hash password!");
        }
        const sql = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
        const values = [
            req.body.username, 
            req.body.first,
            req.body.last,
            req.body.email,
            hashedPassword
        ];

        db.query(sql, values, function(err, result){
            if (err){
                return res.send("Database error: " + err);
            }

            let response = "Hello " + req.body.first + " " + req.body.last + ", You are now registered!! ";
            response += "We will send an email to you at this email address " + req.body.email + ". ";
            response += "Your password: " + req.body.password + " and the hashed password is: " + hashedPassword;

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
router.post('/loggedin', function (req, res, next){
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
                res.redirect('/');   //Protect page - redirect
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
            return res.redirect('/users/list');
        }
        res.clearCookie('connect.sid');
        res.redirect('/users/login');
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
