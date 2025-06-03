/**
 * App.js - Main Application Logic
 * This is where you initialize Web Weaver and build your website
 */

// Initialize Web Weaver when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize WebWeaver
    const weaver2 = new WebWeaver('app-container');
    
    // Call the main website building function
    buildExampleWebsite(weaver2);
});

/**
 * Example function showing how to build a website using Web Weaver
 */
function buildExampleWebsite(weaver) {
    // Clear any existing content and start building
    weaver.clear()
        .divStart('', '', { 
            style: 'max-width: 1200px; margin: 0 auto; padding: 0 1rem; text-align: center;' 
        })
        .h1('Welcome to Web Weaver JS', 'mb-8')
        .paragraph('A powerful JavaScript library for building websites programmatically.', 'mb-8');
    weaver.divEnd(); // Close the container
    
    // Create a navigation bar
    weaver.createNavbar('Web Weaver JS', [
        { text: 'Home', href: '#home' },
        { text: 'About', href: '#about' },
        { text: 'Features', href: '#features' },
        { text: 'Contact', href: '#contact' }
    ]);
    
    // Create a hero section
    weaver.createHero(
        'Welcome to Web Weaver JS',
        'Build beautiful websites with simple JavaScript methods',
        'Get Started',
        () => alert('Welcome to Web Weaver JS!')
    );
    
    // Create a features section
    weaver.divStart('', '', { 
            style: 'max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; text-align: center;' 
        })
        .h2('Features', '', { style: 'text-align: center; margin-bottom: 2rem;' })
        .flexContainer('', '', { 
            style: 'display: flex; gap: 2rem; margin-bottom: 2rem; justify-content: center; flex-wrap: wrap;' 
        });
    
    // Feature cards
    const features = [
        {
            title: 'Easy to Use',
            description: 'Simple method calls to create complex layouts',
            icon: '🚀'
        },
        {
            title: 'Theme Support',
            description: 'Multiple color themes with easy switching',
            icon: '🎨'
        },
        {
            title: 'Responsive',
            description: 'Built-in responsive design components',
            icon: '📱'
        }
    ];
    
    // Feature cards
    features.forEach(feature => {
        weaver.card('', '', { 
                style: 'flex: 1; min-width: 250px; max-width: 300px; text-align: center;' 
            })
            .text(feature.icon, 'div', '', '', { style: 'font-size: 3rem; margin-bottom: 1rem; text-align: center;' })
            .h3(feature.title, '', { style: 'margin-bottom: 1rem;' })
            .paragraph(feature.description, '', { style: 'font-size: 0.9rem;' })
            .divEnd();
    });
    
    weaver.divEnd() // End flex container
        .divEnd(); // End features container
    
    // Theme switching example
    weaver.divStart('text-center p-8')
        .h2('Try Different Themes', 'mb-8')
        .text('Click the buttons below to switch color themes:', 'p', 'mb-4')
        .flexContainer('flex gap-4 justify-center mb-8');
    
    // Theme buttons with save functionality
    const themes = [
        { name: 'Blue', method: 'applyBlueTheme', theme: 'default' },
        { name: 'Dark', method: 'applyDarkTheme', theme: 'dark' },
        { name: 'Green', method: 'applyGreenTheme', theme: 'green' },
        { name: 'Purple', method: 'applyPurpleTheme', theme: 'purple' },
        { name: 'Red', method: 'applyRedTheme', theme: 'red' }
    ];
    
    themes.forEach(theme => {
        weaver.button(theme.name, () => {
            weaver[theme.method]();
            weaver.saveTheme(theme.theme);
            weaver.toast(`${theme.name} theme applied and saved!`, 'success');
        }, 'btn btn-small');
    });
    
    weaver.divEnd() // End flex container
        .divEnd(); // End container
    
    // Footer
    weaver.createFooter(
        '© 2025 Web Weaver JS. Built with JavaScript.',
        [
            { text: 'Documentation', href: '#docs' },
            { text: 'GitHub', href: '#github' },
            { text: 'Support', href: '#support' }
        ]
    );
}

/**
 * Example form submission handler
 */
function handleFormSubmit(event) {
    event.preventDefault();
    alert('Form submitted! (This is just a demo)');
}

/**
 * Example function to add dynamic content
 */
function addDynamicContent() {
    const weaver = new WebWeaver('app-container');
    
    weaver.clear()
        .divStart()
        .h1('Dynamic Content Added!', 'text-center mb-8')
        .paragraph('This content was added dynamically using Web Weaver methods.', 'text-center')
        .button('Go Back', () => location.reload(), 'btn mt-4')
        .divEnd();
}

// Export functions for global access
window.addDynamicContent = addDynamicContent;