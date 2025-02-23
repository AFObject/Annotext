document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        let selectionData = getSelectionIndex();
        if (selectionData) {
            let { start, end, selectedText } = selectionData;
            let explanation = prompt(`为 "${selectedText}" 添加注释:`);
            if (explanation) addAnnotation(selectedText, start, end, explanation);
        }
    }
});

function getSelectionIndex() {
    let selection = window.getSelection();
    if (!selection.rangeCount) return null;

    let range = selection.getRangeAt(0);
    let selectedText = range.toString().trim();
    if (!selectedText) return null;

    // **获取 HTML 结构对应的纯文本**
    let articleElem = document.getElementsByClassName("body-text")[0];
    // let preText = getPlainText(articleElem); // 关键：转换为纯文本

    // **获取选中文本在 HTML 里的偏移量**
    let beforeRange = document.createRange();
    beforeRange.setStart(articleElem, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    // **计算 start & end（真实纯文本索引）**
    let preContent = beforeRange.cloneContents();
    let preTextBeforeSelection = getPlainText(preContent);
    let start = preTextBeforeSelection.length;
    let end = start + selectedText.length;
    console.log(start, end, selectedText);

    return { start, end, selectedText };
}

function getPlainText(element) {
    // 克隆节点，避免修改原 HTML
    let clone = document.createElement('div');
    clone.appendChild(element)

    // **移除 <sup> 及其内容**
    clone.querySelectorAll("sup").forEach(sup => sup.remove());

    // **移除 <highlight> 但保留其内容**
    clone.querySelectorAll("span").forEach(hl => {
        let parent = hl.parentNode;
        while (hl.firstChild) parent.insertBefore(hl.firstChild, hl);
        parent.removeChild(hl);
    });

    console.log(clone.innerHTML);

    // **转换为纯文本但保留 <p> 结构**
    return clone.innerHTML.replace(/<\/p>\s*$/i, "");;
}


function addAnnotation(text, start, end, explanation) {
    let newAnn = { text, start, end, explanation, type: "yellow" };
    console.log(newAnn)

    let annotations = globalData.articles[currentArticleIndex].annotations;
    annotations.push(newAnn);

    // **按 start 重新排序**
    annotations.sort((a, b) => a.start - b.start);

    saveData(); // 保存数据并刷新
    loadArticle(currentArticleIndex);
}
