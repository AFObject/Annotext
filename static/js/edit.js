const content = document.getElementById('content');
const contextMenu = document.getElementById('custom-context-menu');

document.getElementById("main-text-content").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        let selectionData = getSelectionIndex();
        if (selectionData) {
            let { start, end, selectedText } = selectionData;
            let explanation = prompt(`为 "${selectedText}" 添加注释:`);
            if (explanation) addAnnotation(selectedText, start, end, explanation);
        }
    }
});

document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
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

function showContextMenu(x, y) {
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';
}

function requestEdit(idx1, idx2) {
    let anno = globalData.articles[idx1].annotations[idx2]
    let text = prompt(`编辑“${anno.text}”的释义：`, anno.explanation);
    if (text && text != '') {
        editAnnotation(idx1, idx2, text);
    }
}

function confirmDeletion(idx1, idx2) {
    let anno = globalData.articles[idx1].annotations[idx2]
    let isConfirmed = confirm(`确认删除注释：${anno.text} - ${anno.explanation}？`);
    if (isConfirmed) {
        deleteAnnotation(idx1, idx2);
    }
}

// ===========
//
// 后端操作
//
// ===========

function addAnnotation(text, start, end, explanation) { // 修改保存后端数据
    let newAnn = { text, start, end, explanation, type: "yellow" };
    let annotations = globalData.articles[currentArticleIndex].annotations;
    annotations.push(newAnn);

    // **按 start 重新排序**
    annotations.sort((a, b) => a.start - b.start);

    saveData();
    loadArticle(currentArticleIndex);
}

function editAnnotation(idx1, idx2, text) { // 修改保存后端数据
    globalData.articles[idx1].annotations[idx2].explanation = text;
    saveData();
    loadArticle(currentArticleIndex);
}

function deleteAnnotation(idx1, idx2) { // 修改保存后端数据
    globalData.articles[idx1].annotations.splice(idx2, 1);
    saveData();
    loadArticle(currentArticleIndex);
}

function saveData(updatedData = globalData) { // 终极后端保存
    fetch("/update_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    }).then(res => res.json()).then(console.log);
}