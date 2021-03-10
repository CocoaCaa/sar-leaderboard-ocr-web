import './styles.css';

import { createWorker, OEM, PSM } from 'tesseract.js';
import { FormatBase } from './format/base';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const output = document.querySelector<HTMLTextAreaElement>('#output')!;
const ctx = canvas.getContext('2d')!;

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

document.querySelector<HTMLFormElement>('#main-form')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.target as HTMLFormElement);
    const file = formData.get('file') as File;

    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789',
    });

    const img = new Image();
    img.onload = async function () {
        for (let i = 0; i < 64; i++) {
            defaultFormat.writeImage(canvas, ctx, img, i);
            const {
                data: { text },
            } = await worker.recognize(canvas.toDataURL());
            output.textContent += `${text.trim().split(' ').join(',')}\n`;
        }
        await worker.terminate();
    };
    img.src = URL.createObjectURL(file);
});
