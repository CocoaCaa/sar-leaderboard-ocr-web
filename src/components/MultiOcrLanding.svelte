<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { OcrInput } from '../types';
    import MultiOcrLandingInputItem from './MultiOcrLandingInputItem.svelte';

    const dispatch = createEventDispatcher();
    let inputs: OcrInput[] = [{ players: '' }];
    let isValid = false;

    function handleAddRound() {
        inputs = inputs.concat({ players: '' });
    }

    function handleRemoveRound(idx: number) {
        if (inputs.length <= 1) {
            return;
        }
        const copyInputs = [...inputs];
        copyInputs.splice(idx, 1);
        inputs = copyInputs;
    }

    function handleImageUrlChanged(imageUrl: string, idx: number) {
        const copyInputs = [...inputs];
        copyInputs[idx] = {
            ...copyInputs[idx],
            imageUrl,
        };
        inputs = copyInputs;
    }

    function handlePlayersChanged(players: string, idx: number) {
        const copyInputs = [...inputs];
        copyInputs[idx] = {
            ...copyInputs[idx],
            players,
        };
        inputs = copyInputs;
    }

    function handleStartProcessing() {
        dispatch('submit', inputs);
    }

    $: {
        isValid = inputs.every((input) => !!input.imageUrl && !!input.players);
    }
</script>

<div>
    <ul class="input-list">
        {#each inputs as input, idx}
            <MultiOcrLandingInputItem
                {input}
                {idx}
                on:image-url={(ev) => handleImageUrlChanged(ev.detail, idx)}
                on:players={(ev) => handlePlayersChanged(ev.detail, idx)}
                on:remove={() => handleRemoveRound(idx)}
            />
        {/each}
    </ul>
    <button type="button" on:click={handleAddRound} disabled={!isValid}>Add more rounds</button>
    <button class="btn-success" type="button" on:click={handleStartProcessing} disabled={!isValid}
        >Start processing</button
    >
</div>

<style lang="scss">
    .input-list {
        padding-left: 0;
        list-style: none;
    }
</style>
