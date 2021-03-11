export interface OcrInput {
    imageUrl?: string;
    players: string;
}

export interface PlayerRawRow {
    rank: number;
    id: string;
    kills: number;
}

export interface PlayerRow extends PlayerRawRow {
    name: string;
}

export interface GetPlayerRow {
    pID: string;
    Player: string;
    PlayfabID: string;
}
