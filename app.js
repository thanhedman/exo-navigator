const http = require('http');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');

app.set('port', process.env.PORT || 4000);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

app.post('/search', function (req, res) {
    var form = req.body;
    if (form.url) {
        apiRequest(form.url)
        .then((response) => {
            res.json(response);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({error: "API Error"});
        });
    } else {
        res.status(400).json({error: "Missing url for api query"});
    }
});

app.listen(app.get('port'), function () {
  console.log('Exoplanet Explorer app listening on port '+app.get('port'));
});

function apiRequest(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            var status_code = res.statusCode,
            content_type = res.headers['content-type'];

            let error;
            if (status_code !== 200 && status_code !== 301) {
                error = new Error(`Request Failed.\n` +
                              `Status Code: ${status_code}`);
            }
            if (error) {
                res.resume();
                return reject(error);
            }

            res.setEncoding('utf8');
            let raw_data = '';
            res.on('data', (chunk) => raw_data += chunk);
            res.on('end', () => {
                try {
                    console.log(raw_data);
                    let parsed_data = JSON.parse(raw_data);
                    return resolve(parsed_data);
                } catch (e) {
                    return reject(e);
                }
            });
        }).on('error', (e) => {
            return reject(e);
        });
    })
    .then((result) => {
        return Promise.resolve(result);
    }, (reason) => {
        throw new Error(reason);
    });
}

