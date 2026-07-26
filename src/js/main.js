// This file contains JavaScript functionality for the media team website.
// It includes form validation, interactive elements, and dynamic content loading.

document.addEventListener('DOMContentLoaded', function() {
    if (window.Swiper && document.querySelector('.video-swiper')) {
        new Swiper('.video-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            speed: 800,
            coverflowEffect: {
                rotate: 0,
                stretch: 50,
                depth: 200,
                modifier: 1,
                slideShadows: false,
            },
            slideToClickedSlide: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            observer: true,
            observeParents: true,
        });
    }

    // Example of form validation for the contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                event.preventDefault();
                alert('Please fill in all fields.');
            } else {
                alert('Thank you for your message!');
            }
        });
    }

    // Example of interactive elements (e.g., portfolio item hover effect)
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseover', function() {
            item.classList.add('hover');
        });
        item.addEventListener('mouseout', function() {
            item.classList.remove('hover');
        });
    });
});