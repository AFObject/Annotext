# Annotext - 文言文字词注释背诵幽默小程序

自用 / [[annotext.vercel.app]] / [[anno.afobject.xyz]]

![](https://p.ipic.vip/5p2t6a.png)

---

## 基本功能

- 文言文原文的录入、删除
- 文言文注释的录入、删除、修改
- 为注释打标签（四色 `GABC` + 重点标记 `U`，8 种状态可选），以及相应的筛选功能
- 美观的界面与深色模式

本地部署后以上内容可持久化保存，网页端暂时为静态、但可导出临时修改的数据。

----

## 文言文录入

左上角的第一个按钮。

录入完毕后不可在 GUI 上修改，只可删除重新添加或者手动修改 `data.json`。

1. 直接复制原文：复制原文，按提示操作即可。会自动处理换行（转化为多个 `<p>` 标记的段落）、多余空格等。
2. 导入带有注释的原文：同上，按提示操作即可，但可在复制的文本内用中文全角 `【】` 括起原文字词，紧随其后带上 `（）` 内标记注释。

```
齐威王召即墨大夫，语之曰："自子之【居】（任官）即墨也，【毁言】（指责的话语）【日至】（每天传来）。然吾使人视即墨，田野【辟】（同“僻”，开垦），人民【给】（富裕），官无事，东方【以】（因而）宁；是子不【事】（此指拍马、奉承）吾左右以求助也。"封之万家。召阿大夫，语之曰："自子守阿，【誉言】（赞美的话语）日至。吾使人视阿，田野不辟，人民贫【馁】（饥饿）。昔日赵攻鄄，子不救；卫取薛陵，子不知；是子【厚币】（重金）事吾左右以求誉也！"是日，烹阿大夫及左右尝誉者。于是群臣耸惧，莫敢【饰诈】（弄虚作假），【务】（力求）尽其情，齐国大【治】（社会安定），强于天下。
```

导入的注释默认标记为 `yellow` 类型。

----

## 注释的录入与编辑

1. 录入注释：在中间原文内选中对应字词，键盘上按下回车，输入注释内容、再按回车，即添加完毕。新添加的注释默认标记为 `yellow` 类型。
2. 编辑或删除注释：右侧注释栏内在对应注释处右键，选择“编辑”或“删除”，按提示操作。

----

## 视图

### 总览

- 右上角的两个按钮可切换是否显示左/右边栏。

### 中栏原文

- 鼠标在字词高亮处悬浮可查看解释。

### 右侧注释栏

- 字词解释内容默认不显示，在对应注释内容上点击以显示单个注释内容。
- 点击顶端的“注释”字样可以为全部注释切换显示/不显示。
- 点击单个注释后，标签选择器将自动展开，可修改对应注释的标签。
- 在顶端的筛选器中选择仅展示特定标签的注释。`G`、`A`、`B`、`C` 为 `或` 关系，与 `U` 为 `与` 关系。

----

## 数据导出

点击左上角第二个按钮可下载 `json` 格式的全部数据。数据格式如下：

```json
{
    "articles": [
        {

            "content": "<p>原文</p>",
            "title": "标题"
            "annotations": [
                {
                    "end": 22,
                    "explanation": "注释内容",
                    "start": 20,
                    "text": "对应字词",
                    "type": "red"
                }, ...
        }, ...
}
```