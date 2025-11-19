import { GoogleSheetsClient } from "./google";

export const Members = async(google: GoogleSheetsClient) => {
    const data = await google.read('Medlemmer!A2:F51');
    const members: Member[] = data.map((row) => {
        return {
            id: row[0],
            name: row[1],
            household: row[2],
            score: Number(row[3]),
            weight: Number(row[4]),
            weeks: parseWeeks(row[5]),
        }
    })
    return members;

}

const parseWeeks = (weeks: string) => {
    console.log(weeks);
    if (!weeks) {
        return [];
    }
    if (weeks.includes(',')) {
        return weeks.split(',').map(Number);
    }
    return [Number(weeks)];
}

export type Member = {
    id: string;
    name: string;
    household: string;
    score: number;
    weight: number;
    weeks: number[];
}