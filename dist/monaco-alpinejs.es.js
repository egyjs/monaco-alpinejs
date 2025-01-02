import * as s from "monaco-editor";
function M(r) {
  return new Worker(
    "/assets/editor.worker-CYC0jP-p.js",
    {
      name: r == null ? void 0 : r.name
    }
  );
}
function h(r) {
  return new Worker(
    "/assets/json.worker-heCfXoJw.js",
    {
      name: r == null ? void 0 : r.name
    }
  );
}
function j(r) {
  return new Worker(
    "/assets/css.worker-Byh--afc.js",
    {
      name: r == null ? void 0 : r.name
    }
  );
}
function l(r) {
  return new Worker(
    "/assets/html.worker-DArWg-Dy.js",
    {
      name: r == null ? void 0 : r.name
    }
  );
}
function v(r) {
  return new Worker(
    "/assets/ts.worker-vadtWdV5.js",
    {
      name: r == null ? void 0 : r.name
    }
  );
}
self.MonacoEnvironment = {
  getWorker(r, e) {
    return e === "json" ? new h() : e === "css" || e === "scss" || e === "less" ? new j() : e === "html" || e === "handlebars" || e === "razor" ? new l() : e === "typescript" || e === "javascript" ? new v() : new M();
  }
};
function C(r) {
  function e(t) {
    return t.startsWith("<");
  }
  function i(t) {
    return e(t) ? "xml" : "json";
  }
  r.store("monaco", {
    errors: {}
  });
  const f = /* @__PURE__ */ new Map();
  r.directive("monaco", (t, { expression: u }, { evaluate: c }) => {
    let n, g = c(u);
    const W = t.getAttribute("id") || `editor-${Math.random().toString(36).substr(2, 9)}`;
    t.setAttribute("id", W), n = s.editor.create(t, {
      value: g,
      theme: "vs-dark",
      language: i(g),
      automaticLayout: !0
      // <<== the important part
    }), f.set(t, n), r.effect(() => {
      const a = c(u);
      n.getValue() !== a && n.setValue(a);
    }), n.onDidChangeModelContent(() => {
      const a = n.getValue();
      c(`${u} = \`${a}\``), s.editor.setModelLanguage(n.getModel(), i(a));
    }), s.editor.onDidChangeMarkers((a) => {
      Array.from(f.entries()).filter(([d, m]) => a.some((k) => m.getModel().uri.toString() === k.toString())).forEach(([d, m]) => {
        const o = s.editor.getModelMarkers({ resource: m.getModel().uri }).find((w) => w.severity === s.MarkerSeverity.Error);
        o ? r.store("monaco").errors[d.id] = {
          message: o.message,
          line: o.startLineNumber,
          column: o.startColumn
        } : delete r.store("monaco").errors[d.id];
      });
    });
  });
}
export {
  C as default
};
