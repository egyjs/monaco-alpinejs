import * as monaco from "monaco-editor";

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

export default function (Alpine) {
    function isXmlString(str) {
        return str.startsWith('<');
    }

    function language(str) { // todo: get language from the directive
        if (isXmlString(str)) {
            return 'xml';
        }
        return 'json';
    }

    Alpine.store('monaco', {
        errors: {}
    });

    const editorElementMap = new Map();

    Alpine.directive('monaco', (el, { expression }, { evaluate }) => {
        let editor;
        let value = evaluate(expression);

        // Generate a unique ID for the editor instance if not already present
        const editorId = el.getAttribute('id') || `editor-${Math.random().toString(36).substr(2, 9)}`;
        el.setAttribute('id', editorId);

        editor = monaco.editor.create(el, {
            value,
            theme: 'vs-dark',
            language: language(value),
            automaticLayout: true // <<== the important part
        });

        editorElementMap.set(el, editor);

        // Watch for changes in Alpine state and update the editor
        Alpine.effect(() => {
            const alpineValue = evaluate(expression);
            if (editor.getValue() !== alpineValue) {
                editor.setValue(alpineValue);
            }
        });

        editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            evaluate(`${expression} = \`${newValue}\``); // Sync to Alpine state
            // change language based on content
            monaco.editor.setModelLanguage(editor.getModel(), language(newValue));
        });

        monaco.editor.onDidChangeMarkers((uris) => {
            const relevantEditors = Array.from(editorElementMap.entries())
                .filter(([_, editorInstance]) => uris.some(uri => editorInstance.getModel().uri.toString() === uri.toString()));

            relevantEditors.forEach(([element, editorInstance]) => {
                const markers = monaco.editor.getModelMarkers({ resource: editorInstance.getModel().uri });
                const error = markers.find(marker => marker.severity === monaco.MarkerSeverity.Error);

                if (error) {
                    Alpine.store('monaco').errors[element.id] = {
                        message: error.message,
                        line: error.startLineNumber,
                        column: error.startColumn,
                    };
                } else {
                    delete Alpine.store('monaco').errors[element.id];
                }
            });

        });
    });
}
