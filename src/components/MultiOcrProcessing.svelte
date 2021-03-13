<script lang="ts">
    import papaparse from 'papaparse';
    import { flatten } from 'ramda';
    import { createEventDispatcher, onMount } from 'svelte';

    import { createWorker, OEM, PSM } from 'tesseract.js';
    import { Csv } from '../csv';
    import { FormatBase } from '../format';
    import type { GetPlayerRow, OcrInput } from '../types';

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
        scaleUp: 3.5,
        threshold: 100,
        totalRows: 64,
    });

    const singleRowFormat = new FormatBase({
        nextRowOffset: 150,
        rowWidth: 290,
        rowHeight: 30,
        startX: 802,
        startY: 76,
        maskStartX: 45,
        maskWidth: 190,
        scaleUp: 3,
        threshold: 90,
        totalRows: 32,
    });

    const dispatch = createEventDispatcher();

    export let inputs: OcrInput[];
    let currentInput: OcrInput;
    let currentIdx = 0;
    let currentFormat: FormatBase = defaultFormat;
    let outputs: OutputRow[] = [];
    let isFinished = false;
    let isDownloadingCsv = false;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let currentRankIdx;
    let progress = 0;
    let subProgress = 0;

    onMount(() => {
        ctx = canvas.getContext('2d');
        currentInput = inputs[currentIdx];
        currentFormat = currentInput.isSingleColumn ? singleRowFormat : defaultFormat;
        currentFormat.updateCanvasSize(canvas);
    });

    function getHighestRank(rounds: OutputRound[]) {
        return Math.min(...rounds.filter((r) => r.rank !== null).map((r) => r.rank));
    }

    function getTotalKills(rounds: OutputRound[]) {
        return rounds.map((r) => r.kills ?? 0).reduce((acc, cur) => acc + cur, 0);
    }

    async function handleOcrImageLoaded(ev: Event) {
        const img = ev.target as HTMLImageElement;

        const playersPauseResult = Csv.parsePlayers(currentInput.players);
        if (playersPauseResult.errors.length > 0) {
            console.error(playersPauseResult.errors);
            return;
        }
        const players = playersPauseResult.data;

        let worker: Tesseract.Worker;
        try {
            worker = createWorker({ langPath: '/' });
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            await worker.setParameters({
                tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
                tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
                tessedit_char_whitelist: '0123456789',
            });

            for (currentRankIdx = 0; currentRankIdx < currentFormat.totalRows; currentRankIdx++) {
                currentFormat.writeImage(canvas, ctx, img, currentRankIdx);
                const {
                    data: { text },
                } = await worker.recognize(canvas.toDataURL());
                const [id, kills] = text.trim().split(' ');
                const playerRow = players.find((p) => p.pID === id);
                if (!playerRow) {
                    continue;
                }
                if (!playerRow.PlayfabID && !currentInput.isIncludeBots) {
                    continue;
                }
                const name = playerRow.Player ?? 'Unknown';
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
                row.rounds[currentIdx].kills = Number(kills);
                if (existsRowIdx === -1) {
                    outputs = outputs.concat(row);
                } else {
                    const copyOutputs = [...outputs];
                    copyOutputs[existsRowIdx] = row;
                    outputs = copyOutputs;
                }
            }

            if (currentIdx >= inputs.length - 1) {
                isFinished = true;
                return;
            }
            currentIdx += 1;
            currentInput = inputs[currentIdx];
            currentFormat = currentInput.isSingleColumn ? singleRowFormat : defaultFormat;
        } finally {
            worker.terminate();
        }
    }

    function handleOcrImageLoadError(err) {
        console.error(err);
    }

    function handleDownloadAsCsv() {
        isDownloadingCsv = true;

        const csvRows = outputs.map((o) => ({
            name: o.name,
            ...o.rounds.reduce<Record<string, number>>((acc, cur, idx) => {
                acc[`round_${idx + 1}_rank`] = cur.rank;
                acc[`round_${idx + 1}_kills`] = cur.kills;
                return acc;
            }, {}),
            highest_rank: getHighestRank(o.rounds),
            total_kills: getTotalKills(o.rounds),
        }));
        const csvStr = papaparse.unparse(csvRows, {
            header: true,
            columns: [
                'name',
                ...flatten(inputs.map((_, idx) => [`round_${idx + 1}_rank`, `round_${idx + 1}_kills`])),
                'highest_rank',
                'total_kills',
            ],
        });
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(csvStr)}`);
        element.setAttribute('download', 'sar-result.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        setTimeout(() => {
            isDownloadingCsv = false;
        }, 2000);
    }

    function handleRestart() {
        dispatch('restart');
    }

    $: {
        progress = isFinished ? 100 : (currentIdx / inputs.length) * 100;
        subProgress = (currentRankIdx / currentFormat.totalRows) * 100;
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
    <div class="status">
        <div class="progress-bar">
            <div class="progress-bar__inner" data-progress={progress} style="width: {progress}%" />
            <div class="progress-bar__inner-sub" style="width: {subProgress}%" />
            <span class="progress-bar__progress">{currentIdx + 1}/{inputs.length}</span>
        </div>
        <button
            class="btn-download-as-csv btn-success"
            type="button"
            on:click={handleDownloadAsCsv}
            disabled={!isFinished || !!isDownloadingCsv}
            >{!!isDownloadingCsv ? 'Downloading...' : 'Download as CSV'}</button
        >
        <button type="button" on:click={handleRestart} disabled={!isFinished}>Restart</button>
    </div>
    <div class="ocr-process-preview">
        <div>OCR Process</div>
        <canvas id="canvas" class="process-canvas" bind:this={canvas} />
    </div>
    <div class="result-table-scroll-view">
        <table class="result-table">
            <thead>
                <tr>
                    <th class="result-table__heading-name" rowspan="2">Name</th>
                    {#each inputs as input, idx}
                        <th colspan="2" class:result-column--odd={idx % 2 === 1}>{`Round ${idx + 1}`}</th>
                    {/each}
                    <th colspan="2" class:result-column--odd={inputs.length % 2 === 1}>Final</th>
                </tr>
                <tr>
                    {#each inputs as input, idx}
                        <th class:result-column--odd={idx % 2 === 1}>Rank</th>
                        <th class:result-column--odd={idx % 2 === 1}>Kills</th>
                    {/each}
                    <th>Highest Rank</th>
                    <th>Total Kills</th>
                </tr>
            </thead>
            <tbody>
                {#each outputs as row}
                    <tr>
                        <td>{row.name}</td>
                        {#each inputs as input, idx}
                            <td class:result-column--odd={idx % 2 === 1}>{row.rounds[idx].rank ?? 'N / A'}</td>
                            <td class:result-column--odd={idx % 2 === 1}>{row.rounds[idx].kills ?? 'N / A'}</td>
                        {/each}
                        <td class:result-column--odd={inputs.length % 2 === 1}>{getHighestRank(row.rounds)}</td>
                        <td class:result-column--odd={inputs.length % 2 === 1}>{getTotalKills(row.rounds)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style lang="scss">
    .status {
        display: flex;
        margin-bottom: 10px;
    }

    .btn-download-as-csv {
        margin-right: 10px;
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

    .progress-bar__inner-sub {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        background-color: #f0ec00;
        transition: 200ms linear;
    }

    .progress-bar__progress {
        position: relative;
        font-weight: bold;
        border-radius: 100px;
        line-height: 1;
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

    .result-table-scroll-view {
        overflow-x: auto;
    }

    .result-table {
        min-width: 100%;
        border-collapse: collapse;

        th,
        td {
            padding: 5px 10px;
        }

        th {
            white-space: nowrap;
            text-align: left;
            color: #fff;
            background-color: #de5f33;

            &.result-column--odd,
            &.result-table__heading-name {
                background-color: scale-color(#de5f33, $lightness: -20%);
            }
        }
    }

    .result-column--odd {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>
