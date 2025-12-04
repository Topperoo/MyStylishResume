document.addEventListener('DOMContentLoaded', function() {
    /* ========================================
     * CROSS-BROWSER AUDIO SYSTEM
     * ======================================== */

    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    let isPlaying = false;
    let audioEnabled = false;

    // Detect audio format support (Safari doesn't support OGG)
    function canPlayOgg() {
        const audio = document.createElement('audio');
        return !!(audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    }

    // Get the right audio file path based on browser support
    function getAudioPath(baseName) {
        // Try OGG first (better quality, smaller size), fallback to MP3 for Safari
        if (canPlayOgg()) {
            return 'assets/Music/' + baseName + '.ogg';
        } else {
            return 'assets/Music/' + baseName + '.mp3';
        }
    }

    // Create audio element with error handling
    function createAudio(baseName, volume) {
        const sound = new Audio();
        sound.preload = 'auto';
        sound.volume = volume || 0.5;

        // Try primary format
        sound.src = getAudioPath(baseName);

        // On error, try the other format
        sound.onerror = function() {
            const altFormat = canPlayOgg() ? '.mp3' : '.ogg';
            sound.src = 'assets/Music/' + baseName + altFormat;
        };

        return sound;
    }

    // Create a pool of click sounds for instant playback without lag
    const clickSoundPool = [];
    const poolSize = 5;
    let poolIndex = 0;

    for (let i = 0; i < poolSize; i++) {
        const sound = createAudio('Click', 0.3);
        sound.load();
        clickSoundPool.push(sound);
    }

    // Function to play leaf sound (creates new instance each time)
    function playLeafSound() {
        if (!audioEnabled) return;
        try {
            const sound = createAudio('Leaf', 0.4);
            sound.play().catch(function() {});
        } catch(e) {}
    }

    // Function to play jingle sound for butterfly
    function playJingleSound() {
        if (!audioEnabled) return;
        try {
            const sound = createAudio('Jingle', 0.8);
            sound.play().catch(function() {});
        } catch(e) {}
    }

    // Make sounds available globally
    window.playLeafSound = playLeafSound;
    window.playJingleSound = playJingleSound;

    // Set background music volume
    if (bgMusic) bgMusic.volume = 0.5;

    // Function to play click sound using pool
    function playClickSound() {
        if (!audioEnabled) return;
        try {
            const sound = clickSoundPool[poolIndex];
            sound.currentTime = 0;
            sound.play().catch(function() {});
            poolIndex = (poolIndex + 1) % poolSize;
        } catch(e) {}
    }

    function toggleMusic() {
        if (!bgMusic) return;

        // Enable audio on first interaction
        audioEnabled = true;

        if (isPlaying) {
            bgMusic.pause();
            if (musicIcon) musicIcon.textContent = '🔇';
            if (musicToggle) musicToggle.classList.remove('playing');
            isPlaying = false;
        } else {
            bgMusic.play().then(function() {
                if (musicIcon) musicIcon.textContent = '🎵';
                if (musicToggle) musicToggle.classList.add('playing');
                isPlaying = true;
            }).catch(function(err) {
                console.log('Audio playback failed:', err);
            });
        }
    }

    if (musicToggle) {
        musicToggle.onclick = toggleMusic;

        // Handle audio ending (in case loop fails)
        if (bgMusic) {
            bgMusic.addEventListener('ended', function() {
                bgMusic.currentTime = 0;
                bgMusic.play();
            });
        }
    }

    // Enable audio on first click anywhere
    document.addEventListener('click', function enableAudio() {
        audioEnabled = true;
        document.removeEventListener('click', enableAudio);
    }, { once: true });

    // Make playClickSound available globally for tabs
    window.playClickSound = playClickSound;

    /* ========================================
     * CLOCK AND TIME MANAGEMENT
     * ======================================== */
    
    // Updates the clock display with current time in 12-hour format
    function updateClock() {
        const now = new Date();
        
        // Convert to 12-hour format like in Stardew Valley
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12 for 12am
        const timeString = `${hours}:${minutes} ${ampm}`;
        
        const clockElement = document.getElementById('clockTime');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }
    
    // Updates the date display (separate from time for optimization)
    function updateDate() {
        const now = new Date();
        
        // Format day abbreviation and date number
        const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const dateString = `${dayName} ${day}`;
        
        const dateElement = document.getElementById('clockDate');
        if (dateElement) {
            dateElement.textContent = dateString;
        }
    }
    
    // Determines and updates the seasonal indicator based on current month
    function updateSeason(date) {
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const seasonImage = document.getElementById('seasonImage');
        
        if (!seasonImage) return;
        
        // Map months to seasons (Northern Hemisphere)
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
    
    /* ========================================
     * WEATHER SYSTEM
     * ======================================== */
    
    // Fetches real weather data for Moscow using Open-Meteo API (free, no key required)
    async function updateWeather() {
        try {
            // Moscow coordinates: 55.7558°N, 37.6176°E
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6176&current_weather=true');
            
            if (!response.ok) {
                setMockWeather();
                return;
            }
            
            const data = await response.json();
            const weatherCode = data.current_weather?.weathercode;
            const currentMonth = new Date().getMonth() + 1;
            
            if (weatherCode !== undefined) {
                updateWeatherIconFromCode(weatherCode, currentMonth);
            } else {
                setMockWeather();
            }
        } catch (error) {
            // Fallback to mock weather if API fails
            setMockWeather();
        }
    }
    
    // Generates mock weather data when API is unavailable
    function setMockWeather() {
        const currentMonth = new Date().getMonth() + 1;
        const hour = new Date().getHours();

        // Simple weather logic based on time and season
        let mockCondition = 'clear';

        // Winter months: chance of snow
        if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
            const rand = Math.random();
            if (rand > 0.6) {
                mockCondition = 'snow';
            } else if (rand > 0.4) {
                mockCondition = 'clouds';
            }
        }
        // Evening/night hours: 30% chance of rain
        else if (hour >= 18 || hour <= 6) {
            mockCondition = Math.random() > 0.7 ? 'rain' : 'clear';
        }
        // Other months: slight chance of clouds
        else if (currentMonth >= 9 && currentMonth <= 11) {
            mockCondition = Math.random() > 0.5 ? 'clouds' : 'clear';
        }

        updateWeatherIcon(mockCondition, currentMonth);
    }
    
    // Maps Open-Meteo weather codes to appropriate Stardew Valley weather icons
    function updateWeatherIconFromCode(weatherCode, month) {
        const weatherImage = document.getElementById('weatherImage');
        if (!weatherImage) return;
        
        let weatherFile = 'Sun.png'; // Default to sunny weather
        
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
            weatherFile = 'Snow.png';
        } else if (weatherCode >= 80 && weatherCode <= 82) {
            // 80-82: Rain showers
            weatherFile = 'Rain.png';
        } else if (weatherCode >= 85 && weatherCode <= 86) {
            // 85-86: Snow showers
            weatherFile = 'Snow.png';
        } else if (weatherCode >= 95 && weatherCode <= 99) {
            // 95-99: Thunderstorms
            weatherFile = 'Storm.png';
        } else {
            // Default for any unhandled codes
            weatherFile = 'Sun.png';
        }
        
        weatherImage.src = `assets/images/${weatherFile}`;
    }
    
    // Legacy weather icon function for mock weather system compatibility
    function updateWeatherIcon(condition, month) {
        const weatherImage = document.getElementById('weatherImage');
        if (!weatherImage) return;

        let weatherFile = 'Sun.png'; // Default to sunny weather

        switch (condition) {
            case 'rain':
            case 'drizzle':
                weatherFile = 'Rain.png';
                break;
            case 'snow':
                weatherFile = 'Snow.png';
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
    
    /* ========================================
     * INITIALIZATION AND TIMERS
     * ======================================== */

    // Store interval IDs for cleanup
    const intervals = [];

    // Initialize all time-based updates with appropriate intervals
    updateClock();
    intervals.push(setInterval(updateClock, 1000)); // Update every second

    updateDate();
    intervals.push(setInterval(updateDate, 3600000)); // Update every hour (optimization)

    updateSeason(new Date());
    intervals.push(setInterval(() => updateSeason(new Date()), 3600000)); // Update every hour

    updateWeather();
    intervals.push(setInterval(updateWeather, 1800000)); // Update every 30 minutes
    
    /* ========================================
     * TAB NAVIGATION SYSTEM
     * ======================================== */
    
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.content-panel');
    
    // Handle tab switching with visual feedback
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.getAttribute('data-tab');
            if (!targetPanel) return;

            // Play click sound
            if (window.playClickSound) window.playClickSound();

            // Deactivate all tabs and panels with complete state reset
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
                t.style.transform = ''; // Clear any transform styles
                t.style.animation = ''; // Clear any animations
                t.style.background = ''; // Reset background
                t.style.boxShadow = ''; // Reset box shadow
                t.blur(); // Remove focus to clear :active pseudo-class
            });
            document.querySelectorAll('.content-panel').forEach(p => {
                p.classList.remove('active');
            });
            
            // Activate selected tab and corresponding panel
            this.classList.add('active');
            const targetElement = document.getElementById(targetPanel);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Visual click feedback
            this.style.transform = 'translateY(-4px)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    /* ========================================
     * SKILL BAR ANIMATION SYSTEM
     * ======================================== */
    
    // Animates skill progress bars with staggered timing
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        if (skillBars.length === 0) return;
        
        skillBars.forEach((bar, index) => {
            const level = parseInt(bar.getAttribute('data-level'), 10);
            if (!level || level < 1 || level > 10) return;
            
            // Reset width and animate
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = (level * 10) + '%';
            }, 300 + (index * 100)); // Staggered animation delays
        });
    }
    
    // Trigger skill bar animation when Skills tab is clicked
    const skillsTab = document.querySelector('[data-tab="skills"]');
    if (skillsTab) {
        skillsTab.addEventListener('click', function() {
            setTimeout(animateSkillBars, 100);
        });
    }
    
    // Initialize skill bars on page load
    animateSkillBars();
    
    /* ========================================
     * VISUAL EFFECTS AND ANIMATIONS
     * ======================================== */
    
    // Creates rotating sparkle animation in footer
    function createSparkle() {
        const sparkles = document.querySelector('.sparkles');
        if (!sparkles) return;

        const sparkleElements = ['✨', '⭐', '🌟', '💫'];

        intervals.push(setInterval(() => {
            const randomSparkle = sparkleElements[Math.floor(Math.random() * sparkleElements.length)];
            sparkles.textContent = randomSparkle;
        }, 2000));
    }

    createSparkle();
    
    // Adds enhanced hover effects to interactive elements
    function addHoverEffects() {
        const defaultShadow = 'inset 1px 1px 0px #CD853F';
        const hoverShadow = 'inset 1px 1px 0px #CD853F, 0 4px 12px rgba(0,0,0,0.4)';
        
        // Enhanced hover effects for project cards
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = hoverShadow;
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = defaultShadow;
            });
        });
        
        // Enhanced hover effects for collectible items in Other section
        const collectibleItems = document.querySelectorAll('.collectible-item');
        collectibleItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = hoverShadow;
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = defaultShadow;
            });
        });
    }
    
    addHoverEffects();
    
    // Typewriter effect for character name (currently disabled)
    function typewriterEffect() {
        const nameElement = document.querySelector('.character-name');
        if (!nameElement) return;
        
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
    
    // Uncomment to enable typewriter effect on page load
    // setTimeout(typewriterEffect, 500);
    
    // Creates subtle floating animation for the pixel avatar
    function floatingAvatar() {
        const avatar = document.querySelector('.pixel-avatar');
        if (!avatar) return;

        let direction = 1;
        let position = 0;

        intervals.push(setInterval(() => {
            position += direction * 0.5;
            // Reverse direction at boundaries
            if (position >= 3 || position <= -3) {
                direction *= -1;
            }
            avatar.style.transform = `translateY(${position}px)`;
        }, 100));
    }

    floatingAvatar();
    
    /* ========================================
     * ACCESSIBILITY AND KEYBOARD NAVIGATION
     * ======================================== */
    
    // Enables keyboard navigation between tabs using arrow keys
    document.addEventListener('keydown', function(e) {
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;
        
        const allTabs = Array.from(document.querySelectorAll('.tab'));
        const currentIndex = allTabs.indexOf(activeTab);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % allTabs.length;
            allTabs[nextIndex]?.click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
            allTabs[prevIndex]?.click();
        }
    });
    
    // Adds custom focus styles for better accessibility
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('focus', function() {
            this.style.outline = '2px solid #87CEEB';
        });
        
        tab.addEventListener('blur', function() {
            this.style.outline = '';
        });
    });
    
    // Adds click animation to project links
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Visual feedback on click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Animates skill bars when they come into view (scroll-triggered)
    function animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.classList.contains('skill-progress')) {
                    const level = parseInt(entry.target.getAttribute('data-level'), 10);
                    if (level >= 1 && level <= 10) {
                        entry.target.style.width = (level * 10) + '%';
                    }
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of element is visible
        });
        
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => observer.observe(bar));
    }
    
    animateOnScroll();
    
    /* ========================================
     * INTERACTIVE LEAVES SYSTEM
     * ======================================== */

    // Initialize the clickable leaf attached to content box
    function initializeLeaves() {
        const leaf = document.getElementById('contentLeaf');

        if (!leaf) return;

        // Add magical petal explosion on click
        leaf.addEventListener('click', function(e) {
            createPetalExplosion(leaf);

            // Play leaf sound
            if (window.playLeafSound) window.playLeafSound();

            // Visual feedback - shake animation
            leaf.classList.add('clicked');
            setTimeout(() => {
                leaf.classList.remove('clicked');
            }, 300);
        });
    }
    
    // Creates magical petal explosion effect when leaf is clicked
    function createPetalExplosion(leafElement) {
        const petalCount = 8 + Math.floor(Math.random() * 5); // Random 8-12 petals
        const petalTypes = ['type1', 'type2', 'type3', 'type4']; // 4 different petal styles

        // Get the content container as the reference for positioning
        const contentContainer = document.querySelector('.content-container');
        if (!contentContainer) return;

        // Calculate position relative to content container (not viewport)
        // This ensures petals spawn at same position regardless of zoom/scale
        const containerRect = contentContainer.getBoundingClientRect();
        const leafRect = leafElement.getBoundingClientRect();

        // Position relative to container
        const relativeX = leafRect.left - containerRect.left + leafRect.width / 2;
        const relativeY = leafRect.top - containerRect.top + leafRect.height / 2;

        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = `petal ${petalTypes[Math.floor(Math.random() * petalTypes.length)]}`;

            // Position petals at explosion center with slight random spread
            const spreadX = (Math.random() - 0.5) * 20; // ±10px horizontal spread
            const spreadY = (Math.random() - 0.5) * 20; // ±10px vertical spread
            petal.style.left = (relativeX - 12 + spreadX) + 'px';
            petal.style.top = (relativeY - 12 + spreadY) + 'px';

            // Physics simulation: wind effect vs normal fall
            const hasWindEffect = Math.random() < 0.3; // 30% chance of wind
            const fallDistance = 300 + Math.random() * 400; // Variable fall distance

            let driftDistance, fallDuration, windAnimation;

            if (hasWindEffect) {
                // Wind effect: strong sideways drift, slower fall
                driftDistance = (Math.random() - 0.5) * 400 + (Math.random() > 0.5 ? 150 : -150);
                fallDuration = 4 + Math.random() * 3; // 4-7 seconds
                windAnimation = 'petalWindFallVariable';
            } else {
                // Normal fall: gentle drift
                driftDistance = (Math.random() - 0.5) * 150; // ±75px drift
                fallDuration = 3 + Math.random() * 2; // 3-5 seconds
                windAnimation = 'petalFallVariable';
            }

            const rotation = Math.random() * 720 - 360; // Random rotation ±360°
            const delay = i * 0.02; // Staggered release timing

            // Apply physics parameters via CSS custom properties
            petal.style.setProperty('--drift', driftDistance + 'px');
            petal.style.setProperty('--rotation', rotation + 'deg');
            petal.style.setProperty('--fall-distance', fallDistance + 'px');
            petal.style.animation = `${windAnimation} ${fallDuration}s linear ${delay}s forwards`;

            // Append to content container so petals scale with it
            contentContainer.appendChild(petal);

            // Clean up petal after animation completes
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.parentNode.removeChild(petal);
                }
            }, (fallDuration + delay + 0.1) * 1000);
        }
    }
    
    // Initialize the leaves system
    initializeLeaves();

    /* ========================================
     * INTERACTIVE BUTTERFLY COLOR CHANGER
     * ======================================== */
    
    // Enables color cycling for the third butterfly when clicked
    function initializeButterflyColorChanger() {
        const butterfly3 = document.querySelector('.butterfly-3');
        let currentColor = 1;
        const totalColors = 6;
        
        if (!butterfly3) return;
        
        // Set initial color
        butterfly3.classList.add('color-1');
        
        // Add click handler for color cycling
        butterfly3.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Play jingle sound
            if (window.playJingleSound) window.playJingleSound();

            // Remove current color class
            butterfly3.classList.remove(`color-${currentColor}`);
            
            // Cycle to next color (1-6)
            currentColor = (currentColor % totalColors) + 1;
            
            // Apply new color class
            butterfly3.classList.add(`color-${currentColor}`);
            
            // Visual feedback - bounce effect
            butterfly3.style.transform = 'scale(1.2)';
            setTimeout(() => {
                butterfly3.style.transform = '';
            }, 150);
        });
    }
    
    initializeButterflyColorChanger();

    // Cleanup intervals on page unload to prevent memory leaks
    window.addEventListener('beforeunload', function() {
        intervals.forEach(id => clearInterval(id));
    });

});




/* ========================================
 * COPY TO CLIPBOARD FUNCTIONALITY
 * ======================================== */

// Download resume PDF
function downloadResume(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Play jingle sound
    if (window.playJingleSound) window.playJingleSound();

    // Use fetch to download without navigation
    fetch('assets/Resume.pdf')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Aleksandr_Chernousov_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.log('Download failed:', err);
        });

    return false;
}

// Copies text to clipboard with fallback for older browsers
function copyToClipboard(text) {
    if (!text) {
        showCopyNotification('Nothing to copy');
        return;
    }

    // Play jingle sound
    if (window.playJingleSound) window.playJingleSound();

    // Modern browsers: use Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyNotification('Copied to clipboard!');
        }).catch(function(err) {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback copy method using deprecated execCommand
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification('Copied to clipboard!');
    } catch (err) {
        showCopyNotification('Copy failed - please copy manually');
    }
    
    document.body.removeChild(textArea);
}

// Displays copy notification with fade in/out animation
function showCopyNotification(message) {
    // Remove any existing notification to prevent overlaps
    const existing = document.querySelector('.copy-notification');
    if (existing) existing.remove();
    
    // Create and configure notification element
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Trigger fade-in animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-hide after 2 seconds with fade-out
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300); // Wait for fade-out transition
    }, 2000);
}

// Limits scrolling to content boundaries
function limitScrollToContent() {
    const gameContainer = document.querySelector('.game-container');
    const footer = document.querySelector('.footer');
    
    if (!gameContainer || !footer) return;
    
    // Calculate maximum scroll position
    const footerRect = footer.getBoundingClientRect();
    const gameContainerRect = gameContainer.getBoundingClientRect();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Limit scroll based on content height
    const contentHeight = gameContainerRect.height + parseInt(getComputedStyle(gameContainer).marginTop) + parseInt(getComputedStyle(gameContainer).marginBottom);
    const maxAllowedScroll = Math.max(0, contentHeight - window.innerHeight + 100); // 100px buffer
    
    if (window.scrollY > maxAllowedScroll) {
        window.scrollTo(0, maxAllowedScroll);
    }
}

// Add scroll event listener
window.addEventListener('scroll', limitScrollToContent);

// Also limit on resize
window.addEventListener('resize', limitScrollToContent);

