<script lang="ts">
    import Landing from './components/Landing.svelte';
    import Ocr from './components/Ocr.svelte';

    let isInOcrProcess = false;
    let imageUrl: string;

    function handleSubmit(ev: CustomEvent<string>) {
        imageUrl = ev.detail;
        isInOcrProcess = true;
    }
</script>

<main>
    <h1>SAR Leaderboard OCR</h1>
    {#if isInOcrProcess}
        <Ocr {imageUrl} />
    {:else}
        <Landing on:submit={handleSubmit} />
    {/if}
</main>

<style lang="scss" global>
    @import 'normalize.css';
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap');

    body {
        font-family: 'Rubik', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
    }

    main {
        margin: 0 auto;
        max-width: 1140px;
    }

    fieldset {
        border: 0;
        margin: 0;
        padding: 0;
    }
</style>
