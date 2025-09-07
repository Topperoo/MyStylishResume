document.addEventListener('DOMContentLoaded', function() {
    // Real-time clock functionality (time only)
    function updateClock() {
        const now = new Date();
        
        // Format time (12-hour format like in Stardew Valley)
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeString = `${hours}:${minutes} ${ampm}`;
        
        // Update time only
        document.getElementById('clockTime').textContent = timeString;
    }
    
    // Date update function (separate from clock)
    function updateDate() {
        const now = new Date();
        
        // Format day and date
        const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const dateString = `${dayName} ${day}`;
        
        // Update date only
        document.getElementById('clockDate').textContent = dateString;
    }
    
    // Season detection function
    function updateSeason(date) {
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const seasonImage = document.getElementById('seasonImage');
        
        let seasonFile = '';
        if (month >= 3 && month <= 5) {
            seasonFile = 'spring.png'; // Spring: March, April, May
        } else if (month >= 6 && month <= 8) {
            seasonFile = 'summer.png'; // Summer: June, July, August
        } else if (month >= 9 && month <= 11) {
            seasonFile = 'fall.png'; // Fall: September, October, November
        } else {
            seasonFile = 'winter.png'; // Winter: December, January, February
        }
        
        seasonImage.src = `assets/images/${seasonFile}`;
    }
    
    // Weather update function for Moscow
    async function updateWeather() {
        try {
            // Using OpenWeatherMap API (free tier)
            const API_KEY = 'demo'; // In production, this should be a real API key
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Moscow,RU&appid=${API_KEY}&units=metric`);
            
            if (!response.ok) {
                // Fallback to mock weather data if API fails
                setMockWeather();
                return;
            }
            
            const data = await response.json();
            const weatherCondition = data.weather[0].main.toLowerCase();
            const currentMonth = new Date().getMonth() + 1;
            
            updateWeatherIcon(weatherCondition, currentMonth);
        } catch (error) {
            console.log('Weather API unavailable, using mock data');
            setMockWeather();
        }
    }
    
    // Mock weather function for demo purposes
    function setMockWeather() {
        const currentMonth = new Date().getMonth() + 1;
        const hour = new Date().getHours();
        
        // Simple mock logic based on time and season
        let mockCondition = 'clear';
        if (hour >= 18 || hour <= 6) {
            mockCondition = Math.random() > 0.7 ? 'rain' : 'clear';
        } else if (currentMonth >= 11 || currentMonth <= 2) {
            mockCondition = Math.random() > 0.5 ? 'clouds' : 'clear';
        }
        
        updateWeatherIcon(mockCondition, currentMonth);
    }
    
    // Weather icon mapping function
    function updateWeatherIcon(condition, month) {
        const weatherImage = document.getElementById('weatherImage');
        let weatherFile = 'Sun.png'; // default
        
        switch (condition) {
            case 'rain':
            case 'drizzle':
                weatherFile = 'Rain.png';
                break;
            case 'thunderstorm':
                weatherFile = 'Storm.png';
                break;
            case 'clouds':
            case 'mist':
            case 'fog':
                // Use wind icons based on season
                if (month >= 3 && month <= 5) {
                    weatherFile = 'WindSpring.png'; // Spring wind
                } else if (month >= 9 && month <= 11) {
                    weatherFile = 'WindFall.png'; // Fall wind
                } else {
                    weatherFile = 'Sun.png'; // Default for other seasons
                }
                break;
            case 'clear':
            default:
                weatherFile = 'Sun.png';
                break;
        }
        
        weatherImage.src = `assets/images/${weatherFile}`;
    }
    
    // Update time immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
    
    // Update date immediately and then every hour for optimization
    updateDate();
    setInterval(updateDate, 3600000); // 3600000ms = 1 hour
    
    // Update season separately every hour for optimization
    updateSeason(new Date());
    setInterval(() => updateSeason(new Date()), 3600000); // 3600000ms = 1 hour
    
    // Update weather immediately and then every 30 minutes
    updateWeather();
    setInterval(updateWeather, 1800000); // 1800000ms = 30 minutes
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.content-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            document.getElementById(targetPanel).classList.add('active');
            
            // Add click sound effect (visual feedback)
            this.style.transform = 'translateY(-4px)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Skill bar animations
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => {
            const level = bar.getAttribute('data-level');
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = (level * 10) + '%';
            }, 300);
        });
    }
    
    // Animate skill bars when skills tab is clicked
    const skillsTab = document.querySelector('[data-tab="skills"]');
    skillsTab.addEventListener('click', function() {
        setTimeout(animateSkillBars, 100);
    });
    
    // Initialize skill bars on page load
    animateSkillBars();
    
    // Sparkle animation for footer
    function createSparkle() {
        const sparkles = document.querySelector('.sparkles');
        const sparkleElements = ['✨', '⭐', '🌟', '💫'];
        
        setInterval(() => {
            const randomSparkle = sparkleElements[Math.floor(Math.random() * sparkleElements.length)];
            sparkles.textContent = randomSparkle;
        }, 2000);
    }
    
    createSparkle();
    
    // Hover effects for interactive elements
    function addHoverEffects() {
        // Project items
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = 'inset 1px 1px 0px #CD853F, 0 4px 12px rgba(0,0,0,0.4)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'inset 1px 1px 0px #CD853F';
            });
        });
        
        // Collectible items
        const collectibleItems = document.querySelectorAll('.collectible-item');
        collectibleItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = 'inset 1px 1px 0px #CD853F, 0 4px 12px rgba(0,0,0,0.4)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'inset 1px 1px 0px #CD853F';
            });
        });
    }
    
    addHoverEffects();
    
    // Typewriter effect for character name (optional enhancement)
    function typewriterEffect() {
        const nameElement = document.querySelector('.character-name');
        const originalText = nameElement.textContent;
        nameElement.textContent = '';
        
        let i = 0;
        const timer = setInterval(() => {
            nameElement.textContent += originalText.charAt(i);
            i++;
            if (i >= originalText.length) {
                clearInterval(timer);
            }
        }, 100);
    }
    
    // Uncomment to enable typewriter effect
    // setTimeout(typewriterEffect, 500);
    
    // Floating animation for pixel avatar
    function floatingAvatar() {
        const avatar = document.querySelector('.pixel-avatar');
        let direction = 1;
        let position = 0;
        
        setInterval(() => {
            position += direction * 0.5;
            if (position >= 3 || position <= -3) {
                direction *= -1;
            }
            avatar.style.transform = `translateY(${position}px)`;
        }, 100);
    }
    
    floatingAvatar();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const activeTab = document.querySelector('.tab.active');
        const allTabs = Array.from(tabs);
        const currentIndex = allTabs.indexOf(activeTab);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % allTabs.length;
            allTabs[nextIndex].click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
            allTabs[prevIndex].click();
        }
    });
    
    // Add focus styles for accessibility
    tabs.forEach(tab => {
        tab.addEventListener('focus', function() {
            this.style.outline = '2px solid #87CEEB';
        });
        
        tab.addEventListener('blur', function() {
            this.style.outline = '';
        });
    });
    
    // Smooth scrolling for project links (if they're internal links)
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Progress bar fill animation on scroll/view
    function animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('skill-progress')) {
                        const level = entry.target.getAttribute('data-level');
                        entry.target.style.width = (level * 10) + '%';
                    }
                }
            });
        });
        
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => observer.observe(bar));
    }
    
    animateOnScroll();
    
    // Add console message for developers
    console.log('🌾 Welcome to the Stardew Valley Resume! 🌾');
    console.log('Made with 💚 and pixel-perfect attention to detail.');
});

// Utility functions for future enhancements
function playClickSound() {
    // Placeholder for click sound effect
    // Could be implemented with Web Audio API
}

function addParticleEffect(element) {
    // Placeholder for particle effects
    // Could add floating hearts, stars, or sparkles
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        playClickSound,
        addParticleEffect
    };
}