'use strict';

class ToaruConverter {

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

    // sRGB to L*a*b*
    // https://github.com/antimatter15/rgb-lab
    static sRGB_Lab(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

        x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
    }

    // L*a*b* to sRGB
    // https://github.com/antimatter15/rgb-lab
    static Lab_sRGB(l_, a_, b_) {
        let y = (l_ + 16) / 116;
        let x = a_ / 500 + y;
        let z = y - b_ / 200;

        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

        let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
        let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
        let b = x *  0.0557 + y * -0.2040 + z *  1.0570;

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

        return [r * 255, g * 255, b * 255];
    }

    // L*a*b* to Lch
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

    // sRGB to Lch
    static sRGB_Lch(r, g, b) {
        let [l_, a_, b_] = ToaruConverter.sRGB_Lab(r, g, b);
        return ToaruConverter.Lab_Lch(l_, a_, b_);
    }

    // Lch to sRGB
    static Lch_sRGB(l, c, h) {
        let [l_, a_, b_] = ToaruConverter.Lch_Lab(l, c, h);
        return ToaruConverter.Lab_sRGB(l_, a_, b_);
    }

}
