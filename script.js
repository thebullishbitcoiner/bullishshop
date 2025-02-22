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
let cart = []; // Array to hold cart items

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
    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.textContent = `${item.title} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}`;

        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeFromCart(item.id);
        cartItem.appendChild(removeButton);

        cartItemsContainer.appendChild(cartItem);
        total += item.price * item.quantity; // Calculate total
    });

    const cartTotal = document.getElementById('cart-total');
    cartTotal.textContent = `Total: ${total.toFixed(2)}`; // Update total display
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

        // Create title text
        const titleText = document.createElement('span');
        titleText.className = 'title'; // Add the class for styling
        titleText.textContent = product.title; // Set the title in the title bar
        titleBar.appendChild(titleText);

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

        // Create product image
        const img = document.createElement('img');
        img.src = product.images[0].src; // Display the first image
        img.alt = product.images[0].alt;
        productCard.appendChild(img);

        // Create price element
        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = `${product.price.toFixed(2)}`;
        productCard.appendChild(price);

        // Create stock status
        const stockStatus = document.createElement('div');
        stockStatus.className = 'stock';
        stockStatus.textContent = product.inStock ? 'In Stock' : 'Out of Stock';
        productCard.appendChild(stockStatus);

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

async function fetchBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        const price = data.bitcoin.usd;
        document.getElementById('bitcoin-ticker').textContent = `$${price}`;
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        document.getElementById('bitcoin-ticker').textContent = 'Error fetching Bitcoin price';
    }
}

// Fetch the price immediately and then every 60 seconds
fetchBitcoinPrice();
setInterval(fetchBitcoinPrice, 60000); // Update every 60 seconds


// Call the function to fetch and render products
fetchProducts();

