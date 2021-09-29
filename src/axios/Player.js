import axios from "axios";
import { token } from "../axios";
export const GetPlayerObject = (serverURL) => {
  return {
    Create: async (playerObj) => {
      // [Must] studentID            學號
      // [Must] department           隊伍
      // [Must] grade                年級
      // [Q]    PhotoURL?
      try {
        let response = await axios({
          method: "POST",
          url: serverURL + "players/create",
          data: playerObj,
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return err.response.data;
      }
    },

    Delete: async (player_id) => {
      // [Must] id       User ID
      // [Must] token    使用者登入憑證 {adim: administer}
      // player_id = player_id.player_id
      try {
        let response = await axios({
          method: "DELETE",
          url: serverURL + "players/delete",
          data: { player_id },
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return `[Error][Player][Delete]` + err;
      }
    },

    GetAllPlayerByTeamID: async (team_id) => {
      try {
        let response = await axios({
          method: "GET",
          url: serverURL + "players/data",
          params: { team_id },
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return err.response.data;
      }
    },

    DeleteAllPlayerByTeamID: async (team_id) => {
      try {
        let response = await axios({
          method: "DELETE",
          url: serverURL + "players/deleteAllPlayerByTeamID",
          data: { team_id },
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return `[Error][Player][DeleteAllPlayerByTeamID]` + err;
      }
    },

    Update: async ({ player_id, name, number, studentID, grade, photo }) => {
      // [Must] id       Team name
      // [Must] name     Team department
      // [Must] token    {adim:team}

      try {
        let response = await axios({
          method: "POST",
          url: serverURL + "players/update",
          data: { player_id, name, number, studentID, grade, photo },
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return `[Error][Team][Update]` + err;
      }
    },
  };
};
