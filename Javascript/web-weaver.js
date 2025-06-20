/**
 * Web Weaver JS - Website Builder Methods
 * A comprehensive JavaScript library for building websites programmatically
 */

class WebWeaver {
    constructor(containerId = 'app-container') {
        this.container = document.getElementById(containerId);
        this.currentElement = null;
        this.elementStack = [];
        this.currentTheme = 'default';
        
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }
        
        // Set dark theme as default
        this.setTheme('default');
    }

    // Theme Management
    setTheme(themeName) {
        const validThemes = ['default', 'light', 'green', 'purple', 'red'];
        if (validThemes.includes(themeName)) {
            this.currentTheme = themeName;
            if (themeName === 'default') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', themeName);
            }
            return this;
        } else {
            console.warn(`Invalid theme: ${themeName}. Valid themes are: ${validThemes.join(', ')}`);
            return this;
        }
    }

    // Data Persistence Methods
    saveData(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(`webweaver_${key}`, serializedData);
            return this;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return this;
        }
    }

    loadData(key) {
        try {
            const serializedData = localStorage.getItem(`webweaver_${key}`);
            return serializedData ? JSON.parse(serializedData) : null;
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            return null;
        }
    }

    clearData(key) {
        try {
            localStorage.removeItem(`webweaver_${key}`);
            return this;
        } catch (error) {
            console.error('Error clearing data from localStorage:', error);
            return this;
        }
    }

    getAllSavedData() {
        const savedData = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('webweaver_')) {
                    const dataKey = key.replace('webweaver_', '');
                    savedData[dataKey] = this.loadData(dataKey);
                }
            }
            return savedData;
        } catch (error) {
            console.error('Error getting all saved data:', error);
            return {};
        }
    }

    clearAllData() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('webweaver_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return this;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return this;
        }
    }

    // Theme Persistence Methods
    saveTheme(themeName = null) {
        const themeToSave = themeName || this.currentTheme;
        this.saveData('theme', themeToSave);
        return this;
    }

    loadTheme() {
        const savedTheme = this.loadData('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
        return this;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    // User Preferences Methods
    saveUserPreferences(preferences) {
        this.saveData('userPreferences', preferences);
        return this;
    }

    loadUserPreferences() {
        return this.loadData('userPreferences') || {};
    }

    updateUserPreference(key, value) {
        const preferences = this.loadUserPreferences();
        preferences[key] = value;
        this.saveUserPreferences(preferences);
        return this;
    }

    getUserPreference(key, defaultValue = null) {
        const preferences = this.loadUserPreferences();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }

    // Form Data Persistence
    saveFormData(formId, data = null) {
        let formData = data;
        
        if (!formData) {
            const form = document.getElementById(formId);
            if (!form) {
                console.warn(`Form with id '${formId}' not found`);
                return this;
            }
            
            formData = {};
            const formElements = form.querySelectorAll('input, textarea, select');
            formElements.forEach(element => {
                if (element.name) {
                    if (element.type === 'checkbox') {
                        formData[element.name] = element.checked;
                    } else if (element.type === 'radio') {
                        if (element.checked) {
                            formData[element.name] = element.value;
                        }
                    } else {
                        formData[element.name] = element.value;
                    }
                }
            });
        }
        
        this.saveData(`form_${formId}`, formData);
        return this;
    }

    loadFormData(formId) {
        const formData = this.loadData(`form_${formId}`);
        if (formData) {
            const form = document.getElementById(formId);
            if (form) {
                Object.keys(formData).forEach(fieldName => {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = formData[fieldName];
                        } else if (field.type === 'radio') {
                            if (field.value === formData[fieldName]) {
                                field.checked = true;
                            }
                        } else {
                            field.value = formData[fieldName];
                        }
                    }
                });
            }
        }
        return formData;
    }

    // Auto-save form data on input
    enableFormAutoSave(formId, debounceMs = 1000) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Form with id '${formId}' not found`);
            return this;
        }

        let saveTimeout;
        const autoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveFormData(formId);
            }, debounceMs);
        };

        form.addEventListener('input', autoSave);
        form.addEventListener('change', autoSave);
        
        return this;
    }

    // Session Management
    startSession(sessionId = null) {
        const id = sessionId || `session_${Date.now()}`;
        const sessionData = {
            id: id,
            startTime: new Date().toISOString(),
            theme: this.currentTheme,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.saveData('currentSession', sessionData);
        return this;
    }

    endSession() {
        const session = this.loadData('currentSession');
        if (session) {
            session.endTime = new Date().toISOString();
            session.duration = new Date() - new Date(session.startTime);
            
            // Save to session history
            const sessionHistory = this.loadData('sessionHistory') || [];
            sessionHistory.push(session);
            this.saveData('sessionHistory', sessionHistory);
            
            // Clear current session
            this.clearData('currentSession');
        }
        return this;
    }

    getCurrentSession() {
        return this.loadData('currentSession');
    }

    getSessionHistory() {
        return this.loadData('sessionHistory') || [];
    }

    // Export/Import functionality
    exportData() {
        const allData = this.getAllSavedData();
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: allData
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `webweaver_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        return this;
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    if (importData.data) {
                        Object.keys(importData.data).forEach(key => {
                            this.saveData(key, importData.data[key]);
                        });
                        resolve(importData);
                    } else {
                        reject(new Error('Invalid import file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    // Container Methods
    divStart(className = '', id = '', attributes = {}) {
        const div = document.createElement('div');
        if (className) div.className = className;
        if (id) div.id = id;
        this.setAttributes(div, attributes);
        
        if (this.currentElement) {
            this.currentElement.appendChild(div);
        } else {
            this.container.appendChild(div);
        }
        
        this.elementStack.push(this.currentElement);
        this.currentElement = div;
        return this;
    }

    divEnd() {
        if (this.elementStack.length > 0) {
            this.currentElement = this.elementStack.pop();
        }
        return this;
    }

    section(className = '', id = '', attributes = {}) {
        const section = document.createElement('section');
        if (className) section.className = className;
        if (id) section.id = id;
        this.setAttributes(section, attributes);
        this.appendToContainer(section);
        return this;
    }    

    container(className = '', id = '', attributes = {}) {
        const containerClass = className ? `container ${className}` : 'container';
        return this.divStart(containerClass, id, attributes);
    }

    // Text Elements
    heading(level, text, className = '', id = '', attributes = {}) {
        if (level < 1 || level > 6) {
            console.warn('Heading level must be between 1 and 6');
            level = 1;
        }
        
        const heading = document.createElement(`h${level}`);
        heading.textContent = text;
        if (className) heading.className = className;
        if (id) heading.id = id;
        this.setAttributes(heading, attributes);
        this.appendToContainer(heading);
        return this;
    }

    h1(text, className = '', id = '', attributes = {}) {
        return this.heading(1, text, className, id, attributes);
    }

    h2(text, className = '', id = '', attributes = {}) {
        return this.heading(2, text, className, id, attributes);
    }

    h3(text, className = '', id = '', attributes = {}) {
        return this.heading(3, text, className, id, attributes);
    }

    h4(text, className = '', id = '', attributes = {}) {
        return this.heading(4, text, className, id, attributes);
    }

    h5(text, className = '', id = '', attributes = {}) {
        return this.heading(5, text, className, id, attributes);
    }

    h6(text, className = '', id = '', attributes = {}) {
        return this.heading(6, text, className, id, attributes);
    }

    paragraph(text, className = '', id = '', attributes = {}) {
        const p = document.createElement('p');
        p.textContent = text;
        if (className) p.className = className;
        if (id) p.id = id;
        this.setAttributes(p, attributes);
        this.appendToContainer(p);
        return this;
    }

    text(content, tag = 'span', className = '', id = '', attributes = {}) {
        const element = document.createElement(tag);
        element.textContent = content;
        if (className) element.className = className;
        if (id) element.id = id;
        this.setAttributes(element, attributes);
        this.appendToContainer(element);
        return this;
    }

    // Button Elements
    button(text, onClick = null, className = 'btn', id = '', attributes = {}) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        if (id) button.id = id;
        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }
        this.setAttributes(button, attributes);
        this.appendToContainer(button);
        return this;
    }

    buttonPrimary(text, onClick = null, id = '', attributes = {}) {
        return this.button(text, onClick, 'btn', id, attributes);
    }

    buttonSecondary(text, onClick = null, id = '', attributes = {}) {
        return this.button(text, onClick, 'btn btn-secondary', id, attributes);
    }

    buttonSmall(text, onClick = null, id = '', attributes = {}) {
        return this.button(text, onClick, 'btn btn-small', id, attributes);
    }

    buttonLarge(text, onClick = null, id = '', attributes = {}) {
        return this.button(text, onClick, 'btn btn-large', id, attributes);
    }

    // Form Elements
    formStart(className = '', id = '', attributes = {}) {
        const form = document.createElement('form');
        if (className) form.className = className;
        if (id) form.id = id;
        this.setAttributes(form, attributes);
        
        if (this.currentElement) {
            this.currentElement.appendChild(form);
        } else {
            this.container.appendChild(form);
        }
        
        this.elementStack.push(this.currentElement);
        this.currentElement = form;
        return this;
    }

    formEnd() {
        return this.divEnd();
    }

    // Footer Elements (add after navigation methods)
    footerStart(className = 'footer', id = '', attributes = {}) {
        const footer = document.createElement('footer');
        footer.className = className;
        if (id) footer.id = id;
        this.setAttributes(footer, attributes);
        
        if (this.currentElement) {
            this.currentElement.appendChild(footer);
        } else {
            this.container.appendChild(footer);
        }
        
        this.elementStack.push(this.currentElement);
        this.currentElement = footer;
        return this;
    }

    footerEnd() {
        return this.divEnd();
    }

    input(type = 'text', placeholder = '', className = 'form-control', id = '', attributes = {}) {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.className = className;
        if (id) input.id = id;
        this.setAttributes(input, attributes);
        this.appendToContainer(input);
        return this;
    }

    textarea(placeholder = '', rows = 4, className = 'form-control', id = '', attributes = {}) {
        const textarea = document.createElement('textarea');
        textarea.placeholder = placeholder;
        textarea.rows = rows;
        textarea.className = className;
        if (id) textarea.id = id;
        this.setAttributes(textarea, attributes);
        this.appendToContainer(textarea);
        return this;
    }

    checkbox(labelText, checked = false, className = 'checkbox', id = '', attributes = {}) {
        const label = document.createElement('label');
        label.className = className;
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;
        if (id) input.id = id;
        this.setAttributes(input, attributes);
        
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        
        const text = document.createElement('span');
        text.textContent = labelText;
        text.style.marginLeft = '0.5rem';
        
        label.appendChild(input);
        label.appendChild(checkmark);
        label.appendChild(text);
        
        this.appendToContainer(label);
        return this;
    }

    select(options = [], className = 'form-control', id = '', attributes = {}) {
        const select = document.createElement('select');
        select.className = className;
        if (id) select.id = id;
        this.setAttributes(select, attributes);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value || option;
            optionElement.textContent = option.text || option;
            select.appendChild(optionElement);
        });
        
        this.appendToContainer(select);
        return this;
    }

    // Layout Elements
    flexContainer(className = 'flex', id = '', attributes = {}) {
        return this.divStart(className, id, attributes);
    }

    flexColumn(className = 'flex flex-col', id = '', attributes = {}) {
        return this.divStart(className, id, attributes);
    }

    grid(columns = 3, className = '', id = '', attributes = {}) {
        const gridClass = `grid grid-cols-${columns} ${className}`.trim();
        return this.divStart(gridClass, id, attributes);
    }

    card(className = 'card', id = '', attributes = {}) {
        return this.divStart(className, id, attributes);
    }

    // Navigation Elements
    navStart(className = 'nav', id = '', attributes = {}) {
        const nav = document.createElement('nav');
        nav.className = className;
        if (id) nav.id = id;
        this.setAttributes(nav, attributes);
        
        if (this.currentElement) {
            this.currentElement.appendChild(nav);
        } else {
            this.container.appendChild(nav);
        }
        
        this.elementStack.push(this.currentElement);
        this.currentElement = nav;
        return this;
    }

    navEnd() {
        return this.divEnd();
    }

    // Canvas Methods
    canvas(width = 400, height = 300, className = '', id = '', attributes = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        if (className) canvas.className = className;
        if (id) canvas.id = id;
        this.setAttributes(canvas, attributes);
        this.appendToContainer(canvas);
        return this;
    }

    canvasScript(canvasId, script) {
        const scriptElement = document.createElement('script');
        scriptElement.textContent = `
            (function() {
                const canvas = document.getElementById('${canvasId}');
                if (canvas) {
                    ${script}
                }
            })();
        `;
        document.head.appendChild(scriptElement);
        return this;
    }

    // Canvas Drawing Methods
    canvasDraw(canvasId, drawFunction) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawFunction(ctx, canvas);
        }
        return this;
    }

    canvasRect(canvasId, x, y, width, height, fillColor = '#000000', strokeColor = null, lineWidth = 1) {
        return this.canvasDraw(canvasId, (ctx) => {
            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fillRect(x, y, width, height);
            }
            if (strokeColor) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = lineWidth;
                ctx.strokeRect(x, y, width, height);
            }
        });
    }

    canvasCircle(canvasId, x, y, radius, fillColor = '#000000', strokeColor = null, lineWidth = 1) {
        return this.canvasDraw(canvasId, (ctx) => {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }
            if (strokeColor) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
        });
    }

    canvasLine(canvasId, x1, y1, x2, y2, strokeColor = '#000000', lineWidth = 1) {
        return this.canvasDraw(canvasId, (ctx) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        });
    }

    canvasText(canvasId, text, x, y, font = '16px Arial', fillColor = '#000000', strokeColor = null, lineWidth = 1) {
        return this.canvasDraw(canvasId, (ctx) => {
            ctx.font = font;
            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fillText(text, x, y);
            }
            if (strokeColor) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = lineWidth;
                ctx.strokeText(text, x, y);
            }
        });
    }

    canvasImage(canvasId, imageSrc, x, y, width = null, height = null) {
        const img = new Image();
        img.onload = () => {
            this.canvasDraw(canvasId, (ctx) => {
                if (width && height) {
                    ctx.drawImage(img, x, y, width, height);
                } else {
                    ctx.drawImage(img, x, y);
                }
            });
        };
        img.src = imageSrc;
        return this;
    }

    canvasClear(canvasId) {
        return this.canvasDraw(canvasId, (ctx, canvas) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    canvasPath(canvasId, points, strokeColor = '#000000', lineWidth = 1, closePath = false) {
        return this.canvasDraw(canvasId, (ctx) => {
            if (points.length < 2) return;
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            
            if (closePath) {
                ctx.closePath();
            }
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        });
    }

    canvasGradient(canvasId, x, y, width, height, colors, direction = 'horizontal') {
        return this.canvasDraw(canvasId, (ctx) => {
            let gradient;
            if (direction === 'horizontal') {
                gradient = ctx.createLinearGradient(x, y, x + width, y);
            } else {
                gradient = ctx.createLinearGradient(x, y, x, y + height);
            }
            
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
        });
    }

    // HTML Structure Methods
    htmlStart(lang = 'en') {
        const html = document.createElement('html');
        html.setAttribute('lang', lang);
        this.appendToContainer(html);
        this.elementStack.push(this.currentElement);
        this.currentElement = html;
        return this;
    }

    htmlEnd() {
        return this.divEnd();
    }

    headStart() {
        const head = document.createElement('head');
        this.appendToContainer(head);
        this.elementStack.push(this.currentElement);
        this.currentElement = head;
        return this;
    }

    headEnd() {
        return this.divEnd();
    }

    bodyStart(className = '', id = '', attributes = {}) {
        const body = document.createElement('body');
        if (className) body.className = className;
        if (id) body.id = id;
        this.setAttributes(body, attributes);
        this.appendToContainer(body);
        this.elementStack.push(this.currentElement);
        this.currentElement = body;
        return this;
    }

    bodyEnd() {
        return this.divEnd();
    }

    titleTag(title) {
        const titleEl = document.createElement('title');
        titleEl.textContent = title;
        this.appendToContainer(titleEl);
        return this;
    }

    metaTag(name, content) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        this.appendToContainer(meta);
        return this;
    }

    linkTag(rel, href, type = '') {
        const link = document.createElement('link');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        if (type) link.setAttribute('type', type);
        this.appendToContainer(link);
        return this;
    }

    // Ensure all containers have proper closing methods
    cardEnd() {
        return this.divEnd();
    }

    containerEnd() {
        return this.divEnd();
    }

    sectionEnd() {
        return this.divEnd();
    }

    flexContainerEnd() {
        return this.divEnd();
    }

    flexColumnEnd() {
        return this.divEnd();
    }

    gridEnd() {
        return this.divEnd();
    }

    rowEnd() {
        return this.divEnd();
    }

    colEnd() {
        return this.divEnd();
    }

    navItem(text, href = '#', className = 'nav-item', id = '', attributes = {}) {
        const a = document.createElement('a');
        a.textContent = text;
        a.href = href;
        a.className = className;
        if (id) a.id = id;
        this.setAttributes(a, attributes);
        this.appendToContainer(a);
        return this;
    }

    // Media Elements
    image(src, alt = '', className = '', id = '', attributes = {}) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        if (className) img.className = className;
        if (id) img.id = id;
        this.setAttributes(img, attributes);
        this.appendToContainer(img);
        return this;
    }

    video(src, controls = true, className = '', id = '', attributes = {}) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = controls;
        if (className) video.className = className;
        if (id) video.id = id;
        this.setAttributes(video, attributes);
        this.appendToContainer(video);
        return this;
    }

    // List Elements
    listStart(ordered = false, className = '', id = '', attributes = {}) {
        const list = document.createElement(ordered ? 'ol' : 'ul');
        if (className) list.className = className;
        if (id) list.id = id;
        this.setAttributes(list, attributes);
        
        if (this.currentElement) {
            this.currentElement.appendChild(list);
        } else {
            this.container.appendChild(list);
        }
        
        this.elementStack.push(this.currentElement);
        this.currentElement = list;
        return this;
    }

    listEnd() {
        return this.divEnd();
    }

    listItem(text, className = '', id = '', attributes = {}) {
        const li = document.createElement('li');
        li.textContent = text;
        if (className) li.className = className;
        if (id) li.id = id;
        this.setAttributes(li, attributes);
        this.appendToContainer(li);
        return this;
    }

    // Utility Methods
    spacer(height = '1rem') {
        const spacer = document.createElement('div');
        spacer.style.height = height;
        this.appendToContainer(spacer);
        return this;
    }

    lineBreak() {
        const br = document.createElement('br');
        this.appendToContainer(br);
        return this;
    }

    horizontalRule(className = '', id = '', attributes = {}) {
        const hr = document.createElement('hr');
        if (className) hr.className = className;
        if (id) hr.id = id;
        this.setAttributes(hr, attributes);
        this.appendToContainer(hr);
        return this;
    }

    // Animation Methods
    addFadeIn(element = null) {
        const target = element || this.currentElement;
        if (target) {
            target.classList.add('fade-in');
        }
        return this;
    }

    // Event Methods
    onClick(selector, callback) {
        document.addEventListener('click', (e) => {
            if (e.target.matches(selector)) {
                callback(e);
            }
        });
        return this;
    }

    // CSS Methods
    addCustomCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        return this;
    }

    addClass(className, selector = null) {
        if (selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.classList.add(className));
        } else if (this.currentElement) {
            this.currentElement.classList.add(className);
        }
        return this;
    }

    removeClass(className, selector = null) {
        if (selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.classList.remove(className));
        } else if (this.currentElement) {
            this.currentElement.classList.remove(className);
        }
        return this;
    }

    // Helper Methods
    setAttributes(element, attributes) {
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
    }

    appendToContainer(element) {
        if (this.currentElement) {
            this.currentElement.appendChild(element);
        } else {
            this.container.appendChild(element);
        }
    }

    // Method to get current element for advanced manipulation
    getCurrentElement() {
        return this.currentElement;
    }

    // Method to get main container
    getContainer() {
        return this.container;
    }

    // Theme Preset Methods
    applyLightTheme() {
        return this.setTheme('light');
    }

    applyBlueTheme() {
        return this.setTheme('light'); // Blue theme is now light theme
    }

    applyDarkTheme() {
        return this.setTheme('default');
    }

    applyGreenTheme() {
        return this.setTheme('green');
    }

    applyPurpleTheme() {
        return this.setTheme('purple');
    }

    applyRedTheme() {
        return this.setTheme('red');
    }

    // Quick Layout Methods
    createHero(title, subtitle, buttonText = '', buttonAction = null) {
        this.divStart('flex flex-col items-center justify-center text-center p-8')
            .h1(title, 'text-bold mb-4')
            .paragraph(subtitle, 'text-large mb-8');
        
        if (buttonText) {
            this.buttonLarge(buttonText, buttonAction);
        }
        
        return this.divEnd();
    }

    createNavbar(brand, items = []) {
        this.navStart('nav flex items-center space-between p-4')
            .h3(brand, 'text-bold');
          this.divStart('flex gap-4');
        items.forEach(item => {
            this.navItem(item.text, item.href);
        });
        this.divEnd();
        
        return this.navEnd();
    }

    createFooter(text, links = []) {
        this.divStart('flex flex-col items-center p-8 border-t')
            .paragraph(text, 'text-small mb-4');
        
        if (links.length > 0) {
            this.divStart('flex gap-4');
            links.forEach(link => {
                this.navItem(link.text, link.href, 'text-small');
            });
            this.divEnd();
        }
        
        return this.divEnd();
    }

    modalStart(title = 'Modal', size = 'medium', className = '', id = '', options = {}) {
        const modalId = id || `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store modal info for later rendering
        this.currentModalInfo = {
            id: modalId,
            title: title,
            size: size,
            className: className,
            options: typeof options === 'string' ? this.parseOptionsString(options) : options
        };
        
        // Start collecting modal content
        this.modalContent = [];
        this.isCapturingModal = true;
        
        return this;
    }

    modalEnd() {
        if (!this.isCapturingModal || !this.currentModalInfo) {
            console.warn('modalEnd called without matching modalStart');
            return this;
        }
        
        // Create the modal content container
        const modalContentContainer = document.createElement('div');
        modalContentContainer.id = `modal-content-${Date.now()}`;
        
        // Apply captured content to container
        this.modalContent.forEach(contentItem => {
            if (typeof contentItem === 'string') {
                modalContentContainer.innerHTML += contentItem;
            } else if (contentItem instanceof Element) {
                modalContentContainer.appendChild(contentItem);
            }
        });
        
        // Create modal trigger and setup
        this.createModalFromCapturedContent(modalContentContainer);
        
        // Reset modal capture state
        this.isCapturingModal = false;
        this.currentModalInfo = null;
        this.modalContent = [];
        
        return this;
    }

    modalTrigger(buttonText = 'Open Modal', modalId = 'myModal', buttonClass = 'btn', buttonId = '', buttonStyle = '') {
        return this.button(buttonText, () => {
            // Find and open the modal by ID
            const modalElement = document.querySelector(`[data-modal-id="${modalId}"]`);
            if (modalElement) {
                modalElement.style.display = 'flex';
                modalElement.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            } else {
                console.warn(`Modal with ID "${modalId}" not found`);
            }
        }, buttonClass, buttonId, buttonStyle ? { style: buttonStyle } : {});
    }

    modalHeader(className = '', id = '', style = '') {
        if (this.isCapturingModal) {
            this.modalContent.push('<div class="modal-header ' + className + '"' + (id ? ` id="${id}"` : '') + (style ? ` style="${style}"` : '') + '>');
        } else {
            this.divStart('modal-header ' + className, id, style ? { style } : {});
        }
        return this;
    }

    modalHeaderEnd() {
        if (this.isCapturingModal) {
            this.modalContent.push('</div>');
        } else {
            this.divEnd();
        }
        return this;
    }

    modalBody(className = '', id = '', style = '') {
        if (this.isCapturingModal) {
            this.modalContent.push('<div class="modal-body ' + className + '"' + (id ? ` id="${id}"` : '') + (style ? ` style="${style}"` : '') + '>');
        } else {
            this.divStart('modal-body ' + className, id, style ? { style } : {});
        }
        return this;
    }

    modalBodyEnd() {
        if (this.isCapturingModal) {
            this.modalContent.push('</div>');
        } else {
            this.divEnd();
        }
        return this;
    }

    modalFooter(className = '', id = '', style = '') {
        if (this.isCapturingModal) {
            this.modalContent.push('<div class="modal-footer ' + className + '"' + (id ? ` id="${id}"` : '') + (style ? ` style="${style}"` : '') + '>');
        } else {
            this.divStart('modal-footer ' + className, id, style ? { style } : {});
        }
        return this;
    }

    modalFooterEnd() {
        if (this.isCapturingModal) {
            this.modalContent.push('</div>');
        } else {
            this.divEnd();
        }
        return this;
    }

    modalCloseButton(buttonText = 'Close', className = 'btn btn-secondary', id = '', style = '') {
        const closeHandler = () => {
            // Find the parent modal and close it
            const modalElement = document.querySelector('.modal-overlay.active');
            if (modalElement) {
                modalElement.classList.remove('active');
                setTimeout(() => {
                    modalElement.style.display = 'none';
                    document.body.style.overflow = ''; // Restore scrolling
                }, 300);
            }
        };
        
        if (this.isCapturingModal) {
            // Store as a button element for modal content
            const buttonElement = document.createElement('button');
            buttonElement.className = className;
            if (id) buttonElement.id = id;
            if (style) buttonElement.style.cssText = style;
            buttonElement.textContent = buttonText;
            buttonElement.onclick = closeHandler;
            this.modalContent.push(buttonElement);
        } else {
            this.button(buttonText, closeHandler, className, id, style ? { style } : {});
        }
        
        return this;
    }

    // Helper method to create modal from captured content
    createModalFromCapturedContent(contentContainer) {
        const modalInfo = this.currentModalInfo;
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.setAttribute('data-modal-id', modalInfo.id);
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(2px);
        `;
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = `modal modal-${modalInfo.size} ${modalInfo.className}`;
        modal.style.cssText = `
            background: var(--bg-color, #ffffff);
            color: var(--text-color, #000000);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 90vw;
            max-height: 90vh;
            overflow: hidden;
            transform: scale(0.9) translateY(-20px);
            transition: transform 0.3s ease;
            border: 1px solid var(--border-color, #e5e7eb);
            display: flex;
            flex-direction: column;
        `;
        
        // Size classes
        const sizeMap = {
            small: '400px',
            medium: '600px',
            large: '800px',
            xlarge: '1000px'
        };
        
        if (sizeMap[modalInfo.size]) {
            modal.style.width = sizeMap[modalInfo.size];
        }
        
        // Add title if provided and no custom header found
        const hasCustomHeader = contentContainer.querySelector('.modal-header');
        if (modalInfo.title && !hasCustomHeader) {
            const header = document.createElement('div');
            header.className = 'modal-header';
            header.style.cssText = `
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color, #e5e7eb);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--surface-color, #f9fafb);
            `;
            
            const title = document.createElement('h3');
            title.className = 'modal-title';
            title.textContent = modalInfo.title;
            title.style.cssText = `
                margin: 0;
                font-size: 1.25rem;
                font-weight: bold;
                color: var(--text-color, #000000);
            `;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-color, #000000);
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            `;
            
            closeBtn.onclick = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    modalOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            };
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            modal.appendChild(header);
        }
        
        // Add captured content
        if (!hasCustomHeader && !contentContainer.querySelector('.modal-body')) {
            // Wrap content in modal-body if no custom body found
            const body = document.createElement('div');
            body.className = 'modal-body';
            body.style.cssText = `
                padding: 1.5rem;
                flex: 1;
                overflow-y: auto;
                background: var(--bg-color, #ffffff);
            `;
            body.appendChild(contentContainer);
            modal.appendChild(body);
        } else {
            modal.appendChild(contentContainer);
        }
        
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        // Setup modal animations and events
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay && modalInfo.options.closeOnBackdrop !== false) {
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    modalOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    modalOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        });
        
        // Override standard methods when capturing modal content
        const originalMethods = {};
        if (this.isCapturingModal) {
            // Store original methods that need to be overridden
            ['heading', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'paragraph', 'text', 'button', 'input', 'textarea', 'select', 'image', 'divStart', 'divEnd'].forEach(method => {
                if (this[method]) {
                    originalMethods[method] = this[method].bind(this);
                    this[method] = (...args) => {
                        // Capture HTML instead of directly adding to DOM
                        const tempContainer = document.createElement('div');
                        const tempWeaver = new WebWeaver(tempContainer.id);
                        originalMethods[method].apply(tempWeaver, args);
                        this.modalContent.push(tempContainer.innerHTML);
                        return this;
                    };
                }
            });
        }
    }

    // Helper method to parse options string
    parseOptionsString(optionsString) {
        try {
            return JSON.parse(optionsString);
        } catch (e) {
            // Parse simple key:value pairs
            const options = {};
            optionsString.split(',').forEach(pair => {
                const [key, value] = pair.split(':').map(s => s.trim());
                if (key && value) {
                    options[key] = value === 'true' ? true : value === 'false' ? false : value;
                }
            });
            return options;
        }
    }

    // Modal Methods
    createModal(title, content, options = {}) {
        const {
            id = `modal-${Date.now()}`,
            size = 'medium', // small, medium, large
            showCloseButton = true,
            closeOnBackdrop = true,
            footerButtons = []
        } = options;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = id;

        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;

        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'modal-title';
        titleElement.textContent = title;
        header.appendChild(titleElement);

        if (showCloseButton) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => this.closeModal(id);
            header.appendChild(closeBtn);
        }

        // Modal body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof content === 'string') {
            body.innerHTML = content;        
        } else {
            body.appendChild(content);
        }
        
        modal.appendChild(header);
        modal.appendChild(body);
        
        // Modal footer
        if (footerButtons.length > 0) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            
            footerButtons.forEach(btn => {
                const button = document.createElement('button');
                button.className = btn.className || 'btn';
                button.textContent = btn.text;
                if (btn.onClick) button.onclick = btn.onClick;
                footer.appendChild(button);
            });
            
            modal.appendChild(footer);
        }
        
        overlay.appendChild(modal);

        // Event listeners
        if (closeOnBackdrop) {
            overlay.onclick = (e) => {
                if (e.target === overlay) this.closeModal(id);
            };
        }

        // ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(id);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(overlay);
        window.modalManager.activeModals.push(overlay);

        // Show modal
        setTimeout(() => overlay.classList.add('active'), 10);        
        return this;
    }

    closeModal(modalId) {
        const modal = modalId ? document.getElementById(modalId) : document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                window.modalManager.activeModals = window.modalManager.activeModals.filter(m => m.id !== modalId);
            }, 300);
        }
        return this;
    }

    // Side Panel Methods
    createSidePanel(position, content, options = {}) {
        const {
            id = `panel-${position}-${Date.now()}`,
            width = '300px',
            height = '250px',
            title = '',
            showToggle = true,
            backdrop = true,
            toggleIcon = this.getToggleIcon(position)
        } = options;

        // Create backdrop if needed
        if (backdrop && !document.querySelector('.panel-backdrop')) {
            const backdropEl = document.createElement('div');
            backdropEl.className = 'panel-backdrop';
            backdropEl.onclick = () => this.closeSidePanel(id);
            document.body.appendChild(backdropEl);
        }

        // Create panel
        const panel = document.createElement('div');
        panel.className = `side-panel side-panel-${position}`;
        panel.id = id;

        // Set dimensions
        if (position === 'left' || position === 'right') {
            panel.style.width = width;
        } else {
            panel.style.height = height;
        }

        // Panel header
        if (title) {
            const header = document.createElement('div');
            header.className = 'panel-header';
            const titleEl = document.createElement('h4');
            titleEl.textContent = title;
            header.appendChild(titleEl);
            panel.appendChild(header);
        }

        // Panel content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'panel-content';
        if (typeof content === 'string') {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.appendChild(content);
        }
        panel.appendChild(contentDiv);

        // Toggle button
        if (showToggle) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = `panel-toggle-btn panel-toggle-${position}`;
            toggleBtn.innerHTML = toggleIcon;
            toggleBtn.onclick = () => this.toggleSidePanel(id);
            panel.appendChild(toggleBtn);
        }

        document.body.appendChild(panel);
        window.modalManager.activePanels.push(panel);

        return this;
    }

    toggleSidePanel(panelId) {
        const panel = document.getElementById(panelId);
        const backdrop = document.querySelector('.panel-backdrop');
        
        if (panel) {
            panel.classList.toggle('active');
            if (backdrop) {
                backdrop.classList.toggle('active');
            }
            
            // Update toggle icon
            const toggleBtn = panel.querySelector('.panel-toggle-btn');
            if (toggleBtn) {
                const position = panel.className.includes('left') ? 'left' :
                               panel.className.includes('right') ? 'right' :
                               panel.className.includes('top') ? 'top' : 'bottom';
                
                const isActive = panel.classList.contains('active');
                toggleBtn.innerHTML = this.getToggleIcon(position, isActive);
            }
        }
        return this;
    }

    closeSidePanel(panelId) {
        const panel = document.getElementById(panelId);
        const backdrop = document.querySelector('.panel-backdrop');
        
        if (panel) {
            panel.classList.remove('active');
            if (backdrop) {
                backdrop.classList.remove('active');
            }
            
            // Update toggle icon
            const toggleBtn = panel.querySelector('.panel-toggle-btn');
            if (toggleBtn) {
                const position = panel.className.includes('left') ? 'left' :
                               panel.className.includes('right') ? 'right' :
                               panel.className.includes('top') ? 'top' : 'bottom';
                
                toggleBtn.innerHTML = this.getToggleIcon(position, false);
            }
        }
        return this;
    }

    getToggleIcon(position, isActive = false) {
        const icons = {
            left: isActive ? '◀' : '▶',
            right: isActive ? '▶' : '◀',
            top: isActive ? '▲' : '▼',
            bottom: isActive ? '▼' : '▲'
        };
        return icons[position] || '▶';
    }

    // Quick panel creators
    createLeftPanel(content, options = {}) {
        return this.createSidePanel('left', content, options);
    }

    createRightPanel(content, options = {}) {
        return this.createSidePanel('right', content, options);
    }

    createTopPanel(content, options = {}) {
        return this.createSidePanel('top', content, options);
    }

    createBottomPanel(content, options = {}) {
        return this.createSidePanel('bottom', content, options);
    }

    // Utility Methods for Mobile
    addMobileClass(className = 'flex-mobile-row') {
        if (this.currentElement) {
            this.currentElement.classList.add(className);
        }
        return this;
    }

    isMobile() {
        return window.innerWidth <= 768;
    }

    onMobile(mobileCallback, desktopCallback = null) {
        if (this.isMobile()) {
            if (mobileCallback) mobileCallback.call(this);
        } else {
            if (desktopCallback) desktopCallback.call(this);
        }
        return this;
    }

    // Loading spinner
    spinner(className = 'spinner', id = '', attributes = {}) {
        const spinner = document.createElement('div');
        spinner.className = className;
        if (id) spinner.id = id;        
        this.setAttributes(spinner, attributes);
        this.appendToContainer(spinner);
        return this;
    }

    // Streamlined Layout Methods
    row(className = 'flex', id = '', attributes = {}) {
        return this.flexContainer(`flex ${className}`.trim(), id, attributes);
    }

    col(className = 'flex-1', id = '', attributes = {}) {
        return this.divStart(className, id, attributes);
    }

    // Quick content creators
    quickCard(title, content, buttonText = '', buttonAction = null, className = 'card p-6') {
        this.card(className);
        if (title) this.h3(title, 'mb-4');
        if (content) this.paragraph(content, 'mb-4');
        if (buttonText) this.button(buttonText, buttonAction, 'btn');
        return this.divEnd();
    }

    quickSection(title, content, className = 'p-8') {
        this.divStart(`container ${className}`.trim());
        if (title) this.h2(title, 'text-center mb-8');
        if (content) this.paragraph(content, 'text-center mb-8');
        return this;
    }

    // Bulk operations
    addMultipleCards(cardsData) {
        cardsData.forEach(card => {
            this.quickCard(card.title, card.content, card.buttonText, card.buttonAction, card.className);
        });
        return this;
    }

    addMultipleButtons(buttons) {
        buttons.forEach(btn => {
            this.button(btn.text, btn.onClick, btn.className || 'btn', btn.id || '', btn.attributes || {});
        });
        return this;
    }

    // Template builders
    createLandingPage(config) {
        const {
            navbar = {},
            hero = {},
            features = [],
            testimonials = [],
            footer = {}
        } = config;

        // Navbar
        if (navbar.brand) {
            this.createNavbar(navbar.brand, navbar.items || []);
        }

        // Hero section
        if (hero.title) {
            this.createHero(hero.title, hero.subtitle, hero.buttonText, hero.buttonAction);
        }

        // Features section
        if (features.length > 0) {
            this.quickSection('Features', '')
                .flexContainer('flex gap-8 flex-wrap justify-center');
            features.forEach(feature => {
                this.quickCard(feature.title, feature.description, '', null, 'card flex-1 min-w-64 text-center');
            });
            this.divEnd().divEnd(); // End flex and section
        }

        // Footer
        if (footer.text) {
            this.createFooter(footer.text, footer.links || []);
        }

        return this;
    }

    // Data-driven content
    createTable(headers, rows, className = 'table') {
        const table = document.createElement('table');
        table.className = className;

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        this.appendToContainer(table);
        return this;
    }

    // Progress indicators
    progressBar(percentage, className = 'progress-bar', label = '', id = '', attributes = {}) {
        const container = document.createElement('div');
        container.className = `progress-container ${className}`;
        if (id) container.id = id;
        this.setAttributes(container, attributes);

        if (label) {
            const labelEl = document.createElement('div');
            labelEl.className = 'progress-label';
            labelEl.textContent = label;
            container.appendChild(labelEl);
        }

        const progressBg = document.createElement('div');
        progressBg.className = 'progress-bg';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        
        progressBg.appendChild(progressFill);
        container.appendChild(progressBg);
        
        this.appendToContainer(container);
        return this;
    }

    // Badge/Tag components
    badge(text, type = 'primary', className = '', id = '', attributes = {}) {
        const badge = document.createElement('span');
        badge.textContent = text;
        badge.className = `badge badge-${type} ${className}`.trim();
        if (id) badge.id = id;
        this.setAttributes(badge, attributes);
        this.appendToContainer(badge);
        return this;
    }

    // Alert/notification components
    alert(message, type = 'info', dismissible = true, className = '', id = '', attributes = {}) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} ${className}`.trim();
        if (id) alert.id = id;
        this.setAttributes(alert, attributes);

        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        alert.appendChild(messageEl);

        if (dismissible) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'alert-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => alert.remove();
            alert.appendChild(closeBtn);
        }

        this.appendToContainer(alert);
        return this;
    }

    // Icon support
    icon(iconName, className = '', id = '', attributes = {}) {
        const icon = document.createElement('i');
        icon.className = `icon icon-${iconName} ${className}`.trim();
        if (id) icon.id = id;
        this.setAttributes(icon, attributes);
        this.appendToContainer(icon);
        return this;
    }

    // Breadcrumb navigation
    breadcrumb(items, className = 'breadcrumb', id = '', attributes = {}) {
        const nav = document.createElement('nav');
        nav.className = className;
        if (id) nav.id = id;
        this.setAttributes(nav, attributes);

        const ol = document.createElement('ol');
        ol.className = 'breadcrumb-list';

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';

            if (item.href && index < items.length - 1) {
                const a = document.createElement('a');
                a.href = item.href;
                a.textContent = item.text;
                li.appendChild(a);
            } else {
                li.textContent = item.text;
                if (index === items.length - 1) {
                    li.classList.add('active');
                }
            }

            ol.appendChild(li);
        });

        nav.appendChild(ol);
        this.appendToContainer(nav);
        return this;
    }

    // Utility method for conditional chaining
    when(condition, callback) {
        if (condition) {
            callback.call(this);
        }
        return this;
    }

    // Debug helper
    debug(message) {
        console.log(`WebWeaver Debug: ${message}`, this.currentElement);
        return this;
    }

    // Performance helper - batch operations
    batch(operations) {
        const fragment = document.createDocumentFragment();
        const originalContainer = this.currentElement || this.container;
        
        // Temporarily use fragment as container
        this.currentElement = fragment;
        
        // Execute operations
        operations.call(this);
        
        // Append fragment to original container
        originalContainer.appendChild(fragment);
        this.currentElement = originalContainer;
        
        return this;
    }

    // Advanced form validation
    validateForm(formId, rules = {}) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const errors = [];

        Object.keys(rules).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) return;

            const rule = rules[fieldName];
            const value = field.value.trim();

            // Required validation
            if (rule.required && !value) {
                isValid = false;
                errors.push(`${fieldName} is required`);
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }

            // Min length validation
            if (rule.minLength && value.length < rule.minLength) {
                isValid = false;
                errors.push(`${fieldName} must be at least ${rule.minLength} characters`);
                field.classList.add('error');
            }

            // Email validation
            if (rule.email && value && !/\S+@\S+\.\S+/.test(value)) {
                isValid = false;
                errors.push(`${fieldName} must be a valid email`);
                field.classList.add('error');
            }

            // Custom validation
            if (rule.custom && typeof rule.custom === 'function') {
                const customResult = rule.custom(value);
                if (customResult !== true) {
                    isValid = false;
                    errors.push(customResult);
                    field.classList.add('error');
                }
            }
        });

        return { isValid, errors };
    }

    // Toast notifications
    toast(message, type = 'info', duration = 3000, position = 'top-right') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} toast-${position}`;
        toast.textContent = message;

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('toast-removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // Close on click
        toast.onclick = () => {
            toast.classList.add('toast-removing');
            setTimeout(() => toast.remove(), 300);
        };

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('toast-show'), 10);

        return this;
    }

    // Accordion component
    accordion(items, className = 'accordion', id = '', attributes = {}) {
        const accordion = document.createElement('div');
        accordion.className = className;
        if (id) accordion.id = id;
        this.setAttributes(accordion, attributes);

        items.forEach((item, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';

            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.textContent = item.title;
            header.onclick = () => {
                const content = accordionItem.querySelector('.accordion-content');
                const isOpen = content.classList.contains('open');
                
                // Close all other items if single-open accordion
                if (!isOpen) {
                    accordion.querySelectorAll('.accordion-content.open').forEach(openContent => {
                        openContent.classList.remove('open');
                    });
                }
                
                content.classList.toggle('open');
            };

            const content = document.createElement('div');
            content.className = 'accordion-content';
            if (typeof item.content === 'string') {
                content.innerHTML = item.content;
            } else {
                content.appendChild(item.content);
            }

            accordionItem.appendChild(header);
            accordionItem.appendChild(content);
            accordion.appendChild(accordionItem);
        });

        this.appendToContainer(accordion);
        return this;
    }

    // Carousel/Slider component
    carousel(items, options = {}, className = 'carousel', id = '', attributes = {}) {
        const {
            autoPlay = false,
            interval = 5000,
            showDots = true,
            showArrows = true
        } = options;

        const carousel = document.createElement('div');
        carousel.className = className;
        if (id) carousel.id = id;
        this.setAttributes(carousel, attributes);

        const track = document.createElement('div');
        track.className = 'carousel-track';

        let currentIndex = 0;

        items.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            
            if (typeof item === 'string') {
                slide.innerHTML = item;
            } else {
                slide.appendChild(item);
            }
            
            track.appendChild(slide);
        });

        carousel.appendChild(track);

        // Navigation arrows
        if (showArrows) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'carousel-prev';
            prevBtn.innerHTML = '❮';
            prevBtn.onclick = () => goToSlide(currentIndex - 1);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'carousel-next';
            nextBtn.innerHTML = '❯';
            nextBtn.onclick = () => goToSlide(currentIndex + 1);

            carousel.appendChild(prevBtn);
            carousel.appendChild(nextBtn);
        }

        // Dots indicator
        if (showDots) {
            const dots = document.createElement('div');
            dots.className = 'carousel-dots';

            items.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
                dot.onclick = () => goToSlide(index);
                dots.appendChild(dot);
            });

            carousel.appendChild(dots);
        }

        function goToSlide(index) {
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;

            // Update active slide
            track.querySelectorAll('.carousel-slide').forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });

            // Update active dot
            if (showDots) {
                carousel.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }

            currentIndex = index;
        }

        // Auto-play functionality
        if (autoPlay) {
            setInterval(() => {
                goToSlide(currentIndex + 1);
            }, interval);
        }

        this.appendToContainer(carousel);
        return this;
    }

    clear() {
      if (this.container) {
            this.container.innerHTML = '';
        }
        this.currentElement = null;
        this.elementStack = [];
        return this;
    }
}

/**
 * Modal Manager Class
 * Handles modal and panel state management
 */
class ModalManager {
    constructor() {
        this.activeModals = [];
        this.activePanels = [];
    }

    closeAllModals() {
        this.activeModals.forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
        this.activeModals = [];
    }

    closeAllPanels() {
        this.activePanels.forEach(panel => {
            panel.classList.remove('active');
            const backdrop = document.querySelector('.panel-backdrop');
            if (backdrop) backdrop.classList.remove('active');
        });
    }

    getActiveModals() {
        return this.activeModals;
    }

    getActivePanels() {
        return this.activePanels;
    }
}

// Export to global scope
window.WebWeaver = WebWeaver;
window.modalManager = new ModalManager();
