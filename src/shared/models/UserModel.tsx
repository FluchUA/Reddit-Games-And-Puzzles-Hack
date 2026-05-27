export class UserModel {
    id: string;
    name: string;
    currentXP: number;
    winRate: number;
    loseRate: number;
    recordsWon: number;
    completedGames: string[];
    wonSubposts: string[];
    lostSubposts: string[];
    [key: string]: any;

    constructor(
        id: string = "",
        name: string = "Anonymous",
        currentXP: number = 0,
        winRate: number = 0,
        loseRate: number = 0,
        recordsWon: number = 0,
        wonSubposts: string[] = [],
        lostSubposts: string[] = [],
        completedGames: string[] = [],
    ) {
        this.id = id;
        this.name = name;
        this.currentXP = currentXP;
        this.winRate = winRate;
        this.loseRate = loseRate;
        this.recordsWon = recordsWon;
        this.wonSubposts = wonSubposts;
        this.lostSubposts = lostSubposts;
        this.completedGames = completedGames;
    }
}
