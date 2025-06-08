function downloadDataAsJSON(data = globalData, fileName = "data.json") {
    // Step 1: Convert data to JSON string
    const jsonString = JSON.stringify(data, null, 4); // 使用缩进美化JSON格式

    // Step 2: Create a Blob object
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Step 3: Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Step 4: Create a hidden <a> element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'data.json'; // 设置文件名，默认为 data.json
    a.style.display = 'none'; // 隐藏链接
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 释放URL对象
}

function copyAnnotations() {
    const listItems = document.querySelectorAll('#annotation-list li');

    const htmlLines = Array.from(listItems).map(li => {
        const clonedLi = li.cloneNode(true);

        // 移除不需要的部分
        clonedLi.querySelectorAll('span.anno-content, div.type-menu').forEach(el => el.remove());

        // 替换 circle-capsule
        const originalCapsule = li.querySelector('div.circle-capsule');
        const capsule = clonedLi.querySelector('div.circle-capsule');
        if (capsule) {
            const spanCapsule = document.createElement('span');
            spanCapsule.innerText = capsule.innerText + '.';
            spanCapsule.className = capsule.className;
            spanCapsule.style.backgroundColor = getComputedStyle(originalCapsule).backgroundColor;
            capsule.replaceWith(spanCapsule);
            spanCapsule.insertAdjacentText('afterend', ' ');
        }
        return clonedLi.innerHTML.trim();
    }).filter(html => html.length > 0)
        .map(html => `${html}`)
        .join('\n');


    const htmlLines2 = Array.from(listItems).map(li => {
        const clonedLi = li.cloneNode(true);

        // 移除不需要的部分
        clonedLi.querySelectorAll('div.type-menu').forEach(el => el.remove());

        // 替换 circle-capsule
        const originalCapsule = li.querySelector('div.circle-capsule');
        const capsule = clonedLi.querySelector('div.circle-capsule');
        if (capsule) {
            const spanCapsule = document.createElement('span');
            spanCapsule.innerText = capsule.innerText + '.';
            spanCapsule.className = capsule.className;
            spanCapsule.style.backgroundColor = getComputedStyle(originalCapsule).backgroundColor;
			spanCapsule.style.fontWeight = getComputedStyle(originalCapsule).fontWeight;
            capsule.replaceWith(spanCapsule);
            spanCapsule.insertAdjacentText('afterend', ' ');
        }
        return clonedLi.innerHTML.trim();
    }).filter(html2 => html2.length > 0)
        .map(html2 => `${html2}`)
        .join('\n');

    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(`
        <html>
          <head>
            <title>注释展示</title>
            <style>
              body {
                font-family: sans-serif;
                padding: 20px;
                line-height: 1.6;
                white-space: pre-wrap;
                tab-size: 3;
              }
              b { font-weight: bold; }
              u { text-decoration: underline; }
              .highlight { background-color: yellow; }
			  .red-underline { text-decoration: red underline; font-weight: bold; border: 2px black solid; }
              .anno-content { color: #333; font-family: 'Kaiti SC'; }
            </style>
          </head>
          <body>
            <h2>注释</h2>
            ${'\n' + htmlLines}
            <h2>答案</h2>
            ${'\n' + htmlLines2}
          </body>
        </html>
      `);
        newWindow.document.close();
    } else {
        alert('无法打开新窗口，可能被浏览器拦截，请允许弹出窗口。');
    }
}
