fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const articleList = document.getElementById('article-list');
        data.articles.forEach((article, index) => {
            let li = document.createElement('li');
            li.textContent = article.title;
            li.onclick = () => loadArticle(index, data);
            articleList.appendChild(li);
        });
    });

document.getElementById('toggle-annotations').addEventListener('click', () => {
    document.getElementsByClassName('annotations')[0].classList.toggle('hidden');
});

function setupAnnoContents() {
    const annoContents = document.querySelectorAll(".anno-content");
    // 为每个 anno-content 添加点击事件
    annoContents.forEach(content => {
        content.addEventListener("click", function () {
            // 切换显示和隐藏
            this.classList.toggle("show");
        });
    });
    document.getElementById('toggle-anno-content').addEventListener('click', () => {
        const firstContent = annoContents[0];
        if (firstContent.classList.contains("show")) {
            // 如果第一个内容是显示状态，隐藏所有内容
            annoContents.forEach(content => content.classList.remove("show"));
        } else {
            // 如果第一个内容是隐藏状态，显示所有内容
            annoContents.forEach(content => content.classList.add("show"));
        }
    });
}


function loadArticle(index, data) {
    let article = data.articles[index];
    document.getElementById('title').textContent = article.title;

    const articleList = document.getElementById('article-list').querySelectorAll('li');
    articleList.forEach(li => {
        li.classList.remove('active');
    });
    articleList[index].classList.add('active');

    let text = article.content;
    let annotations = article.annotations;

    // **按 start 索引降序排序，确保从后往前替换**
    annotations.sort((a, b) => b.start - a.start);

    // 依次插入高亮注释
    annotations.forEach(ann => {
        let before = text.slice(0, ann.start);
        let highlighted = `<span class="main highlight" data-explanation="${ann.explanation}">${text.slice(ann.start, ann.end)}</span>`;
        let after = text.slice(ann.end);
        text = before + highlighted + after;
    });

    document.getElementById('text').innerHTML = text;

    // 绑定鼠标悬停事件
    document.querySelectorAll('.main.highlight').forEach(el => {
        el.addEventListener('mouseover', () => {
            let tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);

            document.querySelectorAll('.highlight').forEach(el => {
                el.addEventListener('mouseover', (e) => {
                    tooltip.textContent = el.dataset.explanation;
                    tooltip.style.left = e.pageX + 'px';
                    tooltip.style.top = (e.pageY - 30) + 'px';
                    tooltip.style.display = 'block';
                });
                el.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });
            });

            // document.getElementById('annotation-list').innerHTML = `<li>${el.dataset.explanation}</li>`;
        });
    });

    formatAnnotatedText(data.articles[index]);
    setupAnnoContents();
}

function formatAnnotatedText(data) {

    let annotationList = document.getElementById('annotation-list');
    annotationList.innerHTML = ""; // 清空旧内容

    // 辅助函数：带位置信息的句子分割
    function splitSentences(text) {
        const splitPoints = /([，。！？；：“”.\"])/g;
        const tokens = text.split(splitPoints);
        const sentences = [];
        let current = { text: '', start: 0 };
        
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].match(splitPoints)) {
                current.text += tokens[i];
                current.end = current.start + current.text.length;
                sentences.push(current);
                current = { text: '', start: current.end };
            } else if (tokens[i]) {
                current.text += tokens[i];
            }
        }
        if (current.text) sentences.push(current);
        return sentences;
    }

    // 查找包含注释的句子
    function findAnnotationSentence(sentences, annotation) {
        return sentences.find(s => 
            s.start <= annotation.start && 
            s.end >= annotation.end
        );
    }

    // 主处理逻辑
    const sentences = splitSentences(data.content);

    data.annotations.forEach(anno => {
        let li = document.createElement('li');
        const sentence = findAnnotationSentence(sentences, anno);
        if (!sentence) return;

        // 计算在句子中的相对位置
        const localStart = anno.start - sentence.start;
        const localEnd = anno.end - sentence.start;
        
        // 构建高亮文本
        const highlighted = [
            sentence.text.slice(0, localStart),
            `<strong><u>${anno.text}</u></strong>`,
            sentence.text.slice(localEnd, sentence.text.length - 1)
        ].join('');

        // 构建注释信息
        output = ''
        output += `${highlighted}`;
        output += `：<span class='anno-content'>${anno.explanation}</span>`;
        if (anno.type) output += `\n | 类型：${anno.type}`;
        output += '\n\n';
        li.innerHTML = output
        annotationList.appendChild(li)
    });
}