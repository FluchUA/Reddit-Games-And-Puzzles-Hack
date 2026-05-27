import { UserModel } from "./models/UserModel";

export type UserRepsonse = {
  user: UserModel;
  postData: Record<string, string>;
}