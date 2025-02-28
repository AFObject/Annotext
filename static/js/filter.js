let filterTypes = new Set(['green', 'yellow', 'red', 'gray']);

function toggleFilter(type) {
    if (filterTypes.has(type)) {
        filterTypes.delete(type);
    } else {
        filterTypes.add(type);
    }
    document.getElementById(`${type}-filter-btn`).classList.toggle('bordered');
    console.log(filterTypes);
    loadAnnotationBar();
    resetAnnoContentDisplay();
}

function judgeFilter(type) {
    flag = false;
    for (let i of filterTypes) {
        if (i == 'underline') continue;
        if (type.includes(i)) flag = true;
    }
    if (filterTypes.has('underline') && !type.includes('underline'))
        flag = false;
    return flag;
}