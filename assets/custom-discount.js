document.addEventListener('DOMContentLoaded', function () {
    function removeDiscount() {
        let cartDrawer = document.getElementById('cart-drawer');
        let cartItems = document.getElementById('cart-items');
        let cartSummary = document.getElementById('cart-summary');

        let cartForm = document.querySelector('form[action="/cart"]');

        cartItems && cartItems.addEventListener('click', function (event) {
            if (event.target.matches('.btn-remove')) {
                fetchDiscount(cartItems, cartForm);
            }
        })
        cartSummary && cartSummary.addEventListener('click', function (event) {
            if (event.target.matches('.btn-remove')) {
                fetchDiscount(cartSummary, cartForm);
            }
        })
        cartDrawer && cartDrawer.addEventListener('click', function (event) {
            if (event.target.matches('.btn-remove')) {
                fetchDiscount(cartDrawer, cartForm);
            }
        })
    }

    function fetchDiscount(elm, form) {
        localStorage.removeItem("storedDiscount");

        fetch("/discount/null")
            .then(function (response) {
                return response;
            })
            .then(function (data) {
                if (data.status === 200) {
                    if ((elm.getAttribute('data-section') == "cart-drawer") || (elm.getAttribute('data-name') == "cart-drawer")) {
                        document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh', {
                            bubbles: true
                        }));
                    } else {
                        form.dispatchEvent(new CustomEvent('submit', {bubbles: true, cancelable: true}));
                    }
                    fetch("/checkout?discount=%20");
                } else {
                    alert('Something wrong. Please try again.');
                }
            });
    }
    removeDiscount();
})

function addMultipleEvents(element, eventTypes, handler) {
    eventTypes.forEach(function(eventType) {
        element.addEventListener(eventType, handler);
    });
}

function handleEventDiscount(event) {
    if (event.type === 'page:load' || event.type === 'page:change' || event.type === 'DOMContentLoaded') {
        let discountStored, discountCode, discountInp, cartForm;
        let cartDrawer = document.getElementById('cart-drawer');
        let cart = document.getElementById('cart');

        discountInp = document.querySelector('input[name="discount"]');
        cartForm = document.querySelector('form[action="/cart"]');

        if (localStorage.getItem('storedDiscount')){
            discountStored = localStorage.getItem('storedDiscount');
            discountInp.value = discountStored;
        }

        cartForm && cartForm.addEventListener('submit', function () {
            discountCode = discountInp.value;
            localStorage.setItem('storedDiscount', discountCode);
        })

        // add discount in cart drawer.
        cartDrawer && cartDrawer.addEventListener('click', function (event) {
            if (event.target.matches('.cart__apply-discount-code button')) {
                discountInp = document.querySelector('input[name="discount"]');
                discountCode = discountInp.value;
                localStorage.setItem('storedDiscount', discountCode);

                addDiscount(cartDrawer, discountCode);
            }
        })

        // add discount in cart page
        cart && cart.addEventListener('click', function (event) {
            if (event.target.matches('.cart__apply-discount-code button')) {
                discountInp = document.querySelector('input[name="discount"]');
                discountCode = discountInp.value;
                localStorage.setItem('storedDiscount', discountCode);

                addDiscount(cart, discountCode);
            }
        })
    }
}

function addDiscount(elm, discountCode) {
    let iconLoading = document.getElementById('icon-loading-discount'),
        inputDiscount = document.getElementById('input-discount');
    iconLoading.classList.remove('tw-hidden');
    inputDiscount.readOnly = true;
    inputDiscount.style.backgroundColor = '#c2c2c6';
    localStorage.setItem('storedDiscount', discountCode);

    fetch('/discount/' + encodeURIComponent(discountCode), {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': "*/*",
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
        }
    }).then(function (response) {
        return response;
    }).then(function (data) {
        if (data.status === 200) {
            if(elm.getAttribute('data-name') == "cart-drawer") {
                document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh', {
                    bubbles: true
                }));
                checkApplyDiscount()
            } else {
                // cartForm.dispatchEvent(new CustomEvent('submit', {bubbles: true, cancelable: true}));
                //fetch("/cart.js").then(result => {return result.json()}).then(result => {console.log(result)})
                window.location.reload();
            }
        } else {
            alert('Invalid discount code. Please try again.');
        }
    }).finally(function () {
      iconLoading.classList.add('tw-hidden');
      inputDiscount.readOnly = false;
        inputDiscount.style.backgroundColor = 'unset';
    });
}

function checkApplyDiscount() {
    fetch("/cart.js")
        .then(result => {return result.json()})
        .then(function (result) {
            if(result) {
                let discountItems = false
                result.items.forEach(item => {
                    if(item.line_level_discount_allocations.length > 0) {
                        discountItems = true;
                    }
                })

                if(result.cart_level_discount_applications.length <= 0 && discountItems == false) {
                    let errorDiscount = document.getElementById('mess-error-cart-input');
                    errorDiscount.classList.remove('tw-hidden');
                    setTimeout(function () {
                        errorDiscount.classList.add('tw-hidden')
                    }, 3000);
                    fetch("/discount/null");
                }
            }
        })
}

addMultipleEvents(document, ['page:load', 'page:change', 'DOMContentLoaded'], handleEventDiscount);