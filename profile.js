const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders";
const API_KEY = "7630fae5-737b-4cae-b85d-b7d7c246a48b";

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
        displayOrders(orders);
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
    }
}

// Функция для отображения заказов
function displayOrders(orders) {
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
            ${orders.map((order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${new Date(order.created_at).toLocaleString()}</td>
                    <td>${order.good_ids.map(id => `Название товара ${id}`).join(', ')}</td>
                    <td>${order.total_price || '...'} ₽</td>
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

// Функция для отображения модального окна "Просмотр"
function showOrderDetails(orderId) {
    alert(`Просмотр заказа с ID: ${orderId}`);
    // Здесь вы можете открыть модальное окно и загрузить детали заказа
}

// Функция для отображения модального окна "Редактирование"
function editOrder(orderId) {
    alert(`Редактирование заказа с ID: ${orderId}`);
    // Здесь вы можете открыть модальное окно для редактирования заказа
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

// Обработчики кнопок в хедере
document.addEventListener('DOMContentLoaded', async () => {
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
