import axios from "axios";
import { token } from "../axios";
function DateConverter(date) {
  return date !== null ? new Date(date).toISOString() : null;
}

export const GetMatchObject = (serverURL) => {
  return {
    GetALLMatch: async () => {
      try {
        let response = await axios({
          method: "GET",
          url: serverURL + "matches/data",
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return err.response.data;
      }
    },

    UpdateScheduler: async ({ _id, startDate, recorder, field }) => {
      try {
        let response = await axios({
          method: "POST",
          url: serverURL + "matches/update",
          data: { match_id: _id, startDate, recorder, field },
          headers: { Authorization: token },
        });
        return response.data;
      } catch (err) {
        return err.response.data;
      }
    },

    Create: async (home, away, stage, stage_session) => {
      try {
        let response = await axios({
          method: "POST",
          url: serverURL + "matches/create",
          data: {
            home,
            away,
            stage,
            stage_session,
          },
          headers: { Authorization: token },
        });
        return response.data.data;
      } catch (err) {
        return `[Error][Match][Create]` + err;
      }
    },

    GetMatch: async ({
      match_id,
      home,
      away,
      stage,
      stage_session,
      field,
      recorder,
      winner,
    }) => {
      try {
        let response = await axios({
          method: "GET",
          url: serverURL + "matches/data",
          params: {
            match_id,
            home,
            away,
            stage,
            stage_session,
            field,
            recorder,
            winner,
          },
          headers: { Authorization: token },
        });
        return response.data.data;
      } catch (err) {
        return err.response.data.message;
      }
    },
    Delete: async (match_id) => {
      try {
        let response = await axios({
          method: "DELETE",
          url: serverURL + "matches/delete",
          data: { match_id },
          headers: { Authorization: token },
        });
        return response.data.data;
      } catch (err) {
        return err.response.message;
      }
    },

    // // CreateInterMatch: async( home, away, stage ) => {
    // //   try{
    // //     let response = await axios({
    // //       method: "POST",
    // //       url: serverURL + "matches/createInterMatch",
    // //       data: { home_id: home, away_id: away, stage: stage},
    // //       headers: { Authorization: token },
    // //     });
    // //     return response.data;
    // //   } catch (err){
    // //     return `[Error][Match][CreateInterMatch]` + err;
    // //   }
    // // },
    // DeleteSession: async (stage) => {
    //   try {
    //     let response = await axios({
    //       method: "DELETE",
    //       url: serverURL + "matches/deleteSession",
    //       params: { stage: stage },
    //       headers: { Authorization: token },
    //     });
    //     return response.data;
    //   } catch (err) {
    //     throw err;
    //   }
    // },
    // CheckIfStage: async (stage) => {
    //   try {
    //     let response = await axios({
    //       method: "GET",
    //       url: serverURL + "matches/checkIfStage",
    //       params: { stage },
    //       headers: { Authorization: token },
    //     });
    //     return response.data;
    //   } catch (err) {
    //     throw err;
    //   }
    // },
  };
};
