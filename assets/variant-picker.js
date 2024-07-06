/* eslint-disable */

/**
 * Dependencies:
 * - Custom select component
 *
 * Required translation strings:
 * - addToCart
 * - noStock
 * - noVariant
 * - onlyXLeft
 */

if (!customElements.get('variant-picker')) {
  class VariantPicker extends HTMLElement {
    constructor() {
      super();
      this.section = this.closest('.js-product');
      this.productForm = this.section.querySelector('.js-product-form-main');
      this.optionSelectors = this.querySelectorAll('.option-selector');
      this.data = this.getProductData();

      this.updateAvailability();
      this.addEventListener('change', this.handleVariantChange.bind(this));
      this.updateTextMode(document.querySelector('input[name="id"]').value );
    }

    /**
     * Handles 'change' events on the variant picker element.
     * @param {object} evt - Event object.
     */
    handleVariantChange(evt) {
      const selectedOptions = this.getSelectedOptions();
      this.variant = null;

      // Get selected variant data (if variant exists).
      this.variant = this.data.product.variants.find((v) =>
        v.options.every((val, index) => val === selectedOptions[index])
      );

      if (this.variant) {
        this.updateMedia();
        this.updateUrl(evt);
        this.updateVariantInput();
      }

      this.updateAddToCartButton();
      this.updateAvailability();
      this.updatePrice();
      this.updateBackorderText();
      this.updatePickupAvailability();
      this.updateSku();
      VariantPicker.updateLabelText(evt);

      this.dispatchEvent(new CustomEvent('on:variant:change', {
        bubbles: true,
        detail: {
          form: this.productForm,
          variant: this.variant,
          product: this.data.product
        }
      }));
       // Inicia codigo actualizar sticky cart 3dids
    
                $('#sticky-add-cart-container').load(window.location.href + ' #sticky-add-cart-container', function() {
                    // Llama a la función para reinicializar los scripts
                    initStickyAddCartScripts();
                });

 // termina codigo actualizar sticky cart 3dids
    }





    
    /**
     * Updates the "Add to Cart" button label and disabled state.
     */
    updateAddToCartButton() {
      this.productForm = this.section.querySelector('.js-product-form-main');
      if (!this.productForm) return;

      this.addBtn = this.addBtn || this.productForm.querySelector('[name="add"]');
      const variantAvailable = this.variant && this.variant.available;
      const unavailableStr = this.variant ? theme.strings.noStock : theme.strings.noVariant;

      this.addBtn.disabled = !variantAvailable;
      this.addBtn.textContent = variantAvailable
        ? this.addBtn.dataset.addToCartText
        : unavailableStr;
    }

    /**
     * Updates the availability status in option selectors.
     */
    updateAvailability() {
      if (this.dataset.showAvailability === 'false') return;
      let currVariant = this.variant;

      if (!this.variant) {
        currVariant = { options: this.getSelectedOptions() };
      }

      const updateOptionAvailability = (optionEl, available, soldout) => {
        const el = optionEl;
        const text = soldout ? theme.strings.noStock : theme.strings.noVariant;
        el.classList.toggle('is-unavailable', !available);

        if (optionEl.classList.contains('custom-select__option')) {
          const em = el.querySelector('em');

          if (em) {
            em.hidden = available;
          }

          if (!available) {
            if (em) {
              em.textContent = text;
            } else {
              el.innerHTML = `${el.innerHTML} <em class="pointer-events-none">${text}</em>`;
            }
          }
        } else if (!available) {
          el.nextElementSibling.title = text;
        } else {
          el.nextElementSibling.removeAttribute('title');
        }
      };

      // Flag all options as unavailable
      this.querySelectorAll('.js-option').forEach((optionEl) => {
        updateOptionAvailability(optionEl, false, false);
      });

      // Flag selector options as available or sold out, depending on the variant availability
      this.optionSelectors.forEach((selector, selectorIndex) => {
        this.data.product.variants.forEach((variant) => {
          let matchCount = 0;

          variant.options.forEach((option, optionIndex) => {
            if (option === currVariant.options[optionIndex] && optionIndex !== selectorIndex) {
              matchCount += 1;
            }
          });

          if (matchCount === currVariant.options.length - 1) {
            const options = selector.querySelectorAll('.js-option');
            const optionEl = Array.from(options).find((opt) => {
              if (selector.dataset.selectorType === 'dropdown') {
                return opt.dataset.value === variant.options[selectorIndex];
              }
              return opt.value === variant.options[selectorIndex];
            });

            if (optionEl) {
              updateOptionAvailability(optionEl, variant.available, !variant.available);
            }
          }
        });
      });
    }

    /**
     * Updates the backorder text and visibility.
     */
    updateBackorderText() {
      this.backorder = this.backorder || this.section.querySelector('.backorder');
      if (!this.backorder) return;

      let hideBackorder = true;

      if (this.variant && this.variant.available) {
        const { inventory } = this.data.formatted[this.variant.id];

        if (this.variant.inventory_management && inventory === 'none') {
          const backorderProdEl = this.backorder.querySelector('.backorder__product');
          const prodTitleEl = this.section.querySelector('.product-title');
          const variantTitle = this.variant.title.includes('Default')
            ? ''
            : ` - ${this.variant.title}`;

          backorderProdEl.textContent = `${prodTitleEl.textContent}${variantTitle}`;
          hideBackorder = false;
        }
      }

      this.backorder.hidden = hideBackorder;
    }

    /**
     * Updates the color option label text.
     * @param {object} evt - Event object
     */
    static updateLabelText(evt) {
      const selector = evt.target.closest('.option-selector');
      if (selector.dataset.selectorType === 'dropdown') return;

      const colorText = selector.querySelector('.js-color-text');
      if (!colorText) return;

      colorText.textContent = evt.target.nextElementSibling.querySelector('.js-value').textContent;
    }

    /**
     * Updates the product media.
     */
    updateMedia() {
      if (!this.variant.featured_media) return;

      if (this.section.matches('quick-add-drawer')) {
        this.section.updateMedia(this.variant.featured_media.id);
      } else {
        this.mediaGallery = this.mediaGallery || this.section.querySelector('media-gallery');
        if (!this.mediaGallery) return;

        const variantMedia = this.mediaGallery.querySelector(
          `[data-media-id="${this.variant.featured_media.id}"]`
        );
        this.mediaGallery.setActiveMedia(variantMedia, true, true);
      }
    }

    /**
     * Updates the pick up availability.
     */
    updatePickupAvailability() {
      this.pickUpAvailability =
        this.pickUpAvailability || this.section.querySelector('pickup-availability');
      if (!this.pickUpAvailability) return;

      if (this.variant && this.variant.available) {
        this.pickUpAvailability.getAvailability(this.variant.id);
      } else {
        this.pickUpAvailability.removeAttribute('available');
        this.pickUpAvailability.innerHTML = '';
      }
    }

    /**
     * Updates the price.
     */
    updatePrice() {

      if (this.variant) {
        let priceInfo = document.querySelector('.product-info__price');
        if (priceInfo) {
          let priceRange = priceInfo.querySelector('.price-sale-tag');
          if (priceRange && priceRange != null) {
            let comparePrice = this.variant.compare_at_price;
            let price = this.variant.price;
            let divPriceCurrent = priceRange.querySelector('.price__current');
            divPriceCurrent.innerHTML = this.data.formatted[this.variant.id].price;
            let divPriceWas = priceRange.querySelector('.price__was');
            let divPriceDiscount = priceRange.querySelector('.price__discount');
        

            if (comparePrice && comparePrice != null && comparePrice != undefined && 
               parseFloat(price) < parseFloat(comparePrice) && 
               this.data.formatted[this.variant.id].compareAtPrice != 'undefined'
            ) {
              divPriceWas.classList.remove('hidden');
              divPriceWas.innerHTML = this.data.formatted[this.variant.id].compareAtPrice;
              if (price && price != null && price != undefined) {
                if (parseFloat(comparePrice) > parseFloat(price)) {
                  let discount = 100 - (Math.round((100 * price) / comparePrice));
      
                  if(priceRange.closest('.product-info__sticky')){
                    priceRange.querySelector(".price__discount").innerHTML = `Ahorra Un ${discount}%`;
           
                  } else {
                    if (priceRange.querySelector('.price__was') && priceRange.querySelector('.price__was') != null) {
                      priceRange.querySelector(".price__discount").innerHTML = `Ahorra ${discount}%`;
                      

                      
                      
                    } 
                  }
                }
              }
            } else {
              divPriceWas.classList.remove('hidden');
              divPriceWas.classList.add('hidden');
              divPriceWas.innerHTML = '';
              divPriceDiscount.innerHTML = '';
            }
          }
        }

      }
    }

    /**
     * Updates the SKU.
     */
    updateSku() {
      this.sku = this.sku || this.section.querySelector('.product-sku__value');
      if (!this.sku) return;

      const skuAvailable = this.variant && this.variant.sku;
      this.sku.textContent = skuAvailable ? this.variant.sku : '';
      this.sku.parentNode.hidden = !skuAvailable;
    }

    /**
     * Updates the url with the selected variant id.
     * @param {object} evt - Event object.
     */
    updateUrl(evt) {
      if (!evt || evt.type !== 'change' || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.variant.id}`);
    }

    /**
     * Updates the value of the hidden [name="id"] form inputs.
     */
    updateVariantInput() {
      this.forms = this.forms || this.section.querySelectorAll('.js-product-form-main, .js-instalments-form');
    
      this.forms.forEach((form) => {
        const input = form.querySelector('input[name="id"]');
        input.value = this.variant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    
      if (this.variant) {
        this.updateTextMode(this.variant.id);
      } else {
        this.updateTextMode(null);
      }
    }

    updateTextMode(variantID) {
      let alturaModelo = null, tallaModelo = null;
      
      if (document.querySelector('.value-metafield-variants')) {
        let data = document.querySelector('.value-metafield-variants').innerHTML;
        data = JSON.parse(data);
    
        for (const [key, value] of Object.entries(data)) {
          if (value.variantsID && value.variantsID == variantID) {
            alturaModelo = value.alturaModelo || alturaModelo;
            tallaModelo = value.tallaModelo || tallaModelo;
          }
        }
      }
    
      const textModelElement = document.querySelector('.text-model');
      if (!textModelElement) return;
    
      const alturaModeloElement = textModelElement.querySelector('.altura_modelo');
      const tallaModeloElement = textModelElement.querySelector('.talla_modelo');
    
      if (alturaModelo == null && tallaModelo == null) {
        textModelElement.classList.add('hidden');
        if (alturaModeloElement) alturaModeloElement.innerHTML = '';
        if (tallaModeloElement) tallaModeloElement.innerHTML = '';
      } else {
        textModelElement.classList.remove('hidden');
        if (alturaModeloElement) alturaModeloElement.innerHTML = alturaModelo;
        if (tallaModeloElement) tallaModeloElement.innerHTML = tallaModelo;
      }
    }


    /**
     * Gets the selected option element from each selector.
     * @returns {Array}
     */
    getSelectedOptions() {
      const selectedOptions = [];

      this.optionSelectors.forEach((selector) => {
        if (selector.dataset.selectorType === 'dropdown') {
          selectedOptions.push(selector.querySelector('.custom-select__btn').textContent.trim());
        } else {
          selectedOptions.push(selector.querySelector('input:checked').value);
        }
      });

      return selectedOptions;
    }

    /**
     * Gets the product data.
     * @returns {?object}
     */
    getProductData() {
      const dataEl = this.querySelector('[type="application/json"]');
      return JSON.parse(dataEl.textContent);
    }
  }

  customElements.define('variant-picker', VariantPicker);
}

function checkVariant(evl) {
  let preProductCard = evl.closest('product-card[izas-product-card]');
  if (evl.hasAttribute('variant-out-stock')) {
    if (!preProductCard.classList.contains('variant-out-stock')) {
      preProductCard.classList.add('variant-out-stock');
    }
  }
  else {
    preProductCard.classList.remove('variant-out-stock');
  }

    let priceRange = preProductCard.querySelector('.price-sale-tag');
    if (priceRange && priceRange != null) {
      let comparePrice = evl.dataset.compare;
      let price = evl.dataset.price;
      let divPriceCurrent = priceRange.querySelector('.price__current');
      divPriceCurrent.innerHTML = evl.dataset.priceformat;
      let divPriceWas = priceRange.querySelector('.price__was');
      let divPriceDiscount = priceRange.querySelector('.price__discount');

      if (comparePrice && comparePrice != null && comparePrice != undefined) {
        if (parseFloat(price) < parseFloat(comparePrice) && evl.dataset.compareformat != null && evl.dataset.compareformat != 'undefined') {
          divPriceWas.classList.remove('hidden');
          divPriceWas.innerHTML = evl.dataset.compareformat;
          if (price && price != null && price != undefined) {
            if (parseFloat(comparePrice) > parseFloat(price)) {
              let discount = 100 - (Math.round((100 * price) / comparePrice));

              if(priceRange.closest('.product-info__sticky')){
                priceRange.querySelector(".price__discount").innerHTML = `Ahorra Un ${discount}%`;
              } else {
                if (priceRange.querySelector('.price__was') && priceRange.querySelector('.price__was') != null) {
                  priceRange.querySelector(".price__discount").innerHTML = `Ahorra ${discount}%`;
                  
                }
              }
            }
          }
        } else {
          divPriceWas.classList.remove('hidden');
          divPriceWas.classList.add('hidden');
          divPriceWas.innerHTML = '';
          divPriceDiscount.innerHTML = '';
        }
      } else {
        divPriceWas.classList.remove('hidden');
        divPriceWas.classList.add('hidden');
        divPriceWas.innerHTML = '';
        divPriceDiscount.innerHTML = '';
      }
    }
}