"use strict";

let Stream = {
    url: null,
    hint: null,
    license: null,
    drm_scheme: null,
    set_values(url_new, hint_new, license_new, drm_scheme) {
        this.url = url_new;
        this.hint = hint_new;
        this.license = license_new;
        this.drm_scheme = drm_scheme;
    }

}

export default Stream;