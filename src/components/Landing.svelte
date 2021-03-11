<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const supportedImageMimeTypes = ['image/png', 'image/jpeg'];

    let targetOcrFileUrl: string;
    let isDraggingFile = false;

    const dispatch = createEventDispatcher();

    function handleFileClick(ev: Event) {
        URL.revokeObjectURL(targetOcrFileUrl);
        const input = ev.target as HTMLInputElement;
        const [targetOcrFile] = input.files;
        targetOcrFileUrl = URL.createObjectURL(targetOcrFile);
    }

    function handleFileDrop(ev: DragEvent) {
        URL.revokeObjectURL(targetOcrFileUrl);

        isDraggingFile = false;
        const [item] = ev.dataTransfer.items;
        if (item.kind !== 'file' || !supportedImageMimeTypes.includes(item.type)) {
            alert('Only accept PNG or JPEG image');
            return;
        }
        targetOcrFileUrl = URL.createObjectURL(item.getAsFile());
    }

    function handleDragOver(ev: Event) {
        isDraggingFile = true;
    }

    function handleDragLeave(ev: Event) {
        isDraggingFile = false;
    }

    function handleSubmit() {
        dispatch('submit', targetOcrFileUrl);
    }
</script>

<div>
    <p>
        Recommand use Steam built-in screenshot feature (output without app bar), and the size require 1920x1080, you
        could view the <a href="/example-input.jpg" target="_blank">example by clicking here</a>.
    </p>
    <label
        class="upload-drop-zone"
        class:upload-drop-zone--dragging={isDraggingFile}
        style="background-image: url({targetOcrFileUrl ?? ''})"
        on:drop|preventDefault={handleFileDrop}
        on:dragover|preventDefault={handleDragOver}
        on:dragenter|preventDefault={handleDragOver}
        on:dragleave|preventDefault={handleDragLeave}
        on:dragend|preventDefault={handleDragLeave}
    >
        Drop a leaderboard screenshot or click here to upload
        <input class="upload-drop-zone__input" type="file" on:change={handleFileClick} />
    </label>
    <button type="button" class="btn-start" on:click={handleSubmit} disabled={!targetOcrFileUrl}>Start</button>
    <h2>How it is work?</h2>
    <p>
        It will turn the screenshots into 64 image rows, apply a negative (inverse colour), threshold and scale up to
        make the text more clean and black text with white background. Then masked the player name (since some name are
        so cool, it diffcult to do OCR). And finally, it will output the rank, player in-match ID and kills. You could
        use those data with the in-game <code>/getplayers</code> command (Only match Host could use) to match the player
        names with those data.
    </p>
    <p>
        And the source code is in
        <a href="https://github.com/minixz/sar-leaderboard-ocr-web" target="_blank"
            >https://github.com/minixz/sar-leaderboard-ocr-web</a
        >
    </p>
</div>

<style lang="scss">
    .upload-drop-zone {
        cursor: pointer;
        display: flex;
        width: 100%;
        height: 300px;
        background-color: rgba(255, 255, 255, 0.05);
        align-items: center;
        justify-content: center;
        font-size: 18px;
        background-size: cover;
    }

    .upload-drop-zone__input {
        display: none;
    }

    .upload-drop-zone--dragging,
    .upload-drop-zone:active {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .btn-start {
        display: block;
        width: 100%;
        margin-top: 10px;
    }
</style>
