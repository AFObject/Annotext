const content = document.getElementById('content');
const annoContextMenu = document.getElementById('anno-context-menu');
const sidebarContextMenu = document.getElementById('sidebar-context-menu');

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
    annoContextMenu.style.display = 'none';
    sidebarContextMenu.style.display = 'none';
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
    // 移除句子翻译
    clone.querySelectorAll(".translation-text").forEach(sup => sup.remove());
    // 移除多余换行
    clone.querySelectorAll("br").forEach(sup => sup.remove());

    // 移除原文每句多余的 <p> 标签，但保留内部格式
    clone.querySelectorAll(".translation-sentence").forEach((p) => {
        const children = Array.from(p.childNodes);
        children.forEach((child) => {
            p.parentNode.insertBefore(child, p);
        });
        p.parentNode.removeChild(p);
    });

    // 移除高亮注释
    clone.querySelectorAll(".highlight").forEach((p) => {
        const text = p.textContent;
        const newTextNode = document.createTextNode(text);
        p.parentNode.replaceChild(newTextNode, p);
    });

    // 特殊标记回转
    clone.innerHTML = clone.innerHTML.replaceAll('<span class="__start-note"></span>', '<p>').replaceAll('<span class="__end-note"></span>', '</p>');
    console.log(clone.innerHTML)

    // **转换为纯文本但保留 <p> 结构**
    return clone.innerHTML.replace(/<\/p>\s*$/i, "");;
}

function showAnnoContextMenu(x, y) {
    annoContextMenu.style.left = `${x}px`;
    annoContextMenu.style.top = `${y}px`;
    annoContextMenu.style.display = 'block';
}

function showSidebarContextMenu(x, y) {
    sidebarContextMenu.style.left = `${x}px`;
    sidebarContextMenu.style.top = `${y}px`;
    sidebarContextMenu.style.display = 'block';
}

function requestEdit(idx1, idx2) {
    let anno = globalData.articles[idx1].annotations[idx2]
    let text = prompt(`编辑“${anno.text}”的释义：`, anno.explanation);
    if (text && text != '') {
        editAnnotation(idx1, idx2, text);
    }
}

function confirmAnnoDeletion(idx1, idx2) {
    let anno = globalData.articles[idx1].annotations[idx2]
    let isConfirmed = confirm(`确认删除注释：${anno.text} - ${anno.explanation}？`);
    if (isConfirmed) {
        deleteAnnotation(idx1, idx2);
    }
}

function confirmArticleDeletion(idx1) {
    let article = globalData.articles[idx1]
    let isConfirmed = confirm(`确认删除 ${article.title} 吗？`);
    if (isConfirmed) {
        deleteArticle(idx1);
    }
}

// ===========
//
// 后端操作
//
// ===========

function deleteArticle(idx1) {
    globalData.articles.splice(idx1, 1);
    saveData();
    location.reload(true);
}

function addAnnotation(text, start, end, explanation) { // 修改保存后端数据
    let newAnn = { text, start, end, explanation, type: "red" };
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

function setType(articleIndex, annIndex, color) {
    const temp = globalData.articles[articleIndex].annotations[annIndex].type
    globalData.articles[articleIndex].annotations[annIndex].type = color;
    if (temp.includes('-underline')) {
        globalData.articles[articleIndex].annotations[annIndex].type += '-underline';
    }
    saveData();
    loadArticle(articleIndex);
}

function toggleUnderline(articleIndex, annIndex) {
    let ann = globalData.articles[articleIndex].annotations[annIndex];
    if (ann.type.includes("underline")) {
        ann.type = ann.type.replace("-underline", "");
    } else {
        ann.type += "-underline";
    }
    saveData();
    loadArticle(articleIndex);
}

function saveData(updatedData = globalData) { // 终极后端保存
    fetch("/update_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    }).then(res => res.json()).then(console.log);
}