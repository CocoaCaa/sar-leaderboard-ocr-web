<script lang="ts">
    import { onMount } from 'svelte';

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

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rows: { id: string; kills: string }[] = [];
    let isProcessing = true;

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

            for (let i = 0; i < 64; i++) {
                defaultFormat.writeImage(canvas, ctx, img, i);
                const {
                    data: { text },
                } = await worker.recognize(canvas.toDataURL());
                const [id, kills] = text.trim().split(' ');
                rows = rows.concat({
                    id,
                    kills,
                });
            }
        } finally {
            worker.terminate();
            isProcessing = false;
        }
    }

    function handleOcrImageLoadError(err) {
        console.error(err);
        isProcessing = false;
    }
</script>

<div>
    <img
        class="ocr-target"
        src={imageUrl}
        on:load={handleOcrImageLoaded}
        on:error={handleOcrImageLoadError}
        alt="OCR target"
    />
    <canvas id="canvas" class="process-canvas" class:process-canvas--show={isProcessing} bind:this={canvas} />
    <table class="result-table">
        <thead>
            <th>#</th>
            <th>ID</th>
            <th>Kills</th>
        </thead>
        <tbody>
            {#each rows as row, idx}
                <tr class="result-table__row">
                    <td>{idx + 1}</td>
                    <td>{row.id}</td>
                    <td>{row.kills}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
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

    .result-table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
            padding: 5px 10px;
        }

        th {
            text-align: left;
            color: #fff;
            background-color: #de5f33;

            &:nth-child(odd) {
                background-color: scale-color(#de5f33, $lightness: -20%);
            }
        }
    }

    .result-table__row {
        &:nth-child(odd) {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }
</style>
