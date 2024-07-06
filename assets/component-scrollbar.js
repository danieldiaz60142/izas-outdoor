class CustomScrollBar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this.attachShadow({ mode: "open" });

        this.targetElId = this.dataset.targetId;
        this.trackColor = this.dataset.trackColor || "#F5F5F5";
        this.trackHeight = this.dataset.trackHeight || "6px";
        this.thumbColor = this.dataset.thumbColor || "#7A7A7A";
        this.targetEl = document.querySelector(`#${this.targetElId}`);

        const style = document.createElement("style");
        style.textContent = `
          @media screen and (max-width: 768px) {
              .custom-scrollbar, .custom-scrollbar__thumb {
                     height: 4px !important
              }
          }
        .custom-scrollbar {
            display: flex;
            justify-content: center;
            width: 100%;
            height: ${this.trackHeight};
            position: absolute;
            bottom: 0;
            left: 0;
            background-color: transparent;
            z-index: 99;
        }

        .custom-scrollbar__track {
            width: calc(100% - 28px);
            height: 100%;
            background-color: ${this.trackColor};
            opacity: 0.8;
        }

        .custom-scrollbar__thumb {
            width: 100%;
            height: ${this.trackHeight};
            background-color: ${this.thumbColor};
            border-radius: ${this.trackHeight};
            position: absolute;
            top: 0;
            animation: top 0.25s ease-in;
        }

        .custom-scrollbar__thumb::hover {
            background-color: ${this.thumbColor};
        }
        @media screen and (min-width: 768px) {
            .custom-scrollbar__track {
                width: 100%;
            }
        }
        `;
        this.shadowRoot.appendChild(style);

        // add css to document head
        const style2 = document.createElement("style");
        style2.textContent = `
        .prevent-scroll {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        `;

        document.head.appendChild(style2);

        if (!this.targetEl) {
            console.warn(
                `CustomScrollBar: target element with id "${this.targetElId}" not found`,this, this.dataset.targetId
            );
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.setTargetElCSS();
                    this.setScrollThumbWidth();
                }
            });
        });

        observer.observe(this.targetEl);

        this.shadowRoot.innerHTML += `
        <div class="custom-scrollbar">
            <div class="custom-scrollbar__track">
                <div class="custom-scrollbar__thumb"></div>
            </div>
        </div>
        `;

        this.targetEl.addEventListener("scroll", () => {
            this.moveScrollThumb();
        });
    }

    moveScrollThumb() {
        const scrollBarThumb = this.shadowRoot.querySelector(".custom-scrollbar__thumb");
        const scrollBarTrackWidth = this.shadowRoot.querySelector(".custom-scrollbar__track").offsetWidth;
        const windowWidth = window.innerWidth;
        let scrollThumbLeft;

        if(windowWidth < 768) {
            scrollThumbLeft = ((this.targetEl.scrollLeft / this.targetEl.scrollWidth) * scrollBarTrackWidth) + 14;
        } else {
            scrollThumbLeft = ((this.targetEl.scrollLeft / this.targetEl.scrollWidth) * scrollBarTrackWidth);
        }

        scrollBarThumb.style.left = `${scrollThumbLeft}px`;
    }

    setTargetElCSS() {
        this.targetEl.style.overflowX = "scroll";
        this.targetEl.style.position = "relative";
        this.targetEl.style["-ms-overflow-style"] = "none"; /* Firefox */
        this.targetEl.style.scrollbarWidth = "none"; /* Firefox */
    }

    setScrollThumbWidth() {
        // get the scroll bar element
        const scrollBarTrack = this.shadowRoot.querySelector(
            ".custom-scrollbar__track"
        );
        const scrollBarThumb = this.shadowRoot.querySelector(
            ".custom-scrollbar__thumb"
        );

        // get the scroll bar track height
        const scrollBarTrackWidth = scrollBarTrack.offsetWidth;

        // get the target element height
        const targetElWidth = this.targetEl.offsetWidth;

        // get the target element scroll height
        const targetElScrollWidth = this.targetEl.scrollWidth;

        // calculate the scroll thumb height
        const scrollThumbWidth =
            (targetElWidth / targetElScrollWidth) * scrollBarTrackWidth;

        // set the scroll thumb height
        scrollBarThumb.style.width = `${scrollThumbWidth}px`;

        // attach click-drag event on the thumb
        let isDragging = false;
        let currentX;
        scrollBarThumb.addEventListener("mousedown", (e) => {
            isDragging = true;
            currentX = e.clientX;
            // prevent dragging highlights
            this.preventContentHighlight("remove");
        });
        document.addEventListener("mouseup", () => {
            isDragging = false;
            // remove prevent dragging highlights
            this.preventContentHighlight("add");
        });
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - currentX;
            currentX = e.clientX;
            this.targetEl.scrollLeft += deltaX * (targetElScrollWidth / scrollBarTrackWidth);
        });
    }

    // prevent content highlight when dragging the thumb
    preventContentHighlight(action) {
        if (action) {
            this.targetEl.classList.add("prevent-scroll");
        } else {
            this.targetEl.classList.add("prevent-scroll");
        }
    }
}

customElements.define("custom-scrollbar", CustomScrollBar);