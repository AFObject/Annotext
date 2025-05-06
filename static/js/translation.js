var showingTranslation = false;

function addTranslation(idx1, text) { // 修改保存后端数据
    globalData.articles[idx1].translation = text;
    saveData();
    loadArticle(currentArticleIndex);
}

function splitTextBySentences(text) {
    // 使用正则表达式匹配句子分隔符（包括后续可能的引号），并分割句子
    const splits = text.split(/([。！？；]+(?:\.{6}|……)?["'“‘”’]?(?:\.{6}|……)?)/g);
    const sentences = [];
    let currentSentence = '';

    for (let i = 0; i < splits.length; i++) {
        const part = splits[i] || '';
        if (i % 2 === 0) {
            // 句子内容部分
            currentSentence += part;
        } else {
            // 分隔符部分，组合成完整句子
            currentSentence += part;
            const trimmed = currentSentence.trim();
            if (trimmed) sentences.push(trimmed);
            currentSentence = '';
        }
    }

    // 处理文本末尾没有标点的情况
    const finalTrimmed = currentSentence.trim();
    if (finalTrimmed) sentences.push(finalTrimmed);

    return sentences;
}

function showTranslation() {
    if (showingTranslation) {
        showingTranslation = false;
        document.getElementById('text').classList.remove('translation-state');
        loadArticle(currentArticleIndex);
        return;
    }

    showingTranslation = true;
    const a = document.getElementById('text').innerHTML.replaceAll('<p>', '<span class="__start-note"></span>').replaceAll('</p>', '<span class="__end-note"></span>');
    const b = globalData.articles[currentArticleIndex].translation;
    
    const aa = splitTextBySentences(a);
    const bb = splitTextBySentences(b);

    res = "";
    aa.forEach((aaa, index) => {
        if (index >= bb.length) {
            return;
        }
        res += `<p class='translation-sentence'>${aaa}<br><span class='translation-text'>${bb[index]}</span></p>` // 为段落开头、结尾设置特殊标记，方便回转
    });
    document.getElementById('text').innerHTML = res;
    document.getElementById('text').classList.add('translation-state');
    activateTooltip();
}