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

        // Set dark theme as default for the editor
        this.originalWeaver.setTheme('default').saveTheme('default');

        // Set theme on document root immediately
        document.documentElement.setAttribute('data-theme', 'default');

        this.defineComponents();
        this.addEditorStyles();

        // Load CodeMirror assets before creating interface
        this.loadCodeMirrorAssets().then(() => {
            this.createEditorInterface();

            // Apply theme after interface is created
            setTimeout(() => {
                this.detectAndApplyCurrentTheme();
            }, 100);
        }).catch((error) => {
            console.warn('Failed to load CodeMirror, using fallback editor:', error);
            this.createEditorInterface();

            // Apply theme after interface is created
            setTimeout(() => {
                this.detectAndApplyCurrentTheme();
            }, 100);
        });
    }

    addEditorStyles() {
        this.originalWeaver.addCustomCSS(`
            /* Drag & Drop Editor - Simplified Dark Theme CSS */
            
            /* Force dark theme on ALL editor elements */
            .editor-modal,
            .editor-modal *,
            [data-modal-id="drag-drop-editor"],
            [data-modal-id="drag-drop-editor"] *,
            [data-modal-id="edit-modal"],
            [data-modal-id="edit-modal"] *,
            [data-modal-id="code-modal"],
            [data-modal-id="code-modal"] *,
            [data-modal-id="preview-modal"],
            [data-modal-id="preview-modal"] *,
            [data-modal-id="save-project-modal"],
            [data-modal-id="save-project-modal"] *,
            [data-modal-id="load-project-modal"],
            [data-modal-id="load-project-modal"] *,
            [data-modal-id="new-project-modal"],
            [data-modal-id="new-project-modal"] * {
                background-color: #111827 !important;
                color: #f9fafb !important;
                border-color: #374151 !important;
            }

            /* Modal containers */
            .editor-modal .modal,
            [data-modal-id*="editor"] .modal,
            [data-modal-id*="edit"] .modal,
            [data-modal-id*="code"] .modal,
            [data-modal-id*="save"] .modal,
            [data-modal-id*="load"] .modal,
            [data-modal-id*="new"] .modal {
                max-width: 98vw !important;
                max-height: 98vh !important;
                width: 98vw;
                height: 95vh;
                display: flex;
                flex-direction: column;
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
            }
            
            /* Modal sections */
            .editor-modal .modal-header,
            .editor-modal .modal-footer,
            [data-modal-id*="editor"] .modal-header,
            [data-modal-id*="editor"] .modal-footer,
            [data-modal-id*="edit"] .modal-header,
            [data-modal-id*="edit"] .modal-footer,
            [data-modal-id*="code"] .modal-header,
            [data-modal-id*="code"] .modal-footer,
            [data-modal-id*="save"] .modal-header,
            [data-modal-id*="save"] .modal-footer,
            [data-modal-id*="load"] .modal-header,
            [data-modal-id*="load"] .modal-footer,
            [data-modal-id*="new"] .modal-header,
            [data-modal-id*="new"] .modal-footer {
                background-color: #111827 !important;
                border-color: #374151 !important;
                color: #f9fafb !important;
                flex-shrink: 0;
            }
            
            .editor-modal .modal-body,
            [data-modal-id*="editor"] .modal-body,
            [data-modal-id*="edit"] .modal-body,
            [data-modal-id*="code"] .modal-body,
            [data-modal-id*="save"] .modal-body,
            [data-modal-id*="load"] .modal-body,
            [data-modal-id*="new"] .modal-body {
                flex: 1;
                overflow: hidden;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                background-color: #1f2937 !important;
                color: #f9fafb !important;
            }
            
            /* Editor Layout */
            .editor-layout {
                display: flex;
                height: 70vh;
                gap: 1rem;
                background-color: #1f2937 !important;
            }
            
            /* Canvas Area */
            .editor-canvas {
                flex: 1;
                min-height: 60vh;
                border: 2px dashed #374151 !important;
                border-radius: 8px;
                padding: 1rem;
                background-color: #1f2937 !important;
                color: #f9fafb !important;
                overflow-y: auto;
                position: relative;
                resize: horizontal;
                min-width: 300px;
                max-width: 80%;
            }
            
            .editor-canvas.drag-over {
                border-color: #3b82f6 !important;
                background-color: #1e3a8a !important;
            }
            
            .canvas-placeholder {
                text-align: center;
                color: #9ca3af !important;
                font-style: italic;
                padding: 4rem 2rem;
                border: 2px dashed #374151 !important;
                border-radius: 8px;
                background-color: rgba(31, 41, 55, 0.5) !important;
            }
            
            /* Component Panel */
            .component-panel {
                width: 320px;
                min-width: 250px;
                max-width: 500px;
                background-color: #1f2937 !important;
                border: 1px solid #374151 !important;
                border-radius: 8px;
                padding: 1rem;
                overflow-y: auto;
                max-height: 70vh;
                resize: horizontal;
            }
            
            /* Component Categories Container - Add scrolling support */
            .component-categories-container {
                max-height: calc(70vh - 200px);
                overflow-y: auto;
                padding-right: 0.5rem;
            }
            
            /* Scrollbar styling for component categories */
            .component-categories-container::-webkit-scrollbar {
                width: 6px;
            }
            
            .component-categories-container::-webkit-scrollbar-track {
                background: rgba(55, 65, 81, 0.3) !important;
                border-radius: 3px;
            }
            
            .component-categories-container::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.5) !important;
                border-radius: 3px;
            }
            
            .component-categories-container::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.8) !important;
            }
            
            /* Component Tabs */
            .component-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 2px;
                margin-bottom: 1rem;
                border-bottom: 1px solid #374151 !important;
                padding-bottom: 0.5rem;
            }
            
            .component-tab {
                padding: 0.5rem 0.75rem;
                border: 1px solid #374151 !important;
                background-color: #111827 !important;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 500;
                transition: all 0.2s;
                white-space: nowrap;
                color: #f9fafb !important;
            }
            
            .component-tab:hover {
                background-color: #374151 !important;
                border-color: #4b5563 !important;
            }
            
            .component-tab.active {
                background-color: #3b82f6 !important;
                border-color: #3b82f6 !important;
                color: white !important;
            }
            
            /* Component Categories */
            .component-category {
                display: none;
            }
            
            .component-category.active {
                display: block;
            }
            
            /* Touch feedback states */
            .touch-ready {
                transform: scale(1.02) !important;
                transition: transform 0.1s ease !important;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
            }
            
            .touch-feedback {
                transform: scale(1.05) !important;
                box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5) !important;
                border-color: #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.1) !important;
            }
            
            /* Draggable Components */
            .draggable-component {
                background-color: #111827 !important;
                border: 1px solid #374151 !important;
                border-radius: 6px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                cursor: grab;
                transition: all 0.2s;
                position: relative;
                color: #f9fafb !important;
                touch-action: pan-y; /* Allow vertical scrolling by default */
            }
            
            .draggable-component:hover {
                border-color: #3b82f6 !important;
                background-color: #374151 !important;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
                transform: translateY(-1px);
            }
            
            .draggable-component:active {
                cursor: grabbing;
            }
            
            .draggable-component.dragging {
                opacity: 0.5;
                transform: rotate(2deg);
            }
            
            .draggable-component.touch-dragging {
                opacity: 0.3;
                transform: scale(0.95) rotate(3deg);
                z-index: 1000;
            }
            
            /* Canvas Components */
            .canvas-component {
                background-color: #111827 !important;
                border: 1px solid #374151 !important;
                border-radius: 4px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                position: relative;
                cursor: pointer;
                transition: all 0.2s;
                resize: vertical;
                min-height: 60px;
                max-height: 300px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                color: #f9fafb !important;
                touch-action: pan-y; /* Allow vertical scrolling by default */
            }
            
            .canvas-component:hover {
                border-color: #3b82f6 !important;
                background-color: #1f2937 !important;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
            }
            
            .canvas-component.dragging {
                opacity: 0.5;
                transform: rotate(2deg);
            }
            
            .canvas-component.touch-dragging {
                opacity: 0.3;
                transform: scale(0.95) rotate(3deg);
                z-index: 1000;
            }
            
            /* Touch Drop Zones */
            .touch-drop-zone {
                height: 60px;
                margin: 0.5rem 0;
                border: 2px dashed transparent;
                border-radius: 8px;
                background: rgba(59, 130, 246, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #3b82f6;
                font-weight: 600;
                font-size: 0.9rem;
                opacity: 0;
                transform: scaleY(0);
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .touch-drop-zone.active {
                opacity: 1;
                transform: scaleY(1);
                border-color: #3b82f6;
            }
            
            .touch-drop-zone:hover,
            .touch-drop-zone.highlight {
                background: rgba(59, 130, 246, 0.3);
                border-color: #60a5fa;
                color: #60a5fa;
            }
            
            /* Component Header */
            .component-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #374151 !important;
                min-height: 40px;
                flex-shrink: 0;
                color: #f9fafb !important;
            }
            
            .component-title {
                color: #f9fafb !important;
                font-weight: 600;
            }
            
            /* Component Actions */
            .component-actions {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .component-actions button {
                background: transparent !important;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 3px;
                font-size: 12px;
                transition: all 0.2s;
                color: #9ca3af !important;
                min-width: 24px;
                min-height: 24px;
                touch-action: manipulation;
            }
            
            .component-actions button:hover {
                background-color: rgba(156, 163, 175, 0.1) !important;
                color: #f9fafb !important;
            }
            
            .action-divider {
                width: 1px;
                height: 16px;
                background-color: #374151 !important;
                margin: 0 0.25rem;
            }
            
            /* Component Preview */
            .component-preview {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                min-height: 30px;
                max-height: 200px;
                padding: 0.25rem;
                margin-top: 0.5rem;
                border-top: 1px solid #374151 !important;
                background-color: transparent !important;
                color: #f9fafb !important;
            }
            
            /* Scrollbars */
            .component-preview::-webkit-scrollbar,
            .editor-canvas::-webkit-scrollbar {
                width: 6px;
            }
            
            .component-preview::-webkit-scrollbar-track,
            .editor-canvas::-webkit-scrollbar-track {
                background: rgba(55, 65, 81, 0.3) !important;
                border-radius: 3px;
            }
            
            .component-preview::-webkit-scrollbar-thumb,
            .editor-canvas::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.5) !important;
                border-radius: 3px;
            }
            
            .component-preview::-webkit-scrollbar-thumb:hover,
            .editor-canvas::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.8) !important;
            }
            
            /* Component Types */
            .canvas-component.comment-component {
                background-color: rgba(251, 191, 36, 0.1) !important;
                border-color: #f59e0b !important;
            }
            
            .canvas-component.js-component {
                background-color: rgba(59, 130, 246, 0.1) !important;
                border-color: #3b82f6 !important;
            }
            
            .canvas-component.canvas-component-type {
                background-color: rgba(139, 92, 246, 0.1) !important;
                border-color: #8b5cf6 !important;
            }
            
            .canvas-component.closing-component {
                background-color: rgba(239, 68, 68, 0.1) !important;
                border-color: #ef4444 !important;
                border-style: dashed;
            }
            
            /* Nesting Levels */
            .canvas-component[data-nesting-level="1"] {
                margin-left: 2rem;
                border-left: 3px solid #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.05) !important;
            }
            
            .canvas-component[data-nesting-level="2"] {
                margin-left: 4rem;
                border-left: 3px solid #10b981 !important;
                background-color: rgba(16, 185, 129, 0.05) !important;
            }
            
            .canvas-component[data-nesting-level="3"] {
                margin-left: 6rem;
                border-left: 3px solid #f59e0b !important;
                background-color: rgba(245, 158, 11, 0.05) !important;
            }
            
            .canvas-component[data-nesting-level="4"] {
                margin-left: 8rem;
                border-left: 3px solid #ef4444 !important;
                background-color: rgba(239, 68, 68, 0.05) !important;
            }
            
            .canvas-component[data-nesting-level="5"] {
                margin-left: 10rem;
                border-left: 3px solid #8b5cf6 !important;
                background-color: rgba(139, 92, 246, 0.05) !important;
            }
            
            /* Collapsed States */
            .canvas-component.collapsed .component-preview {
                display: none;
            }
            
            .canvas-component.collapsed {
                min-height: auto;
                height: auto;
                max-height: none;
                overflow: visible;
            }
            
            .canvas-component.group-collapsed {
                border-left: 4px solid #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.1) !important;
            }
            
            .canvas-component.group-hidden {
                display: none !important;
            }
            
            .group-collapse-summary {
                padding: 0.75rem;
                background-color: rgba(59, 130, 246, 0.2) !important;
                border: 1px dashed #60a5fa !important;
                border-radius: 6px;
                text-align: center;
                color: #60a5fa !important;
                font-style: italic;
                font-size: 0.9rem;
            }
            
            /* Drag Indicators */
            .drop-indicator {
                height: 3px;
                background-color: #3b82f6 !important;
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
            
            .canvas-component.drag-target-before {
                border-top: 2px solid #3b82f6 !important;
                margin-top: 2px;
            }
            
            .canvas-component.drag-target-after {
                border-bottom: 2px solid #3b82f6 !important;
                margin-bottom: 2px;
            }
            
            /* Form Controls in Editor */
            .editor-modal .form-control,
            .editor-modal input,
            .editor-modal textarea,
            .editor-modal select,
            [data-modal-id*="editor"] .form-control,
            [data-modal-id*="editor"] input,
            [data-modal-id*="editor"] textarea,
            [data-modal-id*="editor"] select,
            [data-modal-id*="edit"] .form-control,
            [data-modal-id*="edit"] input,
            [data-modal-id*="edit"] textarea,
            [data-modal-id*="edit"] select,
            [data-modal-id*="save"] .form-control,
            [data-modal-id*="save"] input,
            [data-modal-id*="save"] textarea,
            [data-modal-id*="save"] select,
            [data-modal-id*="load"] .form-control,
            [data-modal-id*="load"] input,
            [data-modal-id*="load"] textarea,
            [data-modal-id*="load"] select {
                background-color: #111827 !important;
                border-color: #374151 !important;
                color: #f9fafb !important;
            }
            
            .editor-modal .form-control:focus,
            .editor-modal input:focus,
            .editor-modal textarea:focus,
            .editor-modal select:focus,
            [data-modal-id*="editor"] .form-control:focus,
            [data-modal-id*="editor"] input:focus,
            [data-modal-id*="editor"] textarea:focus,
            [data-modal-id*="editor"] select:focus,
            [data-modal-id*="edit"] .form-control:focus,
            [data-modal-id*="edit"] input:focus,
            [data-modal-id*="edit"] textarea:focus,
            [data-modal-id*="edit"] select:focus {
                border-color: #3b82f6 !important;
                background-color: #1f2937 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            /* Style Form Elements */
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
            
            .style-tabs {
                display: flex;
                margin-bottom: 1rem;
                border-bottom: 1px solid #374151 !important;
            }
            
            .style-tab {
                padding: 0.5rem 1rem;
                border: none;
                background-color: #111827 !important;
                border-radius: 4px 4px 0 0;
                cursor: pointer;
                font-size: 0.875rem;
                margin-right: 2px;
                color: #f9fafb !important;
            }
            
            .style-tab.active {
                background-color: #3b82f6 !important;
                color: white !important;
            }
            
            .style-section {
                display: none;
            }
            
            .style-section.active {
                display: block;
            }
            
            /* Color Previews */
            .color-preview {
                width: 30px;
                height: 30px;
                border: 1px solid #374151 !important;
                border-radius: 4px;
                cursor: pointer;
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .editor-modal .modal {
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    width: 100vw;
                    height: 100vh;
                    border-radius: 0;
                }
                
                .editor-layout {
                    flex-direction: column;
                    gap: 0.25rem;
                    height: 100%;
                }
                
                .component-panel {
                    width: 100%;
                    height: 40vh;
                    max-height: 40vh;
                    order: 2;
                    resize: none;
                }
                
                .component-categories-container {
                    max-height: calc(40vh - 150px);
                }
                
                .editor-canvas {
                    flex: 1;
                    min-height: 50vh;
                    width: 100%;
                    order: 1;
                    resize: none;
                }
                
                .component-tab {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.7rem;
                    flex: 1;
                    text-align: center;
                }
                
                .draggable-component {
                    padding: 0.5rem;
                    margin-bottom: 0.25rem;
                    font-size: 0.85rem;
                }
                
                .canvas-component {
                    padding: 0.5rem;
                    margin-bottom: 0.25rem;
                    min-height: 40px;
                }
                
                /* Touch drag handles for mobile */
                .touch-drag-handle {
                    position: absolute;
                    top: 50%;
                    right: 0.5rem;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                    color: #9ca3af;
                    opacity: 0.7;
                    pointer-events: none;
                    user-select: none;
                }
                
                .touch-ready .touch-drag-handle,
                .touch-feedback .touch-drag-handle {
                    color: #3b82f6;
                    opacity: 1;
                }
            }
            
            /* Fix any remaining white backgrounds */
            .editor-modal,
            .editor-modal div,
            .editor-modal span,
            .editor-modal p,
            .editor-modal h1,
            .editor-modal h2,
            .editor-modal h3,
            .editor-modal h4,
            .editor-modal h5,
            .editor-modal h6,
            [data-modal-id*="editor"],
            [data-modal-id*="editor"] div,
            [data-modal-id*="editor"] span,
            [data-modal-id*="editor"] p,
            [data-modal-id*="edit"],
            [data-modal-id*="edit"] div,
            [data-modal-id*="edit"] span,
            [data-modal-id*="edit"] p {
                background-color: transparent !important;
                color: #f9fafb !important;
            }
            
            /* Ensure labels and text are visible */
            .editor-modal label,
            .editor-modal .component-name,
            .editor-modal .component-desc,
            [data-modal-id*="editor"] label,
            [data-modal-id*="editor"] .component-name,
            [data-modal-id*="editor"] .component-desc,
            [data-modal-id*="edit"] label,
            [data-modal-id*="save"] label,
            [data-modal-id*="load"] label {
                color: #f9fafb !important;
                background-color: transparent !important;
            }
            
            .component-desc {
                color: #9ca3af !important;
            }

            /* CodeMirror Dark Theme Overrides */
            .CodeMirror {
                background: #0d1117 !important;
                color: #e6edf3 !important;
                border: none !important;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
            
            .CodeMirror-gutters {
                background: #161b22 !important;
                border-right: 1px solid #30363d !important;
            }
            
            .CodeMirror-linenumber {
                color: #7d8590 !important;
            }
            
            .CodeMirror-cursor {
                border-left: 2px solid #f0f6fc !important;
            }
            
            .CodeMirror-selected {
                background: #264f78 !important;
            }
            
            .CodeMirror-line::selection,
            .CodeMirror-line > span::selection,
            .CodeMirror-line > span > span::selection {
                background: #264f78 !important;
            }
            
            .CodeMirror-focused .CodeMirror-selected {
                background: #264f78 !important;
            }
            
            .cm-keyword {
                color: #ff7b72 !important;
            }
            
            .cm-string {
                color: #a5d6ff !important;
            }
            
            .cm-comment {
                color: #8b949e !important;
                font-style: italic !important;
            }
            
            .cm-number {
                color: #79c0ff !important;
            }
            
            .cm-variable {
                color: #ffa657 !important;
            }
            
            .cm-def {
                color: #d2a8ff !important;
            }
            
            .cm-operator {
                color: #ff7b72 !important;
            }
            
            .cm-bracket {
                color: #e6edf3 !important;
            }
            
            .cm-tag {
                color: #7ee787 !important;
            }
            
            .cm-attribute {
                color: #79c0ff !important;
            }
            
            .cm-property {
                color: #79c0ff !important;
            }
            
            .cm-builtin {
                color: #ffa657 !important;
            }
            
            .cm-meta {
                color: #d2a8ff !important;
            }
            
            /* CodeMirror addon styles */
            .CodeMirror-foldmarker {
                background: #30363d !important;
                color: #7d8590 !important;
                border: 1px solid #30363d !important;
            }
            
            .CodeMirror-foldgutter {
                width: 16px !important;
            }
            
            .CodeMirror-foldgutter-open,
            .CodeMirror-foldgutter-folded {
                color: #7d8590 !important;
                cursor: pointer !important;
            }
            
            .CodeMirror-foldgutter-open:hover,
            .CodeMirror-foldgutter-folded:hover {
                color: #f0f6fc !important;
            }
            
            /* Search dialog styles */
            .CodeMirror-dialog {
                background: #161b22 !important;
                color: #e6edf3 !important;
                border: 1px solid #30363d !important;
                border-radius: 6px !important;
            }
            
            .CodeMirror-dialog input {
                background: #0d1117 !important;
                color: #e6edf3 !important;
                border: 1px solid #30363d !important;
                border-radius: 4px !important;
            }
            
            /* Fullscreen mode */
            .CodeMirror-fullscreen {
                background: #0d1117 !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                height: 100% !important;
                z-index: 9999 !important;
            }
            
            /* Code editor container improvements */
            .code-editor-container {
                background: #0d1117 !important;
                border: 1px solid #30363d !important;
                border-radius: 8px !important;
                overflow: hidden !important;
            }
            
            .code-editor-header {
                background: #161b22 !important;
                border-bottom: 1px solid #30363d !important;
                padding: 0.75rem !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            
            .code-editor-header button {
                background: #21262d !important;
                border: 1px solid #30363d !important;
                color: #e6edf3 !important;
                padding: 0.375rem 0.75rem !important;
                border-radius: 4px !important;
                font-size: 0.875rem !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            .code-editor-header button:hover {
                background: #30363d !important;
                border-color: #484f58 !important;
            }
            
            .code-editor-header button:active {
                background: #262c36 !important;
            }

            /* Code Editor Container Fixes */
            .code-editor-container .CodeMirror,
            .code-editor-container textarea {
                height: 400px !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            .code-editor {
                min-height: 400px !important;
                overflow: hidden !important;
            }
            
            /* Ensure CodeMirror displays properly */
            .CodeMirror-wrap {
                height: 400px !important;
            }
            
            .CodeMirror-scroll {
                height: 400px !important;
                overflow-y: auto !important;
                overflow-x: auto !important;
            }
            
            /* Modal adjustments for code editor */
            [data-modal-id="code-modal"] .modal-body {
                padding: 1rem !important;
                overflow: visible !important;
            }
            
            [data-modal-id="code-modal"] .modal {
                max-height: 90vh !important;
                display: flex !important;
                flex-direction: column !important;
            }
            
            [data-modal-id="code-modal"] .modal-body {
                flex: 1 !important;
                overflow-y: auto !important;
            }
            
            /* Better code formatting display */
            .CodeMirror pre {
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                border-radius: 0 !important;
                background: transparent !important;
            }
            
            /* Syntax highlighting improvements for the generated code */
            .cm-comment {
                color: #7c7c7c !important;
                font-style: italic !important;
            }
            
            .cm-string {
                color: #a9c5a8 !important;
            }
            
            .cm-number {
                color: #d19a66 !important;
            }
            
            .cm-atom {
                color: #c678dd !important;
            }
            
            .cm-variable-2 {
                color: #56b6c2 !important;
            }
            
            .cm-property {
                color: #e06c75 !important;
            }
            
            .cm-qualifier {
                color: #d19a66 !important;
            }

            /* Add button styling */
            .add-component-btn {
                opacity: 0;
                transition: opacity 0.2s ease !important;
                background: #3b82f6 !important;
                color: white !important;
                border: none !important;
                padding: 0.25rem 0.5rem !important;
                font-size: 0.8rem !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                min-width: auto !important;
                min-height: auto !important;
            }

            .draggable-component:hover .add-component-btn {
                opacity: 1;
            }

            .add-component-btn:hover {
                background: #2563eb !important;
                transform: scale(1.05) !important;
            }

            .component-info {
                flex: 1;
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
                styleOptions: ['fontSize', 'color', 'textAlign', 'fontWeight', 'fontFamily', 'lineHeight', 'textShadow', 'letterSpacing', 'textTransform', 'margin', 'padding', 'backgroundColor', 'border', 'borderRadius'],
                eventOptions: ['onClick', 'onHover', 'onTouch']
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
                styleOptions: ['fontSize', 'color', 'textAlign', 'lineHeight', 'fontFamily', 'fontWeight', 'letterSpacing', 'textIndent', 'textShadow', 'margin', 'padding', 'backgroundColor', 'border', 'borderRadius'],
                eventOptions: ['onClick', 'onHover', 'onTouch']
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
                styleOptions: ['fontSize', 'color', 'fontWeight', 'fontFamily', 'textDecoration', 'textShadow', 'letterSpacing', 'textTransform', 'backgroundColor', 'padding', 'border', 'borderRadius'],
                eventOptions: ['onClick', 'onHover', 'onTouch']
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
                styleOptions: ['backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'border', 'borderRadius', 'boxShadow', 'padding', 'margin', 'width', 'height', 'minHeight', 'maxHeight', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'position', 'top', 'left', 'right', 'bottom', 'zIndex', 'overflow', 'opacity', 'transform'],
                eventOptions: ['onClick', 'onHover', 'onTouch']
            },
            {
                id: 'divEnd',
                name: 'Close Div',
                icon: '📦✕',
                description: 'Closes div container',
                method: 'divEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            {
                id: 'section',
                name: 'Section Container',
                icon: '📋',
                description: 'Semantic section container',
                method: 'section',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['backgroundColor', 'border', 'borderRadius', 'padding', 'margin']
            },
            {
                id: 'sectionEnd',
                name: 'Close Section',
                icon: '📋✕',
                description: 'Closes section container',
                method: 'sectionEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
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
                id: 'flexContainerEnd',
                name: 'Close Flex Container',
                icon: '🔗✕',
                description: 'Closes flex container',
                method: 'flexContainerEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            {
                id: 'card',
                name: 'Card Container',
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
                id: 'cardEnd',
                name: 'Close Card',
                icon: '🎴✕',
                description: 'Closes card container',
                method: 'cardEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
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
                id: 'gridEnd',
                name: 'Close Grid',
                icon: '⬛✕',
                description: 'Closes grid container',
                method: 'gridEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            {
                id: 'container',
                name: 'Container',
                icon: '📄',
                description: 'Bootstrap-style container',
                method: 'container',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['maxWidth', 'padding', 'margin', 'backgroundColor']
            },
            {
                id: 'containerEnd',
                name: 'Close Container',
                icon: '📄✕',
                description: 'Closes container',
                method: 'containerEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            {
                id: 'row',
                name: 'Row Container',
                icon: '📏',
                description: 'Flex row container',
                method: 'row',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['gap', 'justifyContent', 'alignItems', 'padding', 'margin']
            },
            {
                id: 'rowEnd',
                name: 'Close Row',
                icon: '📏✕',
                description: 'Closes row container',
                method: 'rowEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
            },
            {
                id: 'col',
                name: 'Column Container',
                icon: '📐',
                description: 'Flex column container',
                method: 'col',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'containers',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['flex', 'width', 'padding', 'margin']
            },
            {
                id: 'colEnd',
                name: 'Close Column',
                icon: '📐✕',
                description: 'Closes column container',
                method: 'colEnd',
                params: [],
                defaultParams: [],
                category: 'containers',
                isClosing: true
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
                styleOptions: ['backgroundColor', 'color', 'border', 'borderRadius', 'padding', 'margin', 'fontSize', 'fontWeight', 'fontFamily', 'cursor', 'boxShadow', 'textShadow', 'transition', 'transform', 'width', 'height', 'minWidth', 'minHeight'],
                eventOptions: ['onClick', 'onHover', 'onTouch', 'onFocus', 'onBlur'],
                hoverStyles: ['backgroundColor', 'color', 'transform', 'boxShadow', 'borderColor']
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
                defaultParams: ['400', '300', '', 'myCanvas', ''],
                category: 'canvas',
                isCanvasComponent: true,
                styleOptions: ['border', 'borderRadius', 'margin']
            },
            {
                id: 'canvasScript',
                name: 'Canvas Script',
                icon: '🖌️',
                description: 'Custom canvas drawing script',
                method: 'canvasScript',
                params: ['canvasId', 'script'],
                defaultParams: ['myCanvas', 'const ctx = canvas.getContext("2d");\nctx.fillStyle = "blue";\nctx.fillRect(10, 10, 100, 100);'],
                category: 'canvas',
                isCanvasComponent: true,
                isJavaScript: true
            },
            {
                id: 'canvasRect',
                name: 'Canvas Rectangle',
                icon: '⬜',
                description: 'Draw rectangle on canvas',
                method: 'canvasRect',
                params: ['canvasId', 'x', 'y', 'width', 'height', 'fillColor', 'strokeColor', 'lineWidth'],
                defaultParams: ['myCanvas', '10', '10', '100', '80', '#3498db', '#2980b9', '2'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasCircle',
                name: 'Canvas Circle',
                icon: '⭕',
                description: 'Draw circle on canvas',
                method: 'canvasCircle',
                params: ['canvasId', 'x', 'y', 'radius', 'fillColor', 'strokeColor', 'lineWidth'],
                defaultParams: ['myCanvas', '100', '100', '50', '#e74c3c', '#c0392b', '2'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasLine',
                name: 'Canvas Line',
                icon: '📏',
                description: 'Draw line on canvas',
                method: 'canvasLine',
                params: ['canvasId', 'x1', 'y1', 'x2', 'y2', 'strokeColor', 'lineWidth'],
                defaultParams: ['myCanvas', '10', '10', '200', '150', '#2ecc71', '3'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasText',
                name: 'Canvas Text',
                icon: '🔤',
                description: 'Draw text on canvas',
                method: 'canvasText',
                params: ['canvasId', 'text', 'x', 'y', 'font', 'fillColor', 'strokeColor', 'lineWidth'],
                defaultParams: ['myCanvas', 'Hello Canvas!', '50', '50', '20px Arial', '#34495e', '', '1'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasImage',
                name: 'Canvas Image',
                icon: '🖼️',
                description: 'Draw image on canvas',
                method: 'canvasImage',
                params: ['canvasId', 'imageSrc', 'x', 'y', 'width', 'height'],
                defaultParams: ['myCanvas', 'https://via.placeholder.com/100x100', '10', '10', '100', '100'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasClear',
                name: 'Clear Canvas',
                icon: '🧹',
                description: 'Clear the entire canvas',
                method: 'canvasClear',
                params: ['canvasId'],
                defaultParams: ['myCanvas'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasPath',
                name: 'Canvas Path',
                icon: '🛤️',
                description: 'Draw path with multiple points',
                method: 'canvasPath',
                params: ['canvasId', 'points', 'strokeColor', 'lineWidth', 'closePath'],
                defaultParams: ['myCanvas', '[{"x": 10, "y": 10}, {"x": 100, "y": 50}, {"x": 150, "y": 100}]', '#9b59b6', '2', 'false'],
                category: 'canvas',
                isCanvasComponent: true
            },
            {
                id: 'canvasGradient',
                name: 'Canvas Gradient',
                icon: '🌈',
                description: 'Draw gradient rectangle',
                method: 'canvasGradient',
                params: ['canvasId', 'x', 'y', 'width', 'height', 'colors', 'direction'],
                defaultParams: ['myCanvas', '10', '10', '200', '100', '["#ff6b6b", "#4ecdc4", "#45b7d1"]', 'horizontal'],
                category: 'canvas',
                isCanvasComponent: true
            },

            // HTML Structure Components (add after text components)
            {
                id: 'htmlStart',
                name: 'HTML Document',
                icon: '📄',
                description: 'Start HTML document',
                method: 'htmlStart',
                params: ['lang'],
                defaultParams: ['en'],
                category: 'structure',
                isContainer: true,
                needsClosing: true
            },
            {
                id: 'htmlEnd',
                name: 'Close HTML',
                icon: '📄✕',
                description: 'Closes HTML document',
                method: 'htmlEnd',
                params: [],
                defaultParams: [],
                category: 'structure',
                isClosing: true
            },
            {
                id: 'headStart',
                name: 'Head Section',
                icon: '🧠',
                description: 'Document head section',
                method: 'headStart',
                params: [],
                defaultParams: [],
                category: 'structure',
                isContainer: true,
                needsClosing: true
            },
            {
                id: 'headEnd',
                name: 'Close Head',
                icon: '🧠✕',
                description: 'Closes head section',
                method: 'headEnd',
                params: [],
                defaultParams: [],
                category: 'structure',
                isClosing: true
            },
            {
                id: 'bodyStart',
                name: 'Body Section',
                icon: '👤',
                description: 'Document body section',
                method: 'bodyStart',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'structure',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['backgroundColor', 'fontFamily', 'fontSize', 'color', 'margin', 'padding']
            },
            {
                id: 'bodyEnd',
                name: 'Close Body',
                icon: '👤✕',
                description: 'Closes body section',
                method: 'bodyEnd',
                params: [],
                defaultParams: [],
                category: 'structure',
                isClosing: true
            },
            {
                id: 'titleTag',
                name: 'Page Title',
                icon: '🏷️',
                description: 'Document title tag',
                method: 'titleTag',
                params: ['title'],
                defaultParams: ['My Website'],
                category: 'structure'
            },
            {
                id: 'metaTag',
                name: 'Meta Tag',
                icon: '🏷️',
                description: 'Meta information tag',
                method: 'metaTag',
                params: ['name', 'content'],
                defaultParams: ['description', 'My awesome website'],
                category: 'structure'
            },
            {
                id: 'linkTag',
                name: 'Link Tag',
                icon: '🔗',
                description: 'External resource link',
                method: 'linkTag',
                params: ['rel', 'href', 'type'],
                defaultParams: ['stylesheet', 'style.css', 'text/css'],
                category: 'structure'
            },

            {
                id: 'footerStart',
                name: 'Footer Section',
                icon: '🦶',
                description: 'Document footer section',
                method: 'footerStart',
                params: ['className', 'id', 'style'],
                defaultParams: ['', '', ''],
                category: 'structure',
                isContainer: true,
                needsClosing: true,
                styleOptions: ['backgroundColor', 'padding', 'margin', 'border', 'borderRadius', 'color', 'textAlign']
            },
            {
                id: 'footerEnd',
                name: 'Close Footer',
                icon: '🦶✕',
                description: 'Closes footer section',
                method: 'footerEnd',
                params: [],
                defaultParams: [],
                category: 'structure',
                isClosing: true
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
            .paragraph('Drag components from the panel to start building!')
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
                        .flexContainer('flex items-center justify-between')
                        .divStart('component-info')
                        .flexContainer('flex items-center')
                        .text(component.icon, 'span', 'component-icon')
                        .text(component.name, 'span', 'component-name')
                        .divEnd()
                        .divEnd()
                        .button('➕', () => this.addComponentToCanvasFromButton(component.id), 'add-component-btn', '', {
                            title: 'Add to canvas',
                            style: 'padding: 0.25rem 0.5rem; font-size: 0.8rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;'
                        })
                        .divEnd()
                        .text(component.description, 'div', 'component-desc')
                        .divEnd();
                });

            this.editorWeaver.divEnd(); // End category
        });

        this.editorWeaver
            .divEnd() // End component panel
            .divEnd(); // End editor layout

        // Create the modal with responsive footer buttons
        const footerButtons = this.getResponsiveFooterButtons();

        this.originalWeaver.createModal('🎨 Web Weaver Visual Editor', this.editorContainer, {
            id: 'drag-drop-editor',
            size: 'large',
            showCloseButton: true,
            closeOnBackdrop: false,
            footerButtons: footerButtons
        });

        // Add editor-modal class to the modal for specific styling
        const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
        if (modal) {
            modal.classList.add('editor-modal');
            // Force dark theme attributes
            modal.setAttribute('data-theme', 'default');
            modal.style.setProperty('--background-color', '#111827');
            modal.style.setProperty('--text-color', '#f9fafb');
            modal.style.setProperty('--border-color', '#374151');
        }

        // Remove the container from body only if it's still a child
        if (this.editorContainer.parentNode === document.body) {
            document.body.removeChild(this.editorContainer);
        }

        // Setup drag and drop after modal is created
        setTimeout(() => {
            this.setupDragAndDrop();
            // Force theme application again
            this.detectAndApplyCurrentTheme();
        }, 500);
    }

    getResponsiveFooterButtons() {
        if (window.innerWidth <= 768) {
            // Mobile: fewer, more essential buttons
            return [
                {
                    text: '💾',
                    className: 'btn btn-secondary',
                    onClick: () => this.saveProject(),
                    title: 'Save'
                },
                {
                    text: '📂',
                    className: 'btn btn-secondary',
                    onClick: () => this.loadProject(),
                    title: 'Load'
                },
                {
                    text: '👁️',
                    className: 'btn btn-secondary',
                    onClick: () => this.previewWebsite(),
                    title: 'Preview'
                },
                {
                    text: '💾',
                    className: 'btn',
                    onClick: () => this.generateCode(),
                    title: 'Code'
                }
            ];
        } else {
            // Desktop: full button set
            return [
                {
                    text: '📁 New Project',
                    className: 'btn btn-secondary',
                    onClick: () => this.newProject()
                },
                {
                    text: '💾 Save Project',
                    className: 'btn btn-secondary',
                    onClick: () => this.saveProject()
                },
                {
                    text: '📂 Load Project',
                    className: 'btn btn-secondary',
                    onClick: () => this.loadProject()
                },
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
            ];
        }
    }

    applyHoverStyles(element, hoverStyleValue, instanceId) {
        if (!hoverStyleValue) return;

        const hoverStyles = this.parseStyleString(hoverStyleValue);
        const cssRules = [];

        Object.keys(hoverStyles).forEach(property => {
            const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            cssRules.push(`${kebabProperty}: ${hoverStyles[property]} !important`);
        });

        if (cssRules.length > 0) {
            const styleId = `hover-style-${instanceId}`;
            let styleElement = document.getElementById(styleId);

            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            const css = `
                [data-instance-id="${instanceId}"] .preview-element:hover {
                    ${cssRules.join(';\n                ')} !important;
                    transition: all 0.3s ease !important;
                }
            `;

            styleElement.textContent = css;
        }
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            structure: 'HTML Structure',
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

        // Force theme reapplication after category switch
        setTimeout(() => {
            this.forceCompleteThemeReapplication();
        }, 50);
    }

    addComponentPreview(weaver, componentInstance) {
        const component = componentInstance;

        try {
            // Get the style parameter if it exists
            const styleIndex = component.params ? component.params.indexOf('style') : -1;
            const styleValue = styleIndex !== -1 ? componentInstance.defaultParams[styleIndex] : '';
            const styleObject = styleValue ? { style: styleValue } : {};

            // Get hover styles if they exist
            const hoverStyleIndex = component.params ? component.params.indexOf('hoverStyle') : -1;
            const hoverStyleValue = hoverStyleIndex !== -1 ? componentInstance.defaultParams[hoverStyleIndex] : '';

            // Add container styling for container components
            if (component.isContainer && !component.isClosing) {
                weaver.divStart('container-component preview-element', '', {
                    style: 'min-height: 50px; position: relative;' + (styleValue ? ' ' + styleValue : '')
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
                    const canvasStyle = `width: ${Math.min(width, 200)}px; height: ${Math.min(height, 150)}px; border: 2px dashed #6f42c1; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%); background-size: 10px 10px;` + (styleValue ? ' ' + styleValue : '');
                    weaver.divStart('preview-element', '', {
                        style: canvasStyle
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
                    const headingText = componentInstance.defaultParams[1] || 'Heading Text';
                    const headingClass = componentInstance.defaultParams[2] || '';
                    const headingId = componentInstance.defaultParams[3] || '';

                    // Create the heading element with proper attributes
                    const headingElement = weaver[`h${level}`](headingText, headingClass + ' preview-element', headingId, styleObject);
                    break;

                case 'paragraph':
                    const paragraphText = componentInstance.defaultParams[0] || 'Paragraph text';
                    const paragraphClass = componentInstance.defaultParams[1] || '';
                    const paragraphId = componentInstance.defaultParams[2] || '';
                    weaver.paragraph(paragraphText, paragraphClass + ' preview-element', paragraphId, styleObject);
                    break;

                case 'text':
                    const textContent = componentInstance.defaultParams[0] || 'Text content';
                    const textTag = componentInstance.defaultParams[1] || 'span';
                    const textClass = componentInstance.defaultParams[2] || '';
                    const textId = componentInstance.defaultParams[3] || '';
                    weaver.text(textContent, textTag, textClass + ' preview-element', textId, styleObject);
                    break;

                case 'button':
                    const buttonText = componentInstance.defaultParams[0] || 'Button';
                    const buttonClass = componentInstance.defaultParams[2] || 'btn';
                    const buttonId = componentInstance.defaultParams[3] || '';
                    weaver.button(buttonText, () => {
                        console.log('Preview button clicked');
                    }, buttonClass + ' preview-element', buttonId, styleObject);
                    break;

                case 'image':
                    const imageSrc = componentInstance.defaultParams[0] || 'https://via.placeholder.com/150x100';
                    const imageAlt = componentInstance.defaultParams[1] || 'Preview image';
                    const imageClass = componentInstance.defaultParams[2] || '';
                    const imageId = componentInstance.defaultParams[3] || '';
                    // Combine style with max-width constraint for preview
                    const combinedImageStyle = {
                        style: 'max-width: 150px; height: auto;' + (styleValue ? ' ' + styleValue : '')
                    };
                    weaver.image(imageSrc, imageAlt, imageClass + ' preview-element', imageId, combinedImageStyle);
                    break;

                case 'input':
                    const inputType = componentInstance.defaultParams[0] || 'text';
                    const inputPlaceholder = componentInstance.defaultParams[1] || 'Enter text...';
                    const inputClass = componentInstance.defaultParams[2] || 'form-control';
                    const inputId = componentInstance.defaultParams[3] || '';
                    weaver.input(inputType, inputPlaceholder, inputClass + ' preview-element', inputId, styleObject);
                    break;

                case 'textarea':
                    const textareaPlaceholder = componentInstance.defaultParams[0] || 'Enter your message...';
                    const textareaRows = componentInstance.defaultParams[1] || '3';
                    const textareaClass = componentInstance.defaultParams[2] || 'form-control';
                    const textareaId = componentInstance.defaultParams[3] || '';
                    weaver.textarea(textareaPlaceholder, textareaRows, textareaClass + ' preview-element', textareaId, styleObject);
                    break;

                case 'select':
                    try {
                        const options = JSON.parse(componentInstance.defaultParams[0] || '[]');
                        const selectClass = componentInstance.defaultParams[1] || 'form-control';
                        const selectId = componentInstance.defaultParams[2] || '';
                        weaver.select(options, selectClass + ' preview-element', selectId, styleObject);
                    } catch (e) {
                        weaver.select([{ text: 'Option 1', value: '1' }], 'form-control preview-element', '', styleObject);
                    }
                    break;

                case 'checkbox':
                    const checkboxLabel = componentInstance.defaultParams[0] || 'Check me';
                    const checkboxChecked = componentInstance.defaultParams[1] === 'true';
                    const checkboxClass = componentInstance.defaultParams[2] || 'checkbox';
                    const checkboxId = componentInstance.defaultParams[3] || '';
                    weaver.checkbox(checkboxLabel, checkboxChecked, checkboxClass + ' preview-element', checkboxId, styleObject);
                    break;

                case 'navItem':
                    const navText = componentInstance.defaultParams[0] || 'Link Text';
                    const navHref = componentInstance.defaultParams[1] || '#';
                    const navClass = componentInstance.defaultParams[2] || '';
                    const navId = componentInstance.defaultParams[3] || '';
                    weaver.navItem(navText, navHref, navClass + ' preview-element', navId, styleObject);
                    break;

                case 'listItem':
                    const listItemText = componentInstance.defaultParams[0] || 'List item text';
                    const listItemClass = componentInstance.defaultParams[1] || '';
                    const listItemId = componentInstance.defaultParams[2] || '';
                    weaver.listItem(listItemText, listItemClass + ' preview-element', listItemId, styleObject);
                    break;

                case 'spacer':
                    const spacerHeight = componentInstance.defaultParams[0] || '2rem';
                    // Combine spacer style with custom styles
                    const spacerStyle = `height: ${spacerHeight}; background: repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 10px, #e9ecef 10px, #e9ecef 20px); border-radius: 4px; display: flex; align-items: center; justify-content: center;` + (styleValue ? ' ' + styleValue : '');
                    weaver.divStart('preview-element', '', { style: spacerStyle })
                        .text('Spacer', 'small', 'text-muted')
                        .divEnd();
                    break;

                case 'horizontalRule':
                    const hrClass = componentInstance.defaultParams[0] || '';
                    const hrId = componentInstance.defaultParams[1] || '';
                    weaver.horizontalRule(hrClass + ' preview-element', hrId, styleObject);
                    break;

                case 'lineBreak':
                    weaver.lineBreak();
                    weaver.text('Line Break', 'small', 'preview-element text-muted');
                    break;

                default:
                    weaver.text(`${component.name} Component`, 'div', 'preview-element text-muted');
                    break;
            }

            // Apply hover styles if they exist
            if (hoverStyleValue && component.eventOptions && component.eventOptions.includes('onHover')) {
                setTimeout(() => {
                    const previewElement = weaver.getCurrentElement()?.querySelector('.preview-element:last-child');
                    if (previewElement) {
                        this.applyHoverStyles(previewElement, hoverStyleValue, componentInstance.instanceId);
                    }
                }, 100);
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
        editWeaver.setTheme('default'); // Force dark theme

        editWeaver
            .h3(`✏️ Edit ${componentInstance.name}`)
            .divStart('form-container');

        // Create tabs for different edit sections
        const hasStyleOptions = componentInstance.styleOptions && componentInstance.styleOptions.length > 0;
        const hasEventOptions = componentInstance.eventOptions && componentInstance.eventOptions.length > 0;
        const hasHoverStyles = componentInstance.hoverStyles && componentInstance.hoverStyles.length > 0;

        if (hasStyleOptions || hasEventOptions || hasHoverStyles) {
            editWeaver.divStart('style-tabs');

            editWeaver.button('Properties', () => this.switchEditTab('properties'), 'style-tab active', 'tab-properties');

            if (hasStyleOptions) {
                editWeaver.button('Styling', () => this.switchEditTab('styling'), 'style-tab', 'tab-styling');
            }

            if (hasHoverStyles) {
                editWeaver.button('Hover Effects', () => this.switchEditTab('hover'), 'style-tab', 'tab-hover');
            }

            if (hasEventOptions) {
                editWeaver.button('Events', () => this.switchEditTab('events'), 'style-tab', 'tab-events');
            }

            editWeaver.divEnd();
        }

        // Properties section
        editWeaver.divStart('style-section active', 'section-properties');
        this.createPropertiesInputs(editWeaver, componentInstance, editContainer);
        editWeaver.divEnd();

        // Styling section
        if (hasStyleOptions) {
            editWeaver.divStart('style-section', 'section-styling');
            this.createStyleInputs(editWeaver, componentInstance, editContainer);
            editWeaver.divEnd();
        }

        // Hover effects section
        if (hasHoverStyles) {
            editWeaver.divStart('style-section', 'section-hover');
            this.createHoverStyleInputs(editWeaver, componentInstance, editContainer);
            editWeaver.divEnd();
        }

        // Events section
        if (hasEventOptions) {
            editWeaver.divStart('style-section', 'section-events');
            this.createEventInputs(editWeaver, componentInstance, editContainer);
            editWeaver.divEnd();
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
            closeOnBackdrop: false, // Prevent closing when clicking outside
            onOpen: () => {
                // Force theme on edit modal
                setTimeout(() => {
                    const modal = document.querySelector('[data-modal-id="edit-modal"]');
                    if (modal) {
                        modal.setAttribute('data-theme', 'default');
                        this.forceDarkThemeOnElement(modal);
                    }
                }, 50);
            },
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

    createPropertiesInputs(weaver, componentInstance, editContainer) {
        componentInstance.params.forEach((param, index) => {
            const currentValue = componentInstance.defaultParams[index] || '';

            weaver.divStart('form-group', '', { style: 'margin-bottom: 1rem;' });

            // Special handling for different parameter types
            if (param === 'onClick') {
                weaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .textarea('Click handler code (optional)', '3', 'form-control', `param-${index}`, {
                        value: currentValue,
                        placeholder: 'e.g., () => alert("Hello!")',
                        style: 'width: 100%; padding: 0.5rem; border: 1px solid #dee2e6; border-radius: 4px;'
                    });
            } else if (param === 'ordered' && componentInstance.method === 'listStart') {
                weaver
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
                weaver
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
                weaver
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
                weaver
                    .text(`${param} (JSON format):`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .textarea('JSON options array', '4', 'form-control', `param-${index}`, {
                        value: currentValue,
                        placeholder: '[{"text": "Option 1", "value": "1"}, {"text": "Option 2", "value": "2"}]'
                    });
            } else {
                weaver
                    .text(`${param}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                    .input('text', `Enter ${param}`, 'form-control', `param-${index}`, {
                        value: currentValue,
                        style: 'width: 100%; padding: 0.5rem; border: 1px solid #dee2e6; border-radius: 4px;'
                    });
            }

            weaver.divEnd(); // End form group
        });
    }

    createStyleInputs(weaver, componentInstance, editContainer) {
        const styleIndex = componentInstance.params.indexOf('style');
        const currentStyle = this.parseStyleString(componentInstance.defaultParams[styleIndex] || '');

        componentInstance.styleOptions.forEach(styleOption => {
            weaver.divStart('style-form-group');

            switch (styleOption) {
                case 'fontSize':
                    weaver
                        .text('Font Size:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('text', '16px', '', 'style-fontSize', { value: currentStyle.fontSize || '', placeholder: 'e.g., 16px, 1.2rem, large' })
                        .divEnd();
                    break;

                case 'fontFamily':
                    weaver
                        .text('Font Family:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .select([
                            { text: 'Default', value: '' },
                            { text: 'Arial', value: 'Arial, sans-serif' },
                            { text: 'Helvetica', value: 'Helvetica, sans-serif' },
                            { text: 'Times New Roman', value: 'Times New Roman, serif' },
                            { text: 'Georgia', value: 'Georgia, serif' },
                            { text: 'Courier New', value: 'Courier New, monospace' },
                            { text: 'Verdana', value: 'Verdana, sans-serif' },
                            { text: 'Custom', value: 'custom' }
                        ], 'form-control', 'style-fontFamily', { value: currentStyle.fontFamily || '' });
                    break;

                case 'textAlign':
                    weaver
                        .text('Text Align:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .select([
                            { text: 'Default', value: '' },
                            { text: 'Left', value: 'left' },
                            { text: 'Center', value: 'center' },
                            { text: 'Right', value: 'right' },
                            { text: 'Justify', value: 'justify' }
                        ], 'form-control', 'style-textAlign', { value: currentStyle.textAlign || '' });
                    break;

                case 'fontWeight':
                    weaver
                        .text('Font Weight:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .select([
                            { text: 'Default', value: '' },
                            { text: 'Normal', value: 'normal' },
                            { text: 'Bold', value: 'bold' },
                            { text: 'Lighter', value: 'lighter' },
                            { text: 'Bolder', value: 'bolder' },
                            { text: '100', value: '100' },
                            { text: '300', value: '300' },
                            { text: '400', value: '400' },
                            { text: '500', value: '500' },
                            { text: '600', value: '600' },
                            { text: '700', value: '700' },
                            { text: '800', value: '800' },
                            { text: '900', value: '900' }
                        ], 'form-control', 'style-fontWeight', { value: currentStyle.fontWeight || '' });
                    break;

                case 'color':
                    weaver
                        .text('Text Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('color', '', '', 'style-color', {
                            value: this.hexToColor(currentStyle.color) || '#000000',
                            style: 'width: 60px; height: 40px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer;'
                        })
                        .input('text', '#000000', '', 'style-color-text', {
                            value: currentStyle.color || '',
                            placeholder: '#000000 or red',
                            style: 'flex: 1; margin-left: 0.5rem;'
                        })
                        .divEnd();
                    break;

                case 'backgroundColor':
                    weaver
                        .text('Background Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('color', '', '', 'style-backgroundColor', {
                            value: this.hexToColor(currentStyle.backgroundColor) || '#ffffff',
                            style: 'width: 60px; height: 40px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer;'
                        })
                        .input('text', 'transparent', '', 'style-backgroundColor-text', {
                            value: currentStyle.backgroundColor || '',
                            placeholder: 'transparent, #ffffff, blue',
                            style: 'flex: 1; margin-left: 0.5rem;'
                        })
                        .divEnd();
                    break;

                case 'backgroundImage':
                    weaver
                        .text('Background Image:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', 'url(...)', '', 'style-backgroundImage', { value: currentStyle.backgroundImage || '', placeholder: 'url(image.jpg) or linear-gradient(...)' });
                    break;

                case 'border':
                    weaver
                        .text('Border:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '1px solid #ccc', '', 'style-border', { value: currentStyle.border || '', placeholder: '1px solid #ccc' });
                    break;

                case 'borderColor':
                    weaver
                        .text('Border Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('color', '', '', 'style-borderColor', {
                            value: this.hexToColor(currentStyle.borderColor) || '#000000',
                            style: 'width: 60px; height: 40px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer;'
                        })
                        .input('text', '#000000', '', 'style-borderColor-text', {
                            value: currentStyle.borderColor || '',
                            placeholder: '#000000 or blue',
                            style: 'flex: 1; margin-left: 0.5rem;'
                        })
                        .divEnd();
                    break;

                case 'borderRadius':
                    weaver
                        .text('Border Radius:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '4px', '', 'style-borderRadius', { value: currentStyle.borderRadius || '', placeholder: '4px, 50%, 10px 20px' });
                    break;

                case 'boxShadow':
                    weaver
                        .text('Box Shadow:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '0 2px 4px rgba(0,0,0,0.1)', '', 'style-boxShadow', { value: currentStyle.boxShadow || '', placeholder: '0 2px 4px rgba(0,0,0,0.1)' });
                    break;

                case 'padding':
                    weaver
                        .text('Padding:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '10px', '', 'style-padding', { value: currentStyle.padding || '', placeholder: '10px or 10px 20px' });
                    break;

                case 'margin':
                    weaver
                        .text('Margin:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '10px', '', 'style-margin', { value: currentStyle.margin || '', placeholder: '10px or 10px 20px' });
                    break;

                case 'width':
                    weaver
                        .text('Width:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '100%', '', 'style-width', { value: currentStyle.width || '', placeholder: '100%, 300px, auto' });
                    break;

                case 'height':
                    weaver
                        .text('Height:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', 'auto', '', 'style-height', { value: currentStyle.height || '', placeholder: 'auto, 200px, 100vh' });
                    break;

                case 'display':
                    weaver
                        .text('Display:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .select([
                            { text: 'Default', value: '' },
                            { text: 'Block', value: 'block' },
                            { text: 'Inline', value: 'inline' },
                            { text: 'Inline Block', value: 'inline-block' },
                            { text: 'Flex', value: 'flex' },
                            { text: 'Grid', value: 'grid' },
                            { text: 'None', value: 'none' }
                        ], 'form-control', 'style-display', { value: currentStyle.display || '' });
                    break;

                case 'position':
                    weaver
                        .text('Position:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .select([
                            { text: 'Default', value: '' },
                            { text: 'Static', value: 'static' },
                            { text: 'Relative', value: 'relative' },
                            { text: 'Absolute', value: 'absolute' },
                            { text: 'Fixed', value: 'fixed' },
                            { text: 'Sticky', value: 'sticky' }
                        ], 'form-control', 'style-position', { value: currentStyle.position || '' });
                    break;

                case 'transform':
                    weaver
                        .text('Transform:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', 'scale(1.1)', '', 'style-transform', { value: currentStyle.transform || '', placeholder: 'scale(1.1), rotate(45deg), translateX(10px)' });
                    break;

                case 'transition':
                    weaver
                        .text('Transition:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', 'all 0.3s ease', '', 'style-transition', { value: currentStyle.transition || '', placeholder: 'all 0.3s ease' });
                    break;

                case 'opacity':
                    weaver
                        .text('Opacity:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('range', '', '', 'style-opacity-range', {
                            min: '0',
                            max: '1',
                            step: '0.1',
                            value: currentStyle.opacity || '1',
                            style: 'width: 60%;'
                        })
                        .input('text', '1', '', 'style-opacity', {
                            value: currentStyle.opacity || '',
                            placeholder: '0 to 1',
                            style: 'width: 35%; margin-left: 0.5rem;'
                        });
                    break;

                default:
                    weaver
                        .text(`${this.formatStyleName(styleOption)}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '', '', `style-${styleOption}`, { value: currentStyle[styleOption] || '', placeholder: this.getStylePlaceholder(styleOption) });
                    break;
            }

            weaver.divEnd(); // End style form group
        });

        // Set up color picker synchronization
        setTimeout(() => {
            this.setupColorPickerSync(editContainer);
            this.setupOpacitySync(editContainer);
        }, 100);
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

    setupHoverColorPickerSync(editContainer) {
        const hoverColorInputs = editContainer.querySelectorAll('input[id^="hover-"][type="color"]');

        hoverColorInputs.forEach(colorInput => {
            const textInputId = colorInput.id + '-text';
            const textInput = editContainer.querySelector(`#${textInputId}`);

            if (textInput) {
                colorInput.addEventListener('input', () => {
                    textInput.value = colorInput.value;
                });

                textInput.addEventListener('input', () => {
                    const value = textInput.value.trim();
                    if (this.isValidHexColor(value)) {
                        colorInput.value = value;
                    }
                });

                textInput.addEventListener('blur', () => {
                    const value = textInput.value.trim();
                    const hexValue = this.hexToColor(value);
                    if (hexValue) {
                        colorInput.value = hexValue;
                    }
                });
            }
        });
    }

    createHoverStyleInputs(weaver, componentInstance, editContainer) {
        weaver.text('Configure hover effects for this component:', 'p', 'mb-4');

        const hoverStyleIndex = componentInstance.params.indexOf('hoverStyle');
        let currentHoverStyle = {};

        if (hoverStyleIndex === -1) {
            componentInstance.params.push('hoverStyle');
            componentInstance.defaultParams.push('');
        } else {
            currentHoverStyle = this.parseStyleString(componentInstance.defaultParams[hoverStyleIndex] || '');
        }

        componentInstance.hoverStyles.forEach(styleOption => {
            weaver.divStart('style-form-group');

            switch (styleOption) {
                case 'backgroundColor':
                    weaver
                        .text('Hover Background Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('color', '', '', 'hover-backgroundColor', {
                            value: this.hexToColor(currentHoverStyle.backgroundColor) || '#ffffff',
                            style: 'width: 60px; height: 40px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer;'
                        })
                        .input('text', '', '', 'hover-backgroundColor-text', {
                            value: currentHoverStyle.backgroundColor || '',
                            placeholder: 'transparent, #ffffff, blue',
                            style: 'flex: 1; margin-left: 0.5rem;'
                        })
                        .divEnd();
                    break;

                case 'color':
                    weaver
                        .text('Hover Text Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('color', '', '', 'hover-color', {
                            value: this.hexToColor(currentHoverStyle.color) || '#000000',
                            style: 'width: 60px; height: 40px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer;'
                        })
                        .input('text', '', '', 'hover-color-text', {
                            value: currentHoverStyle.color || '',
                            placeholder: '#000000 or red',
                            style: 'flex: 1; margin-left: 0.5rem;'
                        })
                        .divEnd();
                    break;

                case 'borderColor':
                    weaver
                        .text('Hover Border Color:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .divStart('style-form-row')
                        .input('color', '', '', 'hover-borderColor', {
                            value: this.hexToColor(currentHoverStyle.borderColor) || '#000000',
                            style: 'width: 60px; height: 40px; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer;'
                        })
                        .input('text', '', '', 'hover-borderColor-text', {
                            value: currentHoverStyle.borderColor || '',
                            placeholder: '#000000 or blue',
                            style: 'flex: 1; margin-left: 0.5rem;'
                        })
                        .divEnd();
                    break;

                case 'transform':
                    weaver
                        .text('Hover Transform:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .select([
                            { text: 'None', value: '' },
                            { text: 'Scale Up', value: 'scale(1.05)' },
                            { text: 'Scale Down', value: 'scale(0.95)' },
                            { text: 'Rotate', value: 'rotate(5deg)' },
                            { text: 'Move Up', value: 'translateY(-2px)' },
                            { text: 'Custom', value: 'custom' }
                        ], 'form-control', 'hover-transform', { value: currentHoverStyle.transform || '' });
                    break;

                case 'boxShadow':
                    weaver
                        .text('Hover Box Shadow:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '', '', 'hover-boxShadow', { value: currentHoverStyle.boxShadow || '', placeholder: '0 4px 8px rgba(0,0,0,0.2)' });
                    break;

                default:
                    weaver
                        .text(`Hover ${this.formatStyleName(styleOption)}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .input('text', '', '', `hover-${styleOption}`, { value: currentHoverStyle[styleOption] || '', placeholder: this.getStylePlaceholder(styleOption) });
                    break;
            }

            weaver.divEnd();
        });

        // Set up color picker synchronization for hover styles
        setTimeout(() => {
            this.setupHoverColorPickerSync(editContainer);
        }, 100);
    }

    // New method to create event inputs
    createEventInputs(weaver, componentInstance, editContainer) {
        weaver.text('Add interactive events to this component:', 'p', 'mb-4');

        componentInstance.eventOptions.forEach(eventType => {
            weaver.divStart('style-form-group');

            switch (eventType) {
                case 'onClick':
                    weaver
                        .text('Click Event:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .textarea('JavaScript code to execute on click', '3', 'form-control', 'event-onClick', {
                            placeholder: 'alert("Clicked!"); // or any JavaScript code',
                            style: 'width: 100%; font-family: monospace;'
                        });
                    break;

                case 'onHover':
                    weaver
                        .text('Hover Event:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .textarea('JavaScript code to execute on hover', '3', 'form-control', 'event-onHover', {
                            placeholder: 'console.log("Hovered!"); // or any JavaScript code',
                            style: 'width: 100%; font-family: monospace;'
                        });
                    break;

                case 'onTouch':
                    weaver
                        .text('Touch Event (Mobile):', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .textarea('JavaScript code to execute on touch', '3', 'form-control', 'event-onTouch', {
                            placeholder: 'console.log("Touched!"); // or any JavaScript code',
                            style: 'width: 100%; font-family: monospace;'
                        });
                    break;

                case 'onFocus':
                    weaver
                        .text('Focus Event:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .textarea('JavaScript code to execute on focus', '2', 'form-control', 'event-onFocus', {
                            placeholder: 'console.log("Focused!"); // or any JavaScript code',
                            style: 'width: 100%; font-family: monospace;'
                        });
                    break;

                case 'onBlur':
                    weaver
                        .text('Blur Event:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .textarea('JavaScript code to execute on blur', '2', 'form-control', 'event-onBlur', {
                            placeholder: 'console.log("Blurred!"); // or any JavaScript code',
                            style: 'width: 100%; font-family: monospace;'
                        });
                    break;

                default:
                    weaver
                        .text(`${eventType}:`, 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
                        .textarea(`JavaScript code for ${eventType}`, '2', 'form-control', `event-${eventType}`, {
                            placeholder: 'console.log("Event triggered!");',
                            style: 'width: 100%; font-family: monospace;'
                        });
                    break;
            }

            weaver.divEnd();
        });
    }

    // Helper methods
    formatStyleName(styleName) {
        return styleName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    getStylePlaceholder(styleOption) {
        const placeholders = {
            lineHeight: '1.5, 24px',
            letterSpacing: '1px, 0.1em',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            textTransform: 'uppercase, lowercase, capitalize',
            textIndent: '20px, 2em',
            backgroundSize: 'cover, contain, 100% 100%',
            backgroundPosition: 'center, top left',
            minHeight: '100px, 50vh',
            maxHeight: '500px, 80vh',
            flexDirection: 'row, column',
            justifyContent: 'center, space-between',
            alignItems: 'center, flex-start',
            gap: '10px, 1rem',
            top: '10px, 50%',
            left: '10px, 50%',
            right: '10px, 50%',
            bottom: '10px, 50%',
            zIndex: '1, 999',
            overflow: 'hidden, auto, scroll',
            cursor: 'pointer, grab'
        };
        return placeholders[styleOption] || '';
    }

    setupColorPickerSync(editContainer) {
        const colorInputs = editContainer.querySelectorAll('input[type="color"]');

        colorInputs.forEach(colorInput => {
            const textInputId = colorInput.id + '-text';
            const textInput = editContainer.querySelector(`#${textInputId}`);

            if (textInput) {
                // When color picker changes, update text input
                colorInput.addEventListener('input', () => {
                    textInput.value = colorInput.value;
                });

                // When text input changes, update color picker if valid hex
                textInput.addEventListener('input', () => {
                    const value = textInput.value.trim();
                    if (this.isValidHexColor(value)) {
                        colorInput.value = value;
                    }
                });

                // Also update on blur for named colors
                textInput.addEventListener('blur', () => {
                    const value = textInput.value.trim();
                    const hexValue = this.hexToColor(value);
                    if (hexValue) {
                        colorInput.value = hexValue;
                    }
                });
            }
        });
    }

    // Add new method to sync opacity range and text
    setupOpacitySync(editContainer) {
        const opacityRange = editContainer.querySelector('#style-opacity-range');
        const opacityText = editContainer.querySelector('#style-opacity');

        if (opacityRange && opacityText) {
            opacityRange.addEventListener('input', () => {
                opacityText.value = opacityRange.value;
            });

            opacityText.addEventListener('input', () => {
                const value = parseFloat(opacityText.value);
                if (!isNaN(value) && value >= 0 && value <= 1) {
                    opacityRange.value = value;
                }
            });
        }
    }

    // Add helper method to validate hex colors
    isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    hexToColor(colorValue) {
        if (!colorValue) return '';

        // If it's already a hex color, return it
        if (this.isValidHexColor(colorValue)) return colorValue;

        // If it's a named color, try to convert
        const namedColors = {
            'red': '#ff0000',
            'blue': '#0000ff',
            'green': '#008000',
            'yellow': '#ffff00',
            'purple': '#800080',
            'orange': '#ffa500',
            'pink': '#ffc0cb',
            'brown': '#a52a2a',
            'black': '#000000',
            'white': '#ffffff',
            'gray': '#808080',
            'grey': '#808080',
            'transparent': '#ffffff'
        };

        return namedColors[colorValue.toLowerCase()] || '';
    }

    saveComponentChanges(componentInstance, editContainer) {
        // Get updated values from form (properties)
        componentInstance.params.forEach((param, index) => {
            if (param === 'ordered' && componentInstance.method === 'listStart') {
                const orderedRadio = editContainer.querySelector(`#param-${index}-ordered`);
                componentInstance.defaultParams[index] = orderedRadio && orderedRadio.checked ? 'true' : 'false';
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
                        const value = textInput && textInput.value ? textInput.value : styleInput.value;
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

        // Collect hover styles if component has hover options
        if (componentInstance.hoverStyles && componentInstance.hoverStyles.length > 0) {
            let hoverStyleIndex = componentInstance.params.indexOf('hoverStyle');
            if (hoverStyleIndex === -1) {
                componentInstance.params.push('hoverStyle');
                componentInstance.defaultParams.push('');
                hoverStyleIndex = componentInstance.params.length - 1;
            }

            const hoverStyles = [];
            componentInstance.hoverStyles.forEach(styleOption => {
                const styleInput = editContainer.querySelector(`#hover-${styleOption}`);
                const textInput = editContainer.querySelector(`#hover-${styleOption}-text`);

                if (styleInput && styleInput.value) {
                    const value = textInput && textInput.value ? textInput.value : styleInput.value;
                    if (value) {
                        const kebabProperty = styleOption.replace(/([A-Z])/g, '-$1').toLowerCase();
                        hoverStyles.push(`${kebabProperty}: ${value}`);
                    }
                }
            });

            componentInstance.defaultParams[hoverStyleIndex] = hoverStyles.join('; ');
        }

        // Collect event handlers if component has event options
        if (componentInstance.eventOptions && componentInstance.eventOptions.length > 0) {
            componentInstance.eventOptions.forEach(eventType => {
                const eventInput = editContainer.querySelector(`#event-${eventType}`);
                if (eventInput && eventInput.value) {
                    let eventIndex = componentInstance.params.indexOf(eventType);
                    if (eventIndex === -1) {
                        componentInstance.params.push(eventType);
                        componentInstance.defaultParams.push('');
                        eventIndex = componentInstance.params.length - 1;
                    }
                    componentInstance.defaultParams[eventIndex] = eventInput.value;
                }
            });
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
                tempWeaver.setTheme('default'); // Force dark theme

                this.addComponentPreview(tempWeaver, componentInstance);

                // Move the preview content
                while (tempContainer.firstChild) {
                    previewContainer.appendChild(tempContainer.firstChild);
                }
                document.body.removeChild(tempContainer);
            }

            // Force theme reapplication on the updated component
            this.forceDarkThemeOnElement(canvasComponent);
        }

        this.updateStructure();

        // Force theme reapplication after saving changes
        setTimeout(() => {
            this.forceCompleteThemeReapplication();
        }, 100);

        this.originalWeaver.closeModal('edit-modal');
        this.originalWeaver.toast('Component updated successfully!', 'success', 2000);
    }

    generateCode() {
    console.log('Generate code called');
    console.log('Current structure length:', this.currentStructure.length);

    if (this.currentStructure.length === 0) {
        this.originalWeaver.toast('Add some components to the canvas first!', 'warning', 3000);
        return;
    }

    // Create code display container
    const codeContainer = document.createElement('div');
    codeContainer.id = 'code-' + Date.now();
    document.body.appendChild(codeContainer);

    const codeWeaver = new WebWeaver(codeContainer.id);
    codeWeaver.setTheme('default');

    let code = this.generateFormattedCode();
    console.log('Generated code length:', code.length);
    console.log('Generated code preview:', code.substring(0, 200) + '...');

    // Ensure we have some code
    if (!code || code.trim().length === 0) {
        code = `// No components found to generate code
// Please add some components to the canvas first
const weaver = new WebWeaver('app-container');
weaver.clear();`;
    }

    const uniqueId = Date.now();

    codeWeaver
        .h3('📋 Generated Web Weaver App')
        .paragraph('This code will recreate your website. Save it as app.js:')
        .divStart('code-editor-container', `code-container-${uniqueId}`, {
            style: 'margin: 1rem 0; border: 1px solid #374151; border-radius: 8px; overflow: hidden;'
        })
        .divStart('code-editor-header', `code-header-${uniqueId}`, {
            style: 'background: #161b22; color: #e6edf3; padding: 0.75rem; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center;'
        })
        .text('app.js', 'span', '', '', {
            style: 'font-weight: 600; color: #60a5fa;'
        })
        .flexContainer('flex gap-2')
        .button('📋 Copy', () => {
            this.copyCodeToClipboard(code);
        }, 'btn btn-small', `copy-btn-${uniqueId}`, {
            style: 'background: #21262d; border: 1px solid #30363d; color: #e6edf3; padding: 0.375rem 0.75rem; border-radius: 4px; font-size: 0.875rem;'
        })
        .button('💾 Download', () => {
            this.downloadCode(code, 'app.js');
        }, 'btn btn-small', `download-btn-${uniqueId}`, {
            style: 'background: #21262d; border: 1px solid #30363d; color: #e6edf3; padding: 0.375rem 0.75rem; border-radius: 4px; font-size: 0.875rem;'
        })
        .divEnd()
        .divEnd()
        .divStart('code-editor', `code-editor-${uniqueId}`, {
            style: 'height: 400px; width: 100%; background: #0d1117; color: #e6edf3; font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace; font-size: 14px; line-height: 1.5; overflow: hidden; position: relative;'
        })
        .divEnd()
        .divEnd();

    // Create the modal
    this.originalWeaver.createModal('💾 Generated Code', codeContainer, {
        id: 'code-modal',
        size: 'large',
        closeOnBackdrop: false,
        showCloseButton: true,
        onOpen: () => {
            console.log('Code modal opened, initializing editor...');
            setTimeout(() => {
                const editorElement = document.getElementById(`code-editor-${uniqueId}`);
                console.log('Looking for editor element with ID:', `code-editor-${uniqueId}`);
                console.log('Found editor element:', editorElement);
                
                if (editorElement) {
                    console.log('Creating fallback editor...');
                    this.createFallbackCodeEditor(editorElement, code, uniqueId);
                } else {
                    console.error('Editor element not found!');
                    console.log('Available elements in container:', codeContainer.querySelectorAll('*'));
                }

                const modal = document.querySelector('[data-modal-id="code-modal"]');
                if (modal) {
                    modal.setAttribute('data-theme', 'default');
                    this.forceDarkThemeOnElement(modal);
                }
            }, 200);
        },
        onClose: () => {
            if (codeContainer.parentNode) {
                codeContainer.parentNode.removeChild(codeContainer);
            }
        }
    });
}

    generateFormattedCode() {
        let code = `// Generated Web Weaver App
    // Save this as app.js and include it in your HTML

    // Initialize Web Weaver
    const weaver = new WebWeaver('app-container');

    // Clear any existing content and start building
    weaver.clear()`;

        let indentLevel = 1; // Start with one level of indentation
        const indentSize = 4; // 4 spaces per indent level
        const containerStack = []; // Track open containers

        this.currentStructure.forEach(item => {
            const { component, params } = item;
            if (!component) return;

            const indent = ' '.repeat(indentLevel * indentSize);

            // Handle different component types
            if (component.isClosing) {
                // Closing component - decrease indent before adding the line
                if (containerStack.length > 0) {
                    containerStack.pop();
                    indentLevel = Math.max(1, indentLevel - 1);
                }
                const closingIndent = ' '.repeat(indentLevel * indentSize);
                code += `\n${closingIndent}.${component.method}()`;
            } else if (component.method === 'button') {
                const clickHandler = params[1] && params[1].trim() !== ''
                    ? params[1]
                    : '() => { console.log("Button clicked!"); }';
                
                // Format multi-line click handlers properly
                const formattedHandler = this.formatJavaScriptCode(clickHandler, indentLevel + 1);
                
                code += `\n${indent}.${component.method}('${params[0] || 'Button'}', ${formattedHandler}, '${params[2] || 'btn'}'${params[3] ? `, '${params[3]}'` : ''}${params[4] ? `, { style: '${params[4]}' }` : ''})`;
            } else if (component.method === 'heading') {
                const level = params[0] || '1';
                const text = params[1] || 'Heading Text';
                const className = params[2] || '';
                const id = params[3] || '';
                const style = params[4] || '';

                code += `\n${indent}.h${level}('${text}'${className ? `, '${className}'` : ''}${id ? `, '${id}'` : ''}${style ? `, { style: '${style}' }` : ''})`;
            } else if (component.method === 'jsVariable') {
                const type = params[0] || 'const';
                const name = params[1] || 'myVariable';
                const value = params[2] || '"value"';
                code += `\n${indent}// JavaScript Variable\n${indent}.jsVariable('${type}', '${name}', '${value}')`;
            } else if (component.method === 'jsFunction') {
                const funcName = params[0] || 'myFunction';
                const funcParams = params[1] || '';
                const body = params[2] || 'console.log("Hello!");';
                const formattedBody = this.formatJavaScriptCode(body, indentLevel + 1);
                code += `\n${indent}// JavaScript Function\n${indent}.jsFunction('${funcName}', '${funcParams}', \`${formattedBody}\`)`;
            } else if (component.method === 'canvasScript') {
                const canvasId = params[0] || 'myCanvas';
                const script = params[1] || 'Canvas drawing code';
                const formattedScript = this.formatJavaScriptCode(script, indentLevel + 1);
                code += `\n${indent}// Canvas Drawing Script\n${indent}.canvasScript('${canvasId}', \`${formattedScript}\`)`;
            } else {
                const formattedParams = params.map((p, index) => {
                    if (typeof p === 'string') {
                        // Handle style parameter specially
                        if (component.params && component.params[index] === 'style' && p) {
                            return `{ style: '${p.replace(/'/g, "\\'")}' }`;
                        }
                        // Handle multi-line strings
                        if (p.includes('\n')) {
                            return '`' + p.replace(/`/g, '\\`') + '`';
                        }
                        return `'${p.replace(/'/g, "\\'")}'`;
                    }
                    return p;
                });

                // Filter out empty parameters from the end
                while (formattedParams.length > 0 && (formattedParams[formattedParams.length - 1] === "''" || formattedParams[formattedParams.length - 1] === '{}')) {
                    formattedParams.pop();
                }

                // Add comment for special components
                if (component.isComment) {
                    code += `\n${indent}// Comment Component`;
                } else if (component.isJavaScript) {
                    code += `\n${indent}// JavaScript Component`;
                } else if (component.isCanvasComponent) {
                    code += `\n${indent}// Canvas Component`;
                }

                if (formattedParams.length > 0) {
                    // Check if we need to break long parameter lists
                    const paramString = formattedParams.join(', ');
                    if (paramString.length > 60) {
                        // Multi-line parameters for readability
                        const paramIndent = ' '.repeat((indentLevel + 1) * indentSize);
                        const formattedParamString = formattedParams.join(`,\n${paramIndent}`);
                        code += `\n${indent}.${component.method}(\n${paramIndent}${formattedParamString}\n${indent})`;
                    } else {
                        code += `\n${indent}.${component.method}(${paramString})`;
                    }
                } else {
                    code += `\n${indent}.${component.method}()`;
                }
            }

            // Track containers for proper indentation
            if (component.isContainer && !component.isClosing) {
                containerStack.push(component);
                indentLevel++;
            }
        });

        code += `;\n\n// Optional: Save the current state
    // weaver.saveData('myWebsite', weaver.getCurrentHTML());

    // Optional: Add some interactive functionality
    /*
    // Example: Add click handlers to buttons
    document.addEventListener('DOMContentLoaded', function() {
        // Your custom JavaScript code here
        console.log('Website loaded successfully!');
    });
    */`;

        return code;
    }

    // Helper method to format JavaScript code with proper indentation
    formatJavaScriptCode(code, baseIndentLevel) {
        if (!code || !code.includes('\n')) {
            return code;
        }

        const lines = code.split('\n');
        const indentSize = 4;
        const baseIndent = ' '.repeat(baseIndentLevel * indentSize);

        return lines
            .map((line, index) => {
                if (index === 0) return line; // First line doesn't need extra indent
                return baseIndent + line.trim();
            })
            .join('\n');
    }

    setupCodeModalEventHandlers(modal) {
        // Remove any existing backdrop click handlers that might close the modal
        const modalBackdrop = modal.querySelector('.modal-overlay');
        if (modalBackdrop) {
            // Clone the backdrop to remove all event listeners
            const newBackdrop = modalBackdrop.cloneNode(true);
            modalBackdrop.parentNode.replaceChild(newBackdrop, modalBackdrop);

            // Add custom event handler that only closes on explicit close button click
            newBackdrop.addEventListener('click', (e) => {
                // Only close if clicking directly on backdrop, not on modal content
                if (e.target === newBackdrop) {
                    // Still prevent closing on backdrop click for code modal
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
        }

        // Prevent mouseup/mousedown events from closing the modal
        modal.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });

        modal.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        // Add explicit close functionality only to close button
        const closeButton = modal.querySelector('.modal-close, [data-dismiss="modal"]');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.originalWeaver.closeModal('code-modal');
            });
        }
    }

    // Initialize CodeMirror with dark theme
    initializeCodeMirror(container, code) {
        console.log('initializeCodeMirror called with code length:', code.length);
        
        const editorElement = container.querySelector('.code-editor');
        if (!editorElement) {
            console.error('Code editor element not found in container');
            console.log('Container HTML:', container.innerHTML);
            return;
        }

        console.log('Found editor element:', editorElement);
        console.log('Editor element dimensions:', editorElement.offsetWidth, 'x', editorElement.offsetHeight);

        // Check if CodeMirror is available and working
        if (typeof CodeMirror !== 'undefined') {
            try {
                console.log('Attempting to use CodeMirror...');
                
                // Clear the editor element first
                editorElement.innerHTML = '';
                
                // Create CodeMirror instance
                const editor = CodeMirror(editorElement, {
                    value: code,
                    mode: 'javascript',
                    theme: 'material-darker',
                    lineNumbers: true,
                    lineWrapping: true,
                    readOnly: false,
                    indentUnit: 4,
                    tabSize: 4,
                    indentWithTabs: false,
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    foldGutter: true,
                    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                    extraKeys: {
                        'Ctrl-A': 'selectAll',
                        'Ctrl-C': 'copy',
                        'Ctrl-F': 'findPersistent',
                        'Ctrl-H': 'replace',
                        'F11': function(cm) {
                            cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                        },
                        'Esc': function(cm) {
                            if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                        }
                    }
                });

                // Apply dark styling
                const wrapper = editor.getWrapperElement();
                wrapper.style.cssText = `
                    background: #0d1117 !important;
                    color: #e6edf3 !important;
                    border: none !important;
                    height: 400px !important;
                    width: 100% !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 14px !important;
                `;

                // Store reference for cleanup
                window.codeMirrorInstance = editor;

                // Update buttons to use CodeMirror content with correct IDs
                const copyButton = container.querySelector('#copy-code-btn');
                if (copyButton) {
                    copyButton.onclick = () => {
                        this.copyCodeToClipboard(editor.getValue());
                    };
                }

                const downloadButton = container.querySelector('#download-code-btn');
                if (downloadButton) {
                    downloadButton.onclick = () => {
                        this.downloadCode(editor.getValue(), 'app.js');
                    };
                }

                // Force refresh and set content
                setTimeout(() => {
                    editor.refresh();
                    editor.setValue(code);
                    editor.focus();
                    console.log('CodeMirror initialized and content set. Value length:', editor.getValue().length);
                }, 100);

                console.log('CodeMirror initialized successfully');
                return;

            } catch (error) {
                console.error('Error initializing CodeMirror:', error);
                // Fall through to fallback editor
            }
        } else {
            console.warn('CodeMirror not available, using fallback editor');
        }

        // Use fallback editor
        this.createFallbackCodeEditor(editorElement, code);
    }

    // Fallback editor if CodeMirror is not available
    createFallbackCodeEditor(editorElement, code, uniqueId) {
    console.log('Creating fallback editor with code length:', code.length);
    console.log('Editor element:', editorElement);

    if (!editorElement) {
        console.error('Editor element not found');
        return;
    }

    // Clear the editor element first
    editorElement.innerHTML = '';
    editorElement.style.position = 'relative';

    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.id = `code-textarea-${uniqueId}`;
    textarea.style.cssText = `
        width: 100%;
        height: 400px;
        background: #0d1117;
        color: #e6edf3;
        border: none;
        padding: 1rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        resize: none;
        outline: none;
        tab-size: 4;
        white-space: pre;
        overflow-wrap: normal;
        overflow-x: auto;
        box-sizing: border-box;
        display: block;
        visibility: visible;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
    `;

    // Handle tab key for indentation
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
    });

    // Add textarea to editor element
    editorElement.appendChild(textarea);

    console.log('Textarea created and appended. Value length:', textarea.value.length);

    // Update buttons to use textarea content
    const copyButton = document.getElementById(`copy-btn-${uniqueId}`);
    const downloadButton = document.getElementById(`download-btn-${uniqueId}`);

    if (copyButton) {
        copyButton.onclick = () => {
            console.log('Copy button clicked, code length:', textarea.value.length);
            this.copyCodeToClipboard(textarea.value);
        };
        console.log('Copy button updated');
    } else {
        console.log('Copy button not found with ID:', `copy-btn-${uniqueId}`);
    }

    if (downloadButton) {
        downloadButton.onclick = () => {
            console.log('Download button clicked, code length:', textarea.value.length);
            this.downloadCode(textarea.value, 'app.js');
        };
        console.log('Download button updated');
    } else {
        console.log('Download button not found with ID:', `download-btn-${uniqueId}`);
    }

    // Focus the textarea and scroll to top
    setTimeout(() => {
        textarea.focus();
        textarea.scrollTop = 0;
        console.log('Textarea focused. Final check - visible:', textarea.offsetWidth > 0 && textarea.offsetHeight > 0);
        console.log('Textarea parent visible:', editorElement.offsetWidth > 0 && editorElement.offsetHeight > 0);
    }, 100);
}
    
    createFallbackCodeEditor(editorElement, code) {
        console.log('Creating fallback editor with code length:', code.length);

        if (!editorElement) {
            console.error('Editor element not found');
            return;
        }

        // Clear the editor element first
        editorElement.innerHTML = '';

        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.id = 'code-textarea-' + Date.now();
        textarea.style.cssText = `
            width: 100%;
            height: 400px;
            background: #0d1117;
            color: #e6edf3;
            border: none;
            padding: 1rem;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
            tab-size: 4;
            white-space: pre;
            overflow-wrap: normal;
            overflow-x: auto;
            box-sizing: border-box;
            display: block;
            visibility: visible;
        `;

        // Handle tab key for indentation
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
        });

        // Add textarea to editor element
        editorElement.appendChild(textarea);

        console.log('Fallback editor created. Textarea value length:', textarea.value.length);

        // Update buttons to use textarea content
        const container = editorElement.closest('[id^="code-"]');
        if (container) {
            const copyButton = container.querySelector('.copy-code-btn');
            if (copyButton) {
                copyButton.onclick = () => {
                    this.copyCodeToClipboard(textarea.value);
                };
            }

            const downloadButton = container.querySelector('.download-code-btn');
            if (downloadButton) {
                downloadButton.onclick = () => {
                    this.downloadCode(textarea.value, 'app.js');
                };
            }
        }

        // Focus the textarea and scroll to top
        setTimeout(() => {
            textarea.focus();
            textarea.scrollTop = 0;
            console.log('Fallback editor focused. Final textarea value length:', textarea.value.length);
        }, 100);
    }

    // Improved copy to clipboard method
    copyCodeToClipboard(code) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(code).then(() => {
                this.originalWeaver.toast('Code copied to clipboard!', 'success', 2000);
            }).catch((err) => {
                console.error('Failed to copy code: ', err);
                this.fallbackCopyToClipboard(code);
            });
        } else {
            this.fallbackCopyToClipboard(code);
        }
    }

    // Fallback copy method for older browsers
    fallbackCopyToClipboard(code) {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.originalWeaver.toast('Code copied to clipboard!', 'success', 2000);
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            this.originalWeaver.toast('Failed to copy code. Please select and copy manually.', 'error', 3000);
        }

        document.body.removeChild(textArea);
    }

    // Add CodeMirror CSS and JS if not already loaded
    loadCodeMirrorAssets() {
        // Check if CodeMirror is already loaded
        if (typeof CodeMirror !== 'undefined') {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            console.log('Loading CodeMirror assets...');

            // Load CSS first
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css';
            document.head.appendChild(cssLink);

            // Load theme CSS
            const themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css';
            document.head.appendChild(themeLink);

            // Load main CodeMirror JS
            const mainScript = document.createElement('script');
            mainScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js';

            mainScript.onload = () => {
                console.log('CodeMirror main script loaded');

                // Load JavaScript mode
                const jsMode = document.createElement('script');
                jsMode.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js';

                jsMode.onload = () => {
                    console.log('CodeMirror JavaScript mode loaded');

                    // Load addons
                    const addons = [
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/search/search.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/search/searchcursor.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/dialog/dialog.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldcode.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldgutter.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/brace-fold.min.js'
                    ];

                    let loadedAddons = 0;

                    const loadNextAddon = () => {
                        if (loadedAddons >= addons.length) {
                            console.log('All CodeMirror addons loaded successfully');
                            resolve();
                            return;
                        }

                        const addonScript = document.createElement('script');
                        addonScript.src = addons[loadedAddons];
                        addonScript.onload = () => {
                            loadedAddons++;
                            loadNextAddon();
                        };
                        addonScript.onerror = () => {
                            console.warn(`Failed to load addon: ${addons[loadedAddons]}`);
                            loadedAddons++;
                            loadNextAddon();
                        };
                        document.head.appendChild(addonScript);
                    };

                    loadNextAddon();
                };

                jsMode.onerror = () => {
                    console.warn('Failed to load CodeMirror JavaScript mode');
                    resolve(); // Still resolve to continue with fallback
                };

                document.head.appendChild(jsMode);
            };

            mainScript.onerror = () => {
                console.warn('Failed to load CodeMirror main script');
                reject(new Error('Failed to load CodeMirror'));
            };

            document.head.appendChild(mainScript);
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

        // Add placeholder back with dark theme
        const placeholderContainer = document.createElement('div');
        placeholderContainer.id = 'placeholder-clear-' + Date.now();

        // Force dark theme on placeholder container
        placeholderContainer.style.backgroundColor = '#1f2937';
        placeholderContainer.style.color = '#f9fafb';

        document.body.appendChild(placeholderContainer);

        const placeholderWeaver = new WebWeaver(placeholderContainer.id);
        placeholderWeaver.setTheme('default'); // Force dark theme

        placeholderWeaver
            .divStart('canvas-placeholder', '', {
                style: 'background: rgba(31, 41, 55, 0.5) !important; border-color: #374151 !important; color: #9ca3af !important;'
            })
            .text('🎨 Drop components here to build your website', 'div', '', '', {
                style: 'color: #9ca3af !important;'
            })
            .paragraph('Drag components from the panel on the right to start building!', '', '', {
                style: 'color: #9ca3af !important;'
            })
            .divEnd();

        canvas.appendChild(placeholderContainer.firstChild);
        document.body.removeChild(placeholderContainer);

        this.currentStructure = [];

        // Force theme reapplication after clearing
        setTimeout(() => {
            this.detectAndApplyCurrentTheme();
            this.forceCompleteThemeReapplication();
        }, 50);

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
                // Add touch drag handle for mobile
                if (window.innerWidth <= 768) {
                    this.addTouchDragHandle(component);
                }

                // Mouse/desktop drag events
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

                // Touch events for mobile
                this.setupTouchEvents(component, 'panel');
            });

            // Set up canvas drag and drop
            this.setupCanvasDragDrop(canvas);
            this.setupCanvasTouchEvents(canvas);

            // Set up existing canvas components for reordering
            this.setupCanvasComponentDragDrop();

            // Window resize handler for responsive layout
            window.addEventListener('resize', () => {
                this.handleResponsiveLayout();
            });

            // Initial responsive layout setup
            this.handleResponsiveLayout();
        }, 100);
    }

    addTouchDragHandle(element) {
        const handle = document.createElement('div');
        handle.className = 'touch-drag-handle';
        handle.innerHTML = '⋮⋮';
        handle.setAttribute('data-touch-handle', 'true');
        element.appendChild(handle);
    }

    setupTouchEvents(element, source) {
        let touchStartPos = null;
        let touchStartTime = null;
        let isDragging = false;
        let dragElement = null;
        let dragTimer = null;
        let hasMoved = false;

        const startTouch = (e) => {
            // Don't prevent default immediately - let scrolling work normally
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            touchStartTime = Date.now();
            hasMoved = false;
            isDragging = false;

            // Add visual feedback for potential drag
            element.classList.add('touch-ready');

            // Set a timer for drag initiation (1 second hold)
            dragTimer = setTimeout(() => {
                if (!hasMoved && !isDragging) {
                    // Initiate drag after 1 second hold without movement
                    e.preventDefault(); // Now prevent default to stop scrolling
                    
                    isDragging = true;
                    element.classList.add('touch-feedback');
                    element.classList.remove('touch-ready');

                    if (source === 'panel') {
                        const componentId = element.getAttribute('data-component-id');
                        this.draggedElement = this.components.find(c => c.id === componentId);
                        this.draggedFrom = 'panel';
                    } else {
                        this.draggedElement = element;
                        this.draggedFrom = 'canvas';
                    }

                    // Create drag element
                    dragElement = this.createTouchDragElement(element);
                    document.body.appendChild(dragElement);

                    element.classList.add('touch-dragging');

                    // Show drop zones
                    this.showTouchDropZones();

                    // Haptic feedback if available
                    if (navigator.vibrate) {
                        navigator.vibrate([100, 50, 100]); // Pattern for drag start
                    }

                    // Update drag element position
                    if (touchStartPos) {
                        dragElement.style.left = touchStartPos.x - 50 + 'px';
                        dragElement.style.top = touchStartPos.y - 25 + 'px';
                    }
                }
            }, 1000); // 1 second delay
        };

        const moveTouch = (e) => {
            if (!touchStartPos) return;

            const currentPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            const distance = Math.sqrt(
                Math.pow(currentPos.x - touchStartPos.x, 2) +
                Math.pow(currentPos.y - touchStartPos.y, 2)
            );

            // If moved more than 10px, it's a scroll gesture, not a drag
            if (distance > 10 && !isDragging) {
                hasMoved = true;
                element.classList.remove('touch-ready');
                
                // Clear the drag timer
                if (dragTimer) {
                    clearTimeout(dragTimer);
                    dragTimer = null;
                }
                
                // Let the scroll happen naturally
                return;
            }

            // If we're already dragging, prevent default and update drag position
            if (isDragging && dragElement) {
                e.preventDefault();
                
                // Update drag element position
                dragElement.style.left = currentPos.x - 50 + 'px';
                dragElement.style.top = currentPos.y - 25 + 'px';

                // Check for drop targets
                this.updateTouchDropTarget(currentPos.x, currentPos.y);
            }
        };

        const endTouch = (e) => {
            // Clear the drag timer
            if (dragTimer) {
                clearTimeout(dragTimer);
                dragTimer = null;
            }

            element.classList.remove('touch-feedback', 'touch-ready');

            if (isDragging) {
                e.preventDefault(); // Prevent any default behavior when ending a drag
                
                const dropTarget = this.getTouchDropTarget(
                    e.changedTouches[0].clientX,
                    e.changedTouches[0].clientY
                );

                if (dropTarget) {
                    if (this.draggedFrom === 'panel') {
                        this.addComponentToCanvas(this.draggedElement, dropTarget);
                    } else {
                        this.reorderComponent(this.draggedElement, dropTarget);
                    }
                }

                // Cleanup
                if (dragElement) {
                    document.body.removeChild(dragElement);
                    dragElement = null;
                }

                element.classList.remove('touch-dragging');
                this.hideTouchDropZones();

                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(dropTarget ? [50, 30, 50] : 100); // Different pattern for success/failure
                }
            }

            // Reset state
            touchStartPos = null;
            touchStartTime = null;
            isDragging = false;
            hasMoved = false;
            this.draggedElement = null;
            this.draggedFrom = null;
        };

        const cancelTouch = (e) => {
            // Clear the drag timer
            if (dragTimer) {
                clearTimeout(dragTimer);
                dragTimer = null;
            }

            element.classList.remove('touch-feedback', 'touch-ready');

            if (isDragging) {
                // Cleanup drag state
                if (dragElement) {
                    document.body.removeChild(dragElement);
                    dragElement = null;
                }

                element.classList.remove('touch-dragging');
                this.hideTouchDropZones();
            }

            // Reset state
            touchStartPos = null;
            touchStartTime = null;
            isDragging = false;
            hasMoved = false;
            this.draggedElement = null;
            this.draggedFrom = null;
        };

        // Add touch event listeners
        element.addEventListener('touchstart', startTouch, { passive: false });
        element.addEventListener('touchmove', moveTouch, { passive: false });
        element.addEventListener('touchend', endTouch, { passive: false });
        element.addEventListener('touchcancel', cancelTouch, { passive: false });
    }

    handleResponsiveLayout() {
        const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
        const canvas = document.querySelector('.editor-canvas');
        const componentPanel = document.querySelector('.component-panel');

        if (!modal || !canvas || !componentPanel) return;

        if (window.innerWidth <= 768) {
            // Mobile layout
            modal.classList.add('mobile-layout');

            // Add touch handles to existing components
            const components = document.querySelectorAll('.draggable-component, .canvas-component');
            components.forEach(comp => {
                if (!comp.querySelector('.touch-drag-handle')) {
                    this.addTouchDragHandle(comp);
                }
            });

            // Update canvas height for mobile
            const modalHeader = modal.querySelector('.modal-header');
            const modalFooter = modal.querySelector('.modal-footer');
            const componentPanelHeight = componentPanel.offsetHeight;

            const availableHeight = window.innerHeight -
                (modalHeader ? modalHeader.offsetHeight : 0) -
                (modalFooter ? modalFooter.offsetHeight : 0) -
                componentPanelHeight - 20; // 20px for gaps

            canvas.style.height = availableHeight + 'px';

        } else {
            // Desktop layout
            modal.classList.remove('mobile-layout');

            // Remove touch handles
            document.querySelectorAll('.touch-drag-handle').forEach(handle => {
                handle.remove();
            });

            // Reset canvas height
            canvas.style.height = '';
        }

        // Force theme reapplication
        setTimeout(() => {
            this.forceCompleteThemeReapplication();
        }, 100);
    }

    createTouchDragElement(sourceElement) {
        const dragEl = sourceElement.cloneNode(true);
        dragEl.style.position = 'fixed';
        dragEl.style.zIndex = '9999';
        dragEl.style.pointerEvents = 'none';
        dragEl.style.opacity = '0.8';
        dragEl.style.transform = 'scale(0.9) rotate(3deg)';
        dragEl.style.width = sourceElement.offsetWidth + 'px';
        dragEl.style.backgroundColor = 'var(--primary-color)';
        dragEl.style.color = 'white';
        dragEl.style.borderRadius = '8px';
        dragEl.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        return dragEl;
    }

    showTouchDropZones() {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas) return;

        const components = canvas.querySelectorAll('.canvas-component');

        // Add drop zone before each component
        components.forEach(comp => {
            const dropZone = document.createElement('div');
            dropZone.className = 'touch-drop-zone';
            dropZone.textContent = 'Drop here';
            dropZone.setAttribute('data-drop-position', 'before');
            dropZone.setAttribute('data-drop-target', comp.getAttribute('data-instance-id'));
            canvas.insertBefore(dropZone, comp);
        });

        // Add drop zone at the end
        const endDropZone = document.createElement('div');
        endDropZone.className = 'touch-drop-zone';
        endDropZone.textContent = 'Drop at end';
        endDropZone.setAttribute('data-drop-position', 'end');
        canvas.appendChild(endDropZone);

        // Show all drop zones
        setTimeout(() => {
            canvas.querySelectorAll('.touch-drop-zone').forEach(zone => {
                zone.classList.add('active');
            });
        }, 50);
    }

    hideTouchDropZones() {
        document.querySelectorAll('.touch-drop-zone').forEach(zone => {
            zone.remove();
        });
    }

    updateTouchDropTarget(x, y) {
        const dropZones = document.querySelectorAll('.touch-drop-zone');
        let activeZone = null;

        dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                activeZone = zone;
            }
            zone.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            zone.style.borderColor = 'var(--primary-color)';
        });

        if (activeZone) {
            activeZone.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
            activeZone.style.borderColor = 'var(--primary-hover)';
        }
    }

    getTouchDropTarget(x, y) {
        const dropZones = document.querySelectorAll('.touch-drop-zone');

        for (let zone of dropZones) {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                const position = zone.getAttribute('data-drop-position');
                const targetId = zone.getAttribute('data-drop-target');

                if (position === 'end') {
                    return { component: null, position: 'end' };
                } else {
                    const targetComponent = document.querySelector(`[data-instance-id="${targetId}"]`);
                    return { component: targetComponent, position: position };
                }
            }
        }

        return null;
    }

    setupCanvasTouchEvents(canvas) {
        // Add touch support for canvas scroll
        let isScrolling = false;

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && !e.target.closest('.canvas-component')) {
                isScrolling = true;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (isScrolling && e.touches.length === 1) {
                // Let native scrolling handle this
                return;
            }
        }, { passive: true });

        canvas.addEventListener('touchend', () => {
            isScrolling = false;
        }, { passive: true });
    }

    detectAndApplyCurrentTheme() {
        // Force dark theme as default
        const currentTheme = 'default';
        this.originalWeaver.setTheme(currentTheme);

        // Apply the same theme to the editor weaver
        if (this.editorWeaver) {
            this.editorWeaver.setTheme(currentTheme);
        }

        // Apply to the modal container and ensure inheritance
        const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
        if (modal) {
            modal.setAttribute('data-theme', currentTheme);
            // Force theme on modal children with inline styles
            modal.style.setProperty('--background-color', '#111827', 'important');
            modal.style.setProperty('--text-color', '#f9fafb', 'important');
            modal.style.setProperty('--border-color', '#374151', 'important');

            // Force specific component styling
            const canvas = modal.querySelector('.editor-canvas');
            if (canvas) {
                canvas.style.setProperty('background-color', '#1f2937', 'important');
                canvas.style.setProperty('border-color', '#374151', 'important');
                canvas.style.setProperty('color', '#f9fafb', 'important');
            }

            const componentPanel = modal.querySelector('.component-panel');
            if (componentPanel) {
                componentPanel.style.setProperty('background-color', '#1f2937', 'important');
                componentPanel.style.setProperty('border-color', '#374151', 'important');
                componentPanel.style.setProperty('color', '#f9fafb', 'important');
            }

            // Force on draggable components
            const draggableComponents = modal.querySelectorAll('.draggable-component');
            draggableComponents.forEach(comp => {
                comp.style.setProperty('background-color', '#111827', 'important');
                comp.style.setProperty('border-color', '#374151', 'important');
                comp.style.setProperty('color', '#f9fafb', 'important');
            });

            // Force on component tabs
            const componentTabs = modal.querySelectorAll('.component-tab:not(.active)');
            componentTabs.forEach(tab => {
                tab.style.setProperty('background-color', '#111827', 'important');
                tab.style.setProperty('border-color', '#374151', 'important');
                tab.style.setProperty('color', '#f9fafb', 'important');
            });

            // Force on canvas components
            const canvasComponents = modal.querySelectorAll('.canvas-component');
            canvasComponents.forEach(comp => {
                comp.style.setProperty('background-color', '#111827', 'important');
                comp.style.setProperty('border-color', '#374151', 'important');
                comp.style.setProperty('color', '#f9fafb', 'important');
            });
        }

        // Apply to document body to ensure inheritance
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    setupCanvasDragDrop(canvas) {
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();

            if (this.draggedElement) {
                // Maintain dark theme during drag
                canvas.style.setProperty('background-color', '#1f2937', 'important');
                canvas.style.setProperty('border-color', '#3b82f6', 'important'); // Blue border during drag
                canvas.style.setProperty('color', '#f9fafb', 'important');

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
                // Restore dark theme colors
                canvas.style.setProperty('background-color', '#1f2937', 'important');
                canvas.style.setProperty('border-color', '#374151', 'important');
                canvas.style.setProperty('color', '#f9fafb', 'important');

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

            // Restore dark theme colors immediately
            canvas.style.setProperty('background-color', '#1f2937', 'important');
            canvas.style.setProperty('border-color', '#374151', 'important');
            canvas.style.setProperty('color', '#f9fafb', 'important');

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

            // Force complete theme reapplication after drop
            setTimeout(() => {
                this.forceCompleteThemeReapplication();
            }, 100);
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

        // Force theme reapplication after adding component
        setTimeout(() => {
            this.detectAndApplyCurrentTheme();

            // Force dark theme on the specific elements that might have reset
            const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
            if (modal) {
                modal.setAttribute('data-theme', 'default');
                modal.style.setProperty('--background-color', '#111827');
                modal.style.setProperty('--text-color', '#f9fafb');
                modal.style.setProperty('--border-color', '#374151');

                // Force on canvas specifically
                const canvas = modal.querySelector('.editor-canvas');
                if (canvas) {
                    canvas.style.backgroundColor = '#1f2937';
                    canvas.style.borderColor = '#374151';
                    canvas.style.color = '#f9fafb';
                }

                // Force on component panel specifically
                const componentPanel = modal.querySelector('.component-panel');
                if (componentPanel) {
                    componentPanel.style.backgroundColor = '#1f2937';
                    componentPanel.style.borderColor = '#374151';
                    componentPanel.style.color = '#f9fafb';
                }

                // Force on all draggable components
                const draggableComponents = modal.querySelectorAll('.draggable-component');
                draggableComponents.forEach(comp => {
                    comp.style.backgroundColor = '#111827';
                    comp.style.borderColor = '#374151';
                    comp.style.color = '#f9fafb';
                });

                // Force on all component tabs
                const componentTabs = modal.querySelectorAll('.component-tab');
                componentTabs.forEach(tab => {
                    if (!tab.classList.contains('active')) {
                        tab.style.backgroundColor = '#111827';
                        tab.style.borderColor = '#374151';
                        tab.style.color = '#f9fafb';
                    }
                });
            }
        }, 50);

        // Update structure
        this.updateStructure();

        this.originalWeaver.toast(`${component.name} added to canvas!`, 'success', 2000);
    }

    addComponentToCanvasFromButton(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (!component) return;

        // Add to the end of the canvas (no drop target)
        this.addComponentToCanvas(component, null);
    }

    findMatchingClosingComponent(allComponents, startIndex, startComponentInstance) {
        let nestingCount = 1;

        // Look for the matching closing component
        for (let i = startIndex + 1; i < allComponents.length; i++) {
            const comp = allComponents[i];
            const instance = comp._componentInstance;

            if (!instance) continue;

            // Check if this is a container of the same type
            if (instance.isContainer && !instance.isClosing) {
                // Another opening container of same type increases nesting
                if (this.getContainerType(instance) === this.getContainerType(startComponentInstance)) {
                    nestingCount++;
                }
            } else if (instance.isClosing) {
                // Check if this is the matching closing component
                if (this.isMatchingClosingComponent(instance, startComponentInstance)) {
                    nestingCount--;
                    if (nestingCount === 0) {
                        return i; // Found the matching closing component
                    }
                }
            }
        }

        return -1; // No matching closing component found
    }

    getContainerType(componentInstance) {
        // Map opening components to their types
        const containerTypes = {
            'divStart': 'div',
            'section': 'section',
            'flexContainer': 'flex',
            'card': 'card',
            'grid': 'grid',
            'container': 'container',
            'row': 'row',
            'col': 'col',
            'formStart': 'form',
            'listStart': 'list',
            'navStart': 'nav',
            'scriptStart': 'script',
            'htmlStart': 'html',
            'headStart': 'head',
            'bodyStart': 'body',
            'footerStart': 'footer'
        };

        return containerTypes[componentInstance.method] || componentInstance.method;
    }

    isMatchingClosingComponent(closingInstance, openingInstance) {
        // Map closing components to their opening counterparts
        const closingMatches = {
            'divEnd': 'divStart',
            'sectionEnd': 'section',
            'flexContainerEnd': 'flexContainer',
            'cardEnd': 'card',
            'gridEnd': 'grid',
            'containerEnd': 'container',
            'rowEnd': 'row',
            'colEnd': 'col',
            'formEnd': 'formStart',
            'listEnd': 'listStart',
            'navEnd': 'navStart',
            'scriptEnd': 'scriptStart',
            'htmlEnd': 'htmlStart',
            'headEnd': 'headStart',
            'bodyEnd': 'bodyStart',
            'footerEnd': 'footerStart'
        };

        return closingMatches[closingInstance.method] === openingInstance.method;
    }

    updateGroupCollapsedPreview(component, childCount) {
        const preview = component.querySelector('.component-preview');
        if (!preview) return;

        // Clear existing preview content
        preview.innerHTML = '';

        // Create summary preview
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'group-collapse-summary';
        summaryContainer.style.cssText = `
            padding: 0.75rem;
            background: rgba(59, 130, 246, 0.1);
            border: 1px dashed #3b82f6;
            border-radius: 6px;
            text-align: center;
            color: #3b82f6;
            font-style: italic;
            font-size: 0.9rem;
        `;

        const componentInstance = component._componentInstance;
        summaryContainer.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">
                📁 ${componentInstance.name} (Collapsed)
            </div>
            <div style="font-size: 0.8rem; opacity: 0.8;">
                Contains ${childCount} component${childCount !== 1 ? 's' : ''}
            </div>
            <div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.6;">
                Click collapse button to expand
            </div>
        `;

        preview.appendChild(summaryContainer);

        // Force dark theme on summary for default theme
        if (document.documentElement.getAttribute('data-theme') === 'default') {
            summaryContainer.style.background = 'rgba(59, 130, 246, 0.2)';
            summaryContainer.style.borderColor = '#60a5fa';
            summaryContainer.style.color = '#60a5fa';
        }
    }

    toggleSingleComponentCollapse(component, collapseBtn) {
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

    toggleComponentCollapse(instanceId) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (!component) return;

        const collapseBtn = component.querySelector('.collapse-btn');
        const componentInstance = component._componentInstance;

        if (!componentInstance) return;

        // Check if this is a container component that can be collapsed as a group
        if (componentInstance.isContainer && !componentInstance.isClosing) {
            this.toggleGroupCollapse(instanceId, component, collapseBtn);
        } else {
            // Regular component collapse (just hides preview)
            this.toggleSingleComponentCollapse(component, collapseBtn);
        }
    }

    toggleGroupCollapse(instanceId, component, collapseBtn) {
        const componentInstance = component._componentInstance;
        const canvas = document.querySelector('.editor-canvas');
        const allComponents = [...canvas.querySelectorAll('.canvas-component')];

        // Find the current component index
        const startIndex = allComponents.indexOf(component);
        if (startIndex === -1) return;

        // Find the matching closing component
        const closingComponentIndex = this.findMatchingClosingComponent(allComponents, startIndex, componentInstance);

        if (closingComponentIndex === -1) {
            // No matching closing component found, treat as regular component
            this.toggleSingleComponentCollapse(component, collapseBtn);
            return;
        }

        const isCurrentlyCollapsed = component.classList.contains('group-collapsed');

        if (isCurrentlyCollapsed) {
            // Expand group
            component.classList.remove('group-collapsed');
            collapseBtn.classList.remove('collapsed');
            collapseBtn.textContent = '🔽';
            collapseBtn.title = 'Collapse group';

            // Show all components between start and end
            for (let i = startIndex + 1; i < closingComponentIndex; i++) {
                const childComponent = allComponents[i];
                childComponent.classList.remove('group-hidden');
                childComponent.style.display = 'block';
            }

            // Show the closing component
            const closingComponent = allComponents[closingComponentIndex];
            closingComponent.classList.remove('group-hidden');
            closingComponent.style.display = 'block';

            // Rebuild the original preview
            const previewContainer = component.querySelector('.component-preview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
                const tempContainer = document.createElement('div');
                tempContainer.id = 'temp-preview-expand-' + Date.now();
                document.body.appendChild(tempContainer);

                const tempWeaver = new WebWeaver(tempContainer.id);
                tempWeaver.setTheme('default');

                this.addComponentPreview(tempWeaver, componentInstance);

                while (tempContainer.firstChild) {
                    previewContainer.appendChild(tempContainer.firstChild);
                }
                document.body.removeChild(tempContainer);
            }

            this.originalWeaver.toast('Group expanded!', 'info', 1000);
        } else {
            // Collapse group
            component.classList.add('group-collapsed');
            collapseBtn.classList.add('collapsed');
            collapseBtn.textContent = '📁';
            collapseBtn.title = 'Expand group';

            // Hide all components between start and end
            for (let i = startIndex + 1; i < closingComponentIndex; i++) {
                const childComponent = allComponents[i];
                childComponent.classList.add('group-hidden');
                childComponent.style.display = 'none';
            }

            // Hide the closing component too
            const closingComponent = allComponents[closingComponentIndex];
            closingComponent.classList.add('group-hidden');
            closingComponent.style.display = 'none';

            // Update the preview to show summary
            this.updateGroupCollapsedPreview(component, closingComponentIndex - startIndex - 1);

            this.originalWeaver.toast('Group collapsed!', 'info', 1000);
        }

        // Force theme reapplication after collapse/expand
        setTimeout(() => {
            this.forceCompleteThemeReapplication();
        }, 50);
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
            .paragraph('Drag components from the panel to start building!')
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

        // Create scrollable container for categories
        this.editorWeaver.divStart('component-categories-container');

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
                        .flexContainer('flex items-center justify-between')
                        .divStart('component-info')
                        .flexContainer('flex items-center')
                        .text(component.icon, 'span', 'component-icon')
                        .text(component.name, 'span', 'component-name')
                        .divEnd()
                        .divEnd()
                        .button('➕', () => this.addComponentToCanvasFromButton(component.id), 'add-component-btn', '', {
                            title: 'Add to canvas',
                            style: 'padding: 0.25rem 0.5rem; font-size: 0.8rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;'
                        })
                        .divEnd()
                        .text(component.description, 'div', 'component-desc')
                        .divEnd();
                });

            this.editorWeaver.divEnd(); // End category
        });

        this.editorWeaver
            .divEnd() // End component categories container
            .divEnd() // End component panel
            .divEnd(); // End editor layout

        // Create the modal with responsive footer buttons
        const footerButtons = this.getResponsiveFooterButtons();

        this.originalWeaver.createModal('🎨 Web Weaver Visual Editor', this.editorContainer, {
            id: 'drag-drop-editor',
            size: 'large',
            showCloseButton: true,
            closeOnBackdrop: false,
            footerButtons: footerButtons
        });

        // Add editor-modal class to the modal for specific styling
        const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
        if (modal) {
            modal.classList.add('editor-modal');
            // Force dark theme attributes
            modal.setAttribute('data-theme', 'default');
            modal.style.setProperty('--background-color', '#111827');
            modal.style.setProperty('--text-color', '#f9fafb');
            modal.style.setProperty('--border-color', '#374151');
        }

        // Remove the container from body only if it's still a child
        if (this.editorContainer.parentNode === document.body) {
            document.body.removeChild(this.editorContainer);
        }

        // Setup drag and drop after modal is created
        setTimeout(() => {
            this.setupDragAndDrop();
            // Force theme application again
            this.detectAndApplyCurrentTheme();
        }, 500);
    }

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
        // Desktop drag events
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

        // Touch events for mobile
        if (window.innerWidth <= 768) {
            this.setupTouchEvents(component, 'canvas');
            if (!component.querySelector('.touch-drag-handle')) {
                this.addTouchDragHandle(component);
            }
        }
    }

    newProject() {
        this.originalWeaver.createModal('🆕 New Project',
            this.createNewProjectDialog(),
            {
                id: 'new-project-modal',
                size: 'medium',
                closeOnBackdrop: false,
                onOpen: () => {
                    // Force theme on new project modal
                    setTimeout(() => {
                        const modal = document.querySelector('[data-modal-id="new-project-modal"]');
                        if (modal) {
                            modal.setAttribute('data-theme', 'default');
                            this.forceDarkThemeOnElement(modal);
                        }
                    }, 50);
                }
            }
        );
    }

    forceDarkThemeOnElement(element) {
        if (!element) return;

        // Force dark theme on the element itself
        element.style.setProperty('background-color', '#111827', 'important');
        element.style.setProperty('border-color', '#374151', 'important');
        element.style.setProperty('color', '#f9fafb', 'important');

        // Force on all children
        const allChildren = element.querySelectorAll('*');
        allChildren.forEach(child => {
            // Don't override specific component preview content colors
            if (!child.classList.contains('preview-element')) {
                child.style.setProperty('color', '#f9fafb', 'important');
            }

            // Force on action buttons
            if (child.classList.contains('reorder-btn') ||
                child.classList.contains('edit-btn') ||
                child.classList.contains('delete-btn') ||
                child.classList.contains('move-btn') ||
                child.classList.contains('collapse-btn')) {
                child.style.setProperty('color', '#9ca3af', 'important');
                child.style.setProperty('background', 'transparent', 'important');
            }

            // Force on action dividers
            if (child.classList.contains('action-divider')) {
                child.style.setProperty('background', '#374151', 'important');
            }

            // Force on headers
            if (child.classList.contains('component-header')) {
                child.style.setProperty('border-bottom-color', '#374151', 'important');
            }
        });
    }

    // Add new method for complete theme reapplication
    forceCompleteThemeReapplication() {
        const modal = document.querySelector('[data-modal-id="drag-drop-editor"]');
        if (!modal) return;

        // Force theme on modal
        modal.setAttribute('data-theme', 'default');
        modal.style.setProperty('--background-color', '#111827', 'important');
        modal.style.setProperty('--text-color', '#f9fafb', 'important');
        modal.style.setProperty('--border-color', '#374151', 'important');

        // Force on modal itself
        modal.style.setProperty('background-color', '#1f2937', 'important');
        modal.style.setProperty('color', '#f9fafb', 'important');
        modal.style.setProperty('border-color', '#374151', 'important');

        // Force on modal header and footer
        const modalHeader = modal.querySelector('.modal-header');
        const modalFooter = modal.querySelector('.modal-footer');

        if (modalHeader) {
            modalHeader.style.setProperty('background-color', '#111827', 'important');
            modalHeader.style.setProperty('border-bottom-color', '#374151', 'important');
            modalHeader.style.setProperty('color', '#f9fafb', 'important');
        }

        if (modalFooter) {
            modalFooter.style.setProperty('background-color', '#111827', 'important');
            modalFooter.style.setProperty('border-top-color', '#374151', 'important');
            modalFooter.style.setProperty('color', '#f9fafb', 'important');
        }

        // Force on canvas
        const canvas = modal.querySelector('.editor-canvas');
        if (canvas) {
            canvas.style.setProperty('background-color', '#1f2937', 'important');
            canvas.style.setProperty('border-color', '#374151', 'important');
            canvas.style.setProperty('color', '#f9fafb', 'important');

            // Force on canvas placeholder if it exists
            const placeholder = canvas.querySelector('.canvas-placeholder');
            if (placeholder) {
                placeholder.style.setProperty('background', 'rgba(31, 41, 55, 0.5)', 'important');
                placeholder.style.setProperty('border-color', '#374151', 'important');
                placeholder.style.setProperty('color', '#9ca3af', 'important');
            }
        }

        // Force on component panel
        const componentPanel = modal.querySelector('.component-panel');
        if (componentPanel) {
            componentPanel.style.setProperty('background-color', '#1f2937', 'important');
            componentPanel.style.setProperty('border-color', '#374151', 'important');
            componentPanel.style.setProperty('color', '#f9fafb', 'important');
        }

        // Force on all draggable components
        const draggableComponents = modal.querySelectorAll('.draggable-component');
        draggableComponents.forEach(comp => {
            comp.style.setProperty('background-color', '#111827', 'important');
            comp.style.setProperty('border-color', '#374151', 'important');
            comp.style.setProperty('color', '#f9fafb', 'important');
        });

        // Force on all component tabs
        const componentTabs = modal.querySelectorAll('.component-tab');
        componentTabs.forEach(tab => {
            if (!tab.classList.contains('active')) {
                tab.style.setProperty('background-color', '#111827', 'important');
                tab.style.setProperty('border-color', '#374151', 'important');
                tab.style.setProperty('color', '#f9fafb', 'important');
            }
        });

        // Force on all canvas components
        const canvasComponents = modal.querySelectorAll('.canvas-component');
        canvasComponents.forEach(comp => {
            this.forceDarkThemeOnElement(comp);
        });

        // Force on all buttons in modal
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.classList.contains('btn-primary') && !button.classList.contains('active')) {
                button.style.setProperty('background-color', '#374151', 'important');
                button.style.setProperty('border-color', '#374151', 'important');
                button.style.setProperty('color', '#f9fafb', 'important');
            }
        });
    }

    addComponentToCanvasDirectly(componentInstance, customData = {}) {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas) return;

        // Remove placeholder if it exists
        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Create canvas component container
        const canvasComponentContainer = document.createElement('div');
        canvasComponentContainer.id = 'canvas-comp-direct-' + Date.now();

        // Apply dark theme to container immediately
        canvasComponentContainer.style.backgroundColor = '#111827';
        canvasComponentContainer.style.color = '#f9fafb';
        canvasComponentContainer.style.borderColor = '#374151';

        document.body.appendChild(canvasComponentContainer);

        const canvasWeaver = new WebWeaver(canvasComponentContainer.id);
        canvasWeaver.setTheme('default'); // Force dark theme

        // Determine extra classes based on component type
        let extraClasses = '';
        if (componentInstance.isClosing) extraClasses += 'closing-component ';
        if (componentInstance.isComment) extraClasses += 'comment-component ';
        if (componentInstance.isJavaScript) extraClasses += 'js-component ';
        if (componentInstance.isCanvasComponent) extraClasses += 'canvas-component-type ';
        if (customData.collapsed) extraClasses += 'collapsed ';
        if (customData.groupCollapsed) extraClasses += 'group-collapsed ';

        // Build component in canvas
        canvasWeaver
            .divStart(`canvas-component ${extraClasses}`, '', {
                'data-instance-id': componentInstance.instanceId,
                draggable: 'true',
                style: 'background-color: #111827 !important; color: #f9fafb !important; border-color: #374151 !important;'
            })
            .divStart('component-header', '', {
                style: 'color: #f9fafb !important; border-bottom-color: #374151 !important;'
            })
            .text(`${componentInstance.icon} ${componentInstance.name}`, 'span', 'component-title', '', {
                style: 'color: #f9fafb !important;'
            })
            .divStart('component-actions')
            .button('⬆️', () => this.moveComponent(componentInstance.instanceId, 'up'), 'reorder-btn', '', {
                title: 'Move up',
                style: 'color: #9ca3af !important; background: transparent !important;'
            })
            .button('⬇️', () => this.moveComponent(componentInstance.instanceId, 'down'), 'reorder-btn', '', {
                title: 'Move down',
                style: 'color: #9ca3af !important; background: transparent !important;'
            })
            .button('⋮⋮', null, 'move-btn', '', {
                title: 'Drag to reorder',
                style: 'color: #9ca3af !important; background: transparent !important;'
            })
            .button('✏️', () => this.editComponent(componentInstance), 'edit-btn', '', {
                title: 'Edit component',
                style: 'color: #9ca3af !important; background: transparent !important;'
            })
            .button('🗑️', () => this.deleteComponent(componentInstance.instanceId), 'delete-btn', '', {
                title: 'Delete component',
                style: 'color: #9ca3af !important; background: transparent !important;'
            })
            .divStart('action-divider', '', {
                style: 'background: #374151 !important;'
            })
            .divEnd();

        // Determine collapse button icon and title based on component type and state
        let collapseIcon = '🔽';
        let collapseTitle = 'Collapse component';

        if (customData.groupCollapsed) {
            collapseIcon = '📁';
            collapseTitle = 'Expand group';
        } else if (customData.collapsed) {
            collapseIcon = '🔼';
            collapseTitle = 'Expand component';
        } else if (componentInstance.isContainer && !componentInstance.isClosing) {
            collapseTitle = 'Collapse group';
        }

        canvasWeaver
            .button(collapseIcon, () => this.toggleComponentCollapse(componentInstance.instanceId), `collapse-btn ${(customData.collapsed || customData.groupCollapsed) ? 'collapsed' : ''}`, '', {
                title: collapseTitle,
                style: 'color: #9ca3af !important; background: transparent !important;'
            })
            .divEnd()
            .divEnd()
            .divStart('component-preview', 'component-preview', {
                style: 'color: #f9fafb !important;'
            });

        // Add the component preview (or group summary if group collapsed)
        if (customData.groupCollapsed) {
            // Don't add normal preview, it will be replaced with group summary
            canvasWeaver.text('Group collapsed...', 'div', 'text-muted');
        } else {
            this.addComponentPreview(canvasWeaver, componentInstance);
        }

        canvasWeaver.divEnd().divEnd(); // End preview and component

        // Move to canvas and store component instance
        const componentElement = canvasComponentContainer.firstChild;
        componentElement._componentInstance = componentInstance;

        // Force dark theme styles on the component element
        this.forceDarkThemeOnElement(componentElement);

        canvas.appendChild(componentElement);

        // Clean up temporary container
        document.body.removeChild(canvasComponentContainer);

        // Set up drag events for the new component
        this.setupSingleComponentDragDrop(componentElement);

        // If this component was group collapsed, we need to handle it after all components are loaded
        if (customData.groupCollapsed) {
            // Mark for post-processing
            componentElement.setAttribute('data-needs-group-collapse', 'true');
        }
    }

    // Helper methods for component state
    isComponentCollapsed(instanceId) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        return component ? component.classList.contains('collapsed') : false;
    }

    getComponentNestingLevel(instanceId) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        return component ? component.getAttribute('data-nesting-level') || '0' : '0';
    }

    getSavedProjects() {
        try {
            const projects = localStorage.getItem('webweaver_editor_projects');
            return projects ? JSON.parse(projects) : [];
        } catch (error) {
            console.error('Error loading saved projects:', error);
            return [];
        }
    }

    createNewProjectDialog() {
        const container = document.createElement('div');
        container.id = 'new-project-' + Date.now();
        document.body.appendChild(container);

        const weaver = new WebWeaver(container.id);

        weaver
            .h4('Start a New Project')
            .paragraph('This will clear the current canvas. Are you sure you want to continue?')
            .divStart('', '', { style: 'margin-top: 1rem;' })
            .text('⚠️ Any unsaved changes will be lost!', 'div', 'text-warning', '', { style: 'margin-bottom: 1rem; font-weight: bold;' })
            .divEnd()
            .flexContainer('flex gap-2 justify-end', '', { style: 'margin-top: 2rem;' })
            .button('❌ Cancel', () => {
                this.originalWeaver.closeModal('new-project-modal');
            }, 'btn btn-secondary')
            .button('🆕 Start New Project', () => {
                this.clearCanvas();
                this.originalWeaver.closeModal('new-project-modal');
                this.originalWeaver.toast('New project started!', 'success', 2000);
            }, 'btn btn-primary')
            .divEnd();

        // Return the content directly without removing from DOM
        return container;
    }

    // Save project functionality
    saveProject() {
        if (this.currentStructure.length === 0) {
            this.originalWeaver.toast('No components to save! Add some components first.', 'warning', 3000);
            return;
        }

        this.originalWeaver.createModal('💾 Save Project',
            this.createSaveProjectDialog(),
            {
                id: 'save-project-modal',
                size: 'medium',
                closeOnBackdrop: false,
                onOpen: () => {
                    // Force theme on save project modal
                    setTimeout(() => {
                        const modal = document.querySelector('[data-modal-id="save-project-modal"]');
                        if (modal) {
                            modal.setAttribute('data-theme', 'default');
                            this.forceDarkThemeOnElement(modal);
                        }
                    }, 50);
                }
            }
        );
    }

    createSaveProjectDialog() {
        const container = document.createElement('div');
        container.id = 'save-project-' + Date.now();

        // Append to DOM BEFORE creating WebWeaver instance
        document.body.appendChild(container);

        const weaver = new WebWeaver(container.id);

        // Get existing saved projects
        const savedProjects = this.getSavedProjects();

        weaver
            .h4('💾 Save Project')
            .paragraph('Enter a name for your project:')
            .divStart('form-group', '', { style: 'margin: 1rem 0;' })
            .text('Project Name:', 'label', '', '', { style: 'display: block; font-weight: 600; margin-bottom: 0.5rem;' })
            .input('text', 'My Awesome Website', 'form-control', 'project-name', {
                style: 'width: 100%; padding: 0.5rem; border: 1px solid #dee2e6; border-radius: 4px;',
                value: `Project ${Date.now()}`
            })
            .divEnd();

        // Show existing projects if any
        if (savedProjects.length > 0) {
            weaver
                .h5('📁 Existing Projects:')
                .divStart('saved-projects-list', '', { style: 'max-height: 200px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px; padding: 0.5rem; margin-bottom: 1rem;' });

            savedProjects.forEach(project => {
                weaver
                    .divStart('project-item', '', {
                        style: 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee; cursor: pointer;'
                    })
                    .text(project.name, 'span')
                    .text(new Date(project.savedAt).toLocaleDateString(), 'small', 'text-muted')
                    .divEnd();

                // Add click handler
                const projectItem = container.querySelector('.project-item:last-child');
                if (projectItem) {
                    projectItem.addEventListener('click', () => {
                        const nameInput = container.querySelector('#project-name');
                        if (nameInput) nameInput.value = project.name;
                    });
                }
            });

            weaver.divEnd();
        }

        weaver
            .flexContainer('flex gap-2 justify-end', '', { style: 'margin-top: 2rem;' })
            .button('❌ Cancel', () => {
                this.originalWeaver.closeModal('save-project-modal');
            }, 'btn btn-secondary')
            .button('💾 Save Project', () => {
                this.performSaveProject(container);
            }, 'btn btn-primary')
            .divEnd();

        return container;
    }

    performSaveProject(container) {
        const projectNameInput = container.querySelector('#project-name');
        const projectName = projectNameInput ? projectNameInput.value.trim() : '';

        if (!projectName) {
            this.originalWeaver.toast('Please enter a project name!', 'error', 3000);
            return;
        }

        // Create project data
        const projectData = {
            name: projectName,
            version: '1.0',
            savedAt: new Date().toISOString(),
            structure: this.serializeCurrentStructure(),
            metadata: {
                componentCount: this.currentStructure.length,
                theme: this.originalWeaver.getCurrentTheme(),
                createdWith: 'Web Weaver Drag & Drop Editor'
            }
        };

        // Save to localStorage
        try {
            const savedProjects = this.getSavedProjects();

            // Remove existing project with same name
            const filteredProjects = savedProjects.filter(p => p.name !== projectName);

            // Add new project
            filteredProjects.push(projectData);

            localStorage.setItem('webweaver_editor_projects', JSON.stringify(filteredProjects));

            this.originalWeaver.closeModal('save-project-modal');
            this.originalWeaver.toast(`Project "${projectName}" saved successfully!`, 'success', 3000);

        } catch (error) {
            console.error('Error saving project:', error);
            this.originalWeaver.toast('Failed to save project. Storage might be full.', 'error', 3000);
        }
    }

    // Load project functionality
    loadProject() {
        const savedProjects = this.getSavedProjects();

        if (savedProjects.length === 0) {
            this.originalWeaver.toast('No saved projects found!', 'info', 3000);
            return;
        }

        this.originalWeaver.createModal('📂 Load Project',
            this.createLoadProjectDialog(),
            {
                id: 'load-project-modal',
                size: 'large',
                closeOnBackdrop: false,
                onOpen: () => {
                    // Force theme on load project modal
                    setTimeout(() => {
                        const modal = document.querySelector('[data-modal-id="load-project-modal"]');
                        if (modal) {
                            modal.setAttribute('data-theme', 'default');
                            this.forceDarkThemeOnElement(modal);
                        }
                    }, 50);
                }
            }
        );
    }

    createLoadProjectDialog() {
        const container = document.createElement('div');
        container.id = 'load-project-' + Date.now();

        // Append to DOM BEFORE creating WebWeaver instance
        document.body.appendChild(container);

        const weaver = new WebWeaver(container.id);
        const savedProjects = this.getSavedProjects();

        weaver
            .h4('📂 Load Project')
            .paragraph('Select a project to load:');

        if (savedProjects.length === 0) {
            weaver.text('No saved projects found.', 'div', 'text-muted');
        } else {
            weaver.divStart('projects-grid', '', {
                style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 1rem 0; max-height: 400px; overflow-y: auto;'
            });

            savedProjects.forEach((project, index) => {
                weaver
                    .divStart('project-card', `project-${index}`, {
                        style: 'border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s;'
                    })
                    .h5(project.name)
                    .text(`Components: ${project.metadata?.componentCount || 0}`, 'div', 'text-muted', '', { style: 'margin: 0.5rem 0;' })
                    .text(`Saved: ${new Date(project.savedAt).toLocaleString()}`, 'div', 'text-muted', '', { style: 'font-size: 0.8rem;' })
                    .flexContainer('flex gap-2 justify-end', '', { style: 'margin-top: 1rem;' })
                    .button('📂 Load', () => {
                        this.performLoadProject(project);
                    }, 'btn btn-sm')
                    .button('🗑️ Delete', () => {
                        this.deleteProject(project.name, index, container);
                    }, 'btn btn-sm btn-secondary')
                    .button('📥 Export', () => {
                        this.exportProject(project);
                    }, 'btn btn-sm btn-secondary')
                    .divEnd()
                    .divEnd();
            });

            weaver.divEnd();
        }

        weaver
            .divStart('import-section', '', { style: 'margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #dee2e6;' })
            .h5('📥 Import Project')
            .paragraph('Or import a project from a JSON file:')
            .input('file', '', 'form-control', 'import-file', {
                accept: '.json',
                style: 'margin-bottom: 1rem;'
            })
            .button('📥 Import from File', () => {
                this.importProjectFromFile(container);
            }, 'btn btn-secondary')
            .divEnd()
            .flexContainer('flex gap-2 justify-end', '', { style: 'margin-top: 2rem;' })
            .button('❌ Cancel', () => {
                this.originalWeaver.closeModal('load-project-modal');
            }, 'btn btn-secondary')
            .divEnd();

        return container;
    }

    performLoadProject(projectData) {
        try {
            // Clear current canvas
            this.clearCanvas();

            // Restore the structure
            this.deserializeStructure(projectData.structure);

            // Apply theme if available
            if (projectData.metadata?.theme) {
                this.originalWeaver.setTheme(projectData.metadata.theme);
                this.editorWeaver.setTheme(projectData.metadata.theme);
            }

            // Force dark theme reapplication after loading
            setTimeout(() => {
                this.detectAndApplyCurrentTheme();
                this.forceCompleteThemeReapplication();
            }, 100);

            this.originalWeaver.closeModal('load-project-modal');
            this.originalWeaver.toast(`Project "${projectData.name}" loaded successfully!`, 'success', 3000);

        } catch (error) {
            console.error('Error loading project:', error);
            this.originalWeaver.toast('Failed to load project. The file might be corrupted.', 'error', 3000);
        }
    }

    deleteProject(projectName, index, container) {
        if (confirm(`Are you sure you want to delete "${projectName}"?`)) {
            try {
                const savedProjects = this.getSavedProjects();
                savedProjects.splice(index, 1);
                localStorage.setItem('webweaver_editor_projects', JSON.stringify(savedProjects));

                // Refresh the load dialog
                this.originalWeaver.closeModal('load-project-modal');
                this.loadProject();

                this.originalWeaver.toast(`Project "${projectName}" deleted!`, 'info', 2000);
            } catch (error) {
                console.error('Error deleting project:', error);
                this.originalWeaver.toast('Failed to delete project.', 'error', 3000);
            }
        }
    }

    exportProject(projectData) {
        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        link.click();

        this.originalWeaver.toast(`Project "${projectData.name}" exported!`, 'success', 2000);
    }

    importProjectFromFile(container) {
        const fileInput = container.querySelector('#import-file');
        const file = fileInput?.files[0];

        if (!file) {
            this.originalWeaver.toast('Please select a file to import!', 'warning', 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);

                // Validate project data structure
                if (!projectData.structure || !projectData.name) {
                    throw new Error('Invalid project file format');
                }

                // Update timestamp
                projectData.savedAt = new Date().toISOString();

                // Save to localStorage
                const savedProjects = this.getSavedProjects();
                const existingIndex = savedProjects.findIndex(p => p.name === projectData.name);

                if (existingIndex !== -1) {
                    if (confirm(`Project "${projectData.name}" already exists. Replace it?`)) {
                        savedProjects[existingIndex] = projectData;
                    } else {
                        return;
                    }
                } else {
                    savedProjects.push(projectData);
                }

                localStorage.setItem('webweaver_editor_projects', JSON.stringify(savedProjects));

                // Refresh the load dialog
                this.originalWeaver.closeModal('load-project-modal');

                // Force theme reapplication after import
                setTimeout(() => {
                    this.detectAndApplyCurrentTheme();
                    this.forceCompleteThemeReapplication();
                }, 100);

                this.loadProject();

                this.originalWeaver.toast(`Project "${projectData.name}" imported successfully!`, 'success', 3000);

            } catch (error) {
                console.error('Error importing project:', error);
                this.originalWeaver.toast('Failed to import project. Invalid file format.', 'error', 3000);
            }
        };

        reader.readAsText(file);
    }

    // Helper methods for serialization
    serializeCurrentStructure() {
        return this.currentStructure.map(item => ({
            componentId: item.component.id,
            params: item.params,
            instanceId: item.component.instanceId,
            // Store any additional component instance data
            customData: {
                collapsed: this.isComponentCollapsed(item.component.instanceId),
                groupCollapsed: this.isComponentGroupCollapsed(item.component.instanceId),
                nestingLevel: this.getComponentNestingLevel(item.component.instanceId)
            }
        }));
    }

    isComponentGroupCollapsed(instanceId) {
        const component = document.querySelector(`[data-instance-id="${instanceId}"]`);
        return component ? component.classList.contains('group-collapsed') : false;
    }

    processGroupCollapses() {
        const componentsNeedingGroupCollapse = document.querySelectorAll('[data-needs-group-collapse="true"]');

        componentsNeedingGroupCollapse.forEach(component => {
            const instanceId = component.getAttribute('data-instance-id');
            const componentInstance = component._componentInstance;

            if (componentInstance && componentInstance.isContainer && !componentInstance.isClosing) {
                // Find and hide the group contents
                const canvas = document.querySelector('.editor-canvas');
                const allComponents = [...canvas.querySelectorAll('.canvas-component')];
                const startIndex = allComponents.indexOf(component);

                if (startIndex !== -1) {
                    const closingComponentIndex = this.findMatchingClosingComponent(allComponents, startIndex, componentInstance);

                    if (closingComponentIndex !== -1) {
                        // Hide all components between start and end
                        for (let i = startIndex + 1; i < closingComponentIndex; i++) {
                            const childComponent = allComponents[i];
                            childComponent.classList.add('group-hidden');
                            childComponent.style.display = 'none';
                        }

                        // Hide the closing component too
                        const closingComponent = allComponents[closingComponentIndex];
                        closingComponent.classList.add('group-hidden');
                        closingComponent.style.display = 'none';

                        // Update the preview to show summary
                        this.updateGroupCollapsedPreview(component, closingComponentIndex - startIndex - 1);
                    }
                }
            }

            // Remove the processing flag
            component.removeAttribute('data-needs-group-collapse');
        });
    }

    deserializeStructure(serializedStructure) {
        const canvas = document.querySelector('.editor-canvas');
        if (!canvas) return;

        serializedStructure.forEach(serializedItem => {
            // Find the component definition
            const componentDef = this.components.find(c => c.id === serializedItem.componentId);
            if (!componentDef) {
                console.warn(`Component with id ${serializedItem.componentId} not found`);
                return;
            }

            // Create component instance
            const componentInstance = {
                ...componentDef,
                instanceId: serializedItem.instanceId || 'instance-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                defaultParams: [...serializedItem.params] // Use saved parameters
            };

            // Add component to canvas without triggering drop target calculation
            this.addComponentToCanvasDirectly(componentInstance, serializedItem.customData);
        });

        // Update nesting levels after all components are added
        this.updateNestingLevels();

        // Process group collapses after all components are loaded
        setTimeout(() => {
            this.processGroupCollapses();
            this.updateStructure();

            // Force theme reapplication after deserialization
            this.detectAndApplyCurrentTheme();
            this.forceCompleteThemeReapplication();
        }, 100);
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

        // Force theme reapplication after reordering
        setTimeout(() => {
            this.forceCompleteThemeReapplication();
        }, 50);

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

            // Force theme reapplication after moving
            setTimeout(() => {
                this.forceCompleteThemeReapplication();
            }, 50);

            this.originalWeaver.toast('Component moved up!', 'info', 1500);
        } else if (direction === 'down' && currentIndex < allComponents.length - 1) {
            // Move down (insert after next sibling)
            const nextComponent = allComponents[currentIndex + 1];
            canvas.insertBefore(component, nextComponent.nextSibling);
            this.updateNestingLevels();
            this.updateStructure();

            // Force theme reapplication after moving
            setTimeout(() => {
                this.forceCompleteThemeReapplication();
            }, 50);

            this.originalWeaver.toast('Component moved down!', 'info', 1500);
        }
    }

    deleteComponent(instanceId) {
        const componentElement = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (componentElement) {
            componentElement.remove();

            // Update nesting levels after deletion to fix indentation
            this.updateNestingLevels();

            this.updateStructure();

            // Add placeholder back if canvas is empty
            const canvas = document.querySelector('.editor-canvas');
            if (canvas && canvas.children.length === 0) {
                const placeholderContainer = document.createElement('div');
                placeholderContainer.id = 'placeholder-' + Date.now();
                document.body.appendChild(placeholderContainer);

                const placeholderWeaver = new WebWeaver(placeholderContainer.id);
                placeholderWeaver.setTheme('default'); // Force dark theme

                placeholderWeaver
                    .divStart('canvas-placeholder', '', {
                        style: 'background: rgba(31, 41, 55, 0.5) !important; border-color: #374151 !important; color: #9ca3af !important;'
                    })
                    .text('🎨 Drop components here to build your website', 'div', '', '', {
                        style: 'color: #9ca3af !important;'
                    })
                    .paragraph('Drag components from the panel on the right to start building!', '', '', {
                        style: 'color: #9ca3af !important;'
                    })
                    .divEnd();

                canvas.appendChild(placeholderContainer.firstChild);
                document.body.removeChild(placeholderContainer);
            }

            // Force theme reapplication after deletion
            setTimeout(() => {
                this.detectAndApplyCurrentTheme();
                this.forceCompleteThemeReapplication();
            }, 50);

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

        // Force theme reapplication after structure update
        setTimeout(() => {
            this.forceCompleteThemeReapplication();
        }, 50);
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

        // Apply current theme to preview (default to default)
        let currentTheme = this.originalWeaver.getCurrentTheme();
        if (!currentTheme || currentTheme === 'default') {
            currentTheme = 'default';
        }
        this.previewWeaver.setTheme(currentTheme);

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
                        case 'select':
                            try {
                                const options = JSON.parse(params[0] || '[]');
                                this.previewWeaver.select(options, params[1] || '', params[2] || '', params[3] ? { style: params[3] } : {});
                            } catch (e) {
                                this.previewWeaver.select([{ text: 'Option 1', value: '1' }], params[1] || '', params[2] || '', params[3] ? { style: params[3] } : {});
                            }
                            break;
                        case 'canvasGradient':
                            try {
                                const colors = JSON.parse(params[5] || '["#ff6b6b", "#4ecdc4"]');
                                this.previewWeaver.canvasGradient(params[0] || 'myCanvas', params[1] || '10', params[2] || '10', params[3] || '200', params[4] || '100', colors, params[6] || 'horizontal');
                            } catch (e) {
                                console.error('Error parsing colors for gradient:', e);
                                this.previewWeaver.canvasGradient(params[0] || 'myCanvas', params[1] || '10', params[2] || '10', params[3] || '200', params[4] || '100', ['#ff6b6b', '#4ecdc4'], params[6] || 'horizontal');
                            }
                            break;
                        case 'canvasPath':
                            try {
                                const points = JSON.parse(params[1] || '[]');
                                this.previewWeaver.canvasPath(params[0] || 'myCanvas', points, params[2] || '#9b59b6', params[3] || '2', params[4] === 'true');
                            } catch (e) {
                                console.error('Error parsing points for path:', e);
                                this.previewWeaver.canvasPath(params[0] || 'myCanvas', [{ "x": 10, "y": 10 }, { "x": 100, "y": 50 }], params[2] || '#9b59b6', params[3] || '2', params[4] === 'true');
                            }
                            break;
                        default:
                            // Apply parameters based on component definition
                            const methodParams = [];
                            component.params.forEach((param, index) => {
                                if (param === 'style' && params[index]) {
                                    methodParams.push({ style: params[index] });
                                } else if (param === 'options' && component.method === 'select') {
                                    try {
                                        methodParams.push(JSON.parse(params[index] || '[]'));
                                    } catch (e) {
                                        methodParams.push([{ text: 'Option 1', value: '1' }]);
                                    }
                                } else if (param === 'colors' && component.method === 'canvasGradient') {
                                    try {
                                        methodParams.push(JSON.parse(params[index] || '[]'));
                                    } catch (e) {
                                        methodParams.push(['#ff6b6b', '#4ecdc4']);
                                    }
                                } else if (param === 'points' && component.method === 'canvasPath') {
                                    try {
                                        methodParams.push(JSON.parse(params[index] || '[]'));
                                    } catch (e) {
                                        methodParams.push([{ "x": 10, "y": 10 }, { "x": 100, "y": 50 }]);
                                    }
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
                console.error('Error rendering component in preview:', error, component);
                // Continue with next component instead of breaking
            }
        });

        this.originalWeaver.createModal('👁️ Website Preview', previewContainer, {
            id: 'preview-modal',
            size: 'large',
            onOpen: () => {
                // Force theme on preview modal if it's the default theme
                setTimeout(() => {
                    const modal = document.querySelector('[data-modal-id="preview-modal"]');
                    if (modal && currentTheme === 'default') {
                        modal.setAttribute('data-theme', 'default');
                        this.forceDarkThemeOnElement(modal);
                    }
                }, 50);
            },
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