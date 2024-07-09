document.addEventListener('DOMContentLoaded', function () {
    function changeSlides() {
        const buttons = document.querySelectorAll('.collection-slider-button .slider__item');
        const slides = document.querySelectorAll('.collection-slider-items .slider');

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(button => {button.classList.remove('active')});
                this.classList.add('active');

                let dataSlide = this.getAttribute('data-id');
                let currentSlide = dataSlide - 1;

                slides.forEach(slide => {slide.classList.remove('active')});
                slides[currentSlide].classList.add('active')
            })
        })
    }

    function moveScrollByGrab() {
        let mouseDown = false;
        let startX, scrollLeft;
        const sliders = document.querySelectorAll('.collection-slider-items .slider__grid');

        // Add the event listeners
        sliders.forEach(function (slider) {
            slider.addEventListener('mousedown', function (e) {
                mouseDown = true;
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = this.scrollLeft;
            });
            slider.addEventListener('mousemove', function (e) {
                e.preventDefault();
                if(!mouseDown) { return; }
                const x = e.pageX - slider.offsetLeft;
                const scroll = x - startX;
                this.scrollLeft = scrollLeft - scroll;
            });
            slider.addEventListener('mouseup', function (e) {
                mouseDown = false;
            });
            slider.addEventListener('mouseleave', function (e) {
                mouseDown = false;
            });
        })
    }

    // Call the function to always show the scrollbar on iOS
    // alwaysShowScrollbar();
    changeSlides();
    moveScrollByGrab();
})