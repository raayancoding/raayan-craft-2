import Minecraft from './net/raayancraft/client/Minecraft.js';

class Start {

    // Globals provided by the classic vendor scripts in index.html
    static REQUIRED_GLOBALS = ["pako", "aesjs", "ASN1", "bigint-mod-arith", "sha1"];

    static checkDependencies() {
        const missing = Start.REQUIRED_GLOBALS.filter((name) => !(name in window) || !window[name]);
        if (missing.length > 0) {
            throw new Error("Missing libraries: " + missing.join(", ") +
                " — make sure index.html loads libraries/*.js as classic scripts over http://localhost:8000");
        }
    }

    loadTextures(textures) {
        let resources = [];
        let index = 0;

        return textures.reduce((currentPromise, texturePath) => {
            return currentPromise.then(() => {
                return new Promise((resolve, reject) => {
                    // Load texture
                    let image = new Image();
                    image.src = "src/resources/" + texturePath;
                    image.onload = () => resolve();
                    image.onerror = () => reject(new Error("Missing texture: src/resources/" + texturePath));
                    resources[texturePath] = image;

                    index++;
                });
            });
        }, Promise.resolve()).then(() => {
            return resources;
        });
    }

    launch(canvasWrapperId) {
        // Visible boot errors instead of a silent dark screen
        window.addEventListener('error', (e) => {
            Start.showBootError(e.message || e.error);
        });
        window.addEventListener('unhandledrejection', (e) => {
            Start.showBootError(e.reason && (e.reason.stack || e.reason.message) || e.reason);
        });
        if (window.location.protocol === 'file:') {
            Start.showBootError('Open via a local server (double-click start-server.bat), not file:// — ES modules are blocked on file://');
        }
        try {
            Start.checkDependencies();
        } catch (err) {
            Start.showBootError(err && (err.stack || err.message) || err);
            return;
        }
        this.loadTextures([
            "misc/grasscolor.png",
            "gui/font.png",
            "gui/gui.png",
            "gui/background.png",
            "gui/icons.png",
            "terrain/terrain.png",
            "terrain/sun.png",
            "terrain/moon.png",
            "char.png",
            "gui/title/raayancraft.png",
            "gui/title/background/panorama_0.png",
            "gui/title/background/panorama_1.png",
            "gui/title/background/panorama_2.png",
            "gui/title/background/panorama_3.png",
            "gui/title/background/panorama_4.png",
            "gui/title/background/panorama_5.png",
            "gui/container/creative.png"
        ]).then((resources) => {
            // Launch actual game on canvas
            window.app = new Minecraft(canvasWrapperId, resources);
        }).catch((err) => {
            Start.showBootError(err && (err.stack || err.message) || err);
        });
    }

    static showBootError(msg) {
        console.error(msg);
        let el = document.getElementById("boot-error");
        if (!el) {
            el = document.createElement("div");
            el.id = "boot-error";
            el.style.cssText = "position:fixed;left:8px;bottom:8px;max-width:90vw;z-index:9999;background:#7a1010;color:#fff;font:12px monospace;padding:10px;border:2px solid #fff;white-space:pre-wrap;";
            document.body.appendChild(el);
        }
        el.textContent = "Boot error: " + msg;
    }
}

// Boot once, as early as possible. Module scripts are deferred, so the DOM
// is already parsed here. Keep the pageshow listener for back-navigation
// (bfcache) restores, guarded against double-launch.
function boot() {
    if (window.__rcBooted) {
        return;
    }
    window.__rcBooted = true;
    new Start().launch("canvas-container");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

// Listen on history back
window.addEventListener('pageshow', function (event) {
    if (window.app) {
        // Reload page to restart the game
        if (!window.app.running) {
            window.location.reload();
        }
    } else {
        boot();
    }
});

export function require(module) {
    return window[module];
}