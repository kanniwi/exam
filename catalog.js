const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";
let goods = [];
let currentPage = JSON.parse(localStorage.getItem('currentPage')) || 1;
const perPage = 10;
let totalPages = 1;
let currentSort = "rating_desc";
let data = [];

function addListenersToButtons() {
    const buttons = document.querySelectorAll('.add-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const selectedGood = goods.find(item => item.id === parseInt(id));

            let storedGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];
            const goodIndex = storedGoods.findIndex(item => item.id === selectedGood.id);

            if (goodIndex !== -1) {
                storedGoods.splice(goodIndex, 1);
                updateCardAppearance(id, false);
            } else {
                storedGoods.push(selectedGood);
                updateCardAppearance(id, true);
            }

            localStorage.setItem('cartGoods', JSON.stringify(storedGoods));
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

function displayGoods(newGoods, append = false) {
    const container = document.querySelector('.container-cards');
    if (!append) {
        container.innerHTML = '';
    }

    const storedGoods = JSON.parse(localStorage.getItem('cartGoods')) || [];
    const storedIds = storedGoods.map(item => item.id);

    newGoods.forEach(item => {
        const goodElement = document.createElement('div');
        goodElement.classList.add('good');
        goodElement.setAttribute('data-id', item.id);

        const roundedRating = Math.round(item.rating);
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= roundedRating ? `<span class="star filled">⭐</span>` : `<span class="star">☆</span>`;
        }

        const isInCart = storedIds.includes(item.id);
        const borderColor = isInCart ? 'red' : '#ddd';
        const buttonText = isInCart ? 'Удалить' : 'Добавить';

        goodElement.style.borderColor = borderColor;
        goodElement.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" />
            <p class="name">${item.name}</p>
            <div class="rating">
                <span>${item.rating.toFixed(1)}</span>
                <div class="stars">${starsHtml}</div>
            </div>
            <div class="price">
                ${item.discount_price 
                    ? `<span class="current-price">${item.discount_price} ₽</span>
                       <span class="old-price">${item.actual_price} ₽</span>`
                    : `<span class="current-price">${item.actual_price} ₽</span>`
                }
            </div>
            <button class="add-button" data-id="${item.id}">${buttonText}</button>
        `;

        container.appendChild(goodElement);
    });

    addListenersToButtons();
}

async function loadGoods(page, perPage, sortOrder = "rating_desc", append = false) {
    try {
        const url = `${API_URL}?api_key=${API_KEY}&page=${page}&per_page=${perPage}&sort_order=${sortOrder}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Ошибка загрузки данных: ${response.statusText}`);

        data = await response.json();
        if (!data.goods || !data._pagination) {
            throw new Error('Некорректный ответ от сервера. Данные отсутствуют.');
        }

        goods = append ? goods.concat(data.goods) : data.goods;
        totalPages = Math.ceil(data._pagination.total_count / perPage);

        displayGoods(data.goods, append);

        const loadMoreButton = document.querySelector('.load-more');
        if (page >= totalPages) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        alert('Не удалось загрузить данные. Попробуйте позже.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('currentPage', JSON.stringify(1));
    currentPage = 1;

    await loadGoods(currentPage, perPage, currentSort);

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

    const loadMoreButton = document.querySelector('.load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', async () => {
            currentPage += 1;
            localStorage.setItem('currentPage', JSON.stringify(currentPage));
            await loadGoods(currentPage, perPage, currentSort, true);
        });
    }

    const sortDropdown = document.querySelector('#sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', async (event) => {
            currentSort = event.target.value;
            currentPage = 1;
            localStorage.setItem('currentSort', currentSort);
            await loadGoods(currentPage, perPage, currentSort);
        });
    }
});
