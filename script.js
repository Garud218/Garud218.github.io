// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Shooting Star Animation (FIXED) ---
    
    const canvas = document.getElementById('stars-bg');
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    const numStars = 200;
    const shootingStarInterval = 2500;
    let lastShootingStar = Date.now();

    class Star {
        constructor(x, y, speed, radius) {
            this.x = x; this.y = y; this.speed = speed;
            this.radius = radius;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            this.x -= this.speed;
            this.y += this.speed / 4;
            if (this.x < -this.radius) {
                this.x = width + this.radius;
                this.y = Math.random() * height;
            }
        }
    }

    class ShootingStar {
        constructor() {
            this.x = Math.random() * width + width / 2;
            this.y = Math.random() * height / 2;
            this.speed = Math.random() * 10 + 15;
            this.len = Math.random() * 200 + 100;
            this.angle = Math.PI / 6;
            this.opacity = 1;
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            const endX = this.x - this.len * Math.cos(this.angle);
            const endY = this.y + this.len * Math.sin(this.angle);
            const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        update() {
            this.x -= this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);
            this.opacity -= 0.02;
        }
    }

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star(
                Math.random() * width, Math.random() * height,
                Math.random() * 0.5 + 0.1, Math.random() * 1.5 + 0.5
            ));
        }
        stars.push(new ShootingStar());
    }

    function animate() {
        //
        // === THIS IS THE FIX ===
        // We clear the canvas to transparent, not a solid color.
        // The dark background comes from the CSS 'body' style.
        ctx.clearRect(0, 0, width, height); 
        //
        
        if (Date.now() - lastShootingStar > shootingStarInterval) {
            stars.push(new ShootingStar());
            lastShootingStar = Date.now();
        }
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();
            if (stars[i] instanceof ShootingStar && stars[i].opacity <= 0) {
                stars.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', init);
    init();
    animate();

    
    // --- Part 2: Contact Form Submission (No Changes) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            const formspreeEndpoint = form.action; 

            try {
                formStatus.textContent = 'Sending message...';
                formStatus.className = 'form-status';

                const response = await fetch(formspreeEndpoint, {
                    method: 'POST',
                    body: data,
                    headers: {'Accept': 'application/json'}
                });

                if (response.ok) {
                    formStatus.textContent = 'Thank you! Your message has been sent.';
                    formStatus.classList.add('success');
                    form.reset();
                } else {
                    const responseData = await response.json();
                    if (responseData.errors) {
                        formStatus.textContent = responseData.errors.map(error => error.message).join(', ');
                    } else {
                        formStatus.textContent = 'Oops! There was a problem sending your message.';
                    }
                    formStatus.classList.add('error');
                }
            } catch (error) {
                formStatus.textContent = 'Network error. Please try again.';
                formStatus.classList.add('error');
            }
        });
    }

    // --- Part 3: Smooth Scrolling for Navigation (No Changes) ---
    document.querySelectorAll('.navbar a, .scroll-down-btn').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                window.location.href = targetId; 
            }
        });
    });
});
