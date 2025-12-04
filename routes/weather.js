const express = require('express');
const request = require('request');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('weather.ejs', { shopData: req.app.locals.shopData, weatherMsg: null })
})

router.get('/search', (req, res, next) => {
    let apiKey = process.env.OPENWEATHER_API_KEY;
    let city = req.query.city || 'London';
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body){
        if (err) {
            return next(err);
        } 
            // res.send(body);
            let weather;
            try {
                weather = JSON.parse(body);
            } catch (e){
                return res.render('weather.ejs', {
                    shopData: req.app.locals.shopData,
                    weatherMsg: "Error with Weather data."
                })
            }

            if (weather && weather.main){
                let wmsg = `
                <strong>Weather report for ${weather.name}</strong><br>
                The Temperature: ${weather.main.temp}°C (It feels like ${weather.main.feels_like}°C)<br>
                The Condition: ${weather.weather[0].description}<br>
                The Humidity: ${weather.main.humidity}%<br>
                The Wind: ${weather.wind.speed} m/s, direction ${weather.wind.deg}
                `;
                res.render('weather.ejs', { shopData: req.app.locals.shopData, weatherMsg: wmsg });
            } else{
                res.render('weather.ejs', {
                    shopData: req.app.locals.shopData,
                    weatherMsg: `No data has been found for "${city}". Please try another city.`
                });
            }
    });

});

// Export the router object so index.js can access it
module.exports = router;

             

           