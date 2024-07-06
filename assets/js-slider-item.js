class PageDots extends HTMLElement {
    connectedCallback() {
        this.buttons = Array.from(this.querySelectorAll("button"));

        // Add event listener to the parent element to handle button clicks
        this.addEventListener("click", this._handleButtonClick.bind(this));

        if (this.hasAttribute("animation-timer")) {
            this.addEventListener("animationend", this._handleAnimationEnd.bind(this));
        }
    }

    _handleButtonClick(event) {
        if (event.target.tagName === "BUTTON") {
            const targetIndex = this.buttons.indexOf(event.target);
            this._dispatchEvent(targetIndex);
        }
    }

    _handleAnimationEnd(event) {
        if (event.elapsedTime > 0) {
            const nextIndex = (this.selectedIndex + 1 + this.buttons.length) % this.buttons.length;
            this._dispatchEvent(nextIndex);
        }
    }

    get selectedIndex() {
        return this.buttons.findIndex((button) => button.getAttribute("aria-current") === "true");
    }

    set selectedIndex(selectedIndex) {
        this.buttons.forEach((button, index) => button.setAttribute("aria-current", selectedIndex === index ? "true" : "false"));

        if (this.hasAttribute("align-selected")) {
            const selectedItem = this.buttons[selectedIndex];
            const windowHalfWidth = window.innerWidth / 2;
            const boundingRect = selectedItem.getBoundingClientRect();
            const scrollableElement = this._findFirstScrollableElement(this.parentElement);

            if (scrollableElement) {
                scrollableElement.scrollTo({
                    behavior: "smooth",
                    left: scrollableElement.scrollLeft + (boundingRect.left - windowHalfWidth) + boundingRect.width / 2
                });
            }
        }
    }

    _dispatchEvent(index) {
        if (index !== this.selectedIndex) {
            this.dispatchEvent(new CustomEvent("page-dots:changed", {
                bubbles: true,
                detail: { index }
            }));
        }
    }

    _findFirstScrollableElement(item, currentDepth = 0) {
        if (item === null || currentDepth > 3) {
            return null;
        }
        return item.scrollWidth > item.clientWidth ? item : this._findFirstScrollableElement(item.parentElement, currentDepth + 1);
    }
}
customElements.define("page-dots", PageDots);

class ImageWithText extends HTMLElement {
    connectedCallback() {
        this.items = Array.from(this.querySelectorAll("image-with-text-item"));
        this.imageItems = Array.from(this.querySelectorAll(".image-with-text__image"));
        this.pageDots = this.querySelector("page-dots");
        this.hasPendingTransition = false;
        if (this.items.length > 1) {
            this.addEventListener("page-dots:changed", (event) => this.select(event.detail.index));
            if (Shopify.designMode) {
                this.addEventListener("shopify:block:deselect", this.startPlayer.bind(this));
                this.addEventListener("shopify:block:select", (event) => {
                    this.intersectionObserver.disconnect();
                    this.pausePlayer();
                    this.select(event.target.index, !event.detail.load);
                });
            }
        }
        this._setupVisibility();
    }
    untilVisible(intersectionObserverOptions = { rootMargin: "30px 0px", threshold: 0 }) {
        const onBecameVisible = () => {
            this.classList.add("became-visible");
            this.style.opacity = "1";
        };
        return new Promise((resolve) => {
            if (window.IntersectionObserver) {
                this.intersectionObserver = new IntersectionObserver((event) => {
                    if (event[0].isIntersecting) {
                        this.intersectionObserver.disconnect();
                        requestAnimationFrame(() => {
                            resolve();
                            onBecameVisible();
                        });
                    }
                }, intersectionObserverOptions);
                this.intersectionObserver.observe(this);
            } else {
                resolve();
                onBecameVisible();
            }
        });
    }
    async _setupVisibility() {
        await this.untilVisible();
        if (this.hasAttribute("reveal-on-scroll")) {
            await this.transitionImage(this.selectedIndex);
            this.select(this.selectedIndex);
        }
        this.startPlayer();
    }
    get selectedIndex() {
        return this.items.findIndex((item) => item.selected);
    }
    async select(index, shouldAnimate = true) {
        if (this.hasPendingTransition) {
            return;
        }
        this.hasPendingTransition = true;
        if (this.items[index].hasAttachedImage || !shouldAnimate) {
            await this.transitionImage(index, shouldAnimate);
        }
        if (this.selectedIndex !== index) {
            await this.items[this.selectedIndex].transitionToLeave(shouldAnimate);
        }
        if (this.pageDots) {
            this.pageDots.selectedIndex = index;
        }
        await this.items[index].transitionToEnter(shouldAnimate);
        this.hasPendingTransition = false;
    }
    async transitionImage(index, shouldAnimate = true) {
        const activeImage = this.imageItems.find((item) => !item.hasAttribute("hidden")), nextImage = this.imageItems.find((item) => item.id === this.items[index].getAttribute("attached-image")) || activeImage;
        activeImage.setAttribute("hidden", "");
        nextImage.removeAttribute("hidden");
        await imageLoaded(nextImage);
        const animation = new CustomAnimation(new CustomKeyframeEffect(nextImage, {
            visibility: ["hidden", "visible"],
            clipPath: ["inset(0 0 0 100%)", "inset(0 0 0 0)"]
        }, {
            duration: 600,
            easing: "cubic-bezier(1, 0, 0, 1)"
        }));
        shouldAnimate ? animation.play() : animation.finish();
    }
    pausePlayer() {
        this.style.setProperty("--section-animation-play-state", "paused");
    }
    startPlayer() {
        this.style.setProperty("--section-animation-play-state", "running");
    }
};
customElements.define('image-with-text', ImageWithText);

class ImageWithTextItem extends HTMLElement {
    get index() {
        return [...this.parentNode.children].indexOf(this);
    }
    get selected() {
        return !this.hasAttribute("hidden");
    }
    get hasAttachedImage() {
        return this.hasAttribute("attached-image");
    }
    async transitionToEnter(shouldAnimate = true) {
        this.removeAttribute("hidden");
        const textWrapper = this.querySelector(".image-with-text__text-wrapper"), headings = await resolveAsyncIterator(this.querySelectorAll(".image-with-text__content split-lines"));
        const animation = new CustomAnimation(new SequenceEffect([
            new ParallelEffect(headings.map((item, index) => {
                return new CustomKeyframeEffect(item, {
                    opacity: [0, 0.2, 1],
                    transform: ["translateY(100%)", "translateY(0)"],
                    clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"]
                }, {
                    duration: 350,
                    delay: 120 * index,
                    easing: "cubic-bezier(0.5, 0.06, 0.01, 0.99)"
                });
            })),
            new CustomKeyframeEffect(textWrapper, { opacity: [0, 1] }, { duration: 300 })
        ]));
        shouldAnimate ? animation.play() : animation.finish();
        return animation.finished;
    }
    async transitionToLeave(shouldAnimate = true) {
        const elements = await resolveAsyncIterator(this.querySelectorAll(".image-with-text__text-wrapper, .image-with-text__content split-lines"));
        const animation = new CustomAnimation(new ParallelEffect(elements.map((item) => {
            return new CustomKeyframeEffect(item, { opacity: [1, 0] }, { duration: 200 });
        })));
        shouldAnimate ? animation.play() : animation.finish();
        await animation.finished;
        this.setAttribute("hidden", "");
    }
};
customElements.define('image-with-text-item', ImageWithTextItem);

async function resolveAsyncIterator(target) {
    const processedTarget = [];
    if (!(target != null && typeof target[Symbol.iterator] === "function")) {
        target = [target];
    }
    for (const targetItem of target) {
        if (typeof targetItem[Symbol.asyncIterator] === "function") {
            // Use an async function to contain the for await ... of loop
            for await (const awaitTarget of targetItem) {
                processedTarget.push(awaitTarget);
            }
        } else {
            processedTarget.push(targetItem);
        }
    }
    return processedTarget;
}

function imageLoaded(image) {
    return new Promise((resolve) => {
        if (!image || image.tagName !== "IMG" || image.complete) {
            resolve();
        } else {
            image.onload = () => resolve();
        }
    });
}
var CustomAnimation = class {
    constructor(effect) {
        this._effect = effect;
        this._playState = "idle";
        this._finished = Promise.resolve();
    }
    get finished() {
        return this._finished;
    }
    get animationEffects() {
        return this._effect instanceof CustomKeyframeEffect ? [this._effect] : this._effect.animationEffects;
    }
    cancel() {
        this.animationEffects.forEach((animationEffect) => animationEffect.cancel());
    }
    finish() {
        this.animationEffects.forEach((animationEffect) => animationEffect.finish());
    }
    play() {
        this._playState = "running";
        this._effect.play();
        this._finished = this._effect.finished;
        this._finished.then(() => {
            this._playState = "finished";
        }, (rejection) => {
            this._playState = "idle";
        });
    }
};
var CustomKeyframeEffect = class {
    constructor(target, keyframes, options = {}) {
        if (!target) {
            return;
        }
        if ("Animation" in window) {
            this._animation = new Animation(new KeyframeEffect(target, keyframes, options));
        } else {
            options["fill"] = "forwards";
            this._animation = target.animate(keyframes, options);
            this._animation.pause();
        }
        this._animation.addEventListener("finish", () => {
            target.style.opacity = keyframes.hasOwnProperty("opacity") ? keyframes["opacity"][keyframes["opacity"].length - 1] : null;
            target.style.visibility = keyframes.hasOwnProperty("visibility") ? keyframes["visibility"][keyframes["visibility"].length - 1] : null;
        });
    }
    get finished() {
        if (!this._animation) {
            return Promise.resolve();
        }
        return this._animation.finished ? this._animation.finished : new Promise((resolve) => this._animation.onfinish = resolve);
    }
    play() {
        if (this._animation) {
            this._animation.startTime = null;
            this._animation.play();
        }
    }
    cancel() {
        if (this._animation) {
            this._animation.cancel();
        }
    }
    finish() {
        if (this._animation) {
            this._animation.finish();
        }
    }
};
var GroupEffect = class {
    constructor(childrenEffects) {
        this._childrenEffects = childrenEffects;
        this._finished = Promise.resolve();
    }
    get finished() {
        return this._finished;
    }
    get animationEffects() {
        return this._childrenEffects.flatMap((effect) => {
            return effect instanceof CustomKeyframeEffect ? effect : effect.animationEffects;
        });
    }
};
var ParallelEffect = class extends GroupEffect {
    play() {
        const promises = [];
        for (const effect of this._childrenEffects) {
            effect.play();
            promises.push(effect.finished);
        }
        this._finished = Promise.all(promises);
    }
};
var SequenceEffect = class extends GroupEffect {
    play() {
        this._finished = new Promise(async (resolve, reject) => {
            try {
                for (const effect of this._childrenEffects) {
                    effect.play();
                    await effect.finished;
                }
                resolve();
            } catch (exception) {
                reject();
            }
        });
    }
};

