exports.id = 163;
exports.ids = [163];
exports.modules = {

/***/ 4163:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ App)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5893);
// EXTERNAL MODULE: ./styles/globals.css
var globals = __webpack_require__(6764);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
;// CONCATENATED MODULE: ./components/Navbar.tsx


function Navbar() {
    return /*#__PURE__*/ jsx_runtime.jsx("nav", {
        className: "bg-white shadow py-3",
        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "max-w-6xl mx-auto flex justify-between items-center px-4",
            children: [
                /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
                    href: "/",
                    children: /*#__PURE__*/ jsx_runtime.jsx("h1", {
                        className: "text-xl font-bold text-blue-700",
                        children: "24TexMarket"
                    })
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "flex gap-4 text-sm",
                    children: [
                        /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
                            href: "/listings",
                            className: "text-gray-800 hover:text-blue-600",
                            children: "E’lonlar"
                        }),
                        /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
                            href: "/add-listing",
                            className: "text-gray-800 hover:text-blue-600",
                            children: "+ Qo‘shish"
                        }),
                        /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
                            href: "/profile",
                            className: "text-gray-800 hover:text-blue-600",
                            children: "Profil"
                        }),
                        /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
                            href: "/login",
                            className: "text-gray-800 hover:text-blue-600",
                            children: "Kirish"
                        }),
                        /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
                            href: "/register",
                            className: "text-gray-800 hover:text-blue-600",
                            children: "Ro‘yxatdan o‘tish"
                        })
                    ]
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./pages/_app.tsx



function App({ Component, pageProps }) {
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime.jsx(Navbar, {}),
            /*#__PURE__*/ jsx_runtime.jsx(Component, {
                ...pageProps
            })
        ]
    });
}


/***/ }),

/***/ 6764:
/***/ (() => {



/***/ })

};
;