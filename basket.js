const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";
let goods = [];
let currentPage = 1;
const perPage = 10;

function showNotification(message, type) {
    const notificationsContainer = document.querySelector('.notifications');
    const notification = document.createElement('div');

    notification.classList.add('notification');

    notification.classList.add(type);

    notification.textContent = message;

    notificationsContainer.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

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
        showNotification('Не удалось загрузить данные о товарах. Попробуйте позже.', 'error');
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
    calculateTotalCost();
}

// Удаление товара из корзины
function addRemoveButtonListeners() {
    const buttons = document.querySelectorAll('.remove-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            let cartGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];

            cartGoods = cartGoods.filter(item => item.id !== id);
            localStorage.setItem('cartGoods', JSON.stringify(cartGoods));
            loadCart();
        });
    });
}

// Функция для преобразования даты в формат "dd.mm.yyyy"
function formatDateToDDMMYYYY(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

// Обработчик формы заказа
document.querySelector('.order-grid').addEventListener('submit', async function (event) {
    event.preventDefault(); // Отменяем стандартное поведение отправки формы

    // Собираем данные из формы
    const formData = new FormData(event.target);
    const orderData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subscribe: formData.get('subscribe') === 'on' ? 1 : 0,
        delivery_address: formData.get('delivery_address'),
        delivery_date: formatDateToDDMMYYYY(formData.get('delivery_date')),
        delivery_interval: document.querySelector('#delivery_interval').value,
        comment: formData.get('comment') || '',
        good_ids: [],
    };

    // Добавляем товары из корзины
    const cartGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];
    orderData.good_ids = cartGoods.map(item => item.id);

    // URL для отправки заказа
    const API_URL_ORDER = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders";

    try {
        const response = await fetch(`${API_URL_ORDER}?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Ошибка: ${errorData.error || response.statusText}`);
            return;
        }

        // Успешное оформление заказа
        showNotification('Заказ успешно оформлен!', 'success');
        localStorage.removeItem('cartGoods'); // Очищаем корзину
        loadCart(); // Обновляем отображение корзины
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        showNotification('Произошла ошибка. Попробуйте позже.', 'error');
    }
});

function calculateTotalCost() {
    const cartGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];
    let totalCost = 0;

    // Считаем стоимость товаров
    cartGoods.forEach(item => {
        if (item.discount_price) {
            totalCost += item.discount_price;
        } else {
            totalCost += item.actual_price;
        }
    });

    // Определяем стоимость доставки
    const deliveryCost = calculateDeliveryCost();

    // Итоговая стоимость = товары + доставка
    totalCost += deliveryCost;

    // Отображаем итоговую стоимость на странице
    const totalCostElement = document.querySelector('.total-cost-note');
    totalCostElement.textContent = `Итоговая стоимость заказа: ${totalCost} ₽ (включая доставку: ${deliveryCost} ₽)`;
}

function calculateDeliveryCost() {
    const baseDeliveryCost = 200;
    const deliveryTime = document.querySelector('#delivery_interval').value;
    const deliveryDate = new Date(document.querySelector('#delivery_date').value);
    const dayOfWeek = deliveryDate.getDay(); // 0 - воскресенье, 6 - суббота

    let additionalCost = 0;

    // Учитываем выходные дни
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        additionalCost += 300;
    }
    // Учитываем вечерние часы
    else {
        if (deliveryTime === '18:00-22:00') {
        additionalCost += 200;
        }
    }

    return baseDeliveryCost + additionalCost;
}



// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadGoods(currentPage, perPage);

    loadCart();

    document.querySelector('#delivery_date').addEventListener('change', calculateTotalCost);
    document.querySelector('#delivery_interval').addEventListener('change', calculateTotalCost);

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
