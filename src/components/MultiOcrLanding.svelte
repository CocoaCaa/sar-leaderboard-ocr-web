<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { OcrInput } from '../types';
    import MultiOcrLandingInputItem from './MultiOcrLandingInputItem.svelte';

    const dispatch = createEventDispatcher();
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
        Recommand use Steam built-in screenshot feature (output without app bar), and the size require 1920x1080, you
        could view the <a href="/example-input.jpg" target="_blank">example by clicking here</a>.
    </p>
    <ul class="input-list">
        {#each inputs as input, idx}
            <MultiOcrLandingInputItem bind:input {idx} on:remove={() => handleRemoveRound(idx)} />
        {/each}
    </ul>
    <label>Compare output (debug)<input type="file" on:change={handleUploadCompareOutput} /></label>
    <div>
        <button type="button" on:click={handleAddRound} disabled={!isValid}>Add more rounds</button>
        <button class="btn-success" type="button" on:click={handleStartProcessing} disabled={!isValid}
            >Start processing</button
        >
    </div>
    <h2>How it is work?</h2>
    <p>
        It will turn the screenshots into 64 image rows, apply a negative (inverse colour), threshold and scale up to
        make the text more clean and black text with white background. Then masked the player name (since some name are
        so cool, it diffcult to do OCR). And finally, it will output the rank, player in-match ID and kills. You could
        use those data with the in-game <code>/getplayers</code> command (Only match Host could use) to match the player
        names with those data. Every process is <strong>no need</strong> require server-side and run in your browser only.
    </p>
    <p>
        And the source code is in
        <a href="https://github.com/minixz/sar-leaderboard-ocr-web" target="_blank"
            >https://github.com/minixz/sar-leaderboard-ocr-web</a
        >
    </p>
    <h2>Accuracy</h2>

    <p>
        The output data tested could up to <strong>100%</strong> accurate in resolution
        <i>1:1 1920x1080 size without application bar</i>
        (and that is the <strong>screenshot requirement</strong>). But there could still have some reason to make the
        result incorrect, recommend doubling check the data one-by-one after converted.
    </p>
</div>

<style lang="scss">
    .input-list {
        padding-left: 0;
        list-style: none;
    }
</style>
