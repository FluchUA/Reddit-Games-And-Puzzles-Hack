import { UserModel } from "./models/UserModel";

export type UserRepsonse = {
  user: UserModel;
  postData: Record<string, string>;
}

export type UserDefeatResponse = {
  user: UserModel;
}

export type UserVictoryResponse = {
  user: UserModel;
}