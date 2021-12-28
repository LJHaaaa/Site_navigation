/* 定义日期的函数 */
function gettime() {
    function zeroize(data) {
        return data <= 9 ? "0" + data : data
    }
    var week = ["日", "一", "二", "三", "四", "五", "六"]
    var now = new Date()
    var y = now.getFullYear()
    var m = zeroize(now.getMonth() + 1)
    var d = zeroize(now.getDate())
    var x = now.getDay()
    var hh = zeroize(now.getHours())
    var mm = zeroize(now.getMinutes())
    var ss = zeroize(now.getSeconds())
    return y + "年" + m + "月" + d + "日" + "&nbsp;星期" + week[x] + " " + hh + ":" + mm + ":" + ss
}

/* 定义获取标签数据的 */
var labelData = null
function getlabel() {
    $.get(path + '/addlabel', function (cbdata) {
        labelData = cbdata
        var rows = []
        for (var i = 0; i < cbdata.length; i++) {
            rows.push(`<li><a href="#leftNav${cbdata[i].id}"> ${cbdata[i].label}</a ></li > `)
        }
        rows.push(`<li><a href="/html/manageIndex.html"> 管理后台</a ></li > `)
        $('.leftNav').html(rows.join(''))
    })
}

function getweb() {
    $.get(path + '/getwebdata', function (cbdata) {
        var cardData = template('labelTemplate', { web: cbdata, label: labelData })
        $('.part').html(cardData)
    })
}


/* 当页面加载完，会自动加载里面的代码 */
window.addEventListener('load', function () {
    getlabel()
    getweb()
    /* 给导航右侧添加时钟 */
    var nowtime = window.setInterval(function () {
        $('.time').html("<p>" + gettime() + "</p>")
    }, 1000)

    /* 右侧返回顶部的显示与隐藏，和返回顶部的功能 */
    var gundong = null
    $('.rightNav').on('click', function () {
        gundong = setInterval(function () {
            var step = ($('html')[0].scrollTop) / 10
            step = step > 0 ? Math.ceil(step) : Math.floor(step);
            if ($('html')[0].scrollTop == 0) {
                clearInterval(gundong)
            }
            $('html')[0].scrollTop = $('html')[0].scrollTop - step
        }, 8)
    })

    window.addEventListener('scroll', function () {
        if ($('html')[0].scrollTop >= 300) {
            $('.rightNav').show()
        } else {
            $('.rightNav').hide()
        }
    })

    /* 左侧导航栏,排他思想 */
    $('body').on('click', '.leftNav a', function () {
        $(this).css("color", "orange").parent().siblings().children().css("color", "#000")
    })
})