<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { OcrInput } from '../types';
    import MultiOcrLandingInputItem from './MultiOcrLandingInputItem.svelte';

    const dispatch = createEventDispatcher();
    const { isProd } = __process.env;
    export let inputs: OcrInput[];
    export let compareOutput: string | null;
    let isValid = false;

    async function handleUploadCompareOutput(ev: Event) {
        const element = ev.target as HTMLInputElement;
        const [file] = element.files;
        compareOutput = await file.text();
    }

    function handleAddRound() {
        inputs = inputs.concat({ players: '', isIncludeBots: false, isSingleColumn: false, _errors: [] });
    }

    function handleRemoveRound(idx: number) {
        if (inputs.length <= 1) {
            return;
        }
        const copyInputs = [...inputs];
        copyInputs.splice(idx, 1);
        inputs = copyInputs;
    }

    function handleStartProcessing() {
        dispatch('submit');
    }

    $: {
        isValid = inputs.every((input) => !!input.imageUrl && !!input.players && input._errors.length === 0);
    }
</script>

<div>
    <p>
        Using Steam's built-in screenshot feature (output without app bar) is recommended. Image size required is
        1920x1080.
        <a href="/example-input.jpg" target="_blank">Example shown here</a>.
    </p>
    <ul class="input-list">
        {#each inputs as input, idx}
            <MultiOcrLandingInputItem bind:input {idx} on:remove={() => handleRemoveRound(idx)} />
        {/each}
    </ul>
    {#if !isProd}
        <label>Compare output (debug)<input type="file" on:change={handleUploadCompareOutput} /></label>
    {/if}
    <div>
        <button type="button" on:click={handleAddRound} disabled={!isValid}>Add more rounds</button>
        <button class="btn-success" type="button" on:click={handleStartProcessing} disabled={!isValid}
            >Start processing</button
        >
    </div>
    <h2>How does it work?</h2>
    <p>
        It turns screenshots into 64 image rows, applies a negative (inverse colour), a threshold and a scale up to make
        the text cleaner and adds a white background to text in black. It then masks the player's name (since some names
        are so cool, it is diffcult to run OCR). Finally, it will output the ranking, player's in-match ID and kills.
        You could use those data by the in-game command <code>/getplayers</code> (Only available to Match Host) to match
        player names with the data. <strong>Server-side process is not required</strong>, it runs on your browser only.
    </p>
    <p>
        Source code is in
        <a href="https://github.com/minixz/sar-leaderboard-ocr-web" target="_blank"
            >https://github.com/minixz/sar-leaderboard-ocr-web</a
        >
    </p>
    <h2>Accuracy</h2>

    <p>
        This application is tested to <strong>100%</strong> accuracy in resolution
        <i>1:1 1920x1080 size without application bar</i> (which is the <strong>screenshot requirement</strong>).
        However, there could still be some factors for potentional inaccuracy, double checking the data after conversion
        is recommended.
    </p>
</div>

<style lang="scss">
    .input-list {
        padding-left: 0;
        list-style: none;
    }
</style>
