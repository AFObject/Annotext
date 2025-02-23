function newArticle() {
    let title = prompt(`标题：`);
    if (title == '') {
        return;
    }
    let text = prompt(`内容：`);
    if (text == '') {
        return;
    }
    let articleData = processAnnotatedText(text, title);
    globalData.articles.push(articleData);
    saveData();
    location.reload(true);
}

function processAnnotatedText(text, title = "") {
    text = text.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line.trim()}</p>`)
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
        const explanation = match[2];

        // 添加注释前的文本
        contentParts.push(text.slice(prevEnd, start));

        // 计算注释在清理后文本中的位置
        const startInContent = contentParts.join('').length;
        contentParts.push(originalText);
        const endInContent = startInContent + originalText.length;

        // 记录注释信息
        annotations.push({
            text: originalText,
            explanation: explanation,
            type: "yellow",
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