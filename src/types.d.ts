export interface OcrInput {
    imageUrl?: string;
    players: string;
    isIncludeBots: boolean;
    isSingleColumn: boolean;
}
export interface GetPlayerRow {
    pID: string;
    Player: string;
    PlayfabID: string;
}
