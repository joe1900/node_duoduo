/*
 * @Description: 
 * @Date: 2020-06-29 09:42:24
 * @LastEditors: Astronautics across the sea of stars
 * @LastEditTime: 2020-07-04 14:23:30
 */
const express = require('express')
const app = express()
const request = require('request')
var md5 = require('md5-node');
var path = require('path')
var fs = require('fs'); 
  
//可以分别设置http、https的访问端口号 
var PORT = 3000; 
var SSLPORT = 3030; 

//使用nodejs自带的http、https模块 
var http = require('http'); 
var https = require('https'); 
  
//根据项目的路径导入生成的证书文件 
var privateKey = fs.readFileSync(path.join(__dirname, './ssl/4151832_xn--kcr98bj2hba.top.key'), 'utf8'); 
var certificate = fs.readFileSync(path.join(__dirname, './ssl/4151832_xn--kcr98bj2hba.top.pem'), 'utf8'); 
var credentials = {key: privateKey, cert: certificate}; 
  
var httpServer = http.createServer(app); 
var httpsServer = https.createServer(credentials, app); 
  

  
//创建http服务器 
httpServer.listen(PORT, function() { 
  console.log('HTTP Server is running on: http://localhost:%s', PORT); 
});   
//创建https服务器 
httpsServer.listen(SSLPORT, function() { 
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT); 
});



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
    if (!req.query.limit) { return res.send({ message: 'limit 参数错误' }) }
    if (!req.query.offset) { return res.send({ message: 'offset 参数错误' }) }
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
 * @desc 生成商城-频道推广链接
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.cms.prom.url.generate&permissionId=2
 * @parameter 0, "1.9包邮"；1, "今日爆款"； 2, "品牌清仓"； 4,"PC端专属商城"；不传值为默认商城
 */
app.get('/pdd_ddk_cms_prom_url_generate', (req, res) => {
    if (!req.query.type) { return res.send({ message: 'type 参数错误' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.cms.prom.url.generate",
        timestamp: time,
        client_id: client_id,
        channel_type: req.query.type,
        generate_mobile: 'true',
        p_id_list: `["${PID}"]`,
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
 * @desc 查询商品标签列表
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.goods.opt.get&permissionId=2
 * @parameter 
 */
app.get('/pdd_goods_opt_get', (req, res) => {
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.goods.opt.get",
        timestamp: time,
        client_id: client_id,
        parent_opt_id: 0
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
 * @desc 多多进宝商品查询
 * @document https://open.pinduoduo.com/application/document/api?id=pdd.ddk.goods.search&permissionId=2
 * @parameter keyword = 搜索关键词
 * sort_type 
 * 排序方式:
 * 0-综合排序;
 * 1-按佣金比率升序;
 * 2-按佣金比例降序;
 * 3-按价格升序;
 * 4-按价格降序;
 * 5-按销量升序;
 * 6-按销量降序;
 * 7-优惠券金额排序升序;
 * 8-优惠券金额排序降序;
 * 9-券后价升序排序;
 * 10-券后价降序排序;
 * 11-按照加入多多进宝时间升序;
 * 12-按照加入多多进宝时间降序;
 * 13-按佣金金额升序排序;
 * 14-按佣金金额降序排序;
 * 15-店铺描述评分升序;
 * 16-店铺描述评分降序;
 * 17-店铺物流评分升序;
 * 18-店铺物流评分降序;
 * 19-店铺服务评分升序;
 * 20-店铺服务评分降序;
 * 27-描述评分击败同类店铺百分比升序，
 * 28-描述评分击败同类店铺百分比降序，
 * 29-物流评分击败同类店铺百分比升序，
 * 30-物流评分击败同类店铺百分比降序，
 * 31-服务评分击败同类店铺百分比升序，
 * 32-服务评分击败同类店铺百分比降序
 * 店铺类型
 * merchant_type
 * 店铺类型，
 * 1-个人 ，
 * 2-企业 ，
 * 3-旗舰店 ，
 * 4-专卖店 ，
 * 5-专营店 ，
 * 6-普通店
 * 0-全部
 */
app.get('/pdd_ddk_goods_search', (req, res) => {
    if (!req.query.keyword) { return res.send({ message: 'keyword 参数错误（搜索关键词）' }) }
    if (!req.query.page) { return res.send({ message: 'page 参数错误（页码）' }) }
    if (!req.query.sort_type) { return res.send({ message: 'sort_type 参数错误（排序方式）' }) }
    if (!req.query.merchant_type) { return res.send({ message: 'merchant_type 参数错误（店铺类型）' }) }
    let url = `https://gw-api.pinduoduo.com/api/router`;
    let time = `${+(new Date())}`
    let data = {
        type: "pdd.ddk.goods.search",
        timestamp: time,
        client_id: client_id,
        keyword: req.query.keyword,
        with_coupon: 'true',
        sort_type: req.query.sort_type,
        merchant_type: req.query.merchant_type,
        page: req.query.page,
        page_size: 30
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
 * @desc 根据URL获取html文本
 * @desc url
 * */ 
app.get('/url_html', (req, res) => {
    if (!req.query.url) { return res.send({ message: 'url 参数错误' }) }
    let url = req.query.url;
    request.get(url, {
        formData: {},
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

