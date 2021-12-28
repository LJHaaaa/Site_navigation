/* 导入layui提供的方法 */
var layer = layui.layer;
var form = layui.form;
var laypage = layui.laypage;

var q = {
    pageNo: 1,
    pageSize: 5,
    status: 0,
    label: null
}

/* 请求服务器的网址 */
/* const path = 'http://localhost:5555' */

/*定义判断网址是否存在协议，如果有将协议替换成空 */
function judgeAddress(address) {
    var webRegular = /^(http|https|ftp)\:\/\//
    if (webRegular.test(address)) {
        return address.replace(address.match(webRegular)[0], '')
    } else {
        return address
    }
}

/* 定义请求数据的方法 */
function gitdata(paging) {
    $.get(path + '/webdata', paging, function (data) {
        var rows = []
        for (var i = 0; i < data.webdata.length; i++) {
            var webmsg = `
             <tr>
             <td>${i + 1 + ((parseInt(paging.pageNo) - 1) * parseInt(paging.pageSize))}</td>
             <td>${data.webdata[i].websiteName}</td>
             <td>${data.webdata[i].label}</td>
             <td>${data.webdata[i].webSynopsis}</td>
             <td><a href=\/\/${judgeAddress(data.webdata[i].webUrl)}  target="_blank">${data.webdata[i].webUrl}</a></td>
             <td><img src=\/${data.webdata[i].imageurl}></td>
             <td><button data-id=${data.webdata[i].id}  class="layui-btn layui-btn-xs add">编辑</button>&nbsp;<button data-id=${data.webdata[i].id}  class="layui-btn layui-btn-xs del">删除</button></td>
             </tr>`
            rows.push(webmsg)
        }
        $('#webdata-table').html(rows.join(''))
        laypage.render({
            elem: 'web_paging',
            count: data.chang,
            limit: paging.pageSize,
            curr: paging.pageNo,
            jump: function (obj, first) {
                paging.pageNo = obj.curr
                if (!first) {
                    gitdata(paging)
                }
            }
        })
    })
}

/* 定义请求标签数据 */
var getlabeldata = null
function getlabel() {
    $.get('http://127.0.0.1:5555/addlabel', function (cbdata) {
        var rows = []
        var labeldata = []
        rows.push(` <option value="">请选择标签</option>`)
        for (var i = 0; i < cbdata.length; i++) {
            rows.push(`<option value=${cbdata[i].label}>${cbdata[i].label}</option>`)
            labeldata.push(cbdata[i].label)
        }
        getlabeldata = labeldata
        $('#screen select').html(rows.join(''))
        form.render('select', 'screen');
    })
}

form.verify({
    weburl: [
        /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-\(\)]*[\w@?^=%&/~+#-\(\)])?$/
        , '链接格式不对'
    ]
});

/* 当页面加载完毕可以使用里面的代码 */
window.addEventListener('load', function () {
    gitdata(q)
    getlabel()
    /* 添加一个添加网站的弹出层 */
    var add = null
    $('#addweb').on('click', function () {
        $.get(path + '/addlabel', function (cbdata) {
            var rows = []
            for (var i = 0; i < cbdata.length; i++) {
                rows.push(cbdata[i].label)
            }
            var asd = template('addWeb-template1', { label: rows })
            add = layer.open({
                type: 1,
                title: '添加网站',
                area: ['800px', '400px'],
                content: asd,
                success: function () {
                    form.render('select')
                }
            });
        })
    });


    /* 获取图像的数据 */
    var imageData = null
    /* 点击上传图片按钮，会模拟点击事件点击，类型为file文件类型的input框 */
    $('body').on('click', '#imageUpload', function () {
        $('#file-Image').click()
    })

    /* 当文件类型的input框发生变化时，获取到里面的文件数据，并赋值到imageData，方便全局调用 */
    $('body').on('change', '#file-Image', function (e) {
        imageData = (e.target.files[0]);
        var newImageURL = URL.createObjectURL(imageData)
        /*  console.log(newImageURL); */
        $('.showImage').css({
            'background': 'url(' + newImageURL + ') no-repeat',
            'backgroundSize': '200px 200px'
        })
    })

    /* 点击关闭添加网站的弹出层 */
    $('body').on('click', '#upload-cancel', function () {
        layer.close(add)
    })

    /* 发送ajax请求到服务器，添加网站的数据。 */
    /* 因为有文件上传所以ajax会自动刷新页面，所以不需要调用方法重新渲染表格数据。这个问题等以后想办法解决 */
    $('body').on('submit', '#addmessage', function (e) {
        e.preventDefault()
        var filedata = new FormData($('#addmessage')[0])

        var filedata = new FormData($('#addmessage')[0])
        if (imageData == null) {
            layer.msg('请上传图片', { icon: 2 })
            return
        }
        filedata.append('image', imageData)
        $.ajax({
            url: path + '/add',
            type: 'post',
            data: filedata,
            processData: false,
            contentType: false,
            success: function (cbdata) {
                layer.msg(cbdata.msg)
            }
        })
    })

    /* 点击删除该网站数据，会有提示框提示是否删除 */
    $('#webdata-table').on('click', '.del', function () {
        var rowId = $(this).attr('data-id')
        var delWeb = null
        delWeb = layer.confirm('是否删除', function () {
            $.get(path + '/del', { id: rowId }, function (cbdata) {
                layer.msg(cbdata)
                layer.close(delWeb)
                gitdata()
            })
        })
    })

    /* 点击编辑按钮，弹出修改网站的弹出层 */
    var edit = null
    $('#webdata-table').on('click', '.add', function () {
        var rowId = $(this).attr('data-id')
        console.log(getlabeldata);
        $.get(path + '/edit', { id: rowId }, function (cbdata) {
            var edite = template("ed", { editmsg: cbdata[0], editlaber: getlabeldata })
            edit = layer.open({
                type: 1,
                title: '修改网站',
                area: ['600px', '350px'],
                content: edite,
                success: function () {
                    form.render('select')
                }
            })
        })
    })

    /* 点击关闭修改网站弹出层*/
    $('body').on('click', '#editmsg .upload-cancel', function () {
        layer.close(edit)
    })

    /* 修改网站弹出层的表单提交 */
    $('body').on('submit', '#editmsg', function (e) {
        e.preventDefault()
        $.post(path + '/editmsg', $(this).serialize(), function (cbdata) {
            layer.msg(cbdata)
            layer.close(edit)
            gitdata()
        })
    })

    /* 当标签筛选失去焦点时，根据表单的数据，发起get请求，获取到相应的数据 */
    $('body').on('blur', '#screen .layui-select-title', function (e) {
        e.preventDefault()
        q.label = $("#screen select").val()
        gitdata(q)
    })

    /* 重置标签筛选的表单，并将对应数据通过get请求获取回来 */
    $('#screen .reset').on('click', function () {
        q.label = null
        gitdata(q)
        $('#screen')[0].reset()
    })
})









