<script lang="ts">
    import GitHubCorner from './components/GitHubCorner.svelte';
    import Landing from './components/Landing.svelte';
    import Ocr from './components/Ocr.svelte';
    import MultiOcrLanding from './components/MultiOcrLanding.svelte';
    import type { OcrInput } from './types';
    import MultiOcrProcessing from './components/MultiOcrProcessing.svelte';

    let isInOcrProcess = false;
    let inputs: OcrInput[];

    function handleSubmit(ev: CustomEvent<OcrInput[]>) {
        inputs = ev.detail;
        isInOcrProcess = true;
    }

    function handleRestart() {
        isInOcrProcess = false;
    }
</script>

<GitHubCorner href="https://github.com/minixz/sar-leaderboard-ocr-web" />
<main>
    <h1>SAR Leaderboard OCR</h1>
    {#if isInOcrProcess}
        <MultiOcrProcessing {inputs} on:restart={handleRestart} />
    {:else}
        <MultiOcrLanding on:submit={handleSubmit} />
    {/if}
</main>
<footer class="page-footer">
    <p>Develop by CocoaCaa (a.k.a. minixz)</p>
    <p>
        <a href="https://animalroyale.com/" target="_blank">Super Animal Royale</a>
        is copyright
        <a href="https://pixilestudios.com/" target="_blank">Pixile, Inc</a>
        and is not affiliated with this site.
    </p>
</footer>

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
        line-height: 1.5;
    }

    a {
        color: #de5f33;
        text-decoration: underline;
    }

    h2 {
        display: inline-block;
        padding-right: 30px;
        border-bottom: 3px solid #fff;
        margin-bottom: 0px;
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

        &.btn-success {
            background-color: #37dea5;
            color: #282a36;

            &:active {
                background-color: scale-color(#37dea5, $lightness: -30%);
            }

            &:focus {
                outline: none;
            }

            &:disabled {
                cursor: not-allowed;
                opacity: 0.3;
            }
        }
    }

    code {
        color: #ff6565;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 7px;
        border-radius: 5px;
    }

    .page-footer {
        font-size: 14px;
        color: #717386;
        margin-top: 30px;
        margin-left: auto;
        margin-right: auto;
        max-width: 768px;

        p {
            margin-top: 0;
            margin-bottom: 0;
        }

        a {
            color: #717386;
        }
    }
</style>
