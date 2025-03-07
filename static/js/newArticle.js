function newArticle() {
    let title = prompt(`标题：`);
    if (title && title != '') {
        let text = prompt(`内容：`);
        if (text && text != '') {
            let articleData = processAnnotatedText(text, title);
            globalData.articles.push(articleData);
            saveData();
            location.reload(true);
        }
    }
}

// 带标记的纯文本 -> 处理后的数据结构
// - text: 待处理文本
// - title: 文章标题
// - needAlign: 是否需要格式化文本
function processAnnotatedText(text, title = "", needAlign = true) {
    if (needAlign)
        text = text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                if (line.includes('<h3>')) return line.trim();
                if (line.includes('##')) return line.replace('##', '<h3>').trim() + '</h3>';
                else return `<p>${line.trim()}</p>`;
            })
            .join('');
    // 正则匹配所有注释结构（添加g标志进行全局匹配）
    const pattern = /【(.*?)】\s*（(.*?)）/g;
    const matches = Array.from(text.matchAll(pattern));

    const contentParts = [];
    const annotations = [];
    let prevEnd = 0;

    for (const match of matches) {
        const start = match.index;
        const end = start + match[0].length; // 通过匹配字符串长度计算结束位置
        const originalText = match[1];
        let explanation = match[2];

        // 添加注释前的文本
        contentParts.push(text.slice(prevEnd, start));

        // 计算注释在清理后文本中的位置
        const startInContent = contentParts.join('').length;
        contentParts.push(originalText);
        const endInContent = startInContent + originalText.length;

        let type = "default"
        if (explanation.length > 2) {
            const mark = explanation.slice(0, 2);
            switch (mark) {
                case "gg": type = "gray"; break;
                case "aa": type = "green"; break;
                case "bb": type = "yellow"; break;
                case "cc": type = "red"; break;
                case "gl": type = "gray-underline"; break;
                case "al": type = "green-underline"; break;
                case "bl": type = "yellow-underline"; break;
                case "cl": type = "red-underline"; break;
                default: type = "default";
            }
        }
        if (type === "default")
            type = "yellow";
        else
            explanation = explanation.slice(2);

        // 记录注释信息
        annotations.push({
            text: originalText,
            explanation: explanation,
            type: type,
            start: startInContent,
            end: endInContent
        });

        prevEnd = end;
    }

    // 添加最后一段文本
    contentParts.push(text.slice(prevEnd));
    const cleanContent = contentParts.join('');

    return {
        title: title,
        content: cleanContent,
        annotations: annotations
    };
}

// 数据结构 -> 带标记的纯文本
function exportText(articleIndex = currentArticleIndex) {
    let article = globalData.articles[articleIndex].content;
    let annotations = globalData.articles[articleIndex].annotations;
    // 按索引顺序替换成【原文（注释）】格式
    annotations.sort((a, b) => a.start - b.start); // 确保按顺序替换

    let offset = 0; // 记录插入的字符导致的索引偏移
    annotations.forEach(anno => {
        start = anno.start;
        end = anno.end;
        note = anno.explanation;
        switch (anno.type) {
            case "gray": note = `gg${note}`; break;
            case "green": note = `aa${note}`; break;
            case "yellow": note = `bb${note}`; break;
            case "red": note = `cc${note}`; break;
            case "gray-underline": note = `gl${note}`; break;
            case "green-underline": note = `al${note}`; break;
            case "yellow-underline": note = `bl${note}`; break;
            case "red-underline": note = `cl${note}`; break;
            default: note = `bb${note}`;
        }
        let before = article.slice(0, start + offset);
        let highlighted = `【${article.slice(start + offset, end + offset)}】（${note}）`;
        let after = article.slice(end + offset);
        article = before + highlighted + after;
        offset += highlighted.length - (end - start); // 计算新的偏移量
    });

    return article;
}

function startEdit() {
    document.getElementById("editorOverlay").style.visibility = "visible"; // 显示编辑框
    document.getElementById("editorContainer").style.display = "flex"; // 显示编辑框
    document.getElementById("textEditor").value = exportText(); // 预填充原文
}

function confirmEdit() {
    let editedText = document.getElementById("textEditor").value;
    let newData = processAnnotatedText(editedText, globalData.articles[currentArticleIndex].title, false);
    globalData.articles[currentArticleIndex] = newData;
    saveData();
    loadArticle(currentArticleIndex);
    cancelEdit();
}

function cancelEdit() {
    document.getElementById("editorContainer").style.display = "none";
    document.getElementById("editorOverlay").style.visibility = "hidden";
}