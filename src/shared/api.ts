import { UserModel } from "./models/UserModel";

export type UserRepsonse = {
  user: UserModel;
  postData: Record<string, string>;
}

export type UserDefeatResponse = {
  currentXP: number;
  loseRate: number;
  winRate: number;
  recordsWon: number;
}

export type UserVictoryResponse = {
  currentXP: number;
  loseRate: number;
  winRate: number;
  recordsWon: number;
}