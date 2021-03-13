export interface OcrInput {
    imageUrl?: string;
    players: string;
    isIncludeBots: boolean;
    isSingleColumn: boolean;
    _errors: string[];
}
export interface GetPlayerRow {
    pID: string;
    Player: string;
    PlayfabID: string;
}
