document.addEventListener('DOMContentLoaded', async () => {
    //событие на кнопку корзины
    const basketButton = document.querySelector('.bi-list-ul');
    if (basketButton) {
        basketButton.addEventListener('click', function() {
            window.location.href = 'index.html'; 
        });
    }
    //событие на кнопку профиля
    const profileButton = document.querySelector('.bi-basket')
    if (profileButton) {
        profileButton.addEventListener('click', function() {
            window.location.href = 'basket.html';
        });
    }
});