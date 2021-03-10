<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let targetOcrFiles: FileList;

    const dispatch = createEventDispatcher();

    function handleOcrFormSubmit() {
        const [targetOcrFile] = targetOcrFiles;
        dispatch('submit', URL.createObjectURL(targetOcrFile));
    }
</script>

<form on:submit|preventDefault={handleOcrFormSubmit}>
    <fieldset>
        <input type="file" name="file" accept="image/*" bind:files={targetOcrFiles} />
        <button type="submit">Submit</button>
    </fieldset>
</form>
