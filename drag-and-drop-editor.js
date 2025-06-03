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
                resize: horizontal;
                min-width: 300px;
                max-width: 80%;
            }
            
            .editor-canvas.drag-over {
                border-color: #0d6efd;
                background: #f8f9ff;
            }
            
            .component-panel {
                width: 320px;
                min-width: 250px;
                max-width: 500px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 1rem;
                overflow-y: auto;
                max-height: 70vh;
                resize: horizontal;
            }
            
            /* Component tabs styling */
            .component-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 2px;
                margin-bottom: 1rem;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 0.5rem;
            }
            
            .component-tab {
                padding: 0.5rem 0.75rem;
                border: 1px solid #dee2e6;
                background: #f8f9fa;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 500;
                transition: all 0.2s;
                white-space: nowrap;
                min-width: 0;
                flex: 0 0 auto;
            }
            
            .component-tab:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            
            .component-tab.active {
                background: #0d6efd;
                border-color: #0d6efd;
                color: white;
            }
            
            /* Component categories */
            .component-category {
                display: none;
            }
            
            .component-category.active {
                display: block;
            }
            
            /* Draggable components */
            .draggable-component {
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                cursor: grab;
                transition: all 0.2s;
                position: relative;
            }
            
            .draggable-component:hover {
                border-color: #0d6efd;
                box-shadow: 0 2px 4px rgba(13, 110, 253, 0.15);
                transform: translateY(-1px);
            }
            
            .draggable-component:active {
                cursor: grabbing;
            }
            
            .draggable-component.dragging {
                opacity: 0.5;
                transform: rotate(2deg);
            }
            
            .canvas-component {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                position: relative;
                cursor: pointer;
                transition: all 0.2s;
                resize: vertical;
                min-height: 60px;
                overflow: hidden;
            }
            
            .canvas-component:hover {
                border-color: #0d6efd;
                box-shadow: 0 2px 4px rgba(13, 110, 253, 0.1);
            }
            
            .canvas-component.dragging {
                opacity: 0.5;
                transform: rotate(2deg);
            }
            
            /* Canvas component collapsed state */
            .canvas-component.collapsed .component-preview {
                display: none;
            }
            
            .canvas-component.collapsed {
                min-height: auto;
                height: auto;
                overflow: visible;
            }
            
            /* Comment components styling */
            .canvas-component.comment-component {
                background: #fff3cd;
                border-color: #ffc107;
                font-style: italic;
            }
            
            .canvas-component.comment-component .component-preview {
                color: #856404;
                font-size: 0.9rem;
            }
            
            /* JavaScript components styling */
            .canvas-component.js-component {
                background: #e7f3ff;
                border-color: #007bff;
            }
            
            .canvas-component.js-component .component-preview {
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                background: #f8f9fa;
                padding: 0.5rem;
                border-radius: 4px;
                border-left: 3px solid #007bff;
                white-space: pre-wrap;
                overflow-x: auto;
            }
            
            /* Canvas components styling */
            .canvas-component.canvas-component-type {
                background: #f0f8ff;
                border-color: #6f42c1;
            }
            
            .canvas-component.canvas-component-type .component-preview {
                border: 2px dashed #6f42c1;
                border-radius: 4px;
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
                            linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
                            linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
                background-size: 10px 10px;
                background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
            }
            
            /* Nesting levels with indentation */
            .canvas-component[data-nesting-level="1"] {
                margin-left: 2rem;
                border-left: 3px solid #0d6efd;
                background: rgba(13, 110, 253, 0.05);
                padding: 0.5rem 0.75rem;
                min-height: auto;
            }
            
            .canvas-component[data-nesting-level="2"] {
                margin-left: 4rem;
                border-left: 3px solid #28a745;
                background: rgba(40, 167, 69, 0.05);
                padding: 0.4rem 0.75rem;
                min-height: auto;
            }
            
            .canvas-component[data-nesting-level="3"] {
                margin-left: 6rem;
                border-left: 3px solid #ffc107;
                background: rgba(255, 193, 7, 0.05);
                padding: 0.3rem 0.75rem;
                min-height: auto;
            }
            
            .canvas-component[data-nesting-level="4"] {
                margin-left: 8rem;
                border-left: 3px solid #dc3545;
                background: rgba(220, 53, 69, 0.05);
                padding: 0.25rem 0.75rem;
                min-height: auto;
            }
            
            .canvas-component[data-nesting-level="5"] {
                margin-left: 10rem;
                border-left: 3px solid #6f42c1;
                background: rgba(111, 66, 193, 0.05);
                padding: 0.2rem 0.75rem;
                min-height: auto;
            }
            
            /* Container components with nesting */
            .container-component {
                border: 2px dashed #28a745;
                background: rgba(40, 167, 69, 0.05);
                min-height: 60px;
                position: relative;
            }
            
            .container-component[data-nesting-level="1"] {
                border-color: #0d6efd;
                background: rgba(13, 110, 253, 0.03);
            }
            
            .container-component[data-nesting-level="2"] {
                border-color: #28a745;
                background: rgba(40, 167, 69, 0.03);
            }
            
            .container-component[data-nesting-level="3"] {
                border-color: #ffc107;
                background: rgba(255, 193, 7, 0.03);
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
            
            /* Nested container helpers with different colors */
            .container-component[data-nesting-level="1"] .container-helper {
                color: #0d6efd;
            }
            
            .container-component[data-nesting-level="2"] .container-helper {
                color: #28a745;
            }
            
            .container-component[data-nesting-level="3"] .container-helper {
                color: #ffc107;
            }
            
            /* Closing components with nesting */
            .canvas-component.closing-component {
                border-style: dashed;
                background: rgba(220, 53, 69, 0.1);
                font-size: 0.8rem;
                padding: 0.4rem 0.75rem;
            }
            
            .canvas-component.closing-component[data-nesting-level="1"] {
                background: rgba(13, 110, 253, 0.1);
                border-color: #0d6efd;
            }
            
            .canvas-component.closing-component[data-nesting-level="2"] {
                background: rgba(40, 167, 69, 0.1);
                border-color: #28a745;
            }
            
            .canvas-component.closing-component[data-nesting-level="3"] {
                background: rgba(255, 193, 7, 0.1);
                border-color: #ffc107;
            }
            
            .component-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #f0f0f0;
            }
            
            /* Smaller headers for nested components */
            .canvas-component[data-nesting-level] .component-header {
                margin-bottom: 0.25rem;
                padding-bottom: 0.25rem;
                font-size: 0.9rem;
            }
            
            .canvas-component[data-nesting-level="2"] .component-header,
            .canvas-component[data-nesting-level="3"] .component-header,
            .canvas-component[data-nesting-level="4"] .component-header,
            .canvas-component[data-nesting-level="5"] .component-header {
                font-size: 0.8rem;
            }
            
            .component-actions {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .component-actions button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 3px;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            /* Smaller action buttons for nested components */
            .canvas-component[data-nesting-level] .component-actions button {
                padding: 0.15rem;
                font-size: 10px;
            }
            
            .component-actions button:hover {
                background: rgba(0,0,0,0.1);
            }
            
            .edit-btn {
                color: #0d6efd;
            }
            
            .delete-btn {
                color: #dc3545;
            }
            
            .move-btn {
                color: #6c757d;
                cursor: move;
            }
            
            .reorder-btn {
                color: #6c757d;
                padding: 0.125rem 0.25rem;
                font-size: 10px;
            }
            
            .collapse-btn {
                color: #6c757d;
                font-size: 10px;
                transform: rotate(0deg);
                transition: transform 0.2s;
            }
            
            .collapse-btn.collapsed {
                transform: rotate(-90deg);
            }
            
            .collapse-btn:hover {
                color: #495057;
            }
            
            /* Action divider */
            .action-divider {
                width: 1px;
                height: 16px;
                background: #dee2e6;
                margin: 0 0.25rem;
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
            
            /* Smaller icons for nested components */
            .canvas-component[data-nesting-level] .component-icon {
                font-size: 1rem;
            }
            
            .canvas-component[data-nesting-level="2"] .component-icon,
            .canvas-component[data-nesting-level="3"] .component-icon,
            .canvas-component[data-nesting-level="4"] .component-icon,
            .canvas-component[data-nesting-level="5"] .component-icon {
                font-size: 0.9rem;
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
            
            /* Improved drop indicators */
            .drop-indicator {
                height: 3px;
                background: #0d6efd;
                border-radius: 2px;
                margin: 0;
                opacity: 0;
                transition: opacity 0.2s ease;
                position: absolute;
                left: 0;
                right: 0;
                z-index: 1000;
                pointer-events: none;
            }
            
            .drop-indicator.active {
                opacity: 1;
            }
            
            .drop-indicator-before {
                top: -2px;
            }
            
            .drop-indicator-after {
                bottom: -2px;
            }
            
            .drop-indicator-end {
                position: relative;
                margin: 10px 0;
                height: 3px;
            }
            
            /* Component drag over state - subtle highlight */
            .canvas-component.drag-target-before {
                border-top: 2px solid #0d6efd;
                margin-top: 2px;
            }
            
            .canvas-component.drag-target-after {
                border-bottom: 2px solid #0d6efd;
                margin-bottom: 2px;
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
            
            [data-theme="dark"] .component-tab {
                background: var(--bg-secondary);
                border-color: var(--border-color);
                color: var(--text-color);
            }
            
            [data-theme="dark"] .component-tab:hover {
                background: var(--bg-hover);
            }
            
            [data-theme="dark"] .component-tab.active {
                background: var(--primary-color);
                color: white;
            }
            
            [data-theme="dark"] .action-divider {
                background: var(--border-color);
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
            {
                id: 'htmlComment',
                name: 'HTML Comment',
                icon: '💬',
                description: 'Add HTML comment',
                method: 'comment',
                params: ['text'],
                defaultParams: ['HTML comment text'],
                category: 'text',
                isComment: true
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
                defaultParams: [JSON.stringify([{ text: 'Option 1', value: '1' }, { text: 'Option 2', value: '2' }]), 'form-control', '', ''],
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
            },

            // JavaScript Components
            {
                id: 'scriptStart',
                name: 'Script Block',
                icon: '⚡',
                description: 'Start JavaScript code block',
                method: 'scriptStart',
                params: ['type'],
                defaultParams: ['text/javascript'],
                category: 'javascript',
                isContainer: true,
                needsClosing: true,
                isJavaScript: true
            },
            {
                id: 'scriptEnd',
                name: 'Close Script',
                icon: '⚡✕',
                description: 'Closes script block',
                method: 'scriptEnd',
                params: [],
                defaultParams: [],
                category: 'javascript',
                isClosing: true,
                isJavaScript: true
            },
            {
                id: 'jsComment',
                name: 'JS Comment',
                icon: '💭',
                description: 'JavaScript comment',
                method: 'jsComment',
                params: ['text'],
                defaultParams: ['JavaScript comment'],
                category: 'javascript',
                isComment: true,
                isJavaScript: true
            },
            {
                id: 'jsVariable',
                name: 'Variable',
                icon: '📦',
                description: 'JavaScript variable declaration',
                method: 'jsVariable',
                params: ['type', 'name', 'value'],
                defaultParams: ['const', 'myVariable', '"Hello World"'],
                category: 'javascript',
                isJavaScript: true
            },
            {
                id: 'jsFunction',
                name: 'Function',
                icon: '⚙️',
                description: 'JavaScript function',
                method: 'jsFunction',
                params: ['name', 'params', 'body'],
                defaultParams: ['myFunction', '', 'console.log("Hello!");'],
                category: 'javascript',
                isJavaScript: true
            },
            {
                id: 'jsEventListener',
                name: 'Event Listener',
                icon: '👂',
                description: 'Add event listener',
                method: 'jsEventListener',
                params: ['selector', 'event', 'callback'],
                defaultParams: ['#myButton', 'click', 'function() { alert("Clicked!"); }'],
                category: 'javascript',
                isJavaScript: true
            },

            // Canvas Components
            {
                id: 'canvas',
                name: 'Canvas Element',
                icon: '🎨',
                description: 'HTML5 Canvas for drawing',
                method: 'canvas',
                params: ['width', 'height', 'className', 'id', 'style'],
                defaultParams: ['400', '300', '', '', ''],
                category: 'canvas',
                isCanvasComponent: true,
                styleOptions: ['border', 'borderRadius', 'margin']
            },
            {
                id: 'canvasScript',
                name: 'Canvas Script',
                icon: '🖌️',
                description: 'Canvas drawing script',
                method: 'canvasScript',
                params: ['canvasId', 'script'],
                defaultParams: ['myCanvas', 'const ctx = canvas.getContext("2d");\nctx.fillStyle = "blue";\nctx.fillRect(10, 10, 100, 100);'],
                category: 'canvas',
                isCanvasComponent: true,
                isJavaScript: true
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
            layout: 'Layout',
            javascript: 'JavaScript',
            canvas: 'Canvas'
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

            // Handle comment components
            if (component.isComment) {
                const commentText = componentInstance.defaultParams[0] || 'Comment text';
                weaver.divStart('preview-element', '', {
                    style: 'font-style: italic; color: #856404; background: #fff3cd; padding: 0.5rem; border-radius: 4px;'
                })
                    .text(`💬 ${commentText}`, 'div')
                    .divEnd();
                return;
            }

            // Handle JavaScript components
            if (component.isJavaScript) {
                let jsCode = '';
                switch (component.method) {
                    case 'jsVariable':
                        const type = componentInstance.defaultParams[0] || 'const';
                        const name = componentInstance.defaultParams[1] || 'myVariable';
                        const value = componentInstance.defaultParams[2] || '"value"';
                        jsCode = `${type} ${name} = ${value};`;
                        break;
                    case 'jsFunction':
                        const funcName = componentInstance.defaultParams[0] || 'myFunction';
                        const params = componentInstance.defaultParams[1] || '';
                        const body = componentInstance.defaultParams[2] || 'console.log("Hello!");';
                        jsCode = `function ${funcName}(${params}) {\n  ${body}\n}`;
                        break;
                    case 'jsEventListener':
                        const selector = componentInstance.defaultParams[0] || '#myButton';
                        const event = componentInstance.defaultParams[1] || 'click';
                        const callback = componentInstance.defaultParams[2] || 'function() { alert("Clicked!"); }';
                        jsCode = `document.querySelector('${selector}').addEventListener('${event}', ${callback});`;
                        break;
                    case 'jsComment':
                        jsCode = `// ${componentInstance.defaultParams[0] || 'JavaScript comment'}`;
                        break;
                    default:
                        jsCode = `<${component.method}>`;
                }

                weaver.divStart('preview-element', '', {
                    style: 'font-family: "Courier New", monospace; background: #f8f9fa; padding: 0.5rem; border-radius: 4px; border-left: 3px solid #007bff;'
                })
                    .text(jsCode, 'code')
                    .divEnd();
                return;
            }

            // Handle Canvas components
            if (component.isCanvasComponent) {
                if (component.method === 'canvas') {
                    const width = componentInstance.defaultParams[0] || '400';
                    const height = componentInstance.defaultParams[1] || '300';
                    weaver.divStart('preview-element', '', {
                        style: `width: ${Math.min(width, 200)}px; height: ${Math.min(height, 150)}px; border: 2px dashed #6f42c1; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%); background-size: 10px 10px;`
                    })
                        .text(`🎨 Canvas ${width}×${height}`, 'div', 'text-center')
                        .divEnd();
                } else if (component.method === 'canvasScript') {
                    const script = componentInstance.defaultParams[1] || 'Canvas drawing code';
                    weaver.divStart('preview-element', '', {
                        style: 'font-family: "Courier New", monospace; background: #f0f8ff; padding: 0.5rem; border-radius: 4px; border-left: 3px solid #6f42c1; max-height: 100px; overflow: hidden;'
                    })
                        .text(`🖌️ ${script.substring(0, 50)}${script.length > 50 ? '...' : ''}`, 'code')
                        .divEnd();
                }
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
                        weaver.select([{ text: 'Option 1', value: '1' }], 'form-control preview-element');
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
                        { text: 'H1', value: '1' },
                        { text: 'H2', value: '2' },
                        { text: 'H3', value: '3' },
                        { text: 'H4', value: '4' },
                        { text: 'H5', value: '5' },
                        { text: 'H6', value: '6' }
                    ], 'form-control', `param-${index}`, {
                        value: currentValue
                    });
            } else if (param === 'type' && componentInstance.method === 'input') {
                editWeaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .select([
                        { text: 'Text', value: 'text' },
                        { text: 'Email', value: 'email' },
                        { text: 'Password', value: 'password' },
                        { text: 'Number', value: 'number' },
                        { text: 'Tel', value: 'tel' },
                        { text: 'URL', value: 'url' },
                        { text: 'Search', value: 'search' }
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

            switch (styleOption) {
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
        const canvas = document.querySelector('.editor-canvas');
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

            // Set up drag events for draggable components from panel
            draggableComponents.forEach(component => {
                component.addEventListener('dragstart', (e) => {
                    const componentId = e.target.closest('.draggable-component').getAttribute('data-component-id');
                    this.draggedElement = this.components.find(c => c.id === componentId);
                    this.draggedFrom = 'panel';
                    e.target.classList.add('dragging');
                });

                component.addEventListener('dragend', (e) => {
                    e.target.classList.remove('dragging');
                    this.draggedElement = null;
                    this.draggedFrom = null;
                });
            });

            // Set up canvas drag and drop
            this.setupCanvasDragDrop(canvas);

            // Set up existing canvas components for reordering
            this.setupCanvasComponentDragDrop();
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

    setupCanvasDragDrop(canvas) {
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();

            if (this.draggedElement) {
                // Clear previous highlights
                canvas.querySelectorAll('.canvas-component').forEach(comp => {
                    comp.classList.remove('drag-target-before', 'drag-target-after');
                });

                // Find the closest component to insert before/after
                const dropTarget = this.getDropTarget(canvas, e.clientX, e.clientY);

                if (dropTarget.component) {
                    if (dropTarget.position === 'before') {
                        dropTarget.component.classList.add('drag-target-before');
                    } else {
                        dropTarget.component.classList.add('drag-target-after');
                    }
                } else {
                    // No specific target, show end indicator
                    this.showEndDropIndicator(canvas);
                }

                canvas.classList.add('drag-over');
            }
        });

        canvas.addEventListener('dragleave', (e) => {
            if (!canvas.contains(e.relatedTarget)) {
                canvas.classList.remove('drag-over');
                // Clear all drag highlights
                canvas.querySelectorAll('.canvas-component').forEach(comp => {
                    comp.classList.remove('drag-target-before', 'drag-target-after');
                });
                this.hideAllDropIndicators(canvas);
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');

            // Clear all drag highlights
            canvas.querySelectorAll('.canvas-component').forEach(comp => {
                comp.classList.remove('drag-target-before', 'drag-target-after');
            });
            this.hideAllDropIndicators(canvas);

            if (this.draggedElement) {
                const dropTarget = this.getDropTarget(canvas, e.clientX, e.clientY);

                if (this.draggedFrom === 'panel') {
                    // Adding new component
                    this.addComponentToCanvas(this.draggedElement, dropTarget);
                } else if (this.draggedFrom === 'canvas') {
                    // Reordering existing component
                    this.reorderComponent(this.draggedElement, dropTarget);
                }
            }
        });
    }

    setupCanvasComponentDragDrop() {
        const canvasComponents = document.querySelectorAll('.canvas-component');

        canvasComponents.forEach(component => {
            // Make canvas components draggable
            component.draggable = true;

            component.addEventListener('dragstart', (e) => {
                this.draggedElement = component;
                this.draggedFrom = 'canvas';
                component.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            component.addEventListener('dragend', (e) => {
                component.classList.remove('dragging');
                this.draggedElement = null;
                this.draggedFrom = null;
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.canvas-component:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    addComponentToCanvas(component, dropTarget = null) {
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
        
        // Determine extra classes based on component type
        let extraClasses = '';
        if (component.isClosing) extraClasses += 'closing-component ';
        if (component.isComment) extraClasses += 'comment-component ';
        if (component.isJavaScript) extraClasses += 'js-component ';
        if (component.isCanvasComponent) extraClasses += 'canvas-component-type ';
        
        // Build component in canvas (temporarily without nesting level)
        canvasWeaver
            .divStart(`canvas-component ${extraClasses}`, '', {
                'data-instance-id': componentInstance.instanceId,
                draggable: 'true'
            })
                .divStart('component-header')
                    .text(`${componentInstance.icon} ${componentInstance.name}`, 'span', 'component-title')
                    .divStart('component-actions')
                        .button('⬆️', () => this.moveComponent(componentInstance.instanceId, 'up'), 'reorder-btn', '', {
                            title: 'Move up'
                        })
                        .button('⬇️', () => this.moveComponent(componentInstance.instanceId, 'down'), 'reorder-btn', '', {
                            title: 'Move down'
                        })
                        .button('⋮⋮', null, 'move-btn', '', {
                            title: 'Drag to reorder'
                        })
                        .button('✏️', () => this.editComponent(componentInstance), 'edit-btn', '', {
                            title: 'Edit component'
                        })
                        .button('🗑️', () => this.deleteComponent(componentInstance.instanceId), 'delete-btn', '', {
                            title: 'Delete component'
                        })
                        .divStart('action-divider')
                        .divEnd()
                        .button('🔽', () => this.toggleComponentCollapse(componentInstance.instanceId), 'collapse-btn', '', {
                            title: 'Collapse/Expand component'
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
        
        // Insert at the correct position based on drop target
        if (dropTarget && dropTarget.component) {
            if (dropTarget.position === 'before') {
                canvas.insertBefore(componentElement, dropTarget.component);
            } else {
                canvas.insertBefore(componentElement, dropTarget.component.nextSibling);
            }
        } else {
            canvas.appendChild(componentElement);
        }
        
        // Clean up temporary container
        document.body.removeChild(canvasComponentContainer);
        
        // Set up drag events for the new component
        this.setupSingleComponentDragDrop(componentElement);
        
        // Update nesting levels for all components AFTER insertion
        this.updateNestingLevels();
        
        // Update structure
        this.updateStructure();
        
        this.originalWeaver.toast(`${component.name} added to canvas!`, 'success', 2000);
    }

    toggleComponentCollapse(instanceId) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (!component) return;
        
        const collapseBtn = component.querySelector('.collapse-btn');
        const preview = component.querySelector('.component-preview');
        
        if (component.classList.contains('collapsed')) {
            // Expand
            component.classList.remove('collapsed');
            collapseBtn.classList.remove('collapsed');
            collapseBtn.textContent = '🔽';
            collapseBtn.title = 'Collapse component';
            this.originalWeaver.toast('Component expanded!', 'info', 1000);
        } else {
            // Collapse
            component.classList.add('collapsed');
            collapseBtn.classList.add('collapsed');
            collapseBtn.textContent = '🔼';
            collapseBtn.title = 'Expand component';
            this.originalWeaver.toast('Component collapsed!', 'info', 1000);
        }
    }

    /*resizeComponent(instanceId, size) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (!component) return;
        
        // Remove existing size classes
        component.classList.remove('component-small', 'component-medium', 'component-large');
        
        // Apply new size
        switch (size) {
            case 'small':
                component.style.height = '60px';
                component.classList.add('component-small');
                break;
            case 'medium':
                component.style.height = '120px';
                component.classList.add('component-medium');
                break;
            case 'large':
                component.style.height = '200px';
                component.classList.add('component-large');
                break;
        }
        
        this.originalWeaver.toast(`Component resized to ${size}!`, 'info', 1500);
    }*/

    calculateNestingLevel(dropTarget = null) {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas) return 0;
        
        const allComponents = [...canvas.querySelectorAll('.canvas-component')];
        
        let insertIndex = allComponents.length; // Default to end
        
        if (dropTarget && dropTarget.component) {
            insertIndex = allComponents.indexOf(dropTarget.component);
            if (dropTarget.position === 'after') {
                insertIndex++;
            }
        }
        
        // Calculate nesting level by simulating the container stack up to insertion point
        let nestingLevel = 0;
        const containerStack = [];
        
        for (let i = 0; i < insertIndex; i++) {
            const comp = allComponents[i];
            const instance = comp._componentInstance;
            if (!instance) continue;
            
            if (instance.isContainer && !instance.isClosing) {
                // Opening container
                containerStack.push(instance);
                nestingLevel = containerStack.length;
            } else if (instance.isClosing) {
                // Closing container
                if (containerStack.length > 0) {
                    containerStack.pop();
                }
                nestingLevel = containerStack.length;
            }
        }
        
        return nestingLevel;
    }

    updateNestingLevels() {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas) return;
        
        const allComponents = [...canvas.querySelectorAll('.canvas-component')];
        
        let currentNestingLevel = 0;
        const containerStack = [];
        
        allComponents.forEach((comp, index) => {
            const instance = comp._componentInstance;
            if (!instance) return;
            
            if (instance.isContainer && !instance.isClosing) {
                // Opening container - set its level to current, then increase for contents
                comp.setAttribute('data-nesting-level', currentNestingLevel);
                containerStack.push({
                    component: instance,
                    level: currentNestingLevel
                });
                currentNestingLevel++;
            } else if (instance.isClosing) {
                // Closing container - decrease level first, then set
                if (containerStack.length > 0) {
                    currentNestingLevel--;
                    containerStack.pop();
                }
                comp.setAttribute('data-nesting-level', currentNestingLevel);
            } else {
                // Regular component - use current nesting level
                comp.setAttribute('data-nesting-level', currentNestingLevel);
            }
            
            // Debug logging
            console.log(`Component ${instance.name} at index ${index}: nesting level ${comp.getAttribute('data-nesting-level')}, stack depth: ${containerStack.length}`);
        });
    }

    showEndDropIndicator(canvas) {
        let indicator = canvas.querySelector('.drop-indicator-end');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'drop-indicator drop-indicator-end active';
            canvas.appendChild(indicator);
        } else {
            indicator.classList.add('active');
        }
    }

    hideAllDropIndicators(canvas) {
        canvas.querySelectorAll('.drop-indicator').forEach(indicator => {
            indicator.classList.remove('active');
        });
    }

    getDropTarget(container, x, y) {
        const components = [...container.querySelectorAll('.canvas-component:not(.dragging)')];

        if (components.length === 0) {
            return { component: null, position: 'end' };
        }

        for (let component of components) {
            const rect = component.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Adjust coordinates relative to container
            const relativeY = y - containerRect.top + container.scrollTop;
            const componentTop = rect.top - containerRect.top + container.scrollTop;
            const componentBottom = componentTop + rect.height;
            const componentMiddle = componentTop + (rect.height / 2);

            if (relativeY >= componentTop && relativeY <= componentBottom) {
                // Determine if we should insert before or after
                if (relativeY < componentMiddle) {
                    return { component: component, position: 'before' };
                } else {
                    return { component: component, position: 'after' };
                }
            }
        }

        // If we're below all components, insert at end
        const lastComponent = components[components.length - 1];
        const lastRect = lastComponent.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeY = y - containerRect.top + container.scrollTop;
        const lastComponentBottom = lastRect.bottom - containerRect.top + container.scrollTop;

        if (relativeY > lastComponentBottom) {
            return { component: null, position: 'end' };
        }

        // Default to inserting before first component
        return { component: components[0], position: 'before' };
    }

    setupSingleComponentDragDrop(component) {
        component.addEventListener('dragstart', (e) => {
            this.draggedElement = component;
            this.draggedFrom = 'canvas';
            component.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        component.addEventListener('dragend', (e) => {
            component.classList.remove('dragging');
            this.draggedElement = null;
            this.draggedFrom = null;
        });
    }

    reorderComponent(draggedComponent, dropTarget) {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas || !draggedComponent) return;

        // Don't do anything if dropping on itself
        if (dropTarget && dropTarget.component === draggedComponent) {
            return;
        }

        // Insert at the correct position based on drop target
        if (dropTarget && dropTarget.component) {
            if (dropTarget.position === 'before') {
                canvas.insertBefore(draggedComponent, dropTarget.component);
            } else {
                canvas.insertBefore(draggedComponent, dropTarget.component.nextSibling);
            }
        } else {
            canvas.appendChild(draggedComponent);
        }

        // Update nesting levels after reordering
        this.updateNestingLevels();

        this.updateStructure();
        this.originalWeaver.toast('Component reordered!', 'info', 1500);
    }

    moveComponent(instanceId, direction) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (!component) return;

        const canvas = document.querySelector('.editor-canvas');
        const allComponents = [...canvas.querySelectorAll('.canvas-component')];
        const currentIndex = allComponents.indexOf(component);

        if (direction === 'up' && currentIndex > 0) {
            // Move up (insert before previous sibling)
            const previousComponent = allComponents[currentIndex - 1];
            canvas.insertBefore(component, previousComponent);
            this.updateNestingLevels();
            this.updateStructure();
            this.originalWeaver.toast('Component moved up!', 'info', 1500);
        } else if (direction === 'down' && currentIndex < allComponents.length - 1) {
            // Move down (insert after next sibling)
            const nextComponent = allComponents[currentIndex + 1];
            canvas.insertBefore(component, nextComponent.nextSibling);
            this.updateNestingLevels();
            this.updateStructure();
            this.originalWeaver.toast('Component moved down!', 'info', 1500);
        }
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

        // Clean up any orphaned drop indicators
        document.querySelectorAll('.drop-indicator').forEach(indicator => {
            if (!indicator.classList.contains('active')) {
                indicator.remove();
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