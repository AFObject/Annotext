function downloadDataAsJSON(data=globalData, fileName="data.json") {
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