<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Csv } from '../csv';

    import type { OcrInput } from '../types';

    const supportedImageMimeTypes = ['image/png', 'image/jpeg'];
    const dispatch = createEventDispatcher();

    export let idx: number;
    export let input: OcrInput & { _errors: string[] };
    let isDraggingFile = false;

    function handleFileClick(ev: Event) {
        const inputElement = ev.target as HTMLInputElement;
        const [targetOcrFile] = inputElement.files;
        input = {
            ...input,
            imageUrl: URL.createObjectURL(targetOcrFile),
        };
    }

    function handleFileDrop(ev: DragEvent) {
        isDraggingFile = false;
        const [item] = ev.dataTransfer.items;
        if (item.kind !== 'file' || !supportedImageMimeTypes.includes(item.type)) {
            alert('Only accept PNG or JPEG image');
            return;
        }
        input = {
            ...input,
            imageUrl: URL.createObjectURL(item.getAsFile()),
        };
    }

    function handleDragOver(ev: Event) {
        isDraggingFile = true;
    }

    function handleDragLeave(ev: Event) {
        isDraggingFile = false;
    }

    function handleRemove() {
        dispatch('remove');
    }

    $: {
        input = {
            ...input,
            _errors: [],
        };

        if (input.players) {
            const parsePlayers = Csv.parsePlayers(input.players);
            console.log(parsePlayers);
            if (
                parsePlayers.data.length === 0 ||
                parsePlayers.errors.length > 0 ||
                !parsePlayers.data[0].pID ||
                !parsePlayers.data[0].Player ||
                !parsePlayers.data[0].PlayfabID
            ) {
                input = {
                    ...input,
                    _errors: input._errors.concat('Invalid /getplayers data, please copy again from this command'),
                };
            }
        } else {
            input = {
                ...input,
                _errors: input._errors.concat('Missing /getplayers data'),
            };
        }

        if (!input.imageUrl) {
            input = {
                ...input,
                _errors: input._errors.concat('Missing leaderboard image'),
            };
        }
    }
</script>

<li class="input-item">
    <div class="input-item__content">
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
            Drop or click to upload leaderboard image
            <input class="upload-drop-zone__input" type="file" on:change={handleFileClick} />
        </label>
        <div class="input-item__settings">
            <textarea
                class="input-item__players"
                bind:value={input.players}
                placeholder="Paste the content from in-game /getplayers"
            />
            <div class="input-item__toolbar">
                <label><input type="checkbox" bind:checked={input.isIncludeBots} /> Include bots?</label>
                <label><input type="checkbox" bind:checked={input.isSingleColumn} /> Single Column?</label>
            </div>
        </div>
        <button type="button" class="input-item__remove" on:click={handleRemove}>X</button>
    </div>
    {#if input._errors.length > 0}
        <p class="input-item__errors">{input._errors.join('; ')}</p>
    {/if}
</li>

<style lang="scss">
    .input-item {
        margin-bottom: 5px;
    }

    .input-item__content {
        display: flex;
        height: 100px;
    }

    .input-item__errors {
        color: #282a36;
        margin-top: 0;
        margin-bottom: 0;
        background-color: #ff5656;
        padding: 2px 15px;
        font-size: 14px;
    }

    .input-item__round {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        width: 35px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .input-item__settings {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .input-item__players {
        flex: 1;
        padding: 5px 10px;
        resize: none;
        font-family: monospace;

        &:focus {
            outline: none;
        }
    }

    .input-item__toolbar {
        padding: 5px 10px;

        > label {
            margin-right: 10px;
        }
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
        padding: 10px;
    }

    .upload-drop-zone__input {
        display: none;
    }

    .upload-drop-zone--dragging,
    .upload-drop-zone:active {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>
