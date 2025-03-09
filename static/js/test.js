var globalTesting = [];

function startTest() {
    document.getElementById("overlay").style.visibility = "visible";
    document.getElementById("testContainer").style.display = "flex";
    globalTesting = Array.from(document.querySelectorAll('#annotation-list li'));
    console.log(globalTesting);
    generateTest();
}

function closeTest() {
    document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("testContainer").style.display = "none";
}

function generateTest() {
    if (globalTesting.length == 0) {
        document.getElementById('test-question').innerHTML = '测试已完成！';
        return;
    }
    const randomIndex = Math.floor(Math.random() * globalTesting.length);
    const randomItem = globalTesting[randomIndex];
    console.log(globalTesting);
    globalTesting.splice(randomIndex, 1);
    console.log(randomItem);
    randomItem.getElementsByClassName('anno-content')[0].style.visibility = 'hidden';
    document.getElementById('test-question').innerHTML = randomItem.innerHTML;
}

function showAnswer() {
    let ans = document.querySelectorAll('#test-question .anno-content')[0];
    ans.style.visibility = 'visible';
    ans.style.color = 'var(--color-text)';
    let current = document.querySelectorAll('#test-question .type-menu')[0];
    current.classList.remove('unshow');
    current.addEventListener('click', function () {
        generateTest();
    })
}