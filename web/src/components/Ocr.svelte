<script lang="ts">
    import OcrResultTable from './OcrResultTable.svelte';

    import { onMount } from 'svelte';

    import papaparse from 'papaparse';
    import { createWorker, OEM, PSM } from 'tesseract.js';
    import { FormatBase } from '../format';

    const defaultFormat = new FormatBase({
        nextRowOffset: 150,
        rowWidth: 290,
        rowHeight: 30,
        startX: 589,
        startY: 106,
        maskStartX: 45,
        maskWidth: 190,
        scaleUp: 5,
        threshold: 128,
    });

    const szFormat = new FormatBase({
        nextRowOffset: 98,
        rowWidth: 200,
        rowHeight: 20,
        startX: 41,
        startY: 32,
        maskStartX: 30,
        maskWidth: 134,
        scaleUp: 10,
        threshold: 132,
    });

    export let imageUrl: string;

    const totalRows = 64;
    let currentRow = 0;
    let progress = 0;
    let copyingCsvStr: string;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rows: { rank: number; id: string; kills: string }[] = [];

    onMount(() => {
        ctx = canvas.getContext('2d');
        defaultFormat.updateCanvasSize(canvas);
    });

    async function handleOcrImageLoaded(ev: Event) {
        const img = ev.target as HTMLImageElement;
        let worker: Tesseract.Worker;
        try {
            worker = createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            await worker.setParameters({
                tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
                tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
                tessedit_char_whitelist: '0123456789',
            });

            for (currentRow = 0; currentRow < totalRows; currentRow++) {
                defaultFormat.writeImage(canvas, ctx, img, currentRow);
                const {
                    data: { text },
                } = await worker.recognize(canvas.toDataURL());
                const [id, kills] = text.trim().split(' ');
                rows = rows.concat({
                    rank: currentRow + 1,
                    id,
                    kills,
                });
            }
        } finally {
            worker.terminate();
        }
    }

    function handleOcrImageLoadError(err) {
        console.error(err);
    }

    function handleCopyAsCsv() {
        copyingCsvStr = papaparse.unparse(rows);
        const textArea = document.createElement('textarea');
        textArea.value = copyingCsvStr;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setTimeout(() => {
            copyingCsvStr = undefined;
        }, 2000);
    }

    $: {
        progress = Math.round((currentRow / totalRows) * 100);
    }
</script>

<div>
    <div class="status">
        <div class="progress-bar">
            <div class="progress-bar__inner" data-progress={progress} style="width: {progress}%" />
            <span class="progress-bar__progress">{progress}%</span>
        </div>
        <button type="button" on:click={handleCopyAsCsv} disabled={progress !== 100 || !!copyingCsvStr}
            >{!!copyingCsvStr ? 'Copied!' : 'Copy as CSV'}</button
        >
    </div>
    <img
        class="ocr-target"
        src={imageUrl}
        on:load={handleOcrImageLoaded}
        on:error={handleOcrImageLoadError}
        alt="OCR target"
    />
    <canvas id="canvas" class="process-canvas" bind:this={canvas} />

    <div class="results">
        <OcrResultTable rows={rows.slice(0, 32)} />
        <OcrResultTable rows={rows.slice(32)} />
    </div>
</div>

<style lang="scss">
    .status {
        display: flex;
        margin-bottom: 10px;
    }

    .progress-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        margin-right: 10px;
        flex: 1;
        border-radius: 100px;
        overflow: hidden;
    }

    .progress-bar__inner {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        height: 100%;
        background-color: #00f082;
        transition: 200ms linear;

        &[data-progress='100'] {
            background-color: #00f0dd;
        }
    }

    .progress-bar__progress {
        position: relative;
        font-weight: bold;
        background-color: #282a36;
        padding: 5px 10px;
        border-radius: 100px;
        line-height: 1;
        width: 65px;
        text-align: center;
    }

    .ocr-target {
        display: none;
    }

    .process-canvas {
        display: none;
        width: 100%;
    }

    .process-canvas--show {
        display: block;
    }

    .results {
        display: grid;
        grid-template-columns: 50% 50%;
        column-gap: 10px;
    }

    .copy-textarea {
        width: 0.1px;
        height: 0.1px;
        background-color: transparent;
        overflow: hidden;
        opacity: 0.01;
        pointer-events: none;
    }
</style>
