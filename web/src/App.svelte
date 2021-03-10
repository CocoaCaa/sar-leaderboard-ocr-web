<script lang="ts">
    import { onMount } from 'svelte';

    import { createWorker, OEM, PSM } from 'tesseract.js';
    import { FormatBase } from './format';

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

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let targetOcrFiles: FileList;
    let ocrImage: string;
    let outputCsv = '';
    let isProcessing = false;

    onMount(() => {
        ctx = canvas.getContext('2d');
    });

    function handleOcrFormSubmit() {
        const [targetOcrFile] = targetOcrFiles;
        console.log(targetOcrFile);
        ocrImage = URL.createObjectURL(targetOcrFile);
        isProcessing = true;
    }

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
                outputCsv += `${text.trim().split(' ').join(',')}\n`;
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

<main>
    <h1>SAR Leaderboard OCR</h1>
    <form on:submit|preventDefault={handleOcrFormSubmit}>
        <fieldset disabled={isProcessing}>
            <input type="file" name="file" accept="image/*" bind:files={targetOcrFiles} />
            <button type="submit">Submit</button>
        </fieldset>
    </form>
    <img
        class="ocr-target"
        src={ocrImage}
        on:load={handleOcrImageLoaded}
        on:error={handleOcrImageLoadError}
        alt="OCR target"
    />
    <canvas id="canvas" bind:this={canvas} />
    <textarea id="output" readonly>{outputCsv}</textarea>
</main>

<style>
    .ocr-target {
        display: none;
    }
</style>
