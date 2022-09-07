var express = require('express');
var app = express();
var redis = require("redis");
var client = redis.createClient({
    legacyMode: true
});

client.connect();

app.use(express.static('public'));

client.mSet('header',0,'left',0,'article',0,'ads',0,'right',0,'footer',0);
client.mGet(['header', 'left', 'article', 'ads', 'right', 'footer'],
function(err, value){
    console.log(value);
});

function data(){
    return new Promise((resolve, reject) => {
        client.mGet(['header', 'left', 'article', 'ads', 'right', 'footer'],
            function(err, value){
                const data = {
                    'header': Number(value[0]),
                    'left':    Number(value[1]),
                    'article': Number(value[2]),
                    'ads':     Number(value[3]),
                    'right':   Number(value[4]),
                    'footer':  Number(value[5])
                };
                err ? reject(null) : resolve(data);
                }
        );
    });
}

app.get('/', function (req, res) {
    res.send('Hello World!');
});

// get data , uses promise from above
app.get('/data', function (req, res) {
    data()            
        .then(data => {
            console.log(data);
            res.send(data);                
        });
});

//update data
app.get('/update/:key/:value', function (req, res) {
    const key = req.params.key;
    let value = Number(req.params.value);
    client.get(key, function(err, reply) {

        // new value
        value = Number(reply) + value;
        client.set(key, value);

        // return data to client
        data()            
            .then(data => {
                console.log(data);
                res.send(data);                
            });
    });   
});

app.listen(3000, function () {
    console.log('Running on port: 3000');
});

// process.on("exit", function(){
//     client.quit();
// });