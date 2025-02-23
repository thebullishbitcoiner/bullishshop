let cart = []; // Array to hold cart items
let bitcoinPrice = 0; // Global variable to store the Bitcoin price

// Function to fetch Bitcoin price
async function fetchBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        bitcoinPrice = data.bitcoin.usd; // Update the global variable
        document.getElementById('bitcoin-ticker').textContent = `$${bitcoinPrice}`;
        return bitcoinPrice; // Return the fetched price
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        document.getElementById('bitcoin-ticker').textContent = 'Error fetching Bitcoin price';
        return null; // Return null in case of an error
    }
}

// Function to fetch products from the local JSON file
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Function to add item to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1; // Increase quantity if item already in cart
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new item to cart
    }
    updateCartDisplay();
}

// Function to update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items
    let totalInSats = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Calculate the total price for the item in sats
        const itemTotalInSats = Math.round((item.price * item.quantity / bitcoinPrice) * 100000000); // Convert to sats and round
        cartItem.textContent = `${item.title} (x${item.quantity}) - ${itemTotalInSats} sats`;

        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeFromCart(item.id);
        cartItem.appendChild(removeButton);

        cartItemsContainer.appendChild(cartItem);
        totalInSats += itemTotalInSats; // Accumulate total in sats
    });

    const cartTotal = document.getElementById('cart-total');
    cartTotal.textContent = `Total: ${totalInSats} sats`; // Update total display to show only in sats
}


// Function to remove item from cart
function removeFromCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1; // Decrease quantity
        } else {
            cart = cart.filter(item => item.id !== productId); // Remove item if quantity is 0
        }
    }
    updateCartDisplay(); // Update cart display
    saveCart(); // Save cart to localStorage
}

// Function to render products
function renderProducts(products) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = ''; // Clear any existing content
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Create title bar
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';

        // Create price element
        const price = document.createElement('div');
        price.className = 'price';
        const priceInSats = (product.price / bitcoinPrice * 100000000).toFixed(0); // Convert price to satoshis
        price.textContent = `${priceInSats} sats`; // Set the price in sats
        titleBar.appendChild(price);

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container'; // Add class for styling

        // Create plus button
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.onclick = () => addToCart(product); // Add item to cart
        buttonContainer.appendChild(plusButton);

        // Create minus button
        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.onclick = () => removeFromCart(product.id); // Remove item from cart
        buttonContainer.appendChild(minusButton);

        // Append button container to title bar
        titleBar.appendChild(buttonContainer);

        productCard.appendChild(titleBar);

        // Create image carousel
        const carousel = document.createElement('div');
        carousel.className = 'image-carousel';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        product.images.forEach((image, index) => {
            const img = document.createElement('img');
            img.src = image.src; // Display the image
            img.alt = image.alt;
            img.className = 'product-image'; // Add class for styling
            img.style.display = index === 0 ? 'block' : 'none'; // Show only the first image
            img.dataset.index = index; // Store the index in a data attribute
            imageContainer.appendChild(img);

            // Add click event to each image
            img.onclick = () => {
                event.preventDefault(); // Prevent default action (e.g., scrolling)
        event.stopPropagation(); // Stop the event from bubbling up
                
                const currentIndex = (index + 1) % product.images.length; // Move to the next image
                showImage(currentIndex, imageContainer, product.images.length);
                if (product.images.length > 1) {
                    updateDots(currentIndex, carousel.querySelector('.dots')); // Update dots if there are multiple images
                }
            };
        });

        carousel.appendChild(imageContainer);

        // Create dots for navigation only if there are multiple images
        if (product.images.length > 1) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'dots';

            product.images.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'dot';
                dot.onclick = () => {
                    showImage(index, imageContainer, product.images.length);
                    updateDots(index, dotsContainer); // Update dots when a dot is clicked
                };
                dotsContainer.appendChild(dot);
            });

            carousel.appendChild(dotsContainer);
        }

        productCard.appendChild(carousel); // Append the carousel to the product card

        // Create title under the image
        const productTitle = document.createElement('h2');
        productTitle.textContent = product.title; // Set the title under the image
        productCard.appendChild(productTitle);

        // Create features list
        const featuresList = document.createElement('ul');
        featuresList.className = 'features';
        product.features.forEach(feature => {
            const featureItem = document.createElement('li');
            featureItem.textContent = feature;
            featuresList.appendChild(featureItem);
        });
        productCard.appendChild(featuresList);

        // Append the product card to the container
        productContainer.appendChild(productCard);
    });
}

function showImage(index, imageContainer, totalImages) {
    const images = imageContainer.querySelectorAll('.product-image');
    images.forEach((img, i) => {
        img.style.display = i === index ? 'block' : 'none'; // Show the current image
    });
}

function updateDots(currentIndex, dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex); // Add 'active' class to the current dot
    });
}

// Main function to fetch Bitcoin price and then products
async function init() {
    const price = await fetchBitcoinPrice(); // Wait for the Bitcoin price
    if (price) {
        await fetchProducts(); // Fetch products only if the price was successfully retrieved
    }
}

// Call the init function to start the process
init();

// Set an interval to fetch the Bitcoin price every 60 seconds
setInterval(fetchBitcoinPrice, 60000); // Update every 60 seconds