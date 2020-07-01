/*
 * @Description: 
 * @Date: 2020-06-29 09:42:24
 * @LastEditors: Astronautics across the sea of stars
 * @LastEditTime: 2020-07-01 10:42:07
 */
const express = require('express')
const app = express()
const port = 3000
const request = require('request')
var md5 = require('md5-node');



/**
 * 拼多多参数
 * client_id 开发者ID
 * Client_secret 多多客ID
 * PID 多多客推广位ID
 */ 
const client_id = "88b792f836994e248b1d594ba4885d7d";
const Client_secret = "aa480065bf09f05436b43b2b2552b525cf8734fc";
const PID = "10820525_145071056";



/**
 * @desc 设置跨域
 **/
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Headers", "content-type"); //允许的header类型
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS"); //跨域允许的请求方式
    if (req.method.toLowerCase() == 'options')
        res.send(200); //让options尝试请求快速结束
    else
        next();
});



/**
 * @desc 多多客获取爆款排行商品接口
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.top.goods.list.query&permissionId=2
 * 3000000次/3600秒
 * @parameter limit = 每页数据数量
 * @parameter offset = 第几页数据
 */
app.get('/goods_list_query', (req, res) => {
    if (!req.query.limit) { return res.send({ message: 'goods_id 参数错误' }) }
    if (!req.query.offset) { return res.send({ message: 'goods_id 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.top.goods.list.query",
        timestamp: time,
        client_id: client_id,
        limit: req.query.limit == undefined ? 20 : req.query.limit,
        offset: req.query.offset == undefined ? 0 : req.query.offset * req.query.limit
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
 * @desc 多多进宝商品详情查询
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.goods.detail&permissionId=2
 * 接口总限流频次：27875次/10秒
 * @parameter goods_id = id
 * */
app.get('/goods_list_detail', (req, res) => {
    if (!req.query.goods_id) { return res.send({ message: 'goods_id 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.goods.detail",
        timestamp: time,
        client_id: client_id,
        goods_id_list: `[${req.query.goods_id - 0}]`
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
 * @desc 获取商品基本信息接口
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.goods.basic.info.get&permissionId=2
 * 接口总限流频次：3000000次/3600秒
 * @parameter goods_id = id
 */
app.get('/goods_basic_info', (req, res) => {
    if (!req.query.goods_id) { return res.send({ message: 'goods_id 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.goods.basic.info.get",
        timestamp: time,
        client_id: client_id,
        goods_id_list: `[${req.query.goods_id - 0}]`
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
 * @desc 多多进宝商品推荐API
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.goods.recommend.get&permissionId=2
 * 0-1.9包邮, 
 * 1-今日爆款, 
 * 2-品牌清仓,
 * 3-相似商品推荐,
 * 4-猜你喜欢,
 * 5-实时热销,
 * 6-实时收益,
 * 7-今日畅销,
 * 8-高佣榜单，
 * 默认1
 * @parameter limit = 每页数据数量
 * @parameter offset = 第几页数据
 * @parameter type = 商品列表类型
 */
app.get('/goods_recommend', (req, res) => {
    if (!req.query.type) { return res.send({ message: 'type 参数错误' }) }
    if (!req.query.limit) { return res.send({ message: 'limit 参数错误' }) }
    if (!req.query.offset) { return res.send({ message: 'offset 参数错误' }) }

    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.goods.recommend.get",
        timestamp: time,
        client_id: client_id,
        channel_type: req.query.type == undefined ? 1 : req.query.type - 0,
        limit: req.query.limit == undefined ? 20 : req.query.limit - 0,
        offset: req.query.offset == undefined ? 0 : req.query.offset * req.query.limit
    }
    if (req.query.type == 3) { data.goods_ids = `[${req.query.goods_id}]` }
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
 * @desc 生成商城-频道推广链接
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.cms.prom.url.generate&permissionId=2
 * */
app.get('/prom_url_generate', (req, res) => {
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.cms.prom.url.generate",
        timestamp: time,
        client_id: client_id,
        goods_id_list: `[${req.query.goods_id - 0}]`,
        channel_type: 0,
        p_id_list: `["${PID}"]`
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
 * @desc 多多客生成单品推广小程序二维码url
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.goods.promotion.url.generate&permissionId=2
 * @parameter goods_id = 商品id
 */
app.get('/promotion_url_generate', (req, res) => {
    if (!req.query.goods_id) { return res.send({ message: 'goods_id 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.goods.promotion.url.generate",
        timestamp: time,
        client_id: client_id,
        goods_id_list: `[${req.query.goods_id - 0}]`,
        p_id: `${PID}`,
        generate_we_app: 'true'
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
 * @desc 多多客生成转盘抽免单url
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.lottery.url.gen&permissionId=2
 * @parameter 
 */
app.get('/lottery_url_gen', (req, res) => {
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.lottery.url.gen",
        timestamp: time,
        client_id: client_id,
        pid_list: `["${PID}"]`,
        generate_we_app: 'true'
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
 * @desc 生成多多进宝频道推广
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.lottery.url.gen&permissionId=2
 * @parameter 4-限时秒杀,39997-充值中心, 39998-神劵，39996-百亿补贴
 */
app.get('/resource_url_gen', (req, res) => {
    if (!req.query.type) { return res.send({ message: 'type 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.resource.url.gen",
        timestamp: time,
        client_id: client_id,
        pid: `${PID}`,
        generate_we_app: 'true',
        resource_type: req.query.type
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
 * @desc 生成营销工具推广链接  - 无权限
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.rp.prom.url.generate&permissionId=2
 * @parameter -1-活动列表，0-默认红包，2–新人红包，3-刮刮卡，4-转盘 ，5-员工内购，6-购物车，7-大促会场
 */
app.get('/rp_prom_url_generate', (req, res) => {
    if (!req.query.type) { return res.send({ message: 'type 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.rp.prom.url.generate",
        timestamp: time,
        client_id: client_id,
        p_id_list: `["${PID}"]`,
        generate_we_app: 'true',
        channel_type: req.query.type
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
 * @desc 多多进宝主题列表查询
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.theme.list.get&permissionId=2
 * @parameter 
 */
app.get('/pdd_ddk_theme_list_get', (req, res) => {
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.theme.list.get",
        timestamp: time,
        client_id: client_id,
        p_id_list: `["${PID}"]`,
        generate_we_app: 'true'
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
 * @desc 多多进宝主题商品列表查询
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.theme.goods.search&permissionId=2
 * @parameter 
 */
app.get('/pdd_ddk_theme_goods_search', (req, res) => {
    if (!req.query.theme_id) { return res.send({ message: 'theme_id 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.theme.goods.search",
        timestamp: time,
        client_id: client_id,
        theme_id: req.query.theme_id
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
 * sign: MD5
 */
function signFun(data) {
    let sign = '';
    let signList = [];
    for (let key in data) { signList.push(`${key}${data[key]}`) }
    signList = signList.sort();
    signList.forEach(element => { sign += element; });
    data.sign = md5(`${Client_secret}${sign}${Client_secret}`).toUpperCase();
    return data;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))