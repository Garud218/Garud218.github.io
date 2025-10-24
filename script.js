// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Shooting Star Animation ---
    
    const canvas = document.getElementById('stars-bg');
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    const numStars = 200; // Number of stars in the starfield
    const shootingStarInterval = 2000; // Time between shooting stars (in ms)
    let lastShootingStar = Date.now();

    // Star class
    class Star {
        constructor(x, y, speed, radius) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.radius = radius;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`; // Random opacity
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Move stars from top-right to bottom-left
            this.x -= this.speed;
            this.y += this.speed / 4; // Move slightly down

            // Reset star if it goes off-screen
            if (this.x < -this.radius) {
                this.x = width + this.radius;
                this.y = Math.random() * height;
            }
        }
    }

    // Shooting Star class
    class ShootingStar {
        constructor() {
            this.x = Math.random() * width + width / 2; // Start from the right side
            this.y = Math.random() * height / 2; // Start from the top half
            this.speed = Math.random() * 10 + 15;
            this.len = Math.random() * 200 + 100;
            this.angle = Math.PI / 6; // Fixed angle (30 degrees)
            this.opacity = 1;
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            const endX = this.x - this.len * Math.cos(this.angle);
            const endY = this.y + this.len * Math.sin(this.angle);
            
            // Create a gradient for the tail
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
            this.opacity -= 0.02; // Fade out
        }
    }

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        stars = [];

        // Create regular stars
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 0.5 + 0.1, // Slow speeds for parallax
                Math.random() * 1.5 + 0.5  // Small radius
            ));
        }
        
        // Add one shooting star to start
        stars.push(new ShootingStar());
    }

    function animate() {
        // Clear the canvas with a solid black background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Check if it's time for a new shooting star
        if (Date.now() - lastShootingStar > shootingStarInterval) {
            stars.push(new ShootingStar());
            lastShootingStar = Date.now();
        }

        // Update and draw all stars
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();

            // Remove faded-out shooting stars
            if (stars[i] instanceof ShootingStar && stars[i].opacity <= 0) {
                stars.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', init);

    // Start animation
    init();
    animate();

    
    // --- Part 2: Fetch GitHub Projects ---
    
    async function fetchGitHubProjects() {
        const username = 'Garud218';
        const url = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`;
        const container = document.getElementById('project-list');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const repos = await response.json();

            // Clear the "Loading..." text
            container.innerHTML = '';

            // Get top 6 projects
            repos.slice(0, 6).forEach(repo => {
                const projectCard = document.createElement('a');
                projectCard.className = 'project-card';
                projectCard.href = repo.html_url;
                projectCard.target = '_blank'; // Open in new tab
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

    // Call the function to get projects
    fetchGitHubProjects();
});
