// Forest-Themed Portfolio JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initializeNavigation();
    initializeSmoothScrolling();
    initializeScrollAnimations();
    initializeParallaxEffects();
    initializeFormHandling();
    initializeTypingEffect();
    addFloatingElements();
    addInteractiveBushes();
    addGrowingPlants();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger?.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));

    // Navbar background on scroll
    window.addEventListener('scroll', throttle(handleNavbarScroll, 100));
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Handle navbar background opacity on scroll
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(240, 255, 240, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(240, 255, 240, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations using Intersection Observer
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add specific animations for different elements
                if (entry.target.classList.contains('skill-category')) {
                    animateSkillCategory(entry.target);
                }
                
                if (entry.target.classList.contains('project-card')) {
                    animateProjectCard(entry.target);
                }
                
                if (entry.target.classList.contains('stat')) {
                    animateStatNumber(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.skill-category, .project-card, .stat, .contact-method').forEach(el => {
        observer.observe(el);
    });
}

// Animate skill categories
function animateSkillCategory(element) {
    const tags = element.querySelectorAll('.skill-tag');
    tags.forEach((tag, index) => {
        setTimeout(() => {
            tag.style.opacity = '0';
            tag.style.transform = 'translateY(20px)';
            tag.style.transition = 'all 0.3s ease';
            
            requestAnimationFrame(() => {
                tag.style.opacity = '1';
                tag.style.transform = 'translateY(0)';
            });
        }, index * 100);
    });
}

// Animate project cards
function animateProjectCard(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 200);
}

// Animate stat numbers
function animateStatNumber(element) {
    const numberElement = element.querySelector('.stat-number');
    if (!numberElement) return;
    
    const finalNumber = parseInt(numberElement.textContent.replace(/\D/g, ''));
    const suffix = numberElement.textContent.replace(/\d/g, '');
    let currentNumber = 0;
    const increment = finalNumber / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
            currentNumber = finalNumber;
            clearInterval(timer);
        }
        numberElement.textContent = Math.floor(currentNumber) + suffix;
    }, stepTime);
}

// Parallax effects for hero background
function initializeParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        const forestSilhouette = document.querySelector('.forest-silhouette');
        
        if (heroBackground) {
            const parallaxSpeed = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${parallaxSpeed}px)`;
        }
        
        if (forestSilhouette) {
            const parallaxSpeed = scrolled * 0.3;
            forestSilhouette.style.transform = `translateY(${parallaxSpeed}px)`;
        }
        
        ticking = false;
    }
    
    function requestParallaxTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestParallaxTick);
}

// Form handling
function initializeFormHandling() {
    const form = document.querySelector('.form');
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    
    // Add focus and blur effects
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // Check if input is pre-filled
        if (input.value) {
            input.parentElement.classList.add('filled');
        }
    });

    // Form submission
    form?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('.form-submit');
        const originalText = submitButton.textContent;
        
        // Add loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        submitButton.style.background = 'var(--forest-medium)';
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            submitButton.textContent = 'Message Sent! 🌲';
            submitButton.style.background = 'var(--forest-bright)';
            
            // Reset form
            setTimeout(() => {
                this.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.background = 'var(--forest-accent)';
                
                // Remove filled classes
                document.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('filled');
                });
            }, 2000);
        }, 1500);
    });
}

// Typing effect for hero title
function initializeTypingEffect() {
    const titleElement = document.querySelector('.hero-title');
    if (!titleElement) return;
    
    const originalText = titleElement.textContent;
    titleElement.textContent = '';
    titleElement.style.borderRight = '2px solid var(--forest-accent)';
    
    let charIndex = 0;
    
    function typeWriter() {
        if (charIndex < originalText.length) {
            titleElement.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 150);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                titleElement.style.borderRight = 'none';
            }, 1000);
        }
    }
    
    // Start typing after a delay
    setTimeout(typeWriter, 500);
}

// Add floating forest elements
function addFloatingElements() {
    // Create floating leaves throughout the entire page
    createPageWideLeaves();
    
    // Create floating particles in hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        for (let i = 0; i < 15; i++) {
            createFloatingParticle(hero, i);
        }
    }
}

// Create floating leaves across the entire page
function createPageWideLeaves() {
    const body = document.body;
    const leafVariants = ['🌿', '🍂'];
    
    // Create initial set of leaves
    for (let i = 0; i < 30; i++) {
        createGlobalFloatingLeaf(body, i, leafVariants);
    }
    
    // Continuously add new leaves
    setInterval(() => {
        if (document.querySelectorAll('.global-floating-leaf').length < 40) {
            createGlobalFloatingLeaf(body, Math.random() * 100, leafVariants);
        }
    }, 2000);
}

function createGlobalFloatingLeaf(container, index, leafVariants) {
    const leaf = document.createElement('div');
    leaf.className = 'global-floating-leaf';
    leaf.innerHTML = leafVariants[Math.floor(Math.random() * leafVariants.length)];
    
    const size = 0.8 + Math.random() * 1.2;
    const animationDuration = 6 + Math.random() * 8;
    const horizontalSpeed = -50 + Math.random() * 100;
    
    leaf.style.cssText = `
        position: fixed;
        font-size: ${size}rem;
        opacity: ${0.3 + Math.random() * 0.5};
        pointer-events: none;
        z-index: 1000;
        left: ${Math.random() * 100}vw;
        top: -5vh;
        color: ${Math.random() > 0.5 ? '#228B22' : '#32CD32'};
        filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.1));
        animation: globalLeafFall ${animationDuration}s linear infinite;
        --horizontal-drift: ${horizontalSpeed}px;
    `;
    
    container.appendChild(leaf);
    
    // Remove leaf after animation completes
    setTimeout(() => {
        if (leaf.parentNode) {
            leaf.remove();
        }
    }, animationDuration * 1000);
}

function createFloatingLeaf(container, index) {
    const leaf = document.createElement('div');
    const leafVariants = ['🌿', '🍂'];
    leaf.className = 'floating-leaf';
    leaf.innerHTML = leafVariants[Math.floor(Math.random() * leafVariants.length)];
    leaf.style.cssText = `
        position: absolute;
        font-size: ${1 + Math.random()}rem;
        opacity: ${0.4 + Math.random() * 0.4};
        pointer-events: none;
        z-index: 1;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatLeaf ${4 + Math.random() * 3}s infinite ease-in-out;
        animation-delay: ${index * -0.8}s;
        color: ${Math.random() > 0.6 ? '#228B22' : '#32CD32'};
        filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.1));
    `;
    
    container.appendChild(leaf);
}

function createFloatingParticle(container, index) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    const colors = ['var(--forest-accent)', 'var(--forest-bright)', 'var(--forest-pale)'];
    particle.style.cssText = `
        position: absolute;
        width: ${3 + Math.random() * 5}px;
        height: ${3 + Math.random() * 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        opacity: ${0.3 + Math.random() * 0.4};
        pointer-events: none;
        z-index: 1;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${5 + Math.random() * 4}s infinite ease-in-out;
        animation-delay: ${index * -0.4}s;
        box-shadow: 0 0 10px rgba(34, 139, 34, 0.3);
    `;
    
    container.appendChild(particle);
}

// Utility function for throttling
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add custom CSS animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* Animation classes */
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .skill-category,
    .project-card,
    .stat,
    .contact-method {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    /* Form focus states */
    .form-group.focused .form-label {
        color: var(--forest-accent) !important;
    }
    
    .form-group.focused .form-input,
    .form-group.focused .form-textarea {
        border-color: var(--forest-accent);
        box-shadow: 0 0 0 3px rgba(34, 139, 34, 0.1);
    }
    
    /* Floating animations */
    @keyframes floatLeaf {
        0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
            opacity: 0.4;
        }
        25% {
            transform: translateY(-25px) translateX(15px) rotate(90deg) scale(1.1);
            opacity: 0.7;
        }
        50% {
            transform: translateY(-10px) translateX(-20px) rotate(180deg) scale(0.95);
            opacity: 0.8;
        }
        75% {
            transform: translateY(-30px) translateX(10px) rotate(270deg) scale(1.05);
            opacity: 0.6;
        }
    }
    
    @keyframes globalLeafFall {
        0% {
            transform: translateY(-5vh) translateX(0px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.6;
        }
        50% {
            transform: translateY(50vh) translateX(var(--horizontal-drift)) rotate(180deg);
            opacity: 0.8;
        }
        90% {
            opacity: 0.4;
        }
        100% {
            transform: translateY(105vh) translateX(calc(var(--horizontal-drift) * 2)) rotate(360deg);
            opacity: 0;
        }
    }
    
    
    @keyframes floatParticle {
        0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.3;
        }
        25% {
            transform: translateY(-40px) translateX(25px) scale(1.2);
            opacity: 0.7;
        }
        50% {
            transform: translateY(-15px) translateX(-20px) scale(0.8);
            opacity: 0.5;
        }
        75% {
            transform: translateY(-35px) translateX(15px) scale(1.1);
            opacity: 0.8;
        }
    }
    
    /* Enhanced hover effects */
    .hero-link {
        position: relative;
        overflow: hidden;
    }
    
    .hero-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: left 0.5s;
    }
    
    .hero-link:hover::before {
        left: 100%;
    }
    
    /* Skill tag enhanced animation */
    .skill-tag {
        position: relative;
        overflow: hidden;
    }
    
    .skill-tag::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.3s;
    }
    
    .skill-tag:hover::before {
        left: 100%;
    }
    
    /* Project card image overlay */
    .project-image::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(34, 139, 34, 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .project-card:hover .project-image::before {
        opacity: 1;
    }
    
    /* Responsive enhancements */
    @media (max-width: 768px) {
        .floating-leaf,
        .floating-particle {
            animation-duration: 3s !important;
        }
        
        .global-floating-leaf {
            animation-duration: 4s !important;
        }
        
        .hero-background {
            transform: none !important;
        }
        
        .forest-silhouette {
            transform: none !important;
        }
    }
    
    /* Smooth transitions for theme consistency */
    * {
        transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
    }
    
    /* Focus states for accessibility */
    .cta-button:focus,
    .hero-link:focus,
    .project-link:focus,
    .nav-link:focus {
        outline: 2px solid var(--forest-accent);
        outline-offset: 2px;
    }
`;

document.head.appendChild(additionalStyles);

// Initialize theme-aware scroll behavior
function initializeThemeScrollBehavior() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;
        
        // Add subtle body class for scroll direction
        if (scrollingDown && currentScrollY > 100) {
            document.body.classList.add('scrolling-down');
        } else {
            document.body.classList.remove('scrolling-down');
        }
        
        lastScrollY = currentScrollY;
    }, 100));
}

// Call theme scroll behavior
initializeThemeScrollBehavior();

// Add interactive bush elements that respond to hover
function addInteractiveBushes() {
    // Add hover effects to skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category, index) => {
        category.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 15px 30px rgba(34, 139, 34, 0.2), inset 0 2px 6px rgba(50, 205, 50, 0.2)';
        });
        
        category.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
            this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(50, 205, 50, 0.1)';
        });
    });
    
    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(34, 139, 34, 0.15), inset 0 3px 6px rgba(34, 139, 34, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
            this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(34, 139, 34, 0.1)';
        });
    });
    
    // Add hover effects to stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow = '0 8px 16px rgba(34, 139, 34, 0.15), inset 0 2px 6px rgba(34, 139, 34, 0.15)';
        });
        
        stat.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(34, 139, 34, 0.1)';
        });
    });
    
    // Add hover effects to contact methods
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px) scale(1.02)';
            this.style.boxShadow = '0 8px 16px rgba(34, 139, 34, 0.2), inset 0 2px 6px rgba(34, 139, 34, 0.1)';
        });
        
        method.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(5px) scale(1)';
            this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), inset 0 1px 3px rgba(34, 139, 34, 0.1)';
        });
    });
}

// Add growing plant animation on scroll
function addGrowingPlants() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        const plant = document.createElement('div');
        plant.className = 'growing-plant';
        plant.innerHTML = ['🌿', '🍂', '🌿', '🍂'][index % 4];
        plant.style.cssText = `
            position: absolute;
            font-size: 2rem;
            opacity: 0;
            transform: translateY(20px) scale(0.5);
            transition: all 1s ease;
            pointer-events: none;
            z-index: 1000;
            ${index % 2 === 0 ? 'left: 50px;' : 'right: 50px;'}
            top: 50%;
        `;
        
        section.style.position = 'relative';
        section.appendChild(plant);
        
        // Animate plant growth on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        plant.style.opacity = '0.6';
                        plant.style.transform = 'translateY(0) scale(1)';
                    }, index * 200);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(section);
    });
}


