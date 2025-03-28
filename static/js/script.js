let globalData = null;
let currentArticleIndex = 0;

fetch('/get_data')
    .then(response => response.json())
    .then(data => {
        const articleList = document.getElementById('article-list');
        data.articles.map((article, index) => ({ article, index })).reverse().forEach(({ article, index }) => {
            let li = document.createElement('li');
            li.textContent = article.title;
            li.onclick = () => loadArticle(index);
            li.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                document.getElementById("sidebar-context-menu-delete-btn").onclick = () => confirmArticleDeletion(index);
                showSidebarContextMenu(e.pageX, e.pageY);
            });
            articleList.appendChild(li);
        });
        globalData = data;
        loadArticle(data.articles.length - 1);
    });

function toggleAnnotations() {
    document.getElementById('annotations').classList.toggle('hidden');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

// 【主要逻辑】一篇 Article 的全部加载任务
// 代码中为正文高亮部分
function loadArticle(index, data=globalData) {
    currentArticleIndex = index;
    fetch('/get_data')
    const article = data.articles[index];
    document.getElementById('text-title').textContent = article.title;

    const articleList = document.getElementById('article-list').querySelectorAll('li');
    articleList.forEach(li => {
        li.classList.remove('active');
    });
    articleList[data.articles.length - 1 - index].classList.add('active');

    let text = article.content;
    let annotations = article.annotations;

    // **按 start 索引降序排序，确保从后往前替换**
    annotations.sort((a, b) => b.start - a.start);
    let length = annotations.length

    // 依次插入高亮注释
    annotations.forEach((ann, idx) => {
        let before = text.slice(0, ann.start);
        let classText = ann.type.replace('-underline', ' red-underline');
        // 倒序了，所以全部是 length - idx
        let highlighted = `<span id="ann-${length - idx}" class="main highlight ${classText}" data-explanation="${ann.explanation}">${text.slice(ann.start, ann.end)}</span>`;
        let after = text.slice(ann.end);
        text = before + highlighted + `<sup style="margin-left: 1px; margin-right: 3px">${length - idx}</sup>` + after;
    });

    annotations.sort((a, b) => a.start - b.start);

    document.getElementById('text').innerHTML = text;

    // 绑定鼠标悬停事件
    document.querySelectorAll('.main.highlight').forEach(el => {
        el.addEventListener('mouseover', (e) => {
            let tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = el.dataset.explanation;
            tooltip.style.left = e.pageX + 'px';
            tooltip.style.top = (e.pageY - 30) + 'px';
            tooltip.style.display = 'block';
            document.body.appendChild(tooltip);
            el.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
                tooltip.remove();
            });
        });
    });

    loadAnnotationBar(index, data.articles[index]);
    resetAnnoContentDisplay();
}

// 【主要逻辑】处理右侧边栏
// - index: 文章编号
// - data: 单篇文章的数据
function loadAnnotationBar(index=currentArticleIndex, data=globalData.articles[index]) {
    let annotationList = document.getElementById('annotation-list');
    annotationList.innerHTML = ""; // 清空旧内容

    // 辅助函数：带位置信息的句子分割
    function splitSentences(text) {
        const splitPoints = /([，。！？；：“”.\"<>])/g;
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
        if (current.text) {
            current.end = text.length;
            sentences.push(current);
        }
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

    data.annotations.forEach((anno, idx) => {
        if (!judgeFilter(anno.type)) return;

        let li = document.createElement('li');
        const sentence = findAnnotationSentence(sentences, anno)
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
        let classText = anno.type.replace('-underline', ' red-underline');
        output = `<div class="circle-capsule ${classText}">${idx + 1}</div>`
        output += `${highlighted.replaceAll('</p>', '').replaceAll('<p>', '')}`;
        output += `：<span class='anno-content'>${anno.explanation}</span>`;
        output += `\n<div class="type-menu unshow"><button class="gray" onclick="setType('${index}', '${idx}', 'gray')">G</button>
            <button class="green" onclick="setType('${index}', '${idx}', 'green')">A</button>
            <button class="yellow" onclick="setType('${index}', '${idx}', 'yellow')">B</button>
            <button class="red" onclick="setType('${index}', '${idx}', 'red')">C</button>
            <button class="red-underline" onclick="toggleUnderline('${index}', '${idx}')">U</button></div>`
        let typeText = anno.type;
        if (typeText.includes('underline')) {
            output = output.replace('class="red-underline"', 'class="red-underline bordered"');
        }
        let g = typeText.replace('-underline', '');
        output = output.replace(`class="${g}"`, `class="${g} bordered"`);
        output += '\n\n';
        li.innerHTML = output;
        li.addEventListener("click", () => {
            // 滑动到对应位置并高亮显示
            const element = document.getElementById(`ann-${idx + 1}`);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 等待滑动结束
            // document.getElementById("main-text-content").addEventListener("scrollend", () => {
            element.classList.add("flash-highlight");
            element.addEventListener("animationend", () => {
                element.classList.remove("flash-highlight");
            }, { once: true }); // 只监听一次动画结束事件

            let elements = document.getElementsByClassName('type-menu');
            let current = li.getElementsByClassName('type-menu')[0];
            for (let i of elements) {
                if (i != current) {
                    i.classList.add("unshow");
                }
            }
            current.classList.toggle("unshow");
        });

        // 增加右键菜单
        li.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            document.getElementById("anno-context-menu-edit-btn").onclick = () => requestEdit(currentArticleIndex, idx);
            document.getElementById("anno-context-menu-delete-btn").onclick = () => confirmAnnoDeletion(currentArticleIndex, idx);
            showAnnoContextMenu(e.pageX, e.pageY);
        });
        annotationList.appendChild(li)
    });
}

// 对每个 anno-content，设置点击切换显示的逻辑
function resetAnnoContentDisplay() {
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

function printMode() {
    toggleSidebar();
    document.getElementsByClassName('container')[0].style.position = 'relative';
    document.getElementsByClassName('container')[0].style.height = 'auto';
    document.getElementsByClassName('body-text')[0].style.lineHeight = 2.4; // 此处修改原文行距
    document.getElementById('main-text-content').style.overflowY = 'visible';
    document.getElementById('annotation-list').style.overflowY = 'visible';
    document.getElementById('annotation-list').style.height = 'auto';
    document.getElementById('annotations').style.width = '40%';
    document.getElementById('main-text-content').style.width = '60%';
    document.getElementsByClassName('filter-menu')[0].style.display = 'none';
    document.querySelectorAll(".annotations li").forEach(li => li.style.padding = '6px'); // 此处修改注释行距
    document.querySelectorAll('.global-btn').forEach(btn => btn.style.display = 'none');
    document.querySelectorAll(".anno-content").forEach(content => content.classList.add("show"));
}