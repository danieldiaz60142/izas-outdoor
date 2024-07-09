window.theme = {
    info: {
      name: 'Enterprise',
      version: '1.3.1'
    },
    mediaQueries: {
      sm: '(min-width: 600px)',
      md: '(min-width: 769px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
      xxl: '(min-width: 1536px)',
      portrait: '(orientation: portrait)'
    },
    device: {
      hasTouch: window.matchMedia('(any-pointer: coarse)').matches,
      hasHover: window.matchMedia('(hover: hover)').matches
    },
    routes: {
      cart: '{{ routes.cart_url }}',
      cartAdd: '{{ routes.cart_add_url }}',
      cartChange: '{{ routes.cart_change_url }}',
      cartUpdate: '{{ routes.cart_update_url }}',
      predictiveSearch: '{{ routes.predictive_search_url }}'
    },
    settings: {
      moneyWithCurrencyFormat: {{ shop.money_with_currency_format | json }},
      pSearchLimit: {{ settings.predictive_search_limit | json }},
      pSearchLimitScope: 'each',
      pSearchIncludeSkus: {{ settings.predictive_search_include_skus | json }},
      pSearchIncludeTags: {{ settings.predictive_search_include_tags | json }},
      pSearchShowArticles: {{ settings.search_show_articles | json }},
      pSearchShowCollections: {{ settings.predictive_search_show_collections | json }},
      pSearchShowPages: {{ settings.search_show_pages | json }},
      pSearchShowProducts: {{ settings.search_show_products | json }},
      pSearchShowSuggestions: {{ settings.search_show_suggestions | json }},
      sliderItemsPerNav: '{{ settings.slider_items_per_nav }}',
      {% if settings.show_blur_messages %}
        blurMessage1: {{ settings.blur_message_1 | json }},
        blurMessage2: {{ settings.blur_message_2 | json }},
        blurMessageDelay: {{ settings.blur_message_delay }},
      {% endif %}
      vibrateOnATC: {{ settings.vibrate_on_atc | json }},
      compareToggle: {{ settings.compare_toggle | json }},
      compareShowEmptyMetafields: {{ settings.compare_show_empty_metafields | json }},
      blendProductImages: {{ settings.blend_product_images | json }},
      externalLinksNewTab: {{ settings.external_links_new_tab | json }},
      afterAtc: {{ settings.after_add_to_cart | json }},
      cartType: {{ settings.cart_type | json }},
      showPdPBottom : {{ settings.show_pdp_bottom | json }},
      paginationInfinite : {{ settings.pagination_infinite | json }}
    },
    strings: {
      addCartNote: '{{ "cart.note.add" | t }}',
      editCartNote: '{{ "cart.note.edit" | t }}',
      cartError: '{{ "cart.general.error" | t }}',
      cartQtyError: '{{ "cart.items.quantity_error" | t: quantity: "[quantity]" }}',
      cartTermsConfirmation: '{{ "cart.terms.confirmation" | t }}',
      imageAvailable: '{{ "products.product.media.image_available" | t: index: "[index]" }}',
      lowStock: '{{ 'products.inventory.low_stock' | t }}',
      inStock: '{{ 'products.inventory.in_stock' | t }}',
      noStock: '{{ "products.variant.no_stock" | t }}',
      noVariant: '{{ "products.variant.non_existent" | t }}',
      onlyXLeft: '{{ "products.inventory.only_x_left" | t: quantity: "[quantity]" }}',
      awaitingSale: '{{ "products.product.awaiting_sale" | t }}',
      shippingCalculator: {
        singleRate: '{{ "cart.shipping_calculator.single_rate" | t }}',
        multipleRates: '{{ "cart.shipping_calculator.multiple_rates" | t }}',
        noRates: '{{ "cart.shipping_calculator.no_rates" | t }}'
      },
      viewDetails: '{{ "products.product.view_details" | t }}',
      compare: {
        limit: '{{ 'products.compare.drawer.limit_reached' | t: quantity: '[quantity]' }}',
        more: '{{ 'products.compare.drawer.select_more' | t }}',
        empty: '{{ 'products.compare.drawer.empty' | t }}',
        continue: '{{ 'products.compare.drawer.close_continue' | t }}'
      },
      discountCopyFail: '{{ 'general.discount_code.copy_fail' | t }}',
      articleReadTime: '{{ 'blogs.article.reading_time' | t }}',
      quickNav: {
        button_standard: '{{ 'general.quick_navigation_panel.button_label' | t }}',
        show_products_none: '{{ 'general.quick_navigation_panel.show_products_none' | t }}',
        button_one: '{{ 'general.quick_navigation_panel.show_products_one' | t: quantity: '[quantity]' }}',
        button_other: '{{ 'general.quick_navigation_panel.show_products_other' | t: quantity: '[quantity]' }}',
      },
    },
    scripts: {
      cartItems: '{{ "cart-items.js" | asset_url }}',
      countryProvinceSelector: '{{ "country-province-selector.js" | asset_url }}',
      shippingCalculator: '{{ "shipping-calculator.js" | asset_url }}'
    }
  };

  // Save product ID to localStorage, for use in the 'Recently viewed products' section.
  {%- if request.page_type == 'product' %}
    try {
      const items = JSON.parse(localStorage.getItem('cc-recently-viewed') || '[]');

      // If product ID is not already in the recently viewed list, add it to the beginning.
      if (!items.includes({{ product.id | json }})) {
        items.unshift({{ product.id | json }});
      }

      // Set recently viewed list and limit to 12 products.
      localStorage.setItem('cc-recently-viewed', JSON.stringify(items.slice(0, 6)));
    } catch (e) {}
  {%- endif %}