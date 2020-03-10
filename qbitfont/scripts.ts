type QbitfontDesignerConfig = {
    ascent?: number;
    height?: number;
    left?: number;
    width?: number;
    glyphList?: number[];
    cellSize?: number;
    refFont?: string;
    refSize?: number;
};

type GlyphJSON = {
    bbx: [number, number, number, number];
    bitmap: number[][];
};

class QbitfontDesigner {
    ascent = 15;
    height = 19;
    left = -4;
    width = 32;
    glyphList = [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 65533];
    cellSize = 24;
    refFont = "Noto Sans";
    refWeight = "bold";
    refSize = 10 / 0.714;

    ucs = 65;
    qpx: 0 | 1 | 2 | 3 = 0;
    glyphs = new Map<number, Glyph>();
    designCell = new Map<number, Map<number, HTMLTableCellElement>>();
    blueprint: HTMLCanvasElement;
    charmapCell = new Map<number, HTMLTableCellElement>();
    previewCanvas: HTMLCanvasElement[] = [];

    private glyphIdx(): number {
        return (this.ucs << 2) | this.qpx;
    }
    private onQpxChange(qpx: 0 | 1 | 2 | 3): void {
        this.qpx = qpx;
        (document.getElementById("qpx0") as HTMLInputElement).disabled = qpx === 0;
        (document.getElementById("qpx1") as HTMLInputElement).disabled = qpx === 1;
        (document.getElementById("qpx2") as HTMLInputElement).disabled = qpx === 2;
        (document.getElementById("qpx3") as HTMLInputElement).disabled = qpx === 3;
        for (let [k, v] of this.charmapCell) {
            if (k === this.ucs) {
                v.classList.add("selected");
                v.classList.remove("available");
            } else if (this.glyphs.has((k << 2) | this.qpx)) {
                v.classList.add("available");
                v.classList.remove("selected");
            } else {
                v.classList.remove("available");
                v.classList.remove("selected");
            }
        }
        this.updateBlueprint();
        this.refreshDesign();
        this.generateJSON();
        this.updatePreview();
    }
    private loadJSON(): void {
        try {
            const jsonText = (document.getElementById("json-panel") as HTMLTextAreaElement).value;
            const json = JSON.parse(jsonText);
            for (let key in json) {
                const idx = +key | 0;
                if (idx.toString() !== key.toString()) {
                    throw Error(`invalid key "${key}"`);
                }
                this.glyphs.set((idx << 2) | this.qpx, Glyph.fromJSON(json[key]));
            }
            this.refreshDesign();
            this.updatePreview();
            window.alert("JSON loaded successfully.");
        } catch (e) {
            window.alert(`Error ${e}`);
            throw e;
        }
    }
    private onDesignCellChange(td: HTMLTableCellElement, y: number, x: number, ev: MouseEvent): void {
        const fill = (ev.buttons & 3) === 1;
        const clear = (ev.buttons & 3) === 2;
        if (!fill && !clear) {
            return;
        }
        if (!this.glyphs.has(this.glyphIdx())) {
            this.glyphs.set(this.glyphIdx(), new Glyph(0, 0, 0, 0));
        }
        this.glyphs.get(this.glyphIdx())!.setPixel(x, y, fill);
        if (fill) {
            td.classList.add("filled");
        } else {
            td.classList.remove("filled");
        }
    }
    private onCharmapCellChange(ucs: number, ev: MouseEvent): void {
        if ((ev.buttons & 1) === 0) {
            return;
        }
        this.ucs = ucs;
        for (let [k, v] of this.charmapCell) {
            if (k === ucs) {
                v.classList.add("selected");
                v.classList.remove("available");
            } else if (this.glyphs.has((k << 2) | this.qpx)) {
                v.classList.add("available");
                v.classList.remove("selected");
            } else {
                v.classList.remove("available");
                v.classList.remove("selected");
            }
        }
        this.updateBlueprint();
        this.refreshDesign();
        this.generateJSON();
        this.updatePreview();
    }
    private refreshDesign(): void {
        for (let y = this.ascent - 1; y > this.ascent - 1 - this.height; y--) {
            for (let x = this.left; x < this.left + this.width; x++) {
                if (this.glyphs.get(this.glyphIdx())?.getPixel(x, y)) {
                    this.designCell.get(y)!.get(x)!.classList.add("filled");
                } else {
                    this.designCell.get(y)!.get(x)!.classList.remove("filled");
                }
            }
        }
    }
    private updateBlueprint(): void {
        const blueprint = document.getElementById("blueprint") as HTMLCanvasElement;
        blueprint.width = this.cellSize * this.width;
        blueprint.height = this.cellSize * this.height;
        const ctx = blueprint.getContext("2d");
        if (ctx === null) {
            throw Error("can not get canvas context");
        }
        const str = String.fromCodePoint(this.ucs);
        ctx.font = `${this.refWeight} ${this.refSize * this.cellSize}px '${this.refFont}'`;
        ctx.strokeText(str, -this.cellSize * this.left + this.qpx * 6, this.cellSize * this.ascent);
    }
    private generateJSON(): void {
        let json: { [idx: number]: GlyphJSON; } = {};
        for (let [idx, glyph] of this.glyphs) {
            if ((idx & 3) !== this.qpx) {
                continue;
            }
            const glyphJSON = glyph.toJSON();
            if (glyphJSON === null) {
                continue;
            }
            json[idx >> 2] = glyphJSON;
        }
        const jsonText = JSON.stringify(json, null, 2);
        (document.getElementById("json-panel") as HTMLTextAreaElement).value = jsonText;
    }
    private updatePreview(): void {
        const testText = (document.getElementById("test-text") as HTMLInputElement).value;
        const canvas0 = this.previewCanvas[0];
        const ctx0 = canvas0.getContext("2d");
        if (ctx0 === null) {
            throw Error("can not get canvas context");
        }
        const totalWidth = Math.ceil(this.measureGlyphOffset(ctx0, testText) * this.refSize) | 0;

        for (let zoom = 1; zoom <= this.previewCanvas.length; zoom++) {
            const canvas = this.previewCanvas[zoom - 1];
            canvas.width = totalWidth * zoom;
            canvas.height = this.height * zoom;
            const ctx = canvas.getContext("2d");
            if (ctx === null) {
                throw Error("can not get canvas context");
            }

            let previousText = "";
            for (let cp of testText) {
                const offset = this.measureGlyphOffset(ctx, previousText, cp);
                const offsetQpx = Math.round(offset * this.refSize * 4) | 0;
                const offsetPx = offsetQpx >> 2;
                const glyphIdx = ((cp.codePointAt(0) ?? 0) << 2) | (offsetQpx & 3);
                ctx.save();
                if (this.glyphs.has(glyphIdx)) {
                    ctx.fillStyle = "#000000";
                    this.glyphs.get(glyphIdx)!.drawToCanvas(ctx, offsetPx, this.ascent, zoom);
                } else if (cp !== " ") {
                    ctx.fillStyle = ["#f79494", "#b4b463", "#7ec07d", "#abaaf9"][offsetQpx & 3];
                    ctx.fillRect(offsetPx * zoom, 0, zoom, this.height * zoom);
                }
                ctx.restore();
                previousText += cp;
            }
        }
    }
    private measureGlyphOffset(ctx: CanvasRenderingContext2D, previousText: string, nextGlyph?: string): number {
        ctx.save();
        const em = 1000;
        ctx.font = `${this.refWeight} ${em}px '${this.refFont}'`;
        const totalMeasure = ctx.measureText(previousText + (nextGlyph ?? ""));
        const nextMeasure = ctx.measureText(nextGlyph ?? "");
        ctx.restore();
        return ((totalMeasure.actualBoundingBoxRight ?? totalMeasure.width) - (nextMeasure.actualBoundingBoxRight ?? nextMeasure.width)) / em;
    }
    constructor(config: QbitfontDesignerConfig) {
        this.ascent = config.ascent ?? this.ascent;
        this.height = config.height ?? this.height;
        this.left = config.left ?? this.left;
        this.width = config.width ?? this.width;
        this.glyphList = config.glyphList ?? this.glyphList;
        this.cellSize = config.cellSize ?? this.cellSize;
        this.refFont = config.refFont ?? this.refFont;
        this.refSize = config.refSize ?? this.refSize;

        document.getElementById("qpx0")!.addEventListener("click", this.onQpxChange.bind(this, 0));
        document.getElementById("qpx1")!.addEventListener("click", this.onQpxChange.bind(this, 1));
        document.getElementById("qpx2")!.addEventListener("click", this.onQpxChange.bind(this, 2));
        document.getElementById("qpx3")!.addEventListener("click", this.onQpxChange.bind(this, 3));
        document.getElementById("clear-glyph")!.addEventListener("click", () => {
            if (window.confirm("Are you sure to clear this glyph?")) {
                this.glyphs.delete(this.glyphIdx());
                this.refreshDesign();
                this.generateJSON();
            }
        });
        document.getElementById("load-json")!.addEventListener("click", this.loadJSON.bind(this));

        this.blueprint = document.createElement("canvas");
        this.blueprint.id = "blueprint";
        document.getElementById("design-panel")!.appendChild(this.blueprint);
        this.updateBlueprint();

        const designTable = document.createElement("table");
        designTable.addEventListener("contextmenu", ev => {
            ev.preventDefault();
            ev.stopPropagation();
        });
        for (let y = this.ascent - 1; y > this.ascent - 1 - this.height; y--) {
            const tr = document.createElement("tr");
            this.designCell.set(y, new Map());
            for (let x = this.left; x < this.left + this.width; x++) {
                const td = document.createElement("td");
                if (x === -1) {
                    td.style.borderRightColor = "#d2341c";
                } else if (x === 0) {
                    td.style.borderLeftColor = "#d2341c";
                }
                if (y === -1) {
                    td.style.borderTopColor = "#d2341c";
                } else if (y === 0) {
                    td.style.borderBottomColor = "#d2341c";
                }
                td.addEventListener("mouseenter", this.onDesignCellChange.bind(this, td, y, x));
                td.addEventListener("mousedown", this.onDesignCellChange.bind(this, td, y, x));
                this.designCell.get(y)!.set(x, td);
                tr.appendChild(td);
            }
            designTable.appendChild(tr);
        }
        document.getElementById("design-panel")!.appendChild(designTable);

        const charmapTable = document.createElement("table");
        for (let row = 0; (row * 8) < this.glyphList.length; row++) {
            const tr = document.createElement("tr");
            for (let col = 0; col < 8 && col < this.glyphList.length; col++) {
                const ucs = this.glyphList[row * 8 + col];
                const td = document.createElement("td");
                if (ucs === this.ucs) {
                    td.classList.add("selected");
                }
                td.innerText = String.fromCodePoint(ucs);
                td.addEventListener("mouseenter", this.onCharmapCellChange.bind(this, ucs));
                td.addEventListener("mousedown", this.onCharmapCellChange.bind(this, ucs));
                this.charmapCell.set(ucs, td);
                tr.appendChild(td);
            }
            charmapTable.appendChild(tr);
        }
        document.getElementById("charmap-panel")!.appendChild(charmapTable);

        this.generateJSON();

        document.getElementById("test-text")!.addEventListener("input", this.updatePreview.bind(this));
        document.getElementById("test-text")!.addEventListener("click", this.updatePreview.bind(this));
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement("canvas");
            this.previewCanvas[i] = canvas;
            document.getElementById("preview-panel")!.appendChild(canvas);
        }
        this.updatePreview();
    }
}

class Glyph {
    buffer: Uint8Array;
    ascent: number;
    height: number;
    left: number;
    width: number;
    stride: number;
    constructor(ascent: number, height: number, left: number, width: number) {
        ascent |= 0;
        height |= 0;
        left |= 0;
        width |= 0;
        if (height < 0) {
            throw RangeError("height < 0");
        }
        if (width < 0) {
            throw RangeError("width < 0");
        }
        const stride = ((width | 7) + 1) | 0;

        this.buffer = new Uint8Array((height * stride) >> 3);
        this.ascent = ascent;
        this.height = height;
        this.left = left;
        this.width = width;
        this.stride = stride;
    }
    public getPixel(x: number, y: number): boolean {
        x |= 0;
        y |= 0;

        const col = (x - (this.left | 0)) | 0;
        const row = ((this.ascent | 0) - 1 - y) | 0;
        if (col < 0 || col >= (this.width | 0) || row < 0 || row >= (this.height | 0)) {
            return false;
        }
        const cell = ((row * (this.stride | 0)) + col) | 0;
        return ((this.buffer[cell >> 3] << (cell & 7)) & 0x80) !== 0;
    }
    public setPixel(x: number, y: number, fill: boolean): this {
        x |= 0;
        y |= 0;
        fill = !!fill;

        let col = (x - (this.left | 0)) | 0;
        let row = ((this.ascent | 0) - 1 - y) | 0;
        if (col < 0) {
            this.resize(this.ascent | 0, this.height | 0, x, ((this.width | 0) - col) | 0);
            col = (x - (this.left | 0)) | 0;
        } else if (col >= (this.width | 0)) {
            this.resize(this.ascent | 0, this.height | 0, this.left | 0, (col + 1) | 0);
        }
        if (row < 0) {
            this.resize((y + 1) | 0, ((this.height | 0) - row) | 0, this.left | 0, this.width | 0);
            row = ((this.ascent | 0) - 1 - y) | 0;
        } else if (row >= (this.height | 0)) {
            this.resize(this.ascent | 0, (row + 1) | 0, this.left | 0, this.width | 0);
        }

        const cell = ((row * (this.stride | 0)) + col) | 0;
        const byte = cell >> 3;
        const bit = cell & 7;
        if (fill) {
            this.buffer[byte] |= (0x80 >> bit);
        } else {
            this.buffer[byte] &= (0x7f7f >> bit);
        }

        return this;
    }
    public resize(ascent: number, height: number, left: number, width: number): this {
        ascent |= 0;
        height |= 0;
        left |= 0;
        width |= 0;
        if (height < 0) {
            throw RangeError("height < 0");
        }
        if (width < 0) {
            throw RangeError("width < 0");
        }
        if (ascent === this.ascent && height === this.height && left === this.left && (((width | 7) + 1) | 0) === this.stride) {
            this.width = width;
            return this;
        }

        const newGlyph = new Glyph(ascent, height, left, width);
        const yMax = ((this.ascent | 0) - 1) | 0;
        const yMin = ((this.ascent | 0) - 1 - (this.height | 0)) | 0;
        const xMin = this.left | 0;
        const xMax = ((this.left | 0) + (this.width | 0)) | 0;
        for (let y = yMax; y > yMin; y--) {
            for (let x = xMin; x < xMax; x++) {
                if (this.getPixel(x, y)) {
                    newGlyph.setPixel(x, y, true);
                }
            }
        }
        this.buffer = newGlyph.buffer;
        this.ascent = ascent;
        this.height = height;
        this.left = left;
        this.width = width;
        this.stride = newGlyph.stride;
        return this;
    }
    public shrink(): this {
        const yMax = ((this.ascent | 0) - 1) | 0;
        const yMin = ((this.ascent | 0) - 1 - (this.height | 0)) | 0;
        const xMin = this.left | 0;
        const xMax = ((this.left | 0) + (this.width | 0)) | 0;

        let top: number | null = null;
        let bottom: number | null = null;
        let left: number | null = null;
        let right: number | null = null;

        for (let y = yMax; y > yMin; y--) {
            for (let x = xMin; x < xMax; x++) {
                if (this.getPixel(x, y)) {
                    if (top === null || y > top) {
                        top = y;
                    }
                    if (bottom === null || y <= bottom) {
                        bottom = (y - 1) | 0;
                    }
                    if (left === null || x < left) {
                        left = x;
                    }
                    if (right === null || x >= right) {
                        right = (x + 1) | 0;
                    }
                }
            }
        }
        if (top === null || bottom === null || left === null || right === null) {
            return this.resize(0, 0, 0, 0);
        }
        return this.resize(((top | 0) + 1) | 0, (top - bottom) | 0, left, (right - left) | 0);
    }
    public toJSON(): GlyphJSON | null {
        this.shrink();
        if (this.width === 0 || this.height === 0) {
            return null;
        }
        let value: GlyphJSON = {
            bbx: [this.width | 0, this.height | 0, this.left | 0, ((this.ascent | 0) - (this.height | 0)) | 0],
            bitmap: []
        };
        for (let y = 0; y < (this.height | 0); y++) {
            let line: number[] = [];
            for (let x = 0; (x << 3) < (this.width | 0); x++) {
                const cell = ((y * (this.stride | 0)) + x) | 0;
                line.push(this.buffer[cell >> 3]);
            }
            value.bitmap.push(line);
        }
        return value;
    }
    public static fromJSON(value: any): Glyph {
        if (typeof value !== "object") {
            throw TypeError("input not an object");
        }
        if (!Array.isArray(value.bbx)) {
            throw TypeError("bbx not an array");
        }
        if (!Array.isArray(value.bitmap)) {
            throw TypeError("bitmap not an array");
        }
        for (let i = 0; i < 4; i++) {
            if (typeof value.bbx[i] !== "number") {
                throw TypeError(`bbx[${i}] not a number`);
            }
        }
        const width = value.bbx[0] | 0;
        const height = value.bbx[1] | 0;
        const left = value.bbx[2] | 0;
        const ascent = ((value.bbx[3] | 0) + height) | 0;
        const glyph = new Glyph(ascent, height, left, width);
        for (let y = 0; y < height; y++) {
            if (!Array.isArray(value.bitmap[y])) {
                throw TypeError(`bitmap[${y}] not an array`);
            }
            for (let x = 0; (x << 3) < width; x++) {
                if (typeof value.bitmap[y][x] !== "number") {
                    throw TypeError(`bitmap[${y}][${x}] not a number`);
                }
                if (value.bitmap[y][x] < 0 || value.bitmap[y][x] >= 256) {
                    throw RangeError(`bitmap[${y}][${x}] out of range`);
                }
                const cell = ((y * (glyph.stride | 0)) + x) | 0;
                glyph.buffer[cell >> 3] = value.bitmap[y][x];
            }
        }
        return glyph;
    }
    public drawToCanvas(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
        const yMax = ((this.ascent | 0) - 1) | 0;
        const yMin = ((this.ascent | 0) - 1 - (this.height | 0)) | 0;
        const xMin = this.left | 0;
        const xMax = ((this.left | 0) + (this.width | 0)) | 0;

        for (let row = yMax; row > yMin; row--) {
            for (let col = xMin; col < xMax; col++) {
                if (this.getPixel(col, row)) {
                    ctx.fillRect((x + col) * scale, (y - 1 - row) * scale, scale, scale);
                }
            }
        }
    }
}
