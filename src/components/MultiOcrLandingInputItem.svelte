<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { OcrInput } from '../types';

    const supportedImageMimeTypes = ['image/png', 'image/jpeg'];
    const dispatch = createEventDispatcher();

    export let idx: number;
    export let input: OcrInput;
    let isDraggingFile = false;

    function handleFileClick(ev: Event) {
        const input = ev.target as HTMLInputElement;
        const [targetOcrFile] = input.files;
        dispatch('image-url', URL.createObjectURL(targetOcrFile));
    }

    function handleFileDrop(ev: DragEvent) {
        isDraggingFile = false;
        const [item] = ev.dataTransfer.items;
        if (item.kind !== 'file' || !supportedImageMimeTypes.includes(item.type)) {
            alert('Only accept PNG or JPEG image');
            return;
        }
        dispatch('image-url', URL.createObjectURL(item.getAsFile()));
    }

    function handleDragOver(ev: Event) {
        isDraggingFile = true;
    }

    function handleDragLeave(ev: Event) {
        isDraggingFile = false;
    }

    function handlePlayersChanged(ev: Event) {
        const textArea = ev.target as HTMLTextAreaElement;
        dispatch('players', textArea.value);
    }

    function handleRemove() {
        dispatch('remove');
    }
</script>

<li class="input-item">
    <div class="input-item__round">
        {idx + 1}
    </div>
    <label
        class="upload-drop-zone"
        class:upload-drop-zone--dragging={isDraggingFile}
        style="background-image: url({input.imageUrl ?? ''})"
        on:drop|preventDefault={handleFileDrop}
        on:dragover|preventDefault={handleDragOver}
        on:dragenter|preventDefault={handleDragOver}
        on:dragleave|preventDefault={handleDragLeave}
        on:dragend|preventDefault={handleDragLeave}
    >
        Drop or click to upload
        <input class="upload-drop-zone__input" type="file" on:change={handleFileClick} />
    </label>
    <textarea
        class="input-item__players"
        bind:value={input.players}
        on:input={handlePlayersChanged}
        placeholder="Fill-in from in-game /getplayers"
    />
    <button type="button" class="input-item__remove" on:click={handleRemove}>X</button>
</li>

<style lang="scss">
    .input-item {
        display: flex;
        height: 100px;
        margin-bottom: 5px;
    }

    .input-item__round {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        width: 35px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .input-item__players {
        flex: 1;
        padding: 5px 10px;
        resize: none;
    }

    .input-item__remove {
        font-size: 20px;
        font-weight: bold;
        color: #fff;
        border-radius: 0;
        background-color: #ff3d3d;
        padding: 0 10px;

        &:active {
            background-color: scale-color(#ff3d3d, $lightness: -30%);
        }
    }

    .upload-drop-zone {
        cursor: pointer;
        display: flex;
        width: 200px;
        height: 100%;
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
</style>
