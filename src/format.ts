export class FormatBase {
    private nextRowOffset: number;
    private rowWidth: number;
    private rowHeight: number;
    private startX: number;
    private startY: number;
    private maskStartX: number;
    private maskWidth: number;
    private scaleUp: number;
    private threshold: number;
    private _totalRows: number;

    public get totalRows() {
        return this._totalRows;
    }

    constructor(params: {
        nextRowOffset: number;
        rowWidth: number;
        rowHeight: number;
        startX: number;
        startY: number;
        maskStartX: number;
        maskWidth: number;
        scaleUp: number;
        threshold: number;
        totalRows: number;
    }) {
        this.nextRowOffset = params.nextRowOffset;
        this.rowWidth = params.rowWidth;
        this.rowHeight = params.rowHeight;
        this.startX = params.startX;
        this.startY = params.startY;
        this.maskStartX = params.maskStartX;
        this.maskWidth = params.maskWidth;
        this.scaleUp = params.scaleUp;
        this.threshold = params.threshold;
        this._totalRows = params.totalRows;
    }

    updateCanvasSize(canvas: HTMLCanvasElement) {
        canvas.width = this.rowWidth * this.scaleUp;
        canvas.height = this.rowHeight * this.scaleUp;
    }

    writeImage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement, idx: number) {
        const yIdx = idx % 32;
        const xOffset = (idx >= 32 ? this.rowWidth + this.nextRowOffset : 0) * this.scaleUp;
        const yOffset = this.rowHeight * this.scaleUp * yIdx;

        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(
            img,
            -this.startX * this.scaleUp - xOffset,
            -this.startY * this.scaleUp - yOffset,
            img.width * this.scaleUp,
            img.height * this.scaleUp,
        );
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const d = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < d.data.length; i += 4) {
            d.data[i] = d.data[i + 1] = d.data[i + 2] = d.data[i + 1] > this.threshold ? 255 : 0;
        }

        ctx.putImageData(d, 0, 0);

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(this.maskStartX * this.scaleUp, 0, this.maskWidth * this.scaleUp, canvas.height);
    }
}
