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
    
    // Weather update function for Moscow using Open-Meteo API
    async function updateWeather() {
        try {
            // Using Open-Meteo API (completely free, no API key needed)
            // Moscow coordinates: 55.7558°N, 37.6176°E
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6176&current_weather=true');
            
            if (!response.ok) {
                // Fallback to mock weather data if API fails
                setMockWeather();
                return;
            }
            
            const data = await response.json();
            const weatherCode = data.current_weather.weathercode;
            const currentMonth = new Date().getMonth() + 1;
            
            updateWeatherIconFromCode(weatherCode, currentMonth);
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
    
    // Weather icon mapping function for Open-Meteo weather codes
    function updateWeatherIconFromCode(weatherCode, month) {
        const weatherImage = document.getElementById('weatherImage');
        let weatherFile = 'Sun.png'; // default
        
        // Open-Meteo weather codes: https://open-meteo.com/en/docs
        if (weatherCode >= 0 && weatherCode <= 3) {
            // 0: Clear sky, 1: Mainly clear, 2: Partly cloudy, 3: Overcast
            if (weatherCode === 0 || weatherCode === 1) {
                weatherFile = 'Sun.png'; // Clear/mainly clear
            } else {
                // Partly cloudy/overcast - use wind icons based on season
                if (month >= 3 && month <= 5) {
                    weatherFile = 'WindSpring.png'; // Spring wind
                } else if (month >= 9 && month <= 11) {
                    weatherFile = 'WindFall.png'; // Fall wind
                } else {
                    weatherFile = 'Sun.png'; // Default for other seasons
                }
            }
        } else if (weatherCode >= 45 && weatherCode <= 48) {
            // 45: Fog, 46: Depositing rime fog, 48: Depositing rime fog
            if (month >= 3 && month <= 5) {
                weatherFile = 'WindSpring.png'; // Spring wind
            } else if (month >= 9 && month <= 11) {
                weatherFile = 'WindFall.png'; // Fall wind
            } else {
                weatherFile = 'Sun.png';
            }
        } else if (weatherCode >= 51 && weatherCode <= 67) {
            // 51-67: Various types of rain (drizzle, rain, freezing rain)
            weatherFile = 'Rain.png';
        } else if (weatherCode >= 71 && weatherCode <= 77) {
            // 71-77: Snow fall
            weatherFile = 'Rain.png'; // Use rain icon for snow
        } else if (weatherCode >= 80 && weatherCode <= 82) {
            // 80-82: Rain showers
            weatherFile = 'Rain.png';
        } else if (weatherCode >= 85 && weatherCode <= 86) {
            // 85-86: Snow showers
            weatherFile = 'Rain.png'; // Use rain icon for snow
        } else if (weatherCode >= 95 && weatherCode <= 99) {
            // 95-99: Thunderstorms
            weatherFile = 'Storm.png';
        } else {
            // Default for any unhandled codes
            weatherFile = 'Sun.png';
        }
        
        weatherImage.src = `assets/images/${weatherFile}`;
    }
    
    // Keep the old function for mock weather compatibility
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
    
    // Interactive Leaves System - Single Fixed Leaf
    function initializeLeaves() {
        const leavesContainer = document.getElementById('leavesContainer');
        
        // Find the main content container (middle box)
        const contentContainer = document.querySelector('.content-container');
        
        if (contentContainer) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            
            // Get container dimensions and position
            const containerRect = contentContainer.getBoundingClientRect();
            
            // Fixed position: top-right corner (adjusted for new 96px size)
            const x = containerRect.right - 48; // 48px from right edge (half leaf inside)  
            const y = containerRect.top - 48; // 48px above top edge (half leaf above)
            
            leaf.style.left = x + 'px';
            leaf.style.top = y + 'px';
            
            // Fixed animation timing
            leaf.style.animationDelay = '0s';
            leaf.style.animationDuration = '4s';
            
            // Click event for petal explosion
            leaf.addEventListener('click', function(e) {
                createPetalExplosion(leaf); // Pass the leaf element instead of coordinates
                
                // Add shake animation
                leaf.classList.add('clicked');
                setTimeout(() => {
                    leaf.classList.remove('clicked');
                }, 300);
            });
            
            leavesContainer.appendChild(leaf);
        }
    }
    
    // Petal particle explosion system using real falling leaf images
    function createPetalExplosion(leafElement) {
        const petalCount = 8 + Math.floor(Math.random() * 5); // 8-12 petals (reduced from 15-25)
        const petalTypes = ['type1', 'type2', 'type3', 'type4']; // 4 different falling leaf types
        
        // Get the center position of the leaf element
        const leafRect = leafElement.getBoundingClientRect();
        const centerX = leafRect.left + leafRect.width / 2;
        const centerY = leafRect.top + leafRect.height / 2; // Center of leaf spawner
        
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = `petal ${petalTypes[Math.floor(Math.random() * petalTypes.length)]}`;
            
            // Position inside the leaf texture at center with small random spread
            const spreadX = (Math.random() - 0.5) * 20; // Random spread of 20px
            const spreadY = (Math.random() - 0.5) * 20; // Random spread in Y direction too
            petal.style.left = (centerX - 12 + spreadX) + 'px'; // 12 = half of 24px petal width + spread
            petal.style.top = (centerY - 12 + spreadY) + 'px'; // Start at center of leaf + small offset
            
            // Enhanced physics with wind effects and variable fall distances
            const hasWindEffect = Math.random() < 0.3; // 30% chance of wind effect
            const fallDistance = 300 + Math.random() * 400; // Random fall distance: 300-700px
            
            let driftDistance, fallDuration, windAnimation;
            
            if (hasWindEffect) {
                // Wind effect: stronger horizontal movement, slower fall
                driftDistance = (Math.random() - 0.5) * 400 + (Math.random() > 0.5 ? 150 : -150); // Strong sideways drift
                fallDuration = 4 + Math.random() * 3; // 4-7 seconds (slower for smoother motion)
                windAnimation = 'petalWindFallVariable';
            } else {
                // Normal fall with light drift
                driftDistance = (Math.random() - 0.5) * 150; // -75 to 75px horizontal drift
                fallDuration = 3 + Math.random() * 2; // 3-5 seconds (increased for smoother motion)
                windAnimation = 'petalFallVariable';
            }
            
            const rotation = Math.random() * 720 - 360; // -360 to 360 degrees
            const delay = i * 0.02; // Staggered delay: 0s, 0.02s, 0.04s, etc. (removes random delay)
            
            // Set CSS custom properties for animation
            petal.style.setProperty('--drift', driftDistance + 'px');
            petal.style.setProperty('--rotation', rotation + 'deg');
            petal.style.setProperty('--fall-distance', fallDistance + 'px');
            petal.style.animation = `${windAnimation} ${fallDuration}s linear ${delay}s forwards`;
            
            document.body.appendChild(petal);
            
            // Remove petal after animation
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.parentNode.removeChild(petal);
                }
            }, (fallDuration + delay + 0.1) * 1000);
        }
    }
    
    // Initialize leaves system
    initializeLeaves();
    
    // Reinitialize leaves on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const leavesContainer = document.getElementById('leavesContainer');
            leavesContainer.innerHTML = '';
            initializeLeaves();
        }, 500);
    });

    // Interactive butterfly color changing
    function initializeButterflyColorChanger() {
        const butterfly3 = document.querySelector('.butterfly-3');
        let currentColor = 1;
        const totalColors = 6;
        
        console.log('Butterfly3 element found:', butterfly3); // Debug log
        
        if (butterfly3) {
            // Set initial color class
            butterfly3.classList.add('color-1');
            
            // Add click event listener
            butterfly3.addEventListener('click', function(e) {
                console.log('Butterfly clicked!', currentColor); // Debug log
                e.preventDefault();
                e.stopPropagation();
                
                // Remove current color class
                butterfly3.classList.remove(`color-${currentColor}`);
                
                // Cycle to next color
                currentColor = (currentColor % totalColors) + 1;
                
                // Add new color class
                butterfly3.classList.add(`color-${currentColor}`);
                console.log('Changed to color:', currentColor); // Debug log
                
                // Add a small bounce effect on click
                butterfly3.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    butterfly3.style.transform = '';
                }, 150);
            });
            
            console.log('Click listener added to butterfly'); // Debug log
        } else {
            console.log('Butterfly3 not found!'); // Debug log
        }
    }
    
    // Initialize butterfly color changer
    initializeButterflyColorChanger();

    // Add console message for developers
    console.log('🌾 Welcome to the Stardew Valley Resume! 🌾');
    console.log('Made with 💚 and pixel-perfect attention to detail.');
    console.log('🍃 Click on the leaves for a magical surprise! 🍃');
    console.log('🦋 Click on the pink butterfly to change its color! 🦋');
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