const express = require('express') /* express 用来快速搭建web服务器 */
const cors = require('cors') /* cors 解决前端请求的跨域问题 */
const mysql = require('mysql')/* mysql 用来连接mysql数据库，进行数据库的增删改查 */
const bodyparser = require('body-parser')/* body-parser 用来获取post请求的数据 */
const multer = require('multer')/* multer 用来将上传的文件存储到指定的文件夹

/* 定义连接数据库的信息 */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'guanjia',
})

/* 创建express实例对象 */
const app = express()
/* 指定存储文件的路径 */
const upload = multer({ dest: 'uploads/' })

/*定义判断网址是否存在协议，如果有将协议替换成空 */
function judgeAddress(address) {
    var webRegular = /^(http|https|ftp)\:\/\//
    if (webRegular.test(address)) {
        return address.replace(address.match(webRegular)[0], '')
    } else {
        return address
    }
}

/* 用express提供的use方法，把cors和bodyparser两个包当做全局插件使用 */
app.use(cors())
app.use(bodyparser.urlencoded({ extended: false }))

/* 添加网站，处理请求过来的信息并添加到数据库 */
app.post('/add', upload.single('image'), function (req, res, err) {
    var sqlStr = 'insert into addweb (websiteName,webSynopsis,webUrl,imageurl,label) values (?,?,?,?,?)'
    connection.query(sqlStr, [req.body.webName, req.body.webSynopsis, judgeAddress(req.body.webUrl), req.file.path, req.body.label], function (err) {
        if (err) throw err
        res.send({ msg: '添加成功' })
    })
})

/* 测试专用 */
app.post('/try', function (req, res, err) {

})

/* 响应请求的网站数据 */
app.get('/webdata', function (req, res, err) {
    var tiao = (parseInt(req.query.pageNo) - 1) * parseInt(req.query.pageSize)
    if (req.query.label == undefined || !req.query.label) {
        connection.query('select * from addweb where status = ?', [req.query.status], function (err, rulit) {
            if (err) throw err
            var target = rulit.length
            sqlstr = 'select * from addweb where status = ? limit ?,?'
            connection.query(sqlstr, [req.query.status, tiao, parseInt(req.query.pageSize)], function (err, ruslit2) {
                if (err) throw err
                res.send({ webdata: ruslit2, chang: target })
            })
        })
    } else {
        connection.query('select * from addweb where status = ? and label = ?', [req.query.status, req.query.label], function (err, rulit) {
            if (err) throw err
            var target = rulit.length
            sqlstr = 'select * from addweb where status = ? and label = ? limit ?,?'
            connection.query(sqlstr, [req.query.status, req.query.label, tiao, parseInt(req.query.pageSize)], function (err, ruslit2) {
                if (err) throw err
                res.send({ webdata: ruslit2, chang: target })
            })
        })
    }
})

app.get('/getwebdata', function (req, res, err) {
    var sqlstr = 'select * from addweb where status = 0'
    connection.query(sqlstr, function (err, ruslit) {
        if (err) throw err
        res.send(ruslit)
    })
})
app.get('/webscreen', function (req, res, err) {
    var sqlstr = ''
    if (req.query.label == '') {
        sqlstr = 'select * from addweb where status = 0'
        connection.query(sqlstr, function (err, ruslit) {
            if (err) return res.send('获取数据失败')
            res.send(ruslit)
        })
    } else {
        sqlstr = 'select * from addweb where status = 0 and label = ?'
        connection.query(sqlstr, [req.query.label], function (err, ruslit) {
            if (err) return res.send('获取数据失败')
            res.send(ruslit)
        })
    }
})

/* 删除网站 */
app.get('/del', function (req, res, err) {
    var sqlstr = 'update addweb set status = 1 where id = ?'
    connection.query(sqlstr, [req.query.id], function (err, ruslit) {
        if (err) res.send('删除失败')
        res.send('删除成功')
    })
})

/* 编辑网站，获取要编辑网站的数据 */
app.get('/edit', function (req, res, err) {
    var sqlstr = 'select * from addweb where id = ?'
    connection.query(sqlstr, [req.query.id], function (err, ruslit) {
        if (err) res.send('没有该条记录')
        res.send(ruslit)
    })
})

/* 提交修改的网站数据 */
app.post('/editmsg', function (req, res, err) {
    console.log(req.body);
    var sqlstr = 'update addweb set websiteName = ? ,webSynopsis = ? , webUrl = ? where id = ?'
    connection.query(sqlstr, [req.body.webName, req.body.webSynopsis, req.body.webUrl, req.body.id], function (error, results) {
        if (error) throw error
        res.send('修改成功')
    })
})

/* 请求和添加标签 */
app.get('/addlabel', function (req, res, err) {
    var sqlstr = ''
    if (req.query.label == undefined) {
        sqlstr = 'select * from category where status = 0'
        connection.query(sqlstr, function (err, results) {
            if (err) throw err
            res.send(results)
        })
    } else {
        sqlstr = 'insert into category (label) values(?)'
        connection.query(sqlstr, [req.query.label], function (err, results) {
            if (err) throw err
            res.send('添加成功')
        })
    }
})

/* 查找标签数据 */
app.post('/search', function (req, res, err) {
    sqlstr = 'select * from category where id = ?'
    connection.query(sqlstr, [req.body.id], function (err, results) {
        if (err) throw err
        res.send(results)
    })
})

/* 修改数据库中指定标签的数据 */
app.post('/editlabel', function (req, res, err) {
    sqlstr = 'update category set label= ? where id = ?'
    connection.query(sqlstr, [req.body.newlabel, req.body.id], function (err, results) {
        if (err) throw err
        connection.query('update addweb set label= ? where label = ?', [req.body.newlabel, req.body.oldlabel], function (err, results) {
            if (err) throw err
            res.send('修改成功')
        })
    })
})

/* 修改数据库中指定标签的状态 */
app.post('/dellabel', function (req, res, err) {
    sqlstr = 'update category set status = 1 where id = ?'
    connection.query(sqlstr, [req.body.id], function (err, results) {
        if (err) throw err
        res.send('删除成功')
    })
})

/* 监听服务端口 */
app.listen('5555', function () {
    console.log('5555端口启用htpp服务');
})