const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders";
const GOODS_API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";

// Функция для расчета стоимости доставки
function calculateDeliveryCost(deliveryDate, deliveryInterval) {
    const baseDeliveryCost = 200;
    const weekendDeliveryCost = 300;
    const eveningDeliveryCost = 200;

    // Получаем день недели (0 - воскресенье, 1 - понедельник, и т.д.)
    const deliveryDay = new Date(deliveryDate).getDay();
    // console.log("Day of the week:", deliveryDay);

    // Проверяем, является ли день выходным (воскресенье или суббота)
    const isWeekend = deliveryDay === 0 || deliveryDay === 6;

    // Проверяем, если доставка в вечерние часы (с 18:00 до 22:00)
    const isEvening = (deliveryInterval == "18:00-22:00");
    // console.log(isEvening);

    // Базовая стоимость доставки
    let deliveryCost = baseDeliveryCost;

    // Если выходные, добавляем дополнительную стоимость
    if (isWeekend) {
        deliveryCost += weekendDeliveryCost;
    }

    // Если вечерняя доставка, добавляем дополнительную стоимость
    if (isEvening) {
        deliveryCost += eveningDeliveryCost;
    }

    return deliveryCost;
}

// Функция для загрузки заказов с API
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
        if (!response.ok) {
            const errorData = await response.json();
            alert(`Ошибка загрузки заказов: ${errorData.error || response.statusText}`);
            throw new Error('Ошибка загрузки заказов');
        }

        const orders = await response.json();
        await displayOrders(orders);
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
    }
}

// Функция для получения данных о товаре по его ID
async function fetchGoodById(goodId) {
    try {
        const response = await fetch(`${GOODS_API_URL}/${goodId}?api_key=${API_KEY}`);
        if (!response.ok) {
            console.error(`Ошибка загрузки товара с ID: ${goodId}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        return null;
    }
}

// Функция для обрезки названия товара до 30 символов
function truncateName(name) {
    return name.length > 30 ? name.slice(0, 30) + '...' : name;
}

// Функция для отображения заказов
async function displayOrders(orders) {
    const tableContainer = document.querySelector('.table-order');
    tableContainer.innerHTML = ''; // Очищаем контейнер перед добавлением данных

    if (orders.length === 0) {
        tableContainer.innerHTML = '<p>Нет оформленных заказов</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table-order');
    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Дата оформления</th>
                <th>Состав заказа</th>
                <th>Стоимость</th>
                <th>Доставка</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(order => `
                <tr id="order-${order.id}">
                    <td>${order.id}</td>
                    <td>${new Date(order.created_at).toLocaleString()}</td>
                    <td class="order-goods">Загрузка...</td>
                    <td class="order-total-price">Загрузка...</td>
                    <td>${order.delivery_date} ${order.delivery_interval}</td>
                    <td>
                        <button class="action-button view" data-id="${order.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="action-button edit" data-id="${order.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-button delete" data-id="${order.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    tableContainer.appendChild(table);

    // Обновляем данные о товарах в каждом заказе
    orders.forEach(async (order) => {
        const goodsInfo = await Promise.all(order.good_ids.map(fetchGoodById));
        const goodsNames = goodsInfo
            .filter(good => good !== null) // Исключаем товары, которые не удалось загрузить
            .map(good => truncateName(good.name)) // Применяем обрезку для каждого названия
            .join(', ');

        const goodsTotalPrice = goodsInfo.reduce((sum, good) => {
            if (!good || (!good.price && !good.discount_price)) return sum; // Убедитесь, что у товара есть цена
            const price = good.discount_price || good.price; // Используйте скидочную цену, если она есть
            return sum + price;
        }, 0);
            

        console.log(goodsTotalPrice);

        // Рассчитываем стоимость доставки
        const deliveryCost = calculateDeliveryCost(order.delivery_date, order.delivery_interval);

        // Общая стоимость с учетом доставки
        const totalPriceWithDelivery = goodsTotalPrice + deliveryCost;

        const orderRow = document.getElementById(`order-${order.id}`);
        if (orderRow) {
            orderRow.querySelector('.order-goods').textContent = goodsNames || 'Нет данных о товарах';
            orderRow.querySelector('.order-total-price').textContent = `${totalPriceWithDelivery} ₽ (включая доставку: ${deliveryCost} ₽)`;
        }
    });

    // Добавляем обработчики для кнопок действий
    addActionListeners();
}

// Функция для добавления обработчиков кнопок "Просмотр", "Редактирование", "Удаление"
function addActionListeners() {
    const viewButtons = document.querySelectorAll('.action-button.view');
    const editButtons = document.querySelectorAll('.action-button.edit');
    const deleteButtons = document.querySelectorAll('.action-button.delete');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            showOrderDetails(orderId);
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            editOrder(orderId);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            deleteOrder(orderId);
        });
    });
}

// Функция для удаления заказа
async function deleteOrder(orderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Ошибка удаления заказа: ${errorData.error || response.statusText}`);
            return;
        }

        alert('Заказ успешно удалён');
        await loadOrders(); // Обновляем список заказов
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        alert('Произошла ошибка при удалении заказа. Попробуйте позже.');
    }
}

async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_URL}/${orderId}?api_key=${API_KEY}`);
        if (!response.ok) {
            const errorData = await response.json();
            alert(`Ошибка загрузки заказа: ${errorData.error || response.statusText}`);
            return;
        }

        const order = await response.json();

        // Обновляем модальное окно данными заказа
        document.getElementById('order-date').textContent = new Date(order.created_at).toLocaleString();
        document.getElementById('customer-name').textContent = order.customer_name || 'Нет данных';
        document.getElementById('customer-phone').textContent = order.customer_phone || 'Нет данных';
        document.getElementById('customer-email').textContent = order.customer_email || 'Нет данных';
        document.getElementById('delivery-address').textContent = order.delivery_address || 'Нет данных';
        document.getElementById('delivery-date').textContent = order.delivery_date || 'Нет данных';
        document.getElementById('delivery-interval').textContent = order.delivery_interval || 'Нет данных';
        document.getElementById('order-comment').textContent = order.comment || 'Нет комментариев';

        // Получаем данные о товарах
        const goodsInfo = await Promise.all(order.good_ids.map(fetchGoodById));
        const goodsNames = goodsInfo
            .filter(good => good !== null)
            .map(good => truncateName(good.name))
            .join(', ');

        document.getElementById('order-items').textContent = goodsNames || 'Нет данных о товарах';

        // Рассчитываем стоимость доставки и итоговую стоимость
        const goodsTotalPrice = goodsInfo.reduce((sum, good) => {
            if (!good || (!good.price && !good.discount_price)) return sum;
            const price = good.discount_price || good.price;
            return sum + price;
        }, 0);

        const deliveryCost = calculateDeliveryCost(order.delivery_date, order.delivery_interval);
        const totalPriceWithDelivery = goodsTotalPrice + deliveryCost;

        document.getElementById('order-cost').textContent = `${totalPriceWithDelivery} ₽ (включая доставку: ${deliveryCost} ₽)`;

        // Показываем модальное окно
        const modal = document.getElementById('order-modal');
        modal.classList.remove('hidden');

        // Обработчик закрытия окна
        const closeModal = () => {
            modal.classList.add('hidden');
        };

        document.querySelector('.close-button').addEventListener('click', closeModal);
        document.querySelector('.order-modal-close-button').addEventListener('click', closeModal);
    } catch (error) {
        console.error('Ошибка загрузки данных заказа:', error);
        alert('Не удалось загрузить данные заказа.');
    }
}


async function editOrder(orderId) {
    try {
        const response = await fetch(`${API_URL}/${orderId}?api_key=${API_KEY}`);
        if (!response.ok) {
            showNotification('Ошибка загрузки данных заказа', 'error');
            return;
        }

        const order = await response.json();

        // Заполняем форму текущими данными
        document.getElementById('edit-customer-name').value = order.full_name || '';
        document.getElementById('edit-customer-phone').value = order.phone || '';
        document.getElementById('edit-customer-email').value = order.email || '';
        document.getElementById('edit-delivery-address').value = order.delivery_address || '';
        document.getElementById('edit-delivery-date').value = order.delivery_date || '';
        document.getElementById('edit-delivery-interval').value = order.delivery_interval || '';
        document.getElementById('edit-order-comment').value = order.comment || '';

        const modal = document.getElementById('edit-order-modal');
        modal.classList.remove('hidden');

        // Закрытие модального окна
        const closeModal = () => {
            modal.classList.add('hidden');
        };

        // Обработчик кнопки "Отмена"
        const cancelButton = document.querySelector('button[type="cancel-button"]');
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение кнопки
            closeModal(); // Закрываем модальное окно
            showNotification('Сохранения не были внесены', 'info'); // Уведомление
        });

        // Обработчик формы "Сохранить"
        const form = document.getElementById('edit-order-form');
        form.onsubmit = async (e) => {
            e.preventDefault();

            const updatedData = {
                full_name: document.getElementById('edit-customer-name').value,
                phone: document.getElementById('edit-customer-phone').value,
                email: document.getElementById('edit-customer-email').value,
                delivery_address: document.getElementById('edit-delivery-address').value,
                delivery_date: document.getElementById('edit-delivery-date').value,
                delivery_interval: document.getElementById('edit-delivery-interval').value,
                comment: document.getElementById('edit-order-comment').value,
            };

            try {
                const putResponse = await fetch(`${API_URL}/${orderId}?api_key=${API_KEY}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (!putResponse.ok) {
                    const errorData = await putResponse.json();
                    showNotification(`Ошибка сохранения: ${errorData.error || 'Неизвестная ошибка'}`, 'error');
                    return;
                }

                showNotification('Данные успешно обновлены', 'success');
                closeModal(); // Закрываем модальное окно после сохранения
                await loadOrders(); // Обновляем список заказов
            } catch (error) {
                console.error('Ошибка сохранения данных заказа:', error);
                showNotification('Произошла ошибка при сохранении данных', 'error');
            }
        };
    } catch (error) {
        console.error('Ошибка редактирования заказа:', error);
        showNotification('Не удалось загрузить данные заказа', 'error');
    }
}





function showNotification(message, type = 'info') {
    const notificationsContainer = document.querySelector('.notifications');
    const notification = document.createElement('div');
    notification.classList.add('notification', type);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Отмена';
    cancelButton.classList.add('cancel-button');

    notification.textContent = message;
    notification.appendChild(cancelButton);
    notificationsContainer.appendChild(notification);

    // Обработчик нажатия на кнопку "Отмена"
    cancelButton.addEventListener('click', () => {
        notification.remove();
    });

    // Удаляем уведомление через 5 секунд (если его не закрыли вручную)
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}




// Обработчики кнопок в хедере
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
    const basketButton = document.querySelector('.bi-list-ul');
    if (basketButton) {
        basketButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    const profileButton = document.querySelector('.bi-basket');
    if (profileButton) {
        profileButton.addEventListener('click', function () {
            window.location.href = 'basket.html';
        });
    }

    // Загружаем и отображаем заказы
    await loadOrders();
});
