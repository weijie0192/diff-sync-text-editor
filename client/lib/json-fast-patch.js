/*! fast-json-patch, version: 3.0.0-1 */
var jsonpatch = (function (e) {
    var t = {};
    function r(n) {
        if (t[n]) return t[n].exports;
        var o = (t[n] = { i: n, l: !1, exports: {} });
        return e[n].call(o.exports, o, o.exports, r), (o.l = !0), o.exports;
    }
    return (
        (r.m = e),
        (r.c = t),
        (r.d = function (e, t, n) {
            r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n });
        }),
        (r.r = function (e) {
            "undefined" != typeof Symbol &&
                Symbol.toStringTag &&
                Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
                Object.defineProperty(e, "__esModule", { value: !0 });
        }),
        (r.t = function (e, t) {
            if ((1 & t && (e = r(e)), 8 & t)) return e;
            if (4 & t && "object" == typeof e && e && e.__esModule) return e;
            var n = Object.create(null);
            if (
                (r.r(n),
                Object.defineProperty(n, "default", { enumerable: !0, value: e }),
                2 & t && "string" != typeof e)
            )
                for (var o in e)
                    r.d(
                        n,
                        o,
                        function (t) {
                            return e[t];
                        }.bind(null, o)
                    );
            return n;
        }),
        (r.n = function (e) {
            var t =
                e && e.__esModule
                    ? function () {
                          return e.default;
                      }
                    : function () {
                          return e;
                      };
            return r.d(t, "a", t), t;
        }),
        (r.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
        }),
        (r.p = ""),
        r((r.s = 2))
    );
})([
    function (e, t) {
        /*!
         * https://github.com/Starcounter-Jack/JSON-Patch
         * (c) 2017 Joachim Wester
         * MIT license
         */
        var r,
            n =
                (this && this.__extends) ||
                ((r = function (e, t) {
                    return (r =
                        Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array &&
                            function (e, t) {
                                e.__proto__ = t;
                            }) ||
                        function (e, t) {
                            for (var r in t) t.hasOwnProperty(r) && (e[r] = t[r]);
                        })(e, t);
                }),
                function (e, t) {
                    function n() {
                        this.constructor = e;
                    }
                    r(e, t),
                        (e.prototype =
                            null === t ? Object.create(t) : ((n.prototype = t.prototype), new n()));
                });
        Object.defineProperty(t, "__esModule", { value: !0 });
        var o = Object.prototype.hasOwnProperty;
        function a(e, t) {
            return o.call(e, t);
        }
        function i(e) {
            if (Array.isArray(e)) {
                for (var t = new Array(e.length), r = 0; r < t.length; r++) t[r] = "" + r;
                return t;
            }
            if (Object.keys) return Object.keys(e);
            t = [];
            for (var n in e) a(e, n) && t.push(n);
            return t;
        }
        function p(e) {
            return -1 === e.indexOf("/") && -1 === e.indexOf("~")
                ? e
                : e.replace(/~/g, "~0").replace(/\//g, "~1");
        }
        function u(e, t) {
            var r;
            for (var n in e)
                if (a(e, n)) {
                    if (e[n] === t) return p(n) + "/";
                    if ("object" == typeof e[n] && "" != (r = u(e[n], t))) return p(n) + "/" + r;
                }
            return "";
        }
        function s(e, t) {
            var r = [e];
            for (var n in t) {
                var o = "object" == typeof t[n] ? JSON.stringify(t[n], null, 2) : t[n];
                void 0 !== o && r.push(n + ": " + o);
            }
            return r.join("\n");
        }
        (t.hasOwnProperty = a),
            (t._objectKeys = i),
            (t._deepClone = function (e) {
                switch (typeof e) {
                    case "object":
                        return JSON.parse(JSON.stringify(e));
                    case "undefined":
                        return null;
                    default:
                        return e;
                }
            }),
            (t.isInteger = function (e) {
                for (var t, r = 0, n = e.length; r < n; ) {
                    if (!((t = e.charCodeAt(r)) >= 48 && t <= 57)) return !1;
                    r++;
                }
                return !0;
            }),
            (t.escapePathComponent = p),
            (t.unescapePathComponent = function (e) {
                return e.replace(/~1/g, "/").replace(/~0/g, "~");
            }),
            (t._getPathRecursive = u),
            (t.getPath = function (e, t) {
                if (e === t) return "/";
                var r = u(e, t);
                if ("" === r) throw new Error("Object not found in root");
                return "/" + r;
            }),
            (t.hasUndefined = function e(t) {
                if (void 0 === t) return !0;
                if (t)
                    if (Array.isArray(t)) {
                        for (var r = 0, n = t.length; r < n; r++) if (e(t[r])) return !0;
                    } else if ("object" == typeof t) {
                        var o = i(t),
                            a = o.length;
                        for (r = 0; r < a; r++) if (e(t[o[r]])) return !0;
                    }
                return !1;
            });
        var c = (function (e) {
            function t(t, r, n, o, a) {
                var i = this.constructor,
                    p = e.call(this, s(t, { name: r, index: n, operation: o, tree: a })) || this;
                return (
                    (p.name = r),
                    (p.index = n),
                    (p.operation = o),
                    (p.tree = a),
                    Object.setPrototypeOf(p, i.prototype),
                    (p.message = s(t, { name: r, index: n, operation: o, tree: a })),
                    p
                );
            }
            return n(t, e), t;
        })(Error);
        t.PatchError = c;
    },
    function (e, t, r) {
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = r(0);
        (t.JsonPatchError = n.PatchError), (t.deepClone = n._deepClone);
        var o = {
                add: function (e, t, r) {
                    return (e[t] = this.value), { newDocument: r };
                },
                remove: function (e, t, r) {
                    var n = e[t];
                    return delete e[t], { newDocument: r, removed: n };
                },
                replace: function (e, t, r) {
                    var n = e[t];
                    return (e[t] = this.value), { newDocument: r, removed: n };
                },
                move: function (e, t, r) {
                    var o = i(r, this.path);
                    o && (o = n._deepClone(o));
                    var a = p(r, { op: "remove", path: this.from }).removed;
                    return (
                        p(r, { op: "add", path: this.path, value: a }),
                        { newDocument: r, removed: o }
                    );
                },
                copy: function (e, t, r) {
                    var o = i(r, this.from);
                    return (
                        p(r, { op: "add", path: this.path, value: n._deepClone(o) }),
                        { newDocument: r }
                    );
                },
                test: function (e, t, r) {
                    return { newDocument: r, test: f(e[t], this.value) };
                },
                _get: function (e, t, r) {
                    return (this.value = e[t]), { newDocument: r };
                },
            },
            a = {
                add: function (e, t, r) {
                    return (
                        n.isInteger(t) ? e.splice(t, 0, this.value) : (e[t] = this.value),
                        { newDocument: r, index: t }
                    );
                },
                remove: function (e, t, r) {
                    return { newDocument: r, removed: e.splice(t, 1)[0] };
                },
                replace: function (e, t, r) {
                    var n = e[t];
                    return (e[t] = this.value), { newDocument: r, removed: n };
                },
                move: o.move,
                copy: o.copy,
                test: o.test,
                _get: o._get,
            };
        function i(e, t) {
            if ("" == t) return e;
            var r = { op: "_get", path: t };
            return p(e, r), r.value;
        }
        function p(e, r, p, u, c, h) {
            if (
                (void 0 === p && (p = !1),
                void 0 === u && (u = !0),
                void 0 === c && (c = !0),
                void 0 === h && (h = 0),
                p && ("function" == typeof p ? p(r, 0, e, r.path) : s(r, 0)),
                "" === r.path)
            ) {
                var l = { newDocument: e };
                if ("add" === r.op) return (l.newDocument = r.value), l;
                if ("replace" === r.op) return (l.newDocument = r.value), (l.removed = e), l;
                if ("move" === r.op || "copy" === r.op)
                    return (l.newDocument = i(e, r.from)), "move" === r.op && (l.removed = e), l;
                if ("test" === r.op) {
                    if (((l.test = f(e, r.value)), !1 === l.test))
                        throw new t.JsonPatchError(
                            "Test operation failed",
                            "TEST_OPERATION_FAILED",
                            h,
                            r,
                            e
                        );
                    return (l.newDocument = e), l;
                }
                if ("remove" === r.op) return (l.removed = e), (l.newDocument = null), l;
                if ("_get" === r.op) return (r.value = e), l;
                if (p)
                    throw new t.JsonPatchError(
                        "Operation `op` property is not one of operations defined in RFC-6902",
                        "OPERATION_OP_INVALID",
                        h,
                        r,
                        e
                    );
                return l;
            }
            u || (e = n._deepClone(e));
            var d = (r.path || "").split("/"),
                v = e,
                w = 1,
                y = d.length,
                _ = void 0,
                O = void 0,
                m = void 0;
            for (m = "function" == typeof p ? p : s; ; ) {
                if (((O = d[w]), c && "__proto__" == O))
                    throw new TypeError(
                        "JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README"
                    );
                if (
                    (p &&
                        void 0 === _ &&
                        (void 0 === v[O]
                            ? (_ = d.slice(0, w).join("/"))
                            : w == y - 1 && (_ = r.path),
                        void 0 !== _ && m(r, 0, e, _)),
                    w++,
                    Array.isArray(v))
                ) {
                    if ("-" === O) O = v.length;
                    else {
                        if (p && !n.isInteger(O))
                            throw new t.JsonPatchError(
                                "Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index",
                                "OPERATION_PATH_ILLEGAL_ARRAY_INDEX",
                                h,
                                r,
                                e
                            );
                        n.isInteger(O) && (O = ~~O);
                    }
                    if (w >= y) {
                        if (p && "add" === r.op && O > v.length)
                            throw new t.JsonPatchError(
                                "The specified index MUST NOT be greater than the number of elements in the array",
                                "OPERATION_VALUE_OUT_OF_BOUNDS",
                                h,
                                r,
                                e
                            );
                        if (!1 === (l = a[r.op].call(r, v, O, e)).test)
                            throw new t.JsonPatchError(
                                "Test operation failed",
                                "TEST_OPERATION_FAILED",
                                h,
                                r,
                                e
                            );
                        return l;
                    }
                } else if (
                    (O && -1 != O.indexOf("~") && (O = n.unescapePathComponent(O)), w >= y)
                ) {
                    if (!1 === (l = o[r.op].call(r, v, O, e)).test)
                        throw new t.JsonPatchError(
                            "Test operation failed",
                            "TEST_OPERATION_FAILED",
                            h,
                            r,
                            e
                        );
                    return l;
                }
                if (((v = v[O]), w < y && (!v || "object" != typeof v)))
                    throw new t.JsonPatchError(
                        "Cannot perform operation at the desired path",
                        "OPERATION_PATH_UNRESOLVABLE",
                        h,
                        r,
                        e
                    );
            }
        }
        function u(e, r, o, a, i) {
            if ((void 0 === a && (a = !0), void 0 === i && (i = !0), o && !Array.isArray(r)))
                throw new t.JsonPatchError(
                    "Patch sequence must be an array",
                    "SEQUENCE_NOT_AN_ARRAY"
                );
            a || (e = n._deepClone(e));
            for (var u = new Array(r.length), s = 0, c = r.length; s < c; s++)
                (u[s] = p(e, r[s], o, !0, i, s)), (e = u[s].newDocument);
            return (u.newDocument = e), u;
        }
        function s(e, r, a, i) {
            if ("object" != typeof e || null === e || Array.isArray(e))
                throw new t.JsonPatchError(
                    "Operation is not an object",
                    "OPERATION_NOT_AN_OBJECT",
                    r,
                    e,
                    a
                );
            if (!o[e.op])
                throw new t.JsonPatchError(
                    "Operation `op` property is not one of operations defined in RFC-6902",
                    "OPERATION_OP_INVALID",
                    r,
                    e,
                    a
                );
            if ("string" != typeof e.path)
                throw new t.JsonPatchError(
                    "Operation `path` property is not a string",
                    "OPERATION_PATH_INVALID",
                    r,
                    e,
                    a
                );
            if (0 !== e.path.indexOf("/") && e.path.length > 0)
                throw new t.JsonPatchError(
                    'Operation `path` property must start with "/"',
                    "OPERATION_PATH_INVALID",
                    r,
                    e,
                    a
                );
            if (("move" === e.op || "copy" === e.op) && "string" != typeof e.from)
                throw new t.JsonPatchError(
                    "Operation `from` property is not present (applicable in `move` and `copy` operations)",
                    "OPERATION_FROM_REQUIRED",
                    r,
                    e,
                    a
                );
            if (("add" === e.op || "replace" === e.op || "test" === e.op) && void 0 === e.value)
                throw new t.JsonPatchError(
                    "Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)",
                    "OPERATION_VALUE_REQUIRED",
                    r,
                    e,
                    a
                );
            if (
                ("add" === e.op || "replace" === e.op || "test" === e.op) &&
                n.hasUndefined(e.value)
            )
                throw new t.JsonPatchError(
                    "Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)",
                    "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED",
                    r,
                    e,
                    a
                );
            if (a)
                if ("add" == e.op) {
                    var p = e.path.split("/").length,
                        u = i.split("/").length;
                    if (p !== u + 1 && p !== u)
                        throw new t.JsonPatchError(
                            "Cannot perform an `add` operation at the desired path",
                            "OPERATION_PATH_CANNOT_ADD",
                            r,
                            e,
                            a
                        );
                } else if ("replace" === e.op || "remove" === e.op || "_get" === e.op) {
                    if (e.path !== i)
                        throw new t.JsonPatchError(
                            "Cannot perform the operation at a path that does not exist",
                            "OPERATION_PATH_UNRESOLVABLE",
                            r,
                            e,
                            a
                        );
                } else if ("move" === e.op || "copy" === e.op) {
                    var s = c([{ op: "_get", path: e.from, value: void 0 }], a);
                    if (s && "OPERATION_PATH_UNRESOLVABLE" === s.name)
                        throw new t.JsonPatchError(
                            "Cannot perform the operation from a path that does not exist",
                            "OPERATION_FROM_UNRESOLVABLE",
                            r,
                            e,
                            a
                        );
                }
        }
        function c(e, r, o) {
            try {
                if (!Array.isArray(e))
                    throw new t.JsonPatchError(
                        "Patch sequence must be an array",
                        "SEQUENCE_NOT_AN_ARRAY"
                    );
                if (r) u(n._deepClone(r), n._deepClone(e), o || !0);
                else {
                    o = o || s;
                    for (var a = 0; a < e.length; a++) o(e[a], a, r, void 0);
                }
            } catch (e) {
                if (e instanceof t.JsonPatchError) return e;
                throw e;
            }
        }
        function f(e, t) {
            if (e === t) return !0;
            if (e && t && "object" == typeof e && "object" == typeof t) {
                var r,
                    n,
                    o,
                    a = Array.isArray(e),
                    i = Array.isArray(t);
                if (a && i) {
                    if ((n = e.length) != t.length) return !1;
                    for (r = n; 0 != r--; ) if (!f(e[r], t[r])) return !1;
                    return !0;
                }
                if (a != i) return !1;
                var p = Object.keys(e);
                if ((n = p.length) !== Object.keys(t).length) return !1;
                for (r = n; 0 != r--; ) if (!t.hasOwnProperty(p[r])) return !1;
                for (r = n; 0 != r--; ) if (!f(e[(o = p[r])], t[o])) return !1;
                return !0;
            }
            return e != e && t != t;
        }
        (t.getValueByPointer = i),
            (t.applyOperation = p),
            (t.applyPatch = u),
            (t.applyReducer = function (e, r, n) {
                var o = p(e, r);
                if (!1 === o.test)
                    throw new t.JsonPatchError(
                        "Test operation failed",
                        "TEST_OPERATION_FAILED",
                        n,
                        r,
                        e
                    );
                return o.newDocument;
            }),
            (t.validator = s),
            (t.validate = c),
            (t._areEquals = f);
    },
    function (e, t, r) {
        var n = r(1);
        Object.assign(t, n);
        var o = r(3);
        Object.assign(t, o);
        var a = r(0);
        (t.JsonPatchError = a.PatchError),
            (t.deepClone = a._deepClone),
            (t.escapePathComponent = a.escapePathComponent),
            (t.unescapePathComponent = a.unescapePathComponent);
    },
    function (e, t, r) {
        Object.defineProperty(t, "__esModule", { value: !0 });
        /*!
         * https://github.com/Starcounter-Jack/JSON-Patch
         * (c) 2017 Joachim Wester
         * MIT license
         */
        var n = r(0),
            o = r(1),
            a = new WeakMap(),
            i = function (e) {
                (this.observers = new Map()), (this.obj = e);
            },
            p = function (e, t) {
                (this.callback = e), (this.observer = t);
            };
        function u(e, t) {
            void 0 === t && (t = !1);
            var r = a.get(e.object);
            s(r.value, e.object, e.patches, "", t),
                e.patches.length && o.applyPatch(r.value, e.patches);
            var n = e.patches;
            return n.length > 0 && ((e.patches = []), e.callback && e.callback(n)), n;
        }
        function s(e, t, r, o, a) {
            if (t !== e) {
                "function" == typeof t.toJSON && (t = t.toJSON());
                for (
                    var i = n._objectKeys(t), p = n._objectKeys(e), u = !1, c = p.length - 1;
                    c >= 0;
                    c--
                ) {
                    var f = e[(l = p[c])];
                    if (
                        !n.hasOwnProperty(t, l) ||
                        (void 0 === t[l] && void 0 !== f && !1 === Array.isArray(t))
                    )
                        Array.isArray(e) === Array.isArray(t)
                            ? (a &&
                                  r.push({
                                      op: "test",
                                      path: o + "/" + n.escapePathComponent(l),
                                      value: n._deepClone(f),
                                  }),
                              r.push({ op: "remove", path: o + "/" + n.escapePathComponent(l) }),
                              (u = !0))
                            : (a && r.push({ op: "test", path: o, value: e }),
                              r.push({ op: "replace", path: o, value: t }),
                              !0);
                    else {
                        var h = t[l];
                        "object" == typeof f && null != f && "object" == typeof h && null != h
                            ? s(f, h, r, o + "/" + n.escapePathComponent(l), a)
                            : f !== h &&
                              (!0,
                              a &&
                                  r.push({
                                      op: "test",
                                      path: o + "/" + n.escapePathComponent(l),
                                      value: n._deepClone(f),
                                  }),
                              r.push({
                                  op: "replace",
                                  path: o + "/" + n.escapePathComponent(l),
                                  value: n._deepClone(h),
                              }));
                    }
                }
                if (u || i.length != p.length)
                    for (c = 0; c < i.length; c++) {
                        var l = i[c];
                        n.hasOwnProperty(e, l) ||
                            void 0 === t[l] ||
                            r.push({
                                op: "add",
                                path: o + "/" + n.escapePathComponent(l),
                                value: n._deepClone(t[l]),
                            });
                    }
            }
        }
        (t.unobserve = function (e, t) {
            t.unobserve();
        }),
            (t.observe = function (e, t) {
                var r,
                    o = (function (e) {
                        return a.get(e);
                    })(e);
                if (o) {
                    var s = (function (e, t) {
                        return e.observers.get(t);
                    })(o, t);
                    r = s && s.observer;
                } else (o = new i(e)), a.set(e, o);
                if (r) return r;
                if (((r = {}), (o.value = n._deepClone(e)), t)) {
                    (r.callback = t), (r.next = null);
                    var c = function () {
                            u(r);
                        },
                        f = function () {
                            clearTimeout(r.next), (r.next = setTimeout(c));
                        };
                    "undefined" != typeof window &&
                        (window.addEventListener("mouseup", f),
                        window.addEventListener("keyup", f),
                        window.addEventListener("mousedown", f),
                        window.addEventListener("keydown", f),
                        window.addEventListener("change", f));
                }
                return (
                    (r.patches = []),
                    (r.object = e),
                    (r.unobserve = function () {
                        u(r),
                            clearTimeout(r.next),
                            (function (e, t) {
                                e.observers.delete(t.callback);
                            })(o, r),
                            "undefined" != typeof window &&
                                (window.removeEventListener("mouseup", f),
                                window.removeEventListener("keyup", f),
                                window.removeEventListener("mousedown", f),
                                window.removeEventListener("keydown", f),
                                window.removeEventListener("change", f));
                    }),
                    o.observers.set(t, new p(t, r)),
                    r
                );
            }),
            (t.generate = u),
            (t.compare = function (e, t, r) {
                void 0 === r && (r = !1);
                var n = [];
                return s(e, t, n, "", r), n;
            });
    },
]);
