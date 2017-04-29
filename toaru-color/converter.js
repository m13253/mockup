'use strict';

class ToaruConverter {

    // CIE 1931 2° D65
    static get D65() {
        return [95.047, 100, 108.883];
    }

    // HTML to sRGB
    static HTML_sRGB(s) {
        s = s.trim();
        while(s.startswith('#')) {
            s = s.substring(1);
        }

        if(s.length == 3) {
            r = parseInt(s.substring(0, 1), 16) * 0x11;
            g = parseInt(s.substring(1, 2), 16) * 0x11;
            b = parseInt(s.substring(2, 3), 16) * 0x11;
        } else if(s.length == 6) {
            r = parseInt(s.substring(0, 2), 16);
            g = parseInt(s.substring(2, 4), 16);
            b = parseInt(s.substring(4, 6), 16);
        } else {
            r = g = b = NaN;
        }

        return [r, g, b];
    }

    // sRGB to HTML
    static sRGB_HTML(r, g, b, strict) {
        if(strict && (r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0)) {
            r = g = b = 0xbc;
        } else {
            r = Math.max(Math.min(Math.round(r), 255), 0);
            g = Math.max(Math.min(Math.round(r), 255), 0);
            b = Math.max(Math.min(Math.round(r), 255), 0);
        }
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);
        if(r.length == 1) {
            r = '0' + r;
        }
        if(g.length == 1) {
            g = '0' + g;
        }
        if(b.length == 1) {
            b = '0' + b;
        }

        return '#' + r + g + b;
    }

    // sRGB to Linear RGB
    static sRGB_RGB(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
        g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
        b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

        return [r, g, b];
    }

    // Linear RGB to sRGB
    static RGB_sRGB(r, g, b) {
        r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055) : r = (r * 12.92);
        g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055) : g = (g * 12.92);
        b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055) : b = (b * 12.92);

        r *= 255;
        g *= 255;
        b *= 255;

        return [r, g, b];
    }

    // Linear RGB to XYZ
    static RGB_XYZ(r, g, b, white) {
        white = white || ToaruConverter.D65;

        let x = (r * 0.41239079926595) + (g * 0.35758433938387) + (b * 0.18048078840183);
        let y = (r * 0.21263900587151) + (g * 0.71516867876775) + (b * 0.072192315360733);
        let z = (r * 0.019330818715591) + (g * 0.11919477979462) + (b * 0.95053215224966);

        x *= white[0];
        y *= white[1];
        z *= white[2];

        return [x, y, z];
    }

    // XYZ to Linear RGB
    static XYZ_RGB(x, y, z, white) {
        white = white || ToaruConverter.D65;

        x /= white[0];
        y /= white[1];
        z /= white[2];

        // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
        let r = (x * 3.240969941904521) + (y * -1.537383177570093) + (z * -0.498610760293);
        let g = (x * -0.96924363628087) + (y * 1.87596750150772) + (z * 0.041555057407175);
        let b = (x * 0.055630079696993) + (y * -0.20397695888897) + (z * 1.056971514242878);

        return [r, g, b];
    }

    // XYZ to L*a*b*
    static XYZ_Lab(x, y, z, white) {
        white = white || ToaruConverter.D65;

        x /= white[0];
        y /= white[1];
        z /= white[2];

        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

        let l = (116 * y) - 16;
        let a = 500 * (x - y);
        let b = 200 * (y - z);

        return [l, a, b];
    }

    // L*a*b* to XYZ
    static Lab_XYZ(l, a, b, white) {
        white = white || ToaruConverter.D65;

        let fy = (l + 16) / 116;
        let fx = a / 500 + fy;
        let fz = fy - b / 200;

        const cbrt_epsilon = Math.pow(0.008856, 1/3);

        let x = fx > cbrt_epsilon ? Math.pow(fx, 3) : (116 * fx - 16) / 903.3;
        let y = l > 903.3 * 0.008856 ? Math.pow((l + 16) / 116, 3) : l / 903.3;
        let z = fz > cbrt_epsilon ? Math.pow(fz, 3) : (116 * fz - 16) / 903.3;

        x *= white[0];
        y *= white[1];
        z *= white[2];

        return [x, y, z];
    }

    // L*a*b to Lch
    static Lab_Lch(l, a, b) {
        let c = Math.hypot(a, b);
        let h = Math.atan2(b, a) * 180 / Math.PI;
        if(h < 0) {
            h += 360;
        }
        return [l, c, h];
    }

    // Lch to L*a*b*
    static Lch_Lab(l, c, h) {
        let hr = h * Math.PI / 180;
        let a = c * Math.cos(hr);
        let b = c * Math.sin(hr);
        return [l, a, b];
    }

    // Lch to sRGB
    static Lch_sRGB(l, c, h, whitepoint) {
        let a, b, x, y, z, r, g;
        [l, a, b] = ToaruConverter.Lch_Lab(l, c, h);
        [x, y, z] = ToaruConverter.Lab_XYZ(l, a, b, whitepoint);
        [r, g, b] = ToaruConverter.XYZ_RGB(x, y, z, whitepoint);
        return ToaruConverter.RGB_sRGB(r, g, b);
    }

    // sRGB to Lch
    static sRGB_Lch(r, g, b, whitepoint) {
        let x, y, z, l, a;
        [r, g, b] = ToaruConverter.sRGB_RGB(r, g, b);
        [x, y, z] = ToaruConverter.RGB_XYZ(r, g, b, whitepoint);
        [l, a, b] = ToaruConverter.XYZ_Lab(x, y, z, whitepoint);
        return ToaruConverter.Lab_Lch(l, a, b);
    }
}
