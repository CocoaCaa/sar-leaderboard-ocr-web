<script lang="ts">
    import { onMount } from 'svelte';

    import { createWorker, OEM, PSM } from 'tesseract.js';
    import { FormatBase } from '../format';
    import type { GetPlayerRow, OcrInput, PlayerRawRow, PlayerRow } from '../types';
    import papaparse from 'papaparse';

    interface OutputRound {
        rank: number | null;
        kills: number | null;
    }

    interface OutputRow {
        name: string;
        rounds: OutputRound[];
    }

    const defaultFormat = new FormatBase({
        nextRowOffset: 150,
        rowWidth: 290,
        rowHeight: 30,
        startX: 589,
        startY: 76,
        maskStartX: 45,
        maskWidth: 190,
        scaleUp: 8,
        threshold: 110,
    });

    export let inputs: OcrInput[];
    let currentInput: OcrInput;
    let currentIdx = 0;
    let outputs: OutputRow[] = [];

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    onMount(() => {
        ctx = canvas.getContext('2d');
        defaultFormat.updateCanvasSize(canvas);
        currentInput = inputs[currentIdx];
    });

    async function handleOcrImageLoaded(ev: Event) {
        const img = ev.target as HTMLImageElement;

        const playersPauseResult = papaparse.parse<GetPlayerRow>(currentInput.players, {
            delimiter: '    ',
            header: true,
        });
        if (playersPauseResult.errors.length > 0) {
            console.error(playersPauseResult.errors);
            return;
        }
        const players = playersPauseResult.data;

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

            const totalRows = 64;
            // const rawRows: PlayerRawRow[] = [];
            for (let currentRankIdx = 0; currentRankIdx < totalRows; currentRankIdx++) {
                defaultFormat.writeImage(canvas, ctx, img, currentRankIdx);
                const {
                    data: { text },
                } = await worker.recognize(canvas.toDataURL());
                const [id, kills] = text.trim().split(' ');
                const name = players.find((p) => p.pID === id)?.Player ?? 'Unknown';
                console.log(`Processing round ${currentIdx + 1} row ${currentRankIdx}`, id, kills, name);
                const existsRowIdx = outputs.findIndex((row) => row.name === name);
                const row =
                    existsRowIdx === -1
                        ? {
                              name,
                              rounds: Array(inputs.length)
                                  .fill(null)
                                  .map(() => ({
                                      rank: null,
                                      kills: null,
                                  })),
                          }
                        : outputs[existsRowIdx];

                row.rounds[currentIdx].rank = currentRankIdx + 1;
                row.rounds[currentIdx].kills = kills;
                if (existsRowIdx === -1) {
                    outputs = outputs.concat(row);
                } else {
                    const copyOutputs = [...outputs];
                    copyOutputs[existsRowIdx] = row;
                    outputs = copyOutputs;
                }
                // rawRows.push({
                //     rank: currentRow + 1,
                //     id,
                //     kills: Number(kills),
                // });
            }

            // const rows: PlayerRow[] = rawRows.map((rawRow) => ({
            //     ...rawRow,
            //     name: players.find((p) => p.pID === rawRow.id)?.Player ?? 'Unknown',
            // }));

            // console.log(rows);

            currentIdx += 1;
            currentInput = inputs[currentIdx];
            if (!currentInput) {
                console.log('Finished!');
            }
        } finally {
            worker.terminate();
        }
    }

    function handleOcrImageLoadError(err) {
        console.error(err);
    }
</script>

<div>
    {#if currentInput}
        <img
            class="ocr-target"
            src={currentInput.imageUrl}
            on:load={handleOcrImageLoaded}
            on:error={handleOcrImageLoadError}
            alt="OCR target"
        />
    {/if}
    <div class="ocr-process-preview">
        <div>OCR Process</div>
        <canvas id="canvas" class="process-canvas" bind:this={canvas} />
    </div>
    <table>
        <thead>
            <tr>
                <td>Name</td>
                {#each inputs as input, idx}
                    <td class:result-column--odd={idx % 2 === 1}>{`R${idx + 1} rank`}</td>
                    <td class:result-column--odd={idx % 2 === 1}>{`R${idx + 1} kills`}</td>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each outputs as row}
                <tr>
                    <td>{row.name}</td>
                    {#each inputs as input, idx}
                        <td class:result-column--odd={idx % 2 === 1}>{row.rounds[idx].rank}</td>
                        <td class:result-column--odd={idx % 2 === 1}>{row.rounds[idx].kills}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
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

    .result-column--odd {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>
