const express = require('express')
const app = express()
const port = 3000
const request = require('request')
var md5 = require('md5-node');
const client_id = "88b792f836994e248b1d594ba4885d7d";
const Client_secret = "aa480065bf09f05436b43b2b2552b525cf8734fc";

/**
 * @desc 多多客获取爆款排行商品接口
 * 3000000次/3600秒
 */
app.get('/', (req, res) => {
    console.log(req.query )
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.top.goods.list.query",
        timestamp: time,
        client_id: client_id,
        limit: req.query.limit == undefined ? 20 : req.query.limit,
        offset: req.query.offset == undefined ? 0 : req.query.offset
    }
    request.post(url, {
        formData: signFun(data),
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        res.send(body)
    }

    })
})

/**
 * @desc 参数加密
 * sign
 */ 
function signFun(data){
    let sign = '';
    let signList = [];
    for (let key in data) {
        signList.push(`${key}${data[key]}`)
    }
    signList = signList.sort();
    signList.forEach(element => {
        sign += element;
    });
    data.sign = md5(`${Client_secret}${sign}${Client_secret}`).toUpperCase();
    return data;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))