<script lang="ts">
    import { createEventDispatcher } from 'svelte';

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
        if (item.kind !== 'file' || item.type !== 'image/png') {
            alert('Only accept PNG image');
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
    <label
        class="upload-drop-zone"
        class:upload-drop-zone--dragging={isDraggingFile}
        style="background-image: url({targetOcrFileUrl})"
        on:drop|preventDefault={handleFileDrop}
        on:dragover|preventDefault={handleDragOver}
        on:dragenter|preventDefault={handleDragOver}
        on:dragleave|preventDefault={handleDragLeave}
        on:dragend|preventDefault={handleDragLeave}
    >
        Drop a leaderboard screenshot or click here to upload
        <input class="upload-drop-zone__input" type="file" on:change={handleFileClick} />
    </label>
    <button class="btn-start" on:click={handleSubmit} disabled={!targetOcrFileUrl}>Start</button>
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
