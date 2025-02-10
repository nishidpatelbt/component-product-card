class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Get template content and clone it
    const template = document.getElementById('product-card-template');
    const content = template.content.cloneNode(true);

    // Get elements from the template
    this.imageElement = content.querySelector('.product-image');
    this.titleElement = content.querySelector('.product-title');
    this.priceElement = content.querySelector('.product-price');
    this.variantSelector = content.querySelector('.variant-selector');
    this.addToCartButton = content.querySelector('.add-to-cart');
    this.productLink = content.querySelector('.product-link');
    this.soldOutTag = content.querySelector('.sold-out-tag');  // "Sold Out" tag element

    const title = this.getAttribute('data-title') || 'No Title';
    const imageSrc = this.getAttribute('data-image') || '';
    const productUrl = this.getAttribute('data-handle') || '#';
    let variantsData = this.getAttribute('data-variants');
    
    let variants = {};
    if (variantsData) {
      try {
        variants = JSON.parse(variantsData);
      } catch (error) {
        console.error('Error parsing variants:', error);
      }
    }

    // Set default values based on the first variant
    let defaultPrice = variants.length > 0 ? variants[0].price : null;
    let defaultVariantId = variants.length > 0 ? variants[0].id : null;
    let isVariantAvailable = variants.length > 0 && variants[0].available;

    // Set values on elements
    this.imageElement.src = imageSrc;
    this.imageElement.alt = title;
    this.titleElement.textContent = title;
    this.priceElement.textContent = defaultPrice;
    this.productLink.href = `/products/${productUrl}`;  // Redirect when clicked on title or card

    // Initially disable or enable the button based on the first variant's availability
    this.updateAddToCartButton(isVariantAvailable);
    this.toggleSoldOutTag(isVariantAvailable);

    // Populate variants dropdown
    if (variants.length) {
      variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant.id;
        option.textContent = variant.title;
        option.setAttribute('data-price', variant.price);
        option.setAttribute('data-available', variant.available);
        this.variantSelector.appendChild(option);
      });

      // Handle variant change
      this.variantSelector.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        this.priceElement.textContent = selectedOption.getAttribute('data-price');
        defaultVariantId = selectedOption.value;

        // Update availability and button text
        isVariantAvailable = selectedOption.getAttribute('data-available') === 'true';
        this.updateAddToCartButton(isVariantAvailable);
        this.toggleSoldOutTag(isVariantAvailable);
      });
    } else {
      this.variantSelector.style.display = 'none'; // Hide dropdown if only one variant
    }

    // Add to cart button click
    this.addToCartButton.addEventListener('click', () => {
      // Check availability of the selected variant before adding to cart
      if (!isVariantAvailable) return;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: defaultVariantId,
            quantity: 1
          }]
        }),
      })
      .then(response => response.json())
      .then(data => {
        window.location.href = '/cart';
      })
      .catch(error => {
        console.error('Error adding item to cart:', error);
        alert('There was an issue adding the item to your cart.');
      });
    });

    this.shadowRoot.appendChild(content);
  }

  // Function to update the Add to Cart button text and disabled state
  updateAddToCartButton(isAvailable) {
    if (isAvailable) {
      this.addToCartButton.textContent = 'Add to Cart';
      this.addToCartButton.style.background = "rgb(146 146 146)";
      this.addToCartButton.style.cursor = "pointer";
      this.addToCartButton.removeAttribute('disabled');
    } else {
      this.addToCartButton.textContent = 'Out of Stock';
      this.addToCartButton.setAttribute('disabled', 'true');
    }
  }

  // Function to toggle the visibility of the "Sold Out" tag
  toggleSoldOutTag(isAvailable) {
    if (isAvailable) {
      this.soldOutTag.style.display = 'none';  // Hide Sold Out tag if available
    } else {
      this.soldOutTag.style.display = 'block';  // Show Sold Out tag if unavailable
    }
  }
}

// Define the custom element
customElements.define('product-card', ProductCard);