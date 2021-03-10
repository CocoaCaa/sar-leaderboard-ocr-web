<script lang="ts">
    export let rows: { rank: number; id: string; kills: string }[];
</script>

<table class="result-table">
    <colgroup>
        <col width="50px" />
    </colgroup>
    <thead>
        <th>#</th>
        <th>ID</th>
        <th>Kills</th>
    </thead>
    <tbody>
        {#each rows as row}
            <tr class="result-table__row">
                <td>{row.rank}</td>
                <td>{row.id}</td>
                <td>{row.kills}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style lang="scss">
    .result-table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
            padding: 5px 10px;
        }

        th {
            text-align: left;
            color: #fff;
            background-color: #de5f33;

            &:nth-child(odd) {
                background-color: scale-color(#de5f33, $lightness: -20%);
            }
        }
    }

    .result-table__row {
        &:nth-child(odd) {
            background-color: rgba(255, 255, 255, 0.05);
        }
    }
</style>
