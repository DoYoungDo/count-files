const hx = require('hbuilderx');
const fs = require("fs");
const path = require("path");
// const nls = require('hxnls');?
// let localize = nls.loadMessageBundle();

// key:ext value:count
const countMap = new Map;

function count(dir, recursion = true) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        if (item === '.' || item === '..' || item === '.DS_Store') {
            return;
        }
        const filePath = path.join(dir, item);
        if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isFile()) {
                let ext = path.extname(filePath);
                ext = (ext === "") ? "无后缀" : ext;

                countMap.set(ext, countMap.has(ext) ? (countMap.get(ext) + 1) : 1);
            }
            else {
                if (recursion) {
                    count(filePath);
                }
            }
        }
    })
}

//该方法将在插件激活的时候调用
function activate(context) {
    let disposable = hx.commands.registerCommand('count-files', (param) => {
        countMap.clear();
        hx.window.setStatusBarMessage('正在统计', 5000, 'info');
        if (fs.existsSync(param.fsPath) && fs.statSync(param.fsPath).isDirectory()) {
            count(param.fsPath);

            function getFormItems(options) {
                const dialogTitle = "统计文件数量"
                const dialogFooter = ""
                let count = 0;
                let items = [];
                for (let [key, value] of countMap) {
                    count += value;
                    items.push({
                        columns: [{
                                label: key + " 文件"
                            },
                            {
                                label: value + ""
                            }
                        ]
                    })
                }

                items = items.sort((a, b) => Number(b.columns[1].label) - Number(a.columns[1].label));

                return {
                    title: dialogTitle,
                    footer: dialogFooter,
                    formItems: [{
                        type: "label",
                        name: "label",
                        text: `文件总数：<span style="color:red;">${count}</span> 个`
                    }, {
                        type: "list",
                        title: "统计",
                        name: "list",
                        columnStretches: [1, 1],
                        items: items,
                        value: 0,
                    }]
                }
            }
            const btnCancelText = "取消(&C)"
            const btnOkText = "确定(&O)"

            hx.window.showFormDialog({
                ...getFormItems(),
                width: 450,
                height: 400,
                customButtons: [{
                    text: btnOkText,
                    role: "accept"
                }],
                onOpened: async function() {},
                onChanged: async function(name, value, data) {},
                validate: async function() {
                    return true;
                }
            })
        }
    });
    //订阅销毁钩子，插件禁用的时候，自动注销该command。
    context.subscriptions.push(disposable);
}
//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}
module.exports = {
    activate,
    deactivate
}