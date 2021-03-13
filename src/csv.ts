import papaparse, { ParseConfig } from 'papaparse';
import type { GetPlayerRow } from './types';

export const Csv = {
    get playersParserSettings(): ParseConfig {
        return {
            delimiter: '\t',
            header: true,
        };
    },
    parsePlayers(players: string) {
        const lastNewLineIdx = players.lastIndexOf('\n');
        if (lastNewLineIdx !== -1) {
            players = players.substring(0, lastNewLineIdx);
        }
        return papaparse.parse<GetPlayerRow>(players, Csv.playersParserSettings);
    },
};
