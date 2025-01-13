const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods"; 
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";
let goods = []; 
let currentPage = 1; 
const perPage = 100;

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
        const pagination = data._pagination; 

        displayGoods(goods); // Отображаем товары
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        alert('Не удалось загрузить данные о товарах. Попробуйте позже.');
    }
}

function displayGoods(goods) {
    const container = document.querySelector('.container-cards');
    container.innerHTML = ''; // Очищаем контейнер перед добавлением карточек

    goods.forEach(item => {
        const goodElement = document.createElement('div');
        goodElement.classList.add('good');

        // Формируем звезды на основе рейтинга
        const roundedRating = Math.round(item.rating); // Округляем рейтинг до ближайшего целого
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRating) {
                starsHtml += `<span class="star filled">⭐</span>`; // Закрашенная звезда
            } else {
                starsHtml += `<span class="star">☆</span>`; // Пустая звезда
            }
        }

        // Проверяем наличие скидки
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
            <button class="add-button">Добавить</button>
        `;

        container.appendChild(goodElement);
    });
}



document.addEventListener('DOMContentLoaded', async () => {
    await loadGoods(currentPage, perPage); 
    console.log('Массив товаров после загрузки:', goods); 
});
