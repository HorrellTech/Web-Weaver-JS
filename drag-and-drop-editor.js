/**
 * Web Weaver Drag & Drop Editor
 * Visual editor for building websites using Web Weaver methods
 * Built entirely with Web Weaver to showcase the library
 */

class DragDropEditor {
    constructor(containerId = 'app-container') {
        this.originalWeaver = new WebWeaver(containerId);
        this.editorWeaver = null;
        this.previewWeaver = null;
        this.components = [];
        this.draggedElement = null;
        this.currentStructure = [];
        this.editorContainer = null;
        
        this.defineComponents();
        this.addEditorStyles();
        this.createEditorInterface();
    }

    addEditorStyles() {
        this.originalWeaver.addCustomCSS(`
            .editor-modal .modal {
                max-width: 95vw !important;
                max-height: 95vh !important;
                width: 95vw;
                height: 85vh;
            }
            
            .editor-layout {
                display: flex;
                height: 70vh;
                gap: 1rem;
            }
            
            .editor-canvas {
                flex: 1;
                min-height: 60vh;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                padding: 1rem;
                background: #f8f9fa;
                overflow-y: auto;
                position: relative;
            }
            
            .editor-canvas.drag-over {
                border-color: #0d6efd;
                background: #f8f9ff;
            }
            
            .component-panel {
                width: 320px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 1rem;
                overflow-y: auto;
                max-height: 70vh;
            }
            
            .component-tabs {
                display: flex;
                margin-bottom: 1rem;
                border-bottom: 1px solid #dee2e6;
                flex-wrap: wrap;
                gap: 2px;
            }
            
            .component-tab {
                padding: 0.5rem 0.75rem;
                border: none;
                background: #f8f9fa;
                border-radius: 4px 4px 0 0;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .component-tab:hover {
                background: #e9ecef;
            }
            
            .component-tab.active {
                background: #0d6efd;
                color: white;
            }
            
            .component-category {
                display: none;
            }
            
            .component-category.active {
                display: block;
            }
            
            .category-title {
                font-weight: bold;
                font-size: 0.9rem;
                color: #495057;
                margin-bottom: 0.5rem;
                padding: 0.25rem 0;
            }
            
            .draggable-component {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                cursor: grab;
                transition: all 0.2s;
                user-select: none;
            }
            
            .draggable-component:hover {
                border-color: #0d6efd;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .draggable-component:active {
                cursor: grabbing;
            }
            
            .dragging {
                opacity: 0.5;
            }
            
            .canvas-component {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                position: relative;
                cursor: pointer;
            }
            
            .canvas-component:hover {
                border-color: #0d6efd;
                box-shadow: 0 2px 4px rgba(13, 110, 253, 0.1);
            }
            
            .container-component {
                border: 2px dashed #28a745;
                background: rgba(40, 167, 69, 0.05);
                min-height: 60px;
                position: relative;
            }
            
            .container-component .component-preview {
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .container-helper {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #28a745;
                font-size: 0.8rem;
                font-style: italic;
                pointer-events: none;
            }
            
            .component-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .component-actions button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                margin-left: 0.25rem;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .edit-btn {
                color: #0d6efd;
            }
            
            .delete-btn {
                color: #dc3545;
            }
            
            .canvas-placeholder {
                text-align: center;
                color: #6c757d;
                font-style: italic;
                padding: 4rem 2rem;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                background: rgba(248, 249, 250, 0.5);
            }
            
            .component-icon {
                font-size: 1.25rem;
                margin-right: 0.5rem;
            }
            
            .component-name {
                font-weight: 600;
                font-size: 0.875rem;
            }
            
            .component-desc {
                font-size: 0.75rem;
                color: #6c757d;
                margin-top: 0.25rem;
            }
            
            .style-form-group {
                margin-bottom: 1rem;
                display: flex;
                flex-direction: column;
            }
            
            .style-form-row {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
            
            .style-form-row input, .style-form-row select {
                flex: 1;
                padding: 0.375rem;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                font-size: 0.875rem;
            }
            
            .color-preview {
                width: 30px;
                height: 30px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .style-tabs {
                display: flex;
                margin-bottom: 1rem;
                border-bottom: 1px solid #dee2e6;
            }
            
            .style-tab {
                padding: 0.5rem 1rem;
                border: none;
                background: #f8f9fa;
                border-radius: 4px 4px 0 0;
                cursor: pointer;
                font-size: 0.875rem;
                margin-right: 2px;
            }
            
            .style-tab.active {
                background: #0d6efd;
                color: white;
            }
            
            .style-section {
                display: none;
            }
            
            .style-section.active {
                display: block;
            }
            
            /* Theme inheritance for editor */
            [data-theme="dark"] .component-panel,
            [data-theme="dark"] .editor-canvas,
            [data-theme="dark"] .canvas-component,
            [data-theme="dark"] .draggable-component {
                background: var(--bg-color);
                color: var(--text-color);
                border-color: var(--border-color);
            }
        `);
    }

    defineComponents() {
        this.components = [
            // Text Components
            {
                id: 'heading',
                name: 'Heading',
                icon: '📝',
                description: 'Add headings (H1-H6)',
                method: 'heading',
                params: ['level', 'text', 'className', 'id', 'style'],
                defaultParams: ['1', 'Heading Text', '', '', ''],
                category: 'text',
                styleOptions: ['fontSize', 'color', 'textAlign', 'fontWeight', 'margin', 'padding']
            },
            {
                id: 'paragraph',
                name: 'Paragraph',
                icon: '📄',
                description: 'Add paragraph text',
                method: 'paragraph',
                params: ['text', 'className', 'id', 'style'],
                defaultParams: ['Your paragraph text here...', '', '', ''],
                category: 'text',
                styleOptions: ['fontSize', 'color', 'textAlign', 'lineHeight', 'margin', 'padding']
            },
            {
                id: 'text',
                name: 'Text Span',
                icon: '📝',
                description: 'Inline text element',
                method: 'text',
                params: ['content', 'tag', 'className', 'id', 'style'],
                defaultParams: ['Text content', 'span', '', '', ''],
                category: 'text',
                styleOptions: ['fontSize', 'color', 'fontWeight', 'textDecoration']
            },
            
            // Container Components
            {
                id: 'divStart',
                name: 'Div Container',
                icon: '📦',
                description: 'Generic container (div)',
                method: 'divStart',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['backgroundColor', 'border', 'borderRadius', 'padding', 'margin', 'width', 'height', 'display']
            },
            {
                id: 'divEnd',
                name: 'Close Container',
                icon: '📦✕',
                description: 'Closes the last opened container',
                method: 'divEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            {
                id: 'section',
                name: 'Section',
                icon: '📋',
                description: 'Semantic section container',
                method: 'section',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                styleOptions: ['backgroundColor', 'border', 'borderRadius', 'padding', 'margin']
            },
            {
                id: 'flexContainer',
                name: 'Flex Container',
                icon: '🔗',
                description: 'Flexible layout container',
                method: 'flexContainer',
                params: ['className', 'id', 'style'],
                defaultParams: ['flex gap-4', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['flexDirection', 'justifyContent', 'alignItems', 'gap', 'padding', 'margin', 'backgroundColor']
            },
            {
                id: 'card',
                name: 'Card',
                icon: '🎴',
                description: 'Card container',
                method: 'card',
                params: ['className', 'id', 'style'],
                defaultParams: ['card p-6', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['backgroundColor', 'border', 'borderRadius', 'boxShadow', 'padding', 'margin']
            },
            {
                id: 'grid',
                name: 'Grid Container',
                icon: '⬛',
                description: 'CSS Grid layout',
                method: 'grid',
                params: ['columns', 'className', 'id', 'style'],
                defaultParams: ['3', '', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['gridTemplateColumns', 'gap', 'padding', 'margin']
            },
            {
                id: 'formStart',
                name: 'Form Container',
                icon: '📝',
                description: 'Form element container',
                method: 'formStart',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['padding', 'margin', 'backgroundColor', 'border']
            },
            {
                id: 'formEnd',
                name: 'Close Form',
                icon: '📝✕',
                description: 'Closes form container',
                method: 'formEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            
            // Interactive Components
            {
                id: 'button',
                name: 'Button',
                icon: '🔘',
                description: 'Interactive button',
                method: 'button',
                params: ['text', 'onClick', 'className', 'id', 'style'],
                defaultParams: ['Click Me', '', 'btn', '', ''],
                category: 'interactive',
                styleOptions: ['backgroundColor', 'color', 'border', 'borderRadius', 'padding', 'fontSize']
            },
            {
                id: 'link',
                name: 'Link',
                icon: '🔗',
                description: 'Hyperlink element',
                method: 'navItem',
                params: ['text', 'href', 'className', 'id', 'style'],
                defaultParams: ['Link Text', '#', '', '', ''],
                category: 'interactive',
                styleOptions: ['color', 'textDecoration', 'fontSize', 'fontWeight']
            },
            
            // Form Components
            {
                id: 'input',
                name: 'Input Field',
                icon: '✏️',
                description: 'Text input field',
                method: 'input',
                params: ['type', 'placeholder', 'className', 'id', 'style'],
                defaultParams: ['text', 'Enter text...', 'form-control', '', ''],
                category: 'forms',
                styleOptions: ['width', 'padding', 'border', 'borderRadius', 'fontSize']
            },
            {
                id: 'textarea',
                name: 'Text Area',
                icon: '📝',
                description: 'Multi-line text input',
                method: 'textarea',
                params: ['placeholder', 'rows', 'className', 'id', 'style'],
                defaultParams: ['Enter your message...', '4', 'form-control', '', ''],
                category: 'forms',
                styleOptions: ['width', 'height', 'padding', 'border', 'borderRadius', 'fontSize']
            },
            {
                id: 'select',
                name: 'Select Dropdown',
                icon: '🔽',
                description: 'Dropdown selection',
                method: 'select',
                params: ['options', 'className', 'id', 'style'],
                defaultParams: [JSON.stringify([{text: 'Option 1', value: '1'}, {text: 'Option 2', value: '2'}]), 'form-control', '', ''],
                category: 'forms',
                styleOptions: ['width', 'padding', 'border', 'borderRadius', 'fontSize']
            },
            {
                id: 'checkbox',
                name: 'Checkbox',
                icon: '☑️',
                description: 'Checkbox input',
                method: 'checkbox',
                params: ['labelText', 'checked', 'className', 'id', 'style'],
                defaultParams: ['Check me', 'false', 'checkbox', '', ''],
                category: 'forms',
                styleOptions: ['fontSize', 'color']
            },
            
            // Media Components
            {
                id: 'image',
                name: 'Image',
                icon: '🖼️',
                description: 'Add images',
                method: 'image',
                params: ['src', 'alt', 'className', 'id', 'style'],
                defaultParams: ['https://via.placeholder.com/300x200', 'Placeholder image', '', '', ''],
                category: 'media',
                styleOptions: ['width', 'height', 'borderRadius', 'border', 'margin']
            },
            {
                id: 'video',
                name: 'Video',
                icon: '🎥',
                description: 'Video element',
                method: 'video',
                params: ['src', 'controls', 'className', 'id', 'style'],
                defaultParams: ['', 'true', '', '', ''],
                category: 'media',
                styleOptions: ['width', 'height', 'borderRadius', 'border']
            },
            
            // List Components
            {
                id: 'listStart',
                name: 'List Container',
                icon: '📋',
                description: 'Start ordered or unordered list',
                method: 'listStart',
                params: ['ordered', 'className', 'id', 'style'],
                defaultParams: ['false', '', '', ''],
                category: 'lists',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['listStyleType', 'padding', 'margin']
            },
            {
                id: 'listEnd',
                name: 'Close List',
                icon: '📋✕',
                description: 'Closes list container',
                method: 'listEnd',
                params: [],
                defaultParams: [],
                category: 'lists',
                isClosing: true
            },
            {
                id: 'listItem',
                name: 'List Item',
                icon: '•',
                description: 'List item',
                method: 'listItem',
                params: ['text', 'className', 'id', 'style'],
                defaultParams: ['List item text', '', '', ''],
                category: 'lists',
                styleOptions: ['fontSize', 'color', 'padding', 'margin']
            },
            
            // Navigation Components
            {
                id: 'navStart',
                name: 'Navigation',
                icon: '🧭',
                description: 'Navigation container',
                method: 'navStart',
                params: ['className', 'id', 'style'],
                defaultParams: ['nav', '', ''],
                category: 'navigation',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['backgroundColor', 'padding', 'border', 'borderRadius']
            },
            {
                id: 'navEnd',
                name: 'Close Navigation',
                icon: '🧭✕',
                description: 'Closes navigation container',
                method: 'navEnd',
                params: [],
                defaultParams: [],
                category: 'navigation',
                isClosing: true
            },
            {
                id: 'navItem',
                name: 'Nav Item',
                icon: '🔗',
                description: 'Navigation link',
                method: 'navItem',
                params: ['text', 'href', 'className', 'id', 'style'],
                defaultParams: ['Nav Link', '#', 'nav-item', '', ''],
                category: 'navigation',
                styleOptions: ['color', 'padding', 'fontSize', 'textDecoration']
            },
            
            // Layout Components
            {
                id: 'spacer',
                name: 'Spacer',
                icon: '⬜',
                description: 'Add vertical space',
                method: 'spacer',
                params: ['height'],
                defaultParams: ['2rem'],
                category: 'layout',
                styleOptions: ['height', 'backgroundColor']
            },
            {
                id: 'horizontalRule',
                name: 'Divider',
                icon: '➖',
                description: 'Horizontal line divider',
                method: 'horizontalRule',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'layout',
                styleOptions: ['border', 'margin', 'width']
            },
            {
                id: 'lineBreak',
                name: 'Line Break',
                icon: '↵',
                description: 'Line break element',
                method: 'lineBreak',
                params: [],
                defaultParams: [],
                category: 'layout'
            }
        ];
    }

    createEditorInterface() {
        // Create main editor container using Web Weaver
        this.editorContainer = document.createElement('div');
        this.editorContainer.id = 'editor-' + Date.now();
        
        // Append to DOM first before creating WebWeaver instance
        document.body.appendChild(this.editorContainer);
        
        this.editorWeaver = new WebWeaver(this.editorContainer.id);
        
        // Build the editor layout with Web Weaver
        this.editorWeaver
            .divStart('editor-layout')
                // Canvas area
                .divStart('editor-canvas', 'editor-canvas')
                    .divStart('canvas-placeholder')
                        .text('🎨 Drop components here to build your website', 'div')
                        .paragraph('Drag components from the panel on the right to start building!')
                    .divEnd()
                .divEnd()
                
                // Component panel
                .divStart('component-panel')
                    .h3('Components')
                    .paragraph('Drag these components to the canvas', 'text-muted')
                    
                    // Create category tabs
                    .divStart('component-tabs');
        
        // Get unique categories
        const categories = [...new Set(this.components.map(c => c.category))];
        
        // Add category tabs
        categories.forEach((category, index) => {
            this.editorWeaver.button(
                this.getCategoryDisplayName(category),
                () => this.switchComponentCategory(category),
                `component-tab ${index === 0 ? 'active' : ''}`,
                `tab-${category}`
            );
        });
        
        this.editorWeaver.divEnd(); // End tabs
        
        // Add component categories
        categories.forEach((category, index) => {
            this.editorWeaver.divStart(`component-category ${index === 0 ? 'active' : ''}`, `category-${category}`);
            
            // Add components for this category
            this.components
                .filter(component => component.category === category)
                .forEach(component => {
                    this.editorWeaver
                        .divStart('draggable-component', `component-${component.id}`, {
                            draggable: 'true',
                            'data-component-id': component.id
                        })
                            .flexContainer('flex items-center')
                                .text(component.icon, 'span', 'component-icon')
                                .text(component.name, 'span', 'component-name')
                            .divEnd()
                            .text(component.description, 'div', 'component-desc')
                        .divEnd();
                });
            
            this.editorWeaver.divEnd(); // End category
        });
        
        this.editorWeaver
            .divEnd() // End component panel
        .divEnd(); // End editor layout
        
        // Create the modal with the editor
        this.originalWeaver.createModal('🎨 Web Weaver Visual Editor', this.editorContainer, {
            id: 'drag-drop-editor',
            size: 'large',
            showCloseButton: true,
            closeOnBackdrop: false,
            footerButtons: [
                {
                    text: '👁️ Preview',
                    className: 'btn btn-secondary',
                    onClick: () => this.previewWebsite()
                },
                {
                    text: '💾 Generate Code',
                    className: 'btn',
                    onClick: () => this.generateCode()
                },
                {
                    text: '🗑️ Clear Canvas',
                    className: 'btn btn-secondary',
                    onClick: () => this.clearCanvas()
                }
            ]
        });

        // Remove the container from body only if it's still a child
        if (this.editorContainer.parentNode === document.body) {
            document.body.removeChild(this.editorContainer);
        }

        // Setup drag and drop after modal is created
        setTimeout(() => {
            this.setupDragAndDrop();
        }, 500);
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            text: 'Text',
            containers: 'Containers',
            interactive: 'Interactive',
            forms: 'Forms',
            media: 'Media',
            lists: 'Lists',
            navigation: 'Navigation',
            layout: 'Layout'
        };
        return categoryNames[category] || category;
    }

    switchComponentCategory(category) {
        // Update tab states
        document.querySelectorAll('.component-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab-${category}`).classList.add('active');
        
        // Update category visibility
        document.querySelectorAll('.component-category').forEach(cat => {
            cat.classList.remove('active');
        });
        document.getElementById(`category-${category}`).classList.add('active');
    }

    addComponentPreview(weaver, componentInstance) {
        const component = componentInstance;
        
        try {
            // Add container styling for container components
            if (component.isContainer && !component.isClosing) {
                weaver.divStart('container-component preview-element', '', {
                    style: 'min-height: 50px; position: relative;'
                });
                
                // Add helper text for containers
                weaver.text(`${component.name} (Drop items here)`, 'div', 'container-helper');
                
                weaver.divEnd();
                return;
            }
            
            // Handle closing components
            if (component.isClosing) {
                weaver.divStart('preview-element', '', {
                    style: 'border: 1px dashed #dc3545; padding: 0.5rem; text-align: center; color: #dc3545; background: rgba(220, 53, 69, 0.1);'
                })
                    .text(`${component.name}`, 'small')
                .divEnd();
                return;
            }
            
            // Create a preview of the component based on its type
            switch (component.method) {
                case 'heading':
                    const level = componentInstance.defaultParams[0] || '1';
                    weaver[`h${level}`](componentInstance.defaultParams[1] || 'Heading Text', 'preview-element');
                    break;
                    
                case 'paragraph':
                    weaver.paragraph(componentInstance.defaultParams[0] || 'Paragraph text', 'preview-element');
                    break;
                    
                case 'text':
                    weaver.text(componentInstance.defaultParams[0] || 'Text content', 'span', 'preview-element');
                    break;
                    
                case 'button':
                    weaver.button(componentInstance.defaultParams[0] || 'Button', () => {
                        console.log('Preview button clicked');
                    }, 'btn preview-element');
                    break;
                    
                case 'image':
                    weaver.image(
                        componentInstance.defaultParams[0] || 'https://via.placeholder.com/150x100',
                        componentInstance.defaultParams[1] || 'Preview image',
                        'preview-element',
                        '',
                        { style: 'max-width: 150px; height: auto;' }
                    );
                    break;
                    
                case 'input':
                    weaver.input(
                        componentInstance.defaultParams[0] || 'text',
                        componentInstance.defaultParams[1] || 'Enter text...',
                        'form-control preview-element'
                    );
                    break;
                    
                case 'textarea':
                    weaver.textarea(
                        componentInstance.defaultParams[0] || 'Enter your message...',
                        componentInstance.defaultParams[1] || '3',
                        'form-control preview-element'
                    );
                    break;
                    
                case 'select':
                    try {
                        const options = JSON.parse(componentInstance.defaultParams[0] || '[]');
                        weaver.select(options, 'form-control preview-element');
                    } catch (e) {
                        weaver.select([{text: 'Option 1', value: '1'}], 'form-control preview-element');
                    }
                    break;
                    
                case 'checkbox':
                    weaver.checkbox(
                        componentInstance.defaultParams[0] || 'Check me',
                        componentInstance.defaultParams[1] === 'true',
                        'checkbox preview-element'
                    );
                    break;
                    
                case 'navItem':
                    weaver.navItem(
                        componentInstance.defaultParams[0] || 'Link Text',
                        componentInstance.defaultParams[1] || '#',
                        'preview-element'
                    );
                    break;
                    
                case 'listItem':
                    weaver.listItem(componentInstance.defaultParams[0] || 'List item text', 'preview-element');
                    break;
                    
                case 'spacer':
                    weaver.divStart('preview-element', '', {
                        style: `height: ${componentInstance.defaultParams[0] || '2rem'}; background: repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 10px, #e9ecef 10px, #e9ecef 20px); border-radius: 4px; display: flex; align-items: center; justify-content: center;`
                    })
                        .text('Spacer', 'small', 'text-muted')
                    .divEnd();
                    break;
                    
                case 'horizontalRule':
                    weaver.horizontalRule('preview-element');
                    break;
                    
                case 'lineBreak':
                    weaver.lineBreak();
                    weaver.text('Line Break', 'small', 'preview-element text-muted');
                    break;
                    
                default:
                    weaver.text(`${component.name} Component`, 'div', 'preview-element text-muted');
                    break;
            }
        } catch (error) {
            console.error('Error creating component preview:', error);
            weaver.text(`${component.name} Preview`, 'div', 'preview-element text-muted');
        }
    }

    editComponent(componentInstance) {
        // Create edit form container
        const editContainer = document.createElement('div');
        editContainer.id = 'edit-' + Date.now();
        document.body.appendChild(editContainer);
        
        const editWeaver = new WebWeaver(editContainer.id);
        
        editWeaver
            .h3(`✏️ Edit ${componentInstance.name}`)
            .divStart('form-container');
        
        // Create tabs for different edit sections
        if (componentInstance.styleOptions && componentInstance.styleOptions.length > 0) {
            editWeaver
                .divStart('style-tabs')
                    .button('Properties', () => this.switchEditTab('properties'), 'style-tab active', 'tab-properties')
                    .button('Styling', () => this.switchEditTab('styling'), 'style-tab', 'tab-styling')
                .divEnd();
        }
        
        // Properties section
        editWeaver.divStart('style-section active', 'section-properties');
        
        // Create form fields for each parameter
        componentInstance.params.forEach((param, index) => {
            const currentValue = componentInstance.defaultParams[index] || '';
            
            editWeaver.divStart('form-group', '', { style: 'margin-bottom: 1rem;' });
            
            // Special handling for different parameter types
            if (param === 'onClick') {
                editWeaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .textarea('Click handler code (optional)', '3', 'form-control', `param-${index}`, {
                        placeholder: 'e.g., () => alert("Hello!")',
                        style: 'width: 100%; padding: 0.5rem; border: 1px solid #dee2e6; border-radius: 4px;'
                    });
            } else if (param === 'ordered' && componentInstance.method === 'listStart') {
                editWeaver
                    .text(`List Type:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .divStart('radio-group')
                        .input('radio', '', '', `param-${index}-unordered`, { 
                            name: `listtype-${index}`, 
                            value: 'false',
                            checked: currentValue !== 'true'
                        })
                        .text('Unordered List (bullets)', 'label', '', '', { style: 'margin-left: 0.5rem; margin-right: 1rem;' })
                        .input('radio', '', '', `param-${index}-ordered`, { 
                            name: `listtype-${index}`, 
                            value: 'true',
                            checked: currentValue === 'true'
                        })
                        .text('Ordered List (numbers)', 'label', '', '', { style: 'margin-left: 0.5rem;' })
                    .divEnd();
            } else if (param === 'level' && componentInstance.method === 'heading') {
                editWeaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .select([
                        {text: 'H1', value: '1'},
                        {text: 'H2', value: '2'},
                        {text: 'H3', value: '3'},
                        {text: 'H4', value: '4'},
                        {text: 'H5', value: '5'},
                        {text: 'H6', value: '6'}
                    ], 'form-control', `param-${index}`, {
                        value: currentValue
                    });
            } else if (param === 'type' && componentInstance.method === 'input') {
                editWeaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .select([
                        {text: 'Text', value: 'text'},
                        {text: 'Email', value: 'email'},
                        {text: 'Password', value: 'password'},
                        {text: 'Number', value: 'number'},
                        {text: 'Tel', value: 'tel'},
                        {text: 'URL', value: 'url'},
                        {text: 'Search', value: 'search'}
                    ], 'form-control', `param-${index}`, {
                        value: currentValue
                    });
            } else if (param === 'options' && componentInstance.method === 'select') {
                editWeaver
                    .text(`${param} (JSON format):`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .textarea('JSON options array', '4', 'form-control', `param-${index}`, {
                        value: currentValue,
                        placeholder: '[{"text": "Option 1", "value": "1"}, {"text": "Option 2", "value": "2"}]'
                    });
            } else {
                editWeaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .input('text', `Enter ${param}`, 'form-control', `param-${index}`, {
                        value: currentValue,
                        style: 'width: 100%; padding: 0.5rem; border: 1px solid #dee2e6; border-radius: 4px;'
                    });
            }
            
            editWeaver.divEnd(); // End form group
        });
        
        editWeaver.divEnd(); // End properties section
        
        // Styling section
        if (componentInstance.styleOptions && componentInstance.styleOptions.length > 0) {
            editWeaver.divStart('style-section', 'section-styling');
            
            this.createStyleInputs(editWeaver, componentInstance);
            
            editWeaver.divEnd(); // End styling section
        }
        
        editWeaver
            .divEnd() // End form container
            .divStart('button-group', '', { style: 'margin-top: 1rem; display: flex; gap: 0.5rem;' })
                .button('💾 Save Changes', () => {
                    this.saveComponentChanges(componentInstance, editContainer);
                }, 'btn')
                .button('❌ Cancel', () => {
                    this.originalWeaver.closeModal('edit-modal');
                }, 'btn btn-secondary')
            .divEnd();
        
        this.originalWeaver.createModal(`Edit ${componentInstance.name}`, editContainer, {
            id: 'edit-modal',
            size: 'large',
            onClose: () => {
                if (editContainer.parentNode) {
                    editContainer.parentNode.removeChild(editContainer);
                }
            }
        });
    }

    switchEditTab(tabName) {
        // Update tab states
        document.querySelectorAll('.style-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // Update section visibility
        document.querySelectorAll('.style-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`section-${tabName}`).classList.add('active');
    }

    createStyleInputs(weaver, componentInstance) {
        const currentStyle = this.parseStyleString(componentInstance.defaultParams[componentInstance.params.indexOf('style')] || '');
        
        componentInstance.styleOptions.forEach(styleOption => {
            weaver.divStart('style-form-group');
            
            switch(styleOption) {
                case 'fontSize':
                    weaver
                        .text('Font Size:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                            .input('text', '16px', '', 'style-fontSize', { value: currentStyle.fontSize || '' })
                        .divEnd();
                    break;
                    
                case 'color':
                    weaver
                        .text('Text Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                            .input('color', '', '', 'style-color', { value: currentStyle.color || '#000000' })
                            .input('text', '#000000', '', 'style-color-text', { value: currentStyle.color || '' })
                        .divEnd();
                    break;
                    
                case 'backgroundColor':
                    weaver
                        .text('Background Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                            .input('color', '', '', 'style-backgroundColor', { value: currentStyle.backgroundColor || '#ffffff' })
                            .input('text', 'transparent', '', 'style-backgroundColor-text', { value: currentStyle.backgroundColor || '' })
                        .divEnd();
                    break;
                    
                case 'padding':
                    weaver
                        .text('Padding:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '10px', '', 'style-padding', { value: currentStyle.padding || '' });
                    break;
                    
                case 'margin':
                    weaver
                        .text('Margin:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '10px', '', 'style-margin', { value: currentStyle.margin || '' });
                    break;
                    
                case 'border':
                    weaver
                        .text('Border:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '1px solid #ccc', '', 'style-border', { value: currentStyle.border || '' });
                    break;
                    
                case 'borderRadius':
                    weaver
                        .text('Border Radius:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '4px', '', 'style-borderRadius', { value: currentStyle.borderRadius || '' });
                    break;
                    
                case 'width':
                    weaver
                        .text('Width:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '100%', '', 'style-width', { value: currentStyle.width || '' });
                    break;
                    
                case 'height':
                    weaver
                        .text('Height:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', 'auto', '', 'style-height', { value: currentStyle.height || '' });
                    break;
                    
                default:
                    weaver
                        .text(`${styleOption}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '', '', `style-${styleOption}`, { value: currentStyle[styleOption] || '' });
                    break;
            }
            
            weaver.divEnd(); // End style form group
        });
    }

    parseStyleString(styleString) {
        const styles = {};
        if (!styleString) return styles;
        
        styleString.split(';').forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value) {
                // Convert kebab-case to camelCase
                const camelProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                styles[camelProperty] = value;
            }
        });
        
        return styles;
    }

    saveComponentChanges(componentInstance, editContainer) {
        // Get updated values from form
        componentInstance.params.forEach((param, index) => {
            if (param === 'ordered' && componentInstance.method === 'listStart') {
                const orderedRadio = editContainer.querySelector(`#param-${index}-ordered`);
                componentInstance.defaultParams[index] = orderedRadio.checked ? 'true' : 'false';
            } else {
                const input = editContainer.querySelector(`#param-${index}`);
                if (input) {
                    componentInstance.defaultParams[index] = input.value;
                }
            }
        });
        
        // Collect style values if component has style options
        if (componentInstance.styleOptions && componentInstance.styleOptions.length > 0) {
            const styleIndex = componentInstance.params.indexOf('style');
            if (styleIndex !== -1) {
                const styles = [];
                
                componentInstance.styleOptions.forEach(styleOption => {
                    const styleInput = editContainer.querySelector(`#style-${styleOption}`);
                    const textInput = editContainer.querySelector(`#style-${styleOption}-text`);
                    
                    if (styleInput && styleInput.value) {
                        const value = textInput ? textInput.value : styleInput.value;
                        if (value) {
                            // Convert camelCase to kebab-case
                            const kebabProperty = styleOption.replace(/([A-Z])/g, '-$1').toLowerCase();
                            styles.push(`${kebabProperty}: ${value}`);
                        }
                    }
                });
                
                componentInstance.defaultParams[styleIndex] = styles.join('; ');
            }
        }
        
        // Update the component instance stored on the DOM element
        const canvasComponent = document.querySelector(`[data-instance-id="${componentInstance.instanceId}"]`);
        if (canvasComponent) {
            canvasComponent._componentInstance = componentInstance;
            
            const previewContainer = canvasComponent.querySelector('.component-preview');
            if (previewContainer) {
                // Clear and rebuild preview
                previewContainer.innerHTML = '';
                
                // Create temporary weaver for the preview
                const tempContainer = document.createElement('div');
                tempContainer.id = 'temp-preview-' + Date.now();
                document.body.appendChild(tempContainer);
                
                const tempWeaver = new WebWeaver(tempContainer.id);
                this.addComponentPreview(tempWeaver, componentInstance);
                
                // Move the preview content
                while (tempContainer.firstChild) {
                    previewContainer.appendChild(tempContainer.firstChild);
                }
                document.body.removeChild(tempContainer);
            }
        }
        
        this.updateStructure();
        this.originalWeaver.closeModal('edit-modal');
        this.originalWeaver.toast('Component updated successfully!', 'success', 2000);
    }

   generateCode() {
        if (this.currentStructure.length === 0) {
            this.originalWeaver.toast('Add some components to the canvas first!', 'warning', 3000);
            return;
        }

        // Create code display container
        const codeContainer = document.createElement('div');
        codeContainer.id = 'code-' + Date.now();
        document.body.appendChild(codeContainer);
        
        const codeWeaver = new WebWeaver(codeContainer.id);
        
        let code = `// Generated Web Weaver App
// Save this as app.js and include it in your HTML

// Initialize Web Weaver
const weaver = new WebWeaver('app-container');

// Clear any existing content and start building
weaver.clear()`;
        
        this.currentStructure.forEach(item => {
            const { component, params } = item;
            if (!component) return;
            
            // Handle different component types
            if (component.isClosing) {
                code += `\n    .${component.method}()`;
            } else if (component.method === 'button') {
                const clickHandler = params[1] && params[1].trim() !== '' 
                    ? params[1] 
                    : '() => { console.log("Button clicked!"); }';
                code += `\n    .${component.method}('${params[0] || 'Button'}', ${clickHandler}, '${params[2] || 'btn'}'${params[3] ? `, '${params[3]}'` : ''}${params[4] ? `, { style: '${params[4]}' }` : ''})`;
            } else if (component.method === 'heading') {
                const level = params[0] || '1';
                const text = params[1] || 'Heading Text';
                const className = params[2] || '';
                const id = params[3] || '';
                const style = params[4] || '';
                
                code += `\n    .h${level}('${text}'${className ? `, '${className}'` : ''}${id ? `, '${id}'` : ''}${style ? `, { style: '${style}' }` : ''})`;
            } else {
                const formattedParams = params.map((p, index) => {
                    if (typeof p === 'string') {
                        // Handle style parameter specially
                        if (component.params[index] === 'style' && p) {
                            return `{ style: '${p.replace(/'/g, "\\'")}' }`;
                        }
                        return `'${p.replace(/'/g, "\\'")}'`;
                    }
                    return p;
                });
                
                // Filter out empty parameters from the end
                while (formattedParams.length > 0 && (formattedParams[formattedParams.length - 1] === "''" || formattedParams[formattedParams.length - 1] === '{}')) {
                    formattedParams.pop();
                }
                
                if (formattedParams.length > 0) {
                    code += `\n    .${component.method}(${formattedParams.join(', ')})`;
                } else {
                    code += `\n    .${component.method}()`;
                }
            }
        });
        
        code += `;\n\n// Optional: Save the current state
// weaver.saveData('myWebsite', weaver.getCurrentHTML());`;
        
        codeWeaver
            .h3('📋 Generated Web Weaver App')
            .paragraph('This code will recreate your website. Save it as app.js:')
            .divStart('', '', {
                style: 'background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1rem; font-family: monospace; white-space: pre-wrap; overflow-x: auto; margin: 1rem 0; font-size: 0.875rem; max-height: 400px; overflow-y: auto;'
            })
                .text(code, 'code')
            .divEnd()
            .flexContainer('flex gap-2')
                .button('📋 Copy Code', () => {
                    navigator.clipboard.writeText(code).then(() => {
                        this.originalWeaver.toast('Code copied to clipboard!', 'success', 2000);
                    }).catch(() => {
                        this.originalWeaver.toast('Failed to copy code', 'error', 2000);
                    });
                }, 'btn')
                .button('💾 Download app.js', () => {
                    this.downloadCode(code, 'app.js');
                }, 'btn btn-secondary')
            .divEnd();
        
        this.originalWeaver.createModal('💾 Generated Code', codeContainer, {
            id: 'code-modal',
            size: 'large',
            onClose: () => {
                if (codeContainer.parentNode) {
                    codeContainer.parentNode.removeChild(codeContainer);
                }
            }
        });
    }

    // Download generated code as file
   downloadCode(code, filename) {
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.originalWeaver.toast('File downloaded!', 'success', 2000);
    }

   clearCanvas() {
        const canvas = document.querySelector('#editor-canvas');
        if (!canvas) return;
        
        canvas.innerHTML = '';
        
        // Add placeholder back
        const placeholderContainer = document.createElement('div');
        placeholderContainer.id = 'placeholder-clear-' + Date.now();
        document.body.appendChild(placeholderContainer);
        
        const placeholderWeaver = new WebWeaver(placeholderContainer.id);
        
        placeholderWeaver
            .divStart('canvas-placeholder')
                .text('🎨 Drop components here to build your website', 'div')
                .paragraph('Drag components from the panel on the right to start building!')
            .divEnd();
        
        canvas.appendChild(placeholderContainer.firstChild);
        document.body.removeChild(placeholderContainer);
        
        this.currentStructure = [];
        this.originalWeaver.toast('Canvas cleared successfully!', 'info', 2000);
    }

    setupDragAndDrop() {
        setTimeout(() => {
            this.detectAndApplyCurrentTheme();
            
            const canvas = document.querySelector('.editor-canvas');
            const draggableComponents = document.querySelectorAll('.draggable-component');
            
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }
            
            // Set up drag events for components
            draggableComponents.forEach(component => {
                component.addEventListener('dragstart', (e) => {
                    const componentId = e.target.getAttribute('data-component-id');
                    this.draggedElement = this.components.find(c => c.id === componentId);
                    e.target.classList.add('dragging');
                });
                
                component.addEventListener('dragend', (e) => {
                    e.target.classList.remove('dragging');
                    this.draggedElement = null;
                });
            });
            
            // Set up drop zone
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                canvas.classList.add('drag-over');
            });
            
            canvas.addEventListener('dragleave', (e) => {
                if (!canvas.contains(e.relatedTarget)) {
                    canvas.classList.remove('drag-over');
                }
            });
            
            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                canvas.classList.remove('drag-over');
                
                if (this.draggedElement) {
                    this.addComponentToCanvas(this.draggedElement);
                }
            });
        }, 100);
    }

    detectAndApplyCurrentTheme() {
        // Get the current theme from the original weaver
        const currentTheme = this.originalWeaver.getCurrentTheme();
        
        // Apply the same theme to the editor weaver
        if (this.editorWeaver && currentTheme) {
            this.editorWeaver.setTheme(currentTheme);
        }
        
        // Also apply to the modal container
        const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
        if (modal) {
            modal.setAttribute('data-theme', currentTheme);
        }
    }

    addComponentToCanvas(component) {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas) return;
        
        // Remove placeholder if it exists
        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create component instance with unique ID
        const componentInstance = {
            ...component,
            instanceId: 'instance-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            defaultParams: [...component.defaultParams] // Clone the array
        };
        
        // Create canvas component container
        const canvasComponentContainer = document.createElement('div');
        canvasComponentContainer.id = 'canvas-comp-' + Date.now();
        document.body.appendChild(canvasComponentContainer);
        
        const canvasWeaver = new WebWeaver(canvasComponentContainer.id);
        
        // Build component in canvas
        canvasWeaver
            .divStart('canvas-component', '', {
                'data-instance-id': componentInstance.instanceId
            })
                .divStart('component-header')
                    .text(`${componentInstance.icon} ${componentInstance.name}`, 'span', 'component-title')
                    .divStart('component-actions')
                        .button('✏️', () => this.editComponent(componentInstance), 'edit-btn', '', {
                            title: 'Edit component'
                        })
                        .button('🗑️', () => this.deleteComponent(componentInstance.instanceId), 'delete-btn', '', {
                            title: 'Delete component'
                        })
                    .divEnd()
                .divEnd()
                .divStart('component-preview', 'component-preview');
        
        // Add the component preview
        this.addComponentPreview(canvasWeaver, componentInstance);
        
        canvasWeaver.divEnd().divEnd(); // End preview and component
        
        // Move to canvas and store component instance
        const componentElement = canvasComponentContainer.firstChild;
        componentElement._componentInstance = componentInstance;
        canvas.appendChild(componentElement);
        
        // Clean up temporary container
        document.body.removeChild(canvasComponentContainer);
        
        // Update structure
        this.updateStructure();
        
        this.originalWeaver.toast(`${component.name} added to canvas!`, 'success', 2000);
    }

    deleteComponent(instanceId) {
        const componentElement = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (componentElement) {
            componentElement.remove();
            this.updateStructure();
            
            // Add placeholder back if canvas is empty
            const canvas = document.querySelector('.editor-canvas');
            if (canvas && canvas.children.length === 0) {
                const placeholderContainer = document.createElement('div');
                placeholderContainer.id = 'placeholder-' + Date.now();
                document.body.appendChild(placeholderContainer);
                
                const placeholderWeaver = new WebWeaver(placeholderContainer.id);
                placeholderWeaver
                    .divStart('canvas-placeholder')
                        .text('🎨 Drop components here to build your website', 'div')
                        .paragraph('Drag components from the panel on the right to start building!')
                    .divEnd();
                
                canvas.appendChild(placeholderContainer.firstChild);
                document.body.removeChild(placeholderContainer);
            }
            
            this.originalWeaver.toast('Component deleted!', 'info', 2000);
        }
    }

    updateStructure() {
        this.currentStructure = [];
        const canvasComponents = document.querySelectorAll('.canvas-component');
        
        canvasComponents.forEach(element => {
            const componentInstance = element._componentInstance;
            if (componentInstance) {
                this.currentStructure.push({
                    component: componentInstance,
                    params: componentInstance.defaultParams
                });
            }
        });
    }

    previewWebsite() {
        if (this.currentStructure.length === 0) {
            this.originalWeaver.toast('Add some components to the canvas first!', 'warning', 3000);
            return;
        }
        
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.id = 'preview-' + Date.now();
        document.body.appendChild(previewContainer);
        
        this.previewWeaver = new WebWeaver(previewContainer.id);
        
        // Apply current theme to preview
        const currentTheme = this.originalWeaver.getCurrentTheme();
        if (currentTheme) {
            this.previewWeaver.setTheme(currentTheme);
        }
        
        // Build the preview
        this.previewWeaver.clear();
        
        this.currentStructure.forEach(item => {
            const { component, params } = item;
            if (!component) return;
            
            try {
                if (component.isClosing) {
                    this.previewWeaver[component.method]();
                } else {
                    // Handle different component methods
                    switch (component.method) {
                        case 'heading':
                            const level = params[0] || '1';
                            this.previewWeaver[`h${level}`](params[1] || 'Heading', params[2] || '', params[3] || '', params[4] ? { style: params[4] } : {});
                            break;
                        case 'button':
                            const clickHandler = params[1] && params[1].trim() !== '' 
                                ? new Function('return ' + params[1])() 
                                : () => { console.log('Button clicked!'); };
                            this.previewWeaver.button(params[0] || 'Button', clickHandler, params[2] || 'btn', params[3] || '', params[4] ? { style: params[4] } : {});
                            break;
                        default:
                            // Apply parameters based on component definition
                            const methodParams = [];
                            component.params.forEach((param, index) => {
                                if (param === 'style' && params[index]) {
                                    methodParams.push({ style: params[index] });
                                } else {
                                    methodParams.push(params[index] || '');
                                }
                            });
                            
                            // Filter out empty parameters from the end
                            while (methodParams.length > 0 && (methodParams[methodParams.length - 1] === '' || (typeof methodParams[methodParams.length - 1] === 'object' && Object.keys(methodParams[methodParams.length - 1]).length === 0))) {
                                methodParams.pop();
                            }
                            
                            this.previewWeaver[component.method](...methodParams);
                            break;
                    }
                }
            } catch (error) {
                console.error('Error rendering component in preview:', error);
            }
        });
        
        this.originalWeaver.createModal('👁️ Website Preview', previewContainer, {
            id: 'preview-modal',
            size: 'large',
            onClose: () => {
                if (previewContainer.parentNode) {
                    previewContainer.parentNode.removeChild(previewContainer);
                }
            }
        });
    }
}

// Launch function
function launchDragDropEditor() {
    new DragDropEditor();
}

// Export for global access
window.DragDropEditor = DragDropEditor;
window.launchDragDropEditor = launchDragDropEditor;