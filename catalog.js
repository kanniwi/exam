const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods"; 
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";
let goods = []; 
let currentPage = 1; 
const perPage = 8;


function addListenersToButtons() {
    const buttons = document.querySelectorAll('.add-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            let storedIds = JSON.parse(localStorage.getItem('cartIds')) || [];

            if (storedIds.includes(id)) {
                storedIds = storedIds.filter(storedId => storedId !== id);
                localStorage.setItem('cartIds', JSON.stringify(storedIds));
                updateCardAppearance(id, false); 
            } else {

                storedIds.push(id);
                localStorage.setItem('cartIds', JSON.stringify(storedIds));
                updateCardAppearance(id, true); 
            }
        });
    });
}

function updateCardAppearance(id, isInCart) {
    const card = document.querySelector(`.good[data-id="${id}"]`);
    if (card) {
        const button = card.querySelector('.add-button');
        if (isInCart) {
            card.style.borderColor = 'red'; 
            button.textContent = 'Удалить'; 
        } else {
            card.style.borderColor = '#ddd'; 
            button.textContent = 'Добавить'; 
        }
    }
}

function displayGoods(goods) {
    const container = document.querySelector('.container-cards');
    container.innerHTML = '';

    const storedIds = JSON.parse(localStorage.getItem('cartIds')) || []; 

    goods.forEach(item => {
        const goodElement = document.createElement('div');
        goodElement.classList.add('good');
        goodElement.setAttribute('data-id', item.id); 

        const roundedRating = Math.round(item.rating);
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRating) {
                starsHtml += `<span class="star filled">⭐</span>`;
            } else {
                starsHtml += `<span class="star">☆</span>`;
            }
        }

        let priceHtml = '';
        if (item.discount_price) {
            const discountPercent = Math.round((1 - item.discount_price / item.actual_price) * 100);
            priceHtml = `
                <span class="current-price">${item.discount_price} ₽</span>
                <span class="old-price">${item.actual_price} ₽</span>
                <span class="discount">-${discountPercent}%</span>
            `;
        } else {
            priceHtml = `
                <span class="current-price">${item.actual_price} ₽</span>
            `;
        }

        const isInCart = storedIds.includes(String(item.id)); 
        const borderColor = isInCart ? 'red' : '#ddd'; 
        const buttonText = isInCart ? 'Удалить' : 'Добавить'; 

        goodElement.style.borderColor = borderColor;
        goodElement.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" />
            <p class="name">${item.name}</p>
            <div class="rating">
                <span>${item.rating.toFixed(1)}</span>
                <div class="stars">
                    ${starsHtml}
                </div>
            </div>
            <div class="price">
                ${priceHtml}
            </div>
            <button class="add-button" data-id="${item.id}">${buttonText}</button>
        `;

        container.appendChild(goodElement);
    });

    addListenersToButtons(); 
}

async function loadGoods(currentPage, perPage) {
    try {
        const urlWithParams = `${API_URL}?api_key=${API_KEY}&page=${currentPage}&per_page=${perPage}`;
        const response = await fetch(urlWithParams);

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error) {
                alert(errorData.error);
            }
            throw new Error('Ошибка загрузки данных: ' + response.statusText);
        }

        const data = await response.json();
        goods = data.goods;
        displayGoods(goods);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        alert('Не удалось загрузить данные о товарах. Попробуйте позже.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadGoods(currentPage, perPage);

    const basketButton = document.querySelector('.bi-basket');
    if (basketButton) {
        basketButton.addEventListener('click', function () {
            window.location.href = 'basket.html';
        });
    }

    const profileButton = document.querySelector('.bi-person-circle');
    if (profileButton) {
        profileButton.addEventListener('click', function () {
            window.location.href = 'profile.html';
        });
    }
});
