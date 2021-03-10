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

    * {
        box-sizing: border-box;
    }

    body {
        font-family: 'Rubik', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
        color: #fff;
        background-color: #282a36;
        font-size: 16px;
        overflow-y: scroll;
    }

    main {
        margin: 0 auto;
        max-width: 768px;
    }

    fieldset {
        border: 0;
        margin: 0;
        padding: 0;
    }

    button {
        cursor: pointer;
        padding: 10px 15px;
        font-size: 16px;
        background-color: #de5f33;
        color: #fff;
        border: 0;
        border-radius: 5px;

        &:active {
            background-color: scale-color(#de5f33, $lightness: -30%);
        }

        &:focus {
            outline: none;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
    }
</style>
