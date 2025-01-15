const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";
let goods = [];
let currentPage = 1;
const perPage = 8;

// Загрузка товаров с API
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
        console.log('Массив товаров после загрузки:', goods);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        alert('Не удалось загрузить данные о товарах. Попробуйте позже.');
    }
}

// Отображение товаров на странице
function displayGoods(goods) {
    const container = document.querySelector('.container-cards-basket');
    container.innerHTML = '';

    goods.forEach(item => {
        const goodElement = document.createElement('div');
        goodElement.classList.add('good');

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
            <button class="remove-button" data-id="${item.id}">Удалить</button>
        `;

        container.appendChild(goodElement);
    });

    // Добавление слушателей на кнопки удаления
    addRemoveButtonListeners();
}

// Загрузка данных из localStorage
function loadCart() {
    const cartGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];
    displayGoods(cartGoods);
}

// Удаление товара из корзины
function addRemoveButtonListeners() {
    const buttons = document.querySelectorAll('.remove-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            let cartGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];

            // Удаляем товар из массива
            cartGoods = cartGoods.filter(item => item.id !== id);

            // Обновляем localStorage
            localStorage.setItem('cartGoods', JSON.stringify(cartGoods));

            // Обновляем отображение корзины
            loadCart();
        });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadGoods(currentPage, perPage);

    loadCart();

    // Переходы по кнопкам
    const basketButton = document.querySelector('.bi-list-ul');
    if (basketButton) {
        basketButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    const profileButton = document.querySelector('.bi-person-circle');
    if (profileButton) {
        profileButton.addEventListener('click', function () {
            window.location.href = 'profile.html';
        });
    }
});
