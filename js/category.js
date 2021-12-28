var layer = layui.layer
/* const path = 'http://localhost:5555' */

/* 请求标签数据，并渲染到指定的表格中 */
function getData() {
    $.get(path + '/addlabel', function (cbdata) {
        if (cbdata) {
            var rows = []
            for (var i = 0; i < cbdata.length; i++) {
                var labelTemplate = `<tr>
            <td>${i + 1}</td>
            <td>${cbdata[i].label}</td>
            <td><button class="layui-btn edit" data-id="${cbdata[i].id}">编辑</button>&nbsp;&nbsp;<button class="layui-btn del"
                    data-id="${cbdata[i].id}" >删除</button>
            </td>
        </tr>`
                rows.push(labelTemplate)
            }
            $('.labelData').html(rows.join(''))
        }
    })
}


/* 当页面加载完毕，调用里面的代码 */
window.addEventListener('load', function () {
    /* 请求标签数据 */
    getData()
    /* 添加标签 */
    $('form').on('submit', function (e) {
        e.preventDefault()
        $.get(path + '/addlabel', $(this).serialize(), function (cbdata) {
            layer.msg(cbdata)
            $('form')[0].reset()
            getData()
        })
    })

    /* 编辑标签的弹出层 */
    var layerEdit = null
    $('body').on('click', '.edit', function () {
        var labelmsg = $(this).attr('data-id')
        console.log(labelmsg);
        $.post(path + '/search', {
            id: labelmsg
        }, function (cbdata) {
            var template = ` <form id="editForm">
              <input type="hidden" name="id" value=${cbdata[0].id}>
              <input type="hidden" name ="oldlabel" value=${cbdata[0].label}>
              <div class="layui-form-item">
                  <label class="layui-form-label">标签</label>
                  <div class="layui-input-block">
                      <input type="text" name="newlabel" placeholder="请输入标签" autocomplete="off" class="layui-input" value=${cbdata[0].label}>
                  </div>
              </div>
               <div class="layui-form-item">
                  <div class="layui-input-block">
                      <button class="layui-btn getedit">立即提交</button>
                      <button type="button" class="layui-btn cancel">取消</button>
                  </div>
              </div>
              </form>
             
          `
            layerEdit = layer.open({
                type: 1,
                title: '在线调试',
                area: ['400px'],
                content: template
            });
        })
    })

    /* 提交修改标签的数据 */
    $('body').on('submit', '#editForm', function (e) {
        e.preventDefault()
        $.post(path + '/editlabel', $(this).serialize(), function (cbdata) {
            layer.msg(cbdata)
            layer.close(layerEdit)
            getData()
        })
    })

    /* 取消编辑标签，并关闭弹出层 */
    $('body').on('click', '#editForm .cancel', function () {
        layer.close(layerEdit)
    })

    /* 确认是否删除 */
    $('body').on('click', '.del', function () {
        var labelmsg = $(this).attr('data-id')
        layer.confirm('是否删除', { icon: 3, title: '提示' }, function () {
            $.post(path + '/dellabel', { id: labelmsg }, function (cbdata) {
                layer.msg(cbdata);
                layer.close(layerEdit);
                getData()
            })
        });
    })
})