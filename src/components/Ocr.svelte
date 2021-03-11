<script lang="ts">
    import OcrResultTable from './OcrResultTable.svelte';

    import { createEventDispatcher, onMount } from 'svelte';

    import papaparse from 'papaparse';
    import { createWorker, OEM, PSM } from 'tesseract.js';
    import { FormatBase } from '../format';

    const defaultFormat = new FormatBase({
        nextRowOffset: 150,
        rowWidth: 290,
        rowHeight: 30,
        startX: 589,
        startY: 76,
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

    const dispatch = createEventDispatcher();
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
        textArea.style.position = 'absolute';
        textArea.style.left = '0';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setTimeout(() => {
            copyingCsvStr = undefined;
        }, 2000);
    }

    function handleRestart() {
        dispatch('restart');
    }

    $: {
        progress = Math.round((currentRow / totalRows) * 100);
    }
</script>

<div>
    <div class="status">
        <div class="progress-bar">
            <div class="progress-bar__inner" data-progress={progress} style="width: {progress}%" />
            <span class="progress-bar__progress">{progress === 0 ? 'Loading...' : `${progress}%`}</span>
        </div>
        <button
            class="btn-copy-as-csv"
            type="button"
            on:click={handleCopyAsCsv}
            disabled={progress !== 100 || !!copyingCsvStr}>{!!copyingCsvStr ? 'Copied!' : 'Copy as CSV'}</button
        >
        <button type="button" on:click={handleRestart} disabled={progress !== 100}>Restart</button>
    </div>
    <img
        class="ocr-target"
        src={imageUrl}
        on:load={handleOcrImageLoaded}
        on:error={handleOcrImageLoadError}
        alt="OCR target"
    />
    <div class="ocr-process-preview">
        <div>OCR Process</div>
        <canvas id="canvas" class="process-canvas" bind:this={canvas} />
    </div>

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

    .ocr-process-preview {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .process-canvas {
        width: 40%;
        min-width: 200px;
        margin-left: 10px;
    }

    .results {
        display: grid;
        grid-template-columns: auto auto;
        column-gap: 10px;
    }

    .btn-copy-as-csv {
        margin-right: 10px;
        background-color: #37dea5;
        color: #282a36;

        &:active {
            background-color: scale-color(#37dea5, $lightness: -30%);
        }

        &:focus {
            outline: none;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
    }
</style>
