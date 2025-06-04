# Web Weaver JS 🕸️

A powerful, intuitive JavaScript library for building websites programmatically using simple method chaining. Create beautiful, responsive websites with minimal code and maximum flexibility.

Website:
https://horrelltech.github.io/Web-Weaver-JS/

## ✨ Features

- **🚀 Easy to Use**: Simple method calls to create complex layouts
- **🎨 Theme Support**: Multiple color themes with easy switching (Blue, Dark, Green, Purple, Red)
- **📱 Responsive**: Built-in responsive design components
- **🔧 Method Chaining**: Fluent API for clean, readable code
- **🎭 Modals & Panels**: Rich UI components for interactive experiences
- **📝 Forms**: Complete form building with validation support
- **🧩 Layout Components**: Flexbox, Grid, Cards, and more
- **⚡ No Dependencies**: Pure JavaScript, no external libraries required
- **🎪 Advanced Components**: Carousels, Accordions, Toast notifications
- **🔍 Form Validation**: Built-in validation with custom rules
- **📊 Data Components**: Tables, progress bars, badges, alerts
- **🎯 Conditional Logic**: When/if conditions for dynamic building
- **⚡ Performance**: Batch operations for bulk content creation
- **🎨 CSS Integration**: Custom CSS injection and class manipulation
- **🔧 Debug Tools**: Built-in debugging helpers
- **🧭 Navigation**: Breadcrumbs, icons, and advanced nav components
- **📱 Mobile Optimized**: Mobile detection and responsive utilities

## 🚀 Quick Start

### 1. Basic Setup

Create your HTML file:

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Weaver Site</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app-container"></div>
    
    <script src="web-weaver.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 2. Initialize Web Weaver

``` javascript
// app.js
document.addEventListener('DOMContentLoaded', function() {
    const weaver = new WebWeaver('app-container');
    
    // Start building your website
    buildWebsite(weaver);
});

function buildWebsite(weaver) {
    weaver.createNavbar('My Website', [
        { text: 'Home', href: '#home' },
        { text: 'About', href: '#about' },
        { text: 'Contact', href: '#contact' }
    ])
    .createHero(
        'Welcome to My Website',
        'Built with Web Weaver JS',
        'Get Started',
        () => alert('Hello World!')
    );
}
```

## 📚 Complete API Documentation

### Core Container & Layout Methods

#### Basic Containers
- `container(className, id, attributes)` - Create a container div
- `divStart(className, id, attributes)` - Start a new div section
- `divEnd()` - End the current div section
- `section(className, id, attributes)` - Create a section element

#### Flex & Grid Layouts
- `flexContainer(className, id, attributes)` - Create a flex container
- `flexColumn(className, id, attributes)` - Create a flex column container
- `row(className, id, attributes)` - Create a flex row
- `col(className, id, attributes)` - Create a flex column
- `grid(columns, className, id, attributes)` - Create a CSS grid layout

#### Components
- `card(className, id, attributes)` - Create a card component

### Text Elements
- `h1(text, className, id, attributes)` - Create h1 heading
- `h2(text, className, id, attributes)` - Create h2 heading
- `h3(text, className, id, attributes)` - Create h3 heading
- `heading(level, text, className, id, attributes)` - Create any heading level (1-6)
- `paragraph(text, className, id, attributes)` - Create paragraphs
- `text(content, tag, className, id, attributes)` - Create any text element

### Interactive Elements
- `button(text, onClick, className, id, attributes)` - Create buttons
- `buttonPrimary(text, onClick, id, attributes)` - Primary button variant
- `buttonSecondary(text, onClick, id, attributes)` - Secondary button variant
- `buttonSmall(text, onClick, id, attributes)` - Small button variant
- `buttonLarge(text, onClick, id, attributes)` - Large button variant

### Form Elements
- `formStart(className, id, attributes)` - Start a form
- `formEnd()` - End a form
- `input(type, placeholder, className, id, attributes)` - Create input fields
- `textarea(placeholder, rows, className, id, attributes)` - Create text areas
- `checkbox(labelText, checked, className, id, attributes)` - Create checkboxes
- `select(options, className, id, attributes)` - Create select dropdowns

### Media Elements
- `image(src, alt, className, id, attributes)` - Add images
- `video(src, controls, className, id, attributes)` - Add videos
- `icon(iconName, className, id, attributes)` - Add icons

### Navigation Elements
- `navStart(className, id, attributes)` - Start navigation
- `navEnd()` - End navigation
- `navItem(text, href, className, id, attributes)` - Add navigation items
- `breadcrumb(items, className, id, attributes)` - Create breadcrumb navigation

### List Elements
- `listStart(ordered, className, id, attributes)` - Start a list
- `listEnd()` - End a list
- `listItem(text, className, id, attributes)` - Add list items

### Data Display Components
- `createTable(headers, rows, className)` - Create data tables
- `progressBar(percentage, className, label, id, attributes)` - Progress indicators
- `badge(text, type, className, id, attributes)` - Badges and tags
- `alert(message, type, dismissible, className, id, attributes)` - Alert messages

### Advanced Interactive Components
- `accordion(items, className, id, attributes)` - Collapsible content sections
- `carousel(items, options, className, id, attributes)` - Image/content sliders
- `toast(message, type, duration, position)` - Toast notifications

### Quick Layout Methods

#### Pre-built Components
- `createNavbar(brand, items)` - Create a complete navigation bar
- `createHero(title, subtitle, buttonText, buttonAction)` - Create a hero section
- `createFooter(text, links)` - Create a footer section
- `createLandingPage(config)` - Generate complete landing page

#### Quick Content Creators
- `quickCard(title, content, buttonText, buttonAction, className)` - Quick card creation
- `quickSection(title, content, className)` - Quick section creation
- `addMultipleCards(cardsData)` - Bulk card operations
- `addMultipleButtons(buttons)` - Bulk button operations

#### Modals & Panels
- `createModal(title, content, options)` - Create modal dialogs
- `createSidePanel(position, content, options)` - Create side panels
- `createLeftPanel(content, options)` - Create left side panel
- `createRightPanel(content, options)` - Create right side panel
- `createTopPanel(content, options)` - Create top panel
- `createBottomPanel(content, options)` - Create bottom panel
- `toggleSidePanel(panelId)` - Toggle panel visibility
- `closeSidePanel(panelId)` - Close specific panel
- `closeModal(modalId)` - Close specific modal

### Theme Management
- `setTheme(themeName)` - Set theme ('default', 'dark', 'green', 'purple', 'red')
- `applyBlueTheme()` - Apply blue theme
- `applyDarkTheme()` - Apply dark theme
- `applyGreenTheme()` - Apply green theme
- `applyPurpleTheme()` - Apply purple theme
- `applyRedTheme()` - Apply red theme

### Form Validation
- `validateForm(formId, rules)` - Validate form fields with custom rules

### Utility Methods
- `clear()` - Clear all content
- `spacer(height)` - Add spacing
- `lineBreak()` - Add line breaks
- `horizontalRule(className, id, attributes)` - Add horizontal rules
- `spinner(className, id, attributes)` - Add loading spinners
- `when(condition, callback)` - Conditional chaining
- `debug(message)` - Debug helper
- `batch(operations)` - Performance optimization for bulk operations

### CSS & Class Management
- `addCustomCSS(css)` - Add custom CSS
- `addClass(className, selector)` - Add CSS classes
- `removeClass(className, selector)` - Remove CSS classes
- `addFadeIn(element)` - Add fade-in animation

### Event Handling
- `onClick(selector, callback)` - Global event delegation

### Mobile & Responsive
- `isMobile()` - Check if device is mobile
- `onMobile(mobileCallback, desktopCallback)` - Execute different code for mobile/desktop
- `addMobileClass(className)` - Add mobile-specific classes

### Helper Methods
- `getCurrentElement()` - Get current element for advanced manipulation
- `getContainer()` - Get main container
- `setAttributes(element, attributes)` - Set element attributes
- `appendToContainer(element)` - Append element to current container

## 🎯 Examples

### Simple Page Layout

``` javascript
function buildSimplePage(weaver) {
    weaver
        .createNavbar('My Site', [
            { text: 'Home', href: '#home' },
            { text: 'About', href: '#about' }
        ])
        .container('p-8')
            .h1('Welcome!', 'text-center mb-8')
            .paragraph('This is a simple page built with Web Weaver JS.')
            .button('Click Me', () => alert('Button clicked!'), 'btn')
        .divEnd();
}
```

### Two-Column Layout

``` javascript
function buildTwoColumnLayout(weaver) {
    weaver
        .container()
            .h1('Two Column Layout', 'text-center mb-8')
            .flexContainer('flex gap-8')
                .col('flex-1')
                    .h3('Left Column')
                    .paragraph('Content for the left side.')
                .divEnd()
                .col('flex-1')
                    .h3('Right Column')
                    .paragraph('Content for the right side.')
                .divEnd()
            .divEnd() // End flex container
        .divEnd(); // End main container
}
```

### Advanced Form with Validation

``` javascript
function buildContactForm(weaver) {
    weaver
        .container('max-w-md mx-auto p-8')
        .h2('Contact Form', 'text-center mb-8')
        .formStart('', 'advanced-form')
        .input('text', 'Full Name', 'form-control mb-4', 'name', { name: 'name' })
        .input('email', 'Email Address', 'form-control mb-4', 'email', { name: 'email' })
        .input('tel', 'Phone Number', 'form-control mb-4', 'phone', { name: 'phone' })
        .select([
            { value: '', text: 'Select Subject...' },
            { value: 'general', text: 'General Inquiry' },
            { value: 'support', text: 'Support' },
            { value: 'sales', text: 'Sales' }
        ], 'form-control mb-4', 'subject', { name: 'subject' })
        .textarea('Your Message', 5, 'form-control mb-4', 'message', { name: 'message' })
        .checkbox('I agree to the terms and conditions', false, 'checkbox mb-4', 'terms', { name: 'terms' })
        .button('Send Message', (e) => {
            e.preventDefault();
            
            const validation = weaver.validateForm('advanced-form', {
                name: { required: true, minLength: 2 },
                email: { required: true, email: true },
                phone: { 
                    required: true,
                    custom: (value) => {
                        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
                        return phoneRegex.test(value) || 'Please enter a valid phone number';
                    }
                },
                subject: { required: true },
                message: { required: true, minLength: 10 },
                terms: {
                    custom: (value, field) => {
                        const checkbox = document.querySelector('[name="terms"]');
                        return checkbox.checked || 'You must agree to the terms';
                    }
                }
            });
            
            if (validation.isValid) {
                weaver.toast('Form submitted successfully!', 'success', 5000);
                document.getElementById('advanced-form').reset();
            } else {
                validation.errors.forEach(error => {
                    weaver.toast(error, 'error', 3000);
                });
            }
        }, 'btn btn-large w-full')
        .formEnd()
        .divEnd();
}
```

### Modal with Custom Content

``` javascript
function createAdvancedModal(weaver) {
    // Create form content for modal
    const formContent = document.createElement('div');
    const tempWeaver = new WebWeaver();
    tempWeaver.container = formContent;
    tempWeaver.currentElement = formContent;
    
    tempWeaver
        .input('text', 'Your Name', 'form-control mb-4', 'modal-name')
        .input('email', 'Your Email', 'form-control mb-4', 'modal-email')
        .textarea('Your Message', 4, 'form-control mb-4', 'modal-message');
    
    // Create modal with form
    weaver.createModal('Contact Us', formContent, {
        size: 'medium',
        footerButtons: [
            { 
                text: 'Cancel', 
                className: 'btn btn-secondary',
                onClick: () => weaver.closeModal()
            },
            { 
                text: 'Send Message', 
                className: 'btn',
                onClick: () => {
                    weaver.toast('Message sent successfully!', 'success');
                    weaver.closeModal();
                }
            }
        ]
    });
}
```

### Carousel Component

``` javascript
function buildImageCarousel(weaver) {
    const slides = [
        '<img src="image1.jpg" alt="Slide 1" style="width: 100%; height: 300px; object-fit: cover;">',
        '<img src="image2.jpg" alt="Slide 2" style="width: 100%; height: 300px; object-fit: cover;">',
        '<img src="image3.jpg" alt="Slide 3" style="width: 100%; height: 300px; object-fit: cover;">'
    ];
    
    weaver
        .container('p-8')
        .h2('Image Gallery', 'text-center mb-8')
        .carousel(slides, {
            autoPlay: true,
            interval: 4000,
            showDots: true,
            showArrows: true
        }, 'my-carousel')
        .divEnd();
}
```

### Accordion Example

``` javascript
function createAccordion(weaver) {
    const accordionItems = [
        {
            title: 'What is Web Weaver JS?',
            content: '<p>Web Weaver JS is a powerful JavaScript library for building websites programmatically.</p>'
        },
        {
            title: 'How do I get started?',
            content: '<p>Simply include the library in your HTML and start using the method chaining API.</p>'
        },
        {
            title: 'Is it responsive?',
            content: '<p>Yes! Web Weaver JS includes built-in responsive design components and utilities.</p>'
        }
    ];
    
    weaver
        .container('p-8')
        .h2('Frequently Asked Questions', 'text-center mb-8')
        .accordion(accordionItems, 'faq-accordion')
        .divEnd();
}
```

### Data Table Example

``` javascript
function createDataTable(weaver) {
    const headers = ['Name', 'Email', 'Role', 'Status'];
    const rows = [
        ['John Doe', 'john@example.com', 'Admin', 'Active'],
        ['Jane Smith', 'jane@example.com', 'User', 'Active'],
        ['Bob Wilson', 'bob@example.com', 'Manager', 'Inactive']
    ];
    
    weaver
        .container('p-8')
        .h2('User Management', 'text-center mb-8')
        .createTable(headers, rows, 'data-table')
        .divEnd();
}
```

### Complete Landing Page

``` javascript
function buildLandingPage(weaver) {
    const config = {
        navbar: {
            brand: 'My Company',
            items: [
                { text: 'Home', href: '#home' },
                { text: 'Features', href: '#features' },
                { text: 'About', href: '#about' },
                { text: 'Contact', href: '#contact' }
            ]
        },
        hero: {
            title: 'Amazing Product',
            subtitle: 'The best solution for your needs',
            buttonText: 'Get Started',
            buttonAction: () => weaver.toast('Welcome to our product!', 'success')
        },
        features: [
            { title: 'Fast', description: 'Lightning-fast performance' },
            { title: 'Secure', description: 'Enterprise-grade security' },
            { title: 'Scalable', description: 'Grows with your business' }
        ],
        footer: {
            text: '© 2025 My Company',
            links: [
                { text: 'Privacy', href: '#privacy' },
                { text: 'Terms', href: '#terms' },
                { text: 'Support', href: '#support' }
            ]
        }
    };
    
    weaver.createLandingPage(config);
}
```

### Side Panel Example

``` javascript
function createSidePanels(weaver) {
    weaver
        .container('p-8 text-center')
        .h2('Side Panel Demo', 'mb-8')
        .flexContainer('flex gap-4 justify-center')
        .button('Left Panel', () => {
            weaver.createLeftPanel('<h3>Left Panel</h3><p>This is a left side panel!</p>', {
                title: 'Settings',
                width: '300px'
            });
        }, 'btn')
        .button('Right Panel', () => {
            weaver.createRightPanel('<h3>Right Panel</h3><p>This is a right side panel!</p>', {
                title: 'Information',
                width: '350px'
            });
        }, 'btn')
        .button('Top Panel', () => {
            weaver.createTopPanel('<h3>Top Panel</h3><p>This is a top panel!</p>', {
                title: 'Notifications',
                height: '200px'
            });
        }, 'btn')
        .divEnd()
        .divEnd();
}
```

## 🎨 Theming

Web Weaver JS comes with 5 built-in themes:

- **Default (Blue)** - Clean blue theme
- **Dark** - Dark mode theme  
- **Green** - Nature-inspired green theme
- **Purple** - Modern purple theme
- **Red** - Bold red theme

``` javascript
// Switch themes programmatically
weaver.applyDarkTheme();
weaver.applyGreenTheme();
weaver.applyPurpleTheme();
weaver.applyRedTheme();

// Or use the generic method
weaver.setTheme('purple');

// Theme switching UI
function createThemeSwitcher(weaver) {
    weaver
        .container('text-center p-8')
        .h2('Choose Your Theme', 'mb-8')
        .flexContainer('flex gap-4 justify-center')
        .button('Blue', () => weaver.setTheme('default'), 'btn')
        .button('Dark', () => weaver.setTheme('dark'), 'btn')
        .button('Green', () => weaver.setTheme('green'), 'btn')
        .button('Purple', () => weaver.setTheme('purple'), 'btn')
        .button('Red', () => weaver.setTheme('red'), 'btn')
        .divEnd()
        .divEnd();
}
```

## 📱 Mobile Responsiveness

Web Weaver JS includes built-in mobile responsiveness:

``` javascript
// Check if mobile
if (weaver.isMobile()) {
    // Mobile-specific code
}

// Execute different code for mobile/desktop
weaver.onMobile(
    function() {
        // Mobile layout
        this.flexColumn('flex flex-col gap-4');
    },
    function() {
        // Desktop layout
        this.flexContainer('flex gap-8');
    }
);

// Add mobile-specific classes
weaver.addMobileClass('mobile-stack');

// Responsive layout example
function createResponsiveLayout(weaver) {
    weaver
        .container()
        .onMobile(
            function() {
                // Mobile: Stack vertically
                this.flexColumn('flex flex-col gap-4');
            },
            function() {
                // Desktop: Side by side
                this.flexContainer('flex gap-8');
            }
        )
        .col('flex-1')
            .h3('Content 1')
            .paragraph('This adapts to screen size.')
        .divEnd()
        .col('flex-1') 
            .h3('Content 2')
            .paragraph('Mobile users see this stacked.')
        .divEnd()
        .divEnd()
        .divEnd();
}
```

## 🔧 Advanced Usage

### Performance Optimization

Use the `batch()` method for bulk operations:

``` javascript
weaver.batch(() => {
    // Multiple operations will be batched for better performance
    for (let i = 0; i < 100; i++) {
        weaver.paragraph(`Item ${i}`, 'mb-2');
    }
});
```

### Conditional Building

``` javascript
const isLoggedIn = true;
const userRole = 'admin';

weaver
    .createNavbar('My App', [
        { text: 'Home', href: '#home' }
    ])
    .when(isLoggedIn, function() {
        this.button('Dashboard', () => goToDashboard(), 'btn');
    })
    .when(!isLoggedIn, function() {
        this.button('Login', () => showLogin(), 'btn btn-secondary');
    })
    .when(userRole === 'admin', function() {
        this.button('Admin Panel', () => showAdminPanel(), 'btn btn-danger');
    });
```

### Custom CSS Integration

``` javascript
weaver.addCustomCSS(`
    .my-custom-card {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        border-radius: 15px;
        padding: 2rem;
        color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
    }
    
    .my-custom-card:hover {
        transform: translateY(-5px);
    }
    
    .pulse-animation {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`);

// Use the custom styles
weaver
    .card('my-custom-card')
    .h3('Custom Styled Card')
    .paragraph('This card has custom CSS styling.')
    .divEnd();
```

### Advanced Event Handling

``` javascript
// Direct event handling
weaver.button('Click Me', () => {
    console.log('Button clicked!');
});

// Global event delegation
weaver.onClick('.special-button', (event) => {
    console.log('Special button clicked!', event.target);
});

// Complex event handling
function setupAdvancedEvents(weaver) {
    weaver
        .button('Show Toast', () => {
            weaver.toast('Hello World!', 'info', 3000);
        }, 'btn special-button')
        .button('Show Success', () => {
            weaver.toast('Success message!', 'success', 5000);
        }, 'btn special-button')
        .button('Show Error', () => {
            weaver.toast('Error message!', 'error', 4000);
        }, 'btn special-button');
}
```

### CSS Class Manipulation

``` javascript
// Add/remove classes dynamically
weaver
    .paragraph('This text will be highlighted', 'demo-text', 'demo-para')
    .button('Highlight Text', () => {
        weaver.addClass('highlight', '#demo-para');
    }, 'btn')
    .button('Remove Highlight', () => {
        weaver.removeClass('highlight', '#demo-para');
    }, 'btn btn-secondary');
```

### Debugging and Development

``` javascript
// Debug helper
weaver
    .debug('Starting to build layout')
    .container()
    .debug('Container created')
    .h1('Debug Example')
    .debug('Heading added')
    .paragraph('This example shows debugging in action.')
    .divEnd()
    .debug('Layout complete');
```

## 🏗️ Project Structure

```
web-weaver-js/
├── index.html          # Main HTML file
├── web-weaver.js       # Core Web Weaver library
├── app.js              # Your application logic
├── styles.css          # CSS styles and themes
├── README.md           # This documentation
└── LICENSE             # License information
```

## 🎯 Form Validation Reference

### Validation Rules

``` javascript
const validationRules = {
    fieldName: {
        required: true,
        minLength: 5,
        maxLength: 50,
        email: true, // For email validation
        custom: (value) => {
            // Custom validation function
            // Return true if valid, or error message if invalid
            return value.includes('@') || 'Must contain @ symbol';
        }
    }
};

// Apply validation
const result = weaver.validateForm('form-id', validationRules);
if (result.isValid) {
    // Form is valid
} else {
    // Show errors
    result.errors.forEach(error => {
        weaver.toast(error, 'error');
    });
}
```

## 🎪 Component Options Reference

### Modal Options

``` javascript
const modalOptions = {
    id: 'my-modal',
    size: 'small', // 'small', 'medium', 'large'
    showCloseButton: true,
    closeOnBackdrop: true,
    footerButtons: [
        { text: 'Cancel', className: 'btn btn-secondary', onClick: () => {} },
        { text: 'Confirm', className: 'btn', onClick: () => {} }
    ]
};
```

### Carousel Options

``` javascript
const carouselOptions = {
    autoPlay: true,
    interval: 5000,
    showDots: true,
    showArrows: true
};
```

### Side Panel Options

``` javascript
const panelOptions = {
    id: 'my-panel',
    width: '300px', // For left/right panels
    height: '250px', // For top/bottom panels
    title: 'Panel Title',
    showToggle: true,
    backdrop: true
};
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Clone your fork
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use camelCase for method names
- Include JSDoc comments for new methods
- Maintain method chaining capability
- Follow existing naming conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Getting Started Checklist

- [ ] Download or clone the repository
- [ ] Include `web-weaver.js` in your HTML
- [ ] Include `styles.css` for themes (or create your own)
- [ ] Create a container div with id "app-container"
- [ ] Initialize Web Weaver: `const weaver = new WebWeaver('app-container')`
- [ ] Start building with method chaining!

## 💡 Tips & Best Practices

1. **Always use `divEnd()`** to close containers started with `divStart()`, `container()`, `flexContainer()`, etc.
2. **Method chaining** makes code more readable - use it liberally
3. **Theme switching** can be done dynamically at any time
4. **Mobile responsiveness** is built-in, but test on different screen sizes
5. **Form validation** should be implemented for user input
6. **Performance** - Use `batch()` for bulk operations
7. **Debugging** - Use the `debug()` method during development
8. **Custom CSS** - Use `addCustomCSS()` for unique styling needs

## 🔍 Troubleshooting

**Q: Getting "weaver.container is not a function" error?**
A: Make sure `web-weaver.js` is loaded before your app script and that you're using `new WebWeaver()` to create the instance.

**Q: Styles not applying correctly?**
A: Ensure `styles.css` is included in your HTML and check that class names match the expected CSS classes.

**Q: Modal/Panel not showing?**
A: Make sure the modal manager is initialized by including the full `web-weaver.js` file.

**Q: Form validation not working?**
A: Ensure form fields have the correct `name` attributes that match your validation rules.

**Q: Toast notifications not appearing?**
A: Check that the CSS for toast notifications is included in your stylesheet.

**Q: Carousel not working?**
A: Verify that the carousel CSS animations are included and that items are properly formatted.

---

**Happy building with Web Weaver JS! 🕸️✨**

**Need help?** Open an issue on GitHub or check the examples folder for more code samples.
