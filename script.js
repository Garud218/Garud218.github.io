// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Shooting Star Animation ---
    
    const canvas = document.getElementById('stars-bg');
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    const numStars = 200; // Number of stars in the starfield
    const shootingStarInterval = 2500; // Time between shooting stars (in ms)
    let lastShootingStar = Date.now();

    class Star {
        constructor(x, y, speed, radius) {
            this.x = x;
            this.y = y;
            this.speed = speed;
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
                Math.random() * width,
                Math.random() * height,
                Math.random() * 0.5 + 0.1,
                Math.random() * 1.5 + 0.5
            ));
        }
        
        // Add one shooting star to start
        stars.push(new ShootingStar());
    }

    function animate() {
        ctx.fillStyle = 'var(--bg-dark)'; // Use CSS variable
        ctx.fillRect(0, 0, width, height);

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

    
    // --- Part 2: Fetch GitHub Projects ---
    
    async function fetchGitHubProjects() {
        const username = 'Garud218'; // Make sure this is your correct GitHub username
        const url = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`;
        const container = document.getElementById('project-list');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const repos = await response.json();

            container.innerHTML = ''; // Clear loading text

            // Display up to 9 projects for a neat grid, adjust as needed
            repos.slice(0, 9).forEach(repo => {
                const projectCard = document.createElement('a');
                projectCard.className = 'project-card';
                projectCard.href = repo.html_url;
                projectCard.target = '_blank';
                projectCard.rel = 'noopener noreferrer';

                projectCard.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description provided.'}</p>
                `;
                container.appendChild(projectCard);
            });

        } catch (error) {
            console.error('Failed to fetch projects:', error);
            container.innerHTML = '<p>Could not load projects. Please try again later.</p>';
        }
    }

    fetchGitHubProjects();


    // --- Part 3: Contact Form Submission (using Formspree) ---

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const form = e.target;
            const data = new FormData(form);

            // Replace 'your_formspree_hash' with your actual Formspree endpoint!
            // Get it from https://formspree.io/
            const formspreeEndpoint = form.action; 

            try {
                formStatus.textContent = 'Sending message...';
                formStatus.className = 'form-status'; // Reset status classes

                const response = await fetch(formspreeEndpoint, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Thank you for your message! I will get back to you soon.';
                    formStatus.classList.add('success');
                    form.reset(); // Clear the form
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
                console.error('Network error during form submission:', error);
                formStatus.textContent = 'Network error. Please try again.';
                formStatus.classList.add('error');
            }
        });
    }

    // --- Part 4: Smooth Scrolling for Navigation ---
    document.querySelectorAll('.navbar a, .scroll-down-btn').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            // If it's a direct hash, scroll to that section
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Use scrollIntoView for scroll-snapping compatibility
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                // For other links (like home or external), default behavior or specific handling
                window.location.href = targetId; 
            }
        });
    });

});
