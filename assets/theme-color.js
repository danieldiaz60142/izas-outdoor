function showOrCloseColorOption(btn) {
    let statusOpen = 'false';
    let characters = '+';
    if (btn.getAttribute('is-open') == 'false') {
        btn.setAttribute('is-open', 'true');
        statusOpen = 'true';
        characters = '-';
    }
    btn.setAttribute('is-open', `${statusOpen}`);
    let cartSwatch = btn.closest('.card__swatches');
    let listItems = cartSwatch.querySelectorAll('.variation-color-hidden');
    if (window.screen.width < 769) {
        listItems = cartSwatch.querySelectorAll('.variation-color-mobile-hidden');
    }
    listItems.forEach((item) => {
        if (statusOpen == 'true') {
            item.classList.add('show');
        } else {
            item.classList.remove('show');
        }
    });
    btn.querySelectorAll('.characters').forEach((item) => {
        item.innerHTML = characters;
    });
}