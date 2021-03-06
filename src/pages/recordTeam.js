import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TeamScore from "../components/recordTeam/teamScore";
import RecordTime from "../components/recordTeam/recordTime";
import { Button } from "antd";
import { RecordTeamAPI, Match } from "../axios";

const ContentBackground = styled.div`
  height: 1000px;
  padding: 50px 100px;
`;
const ContentBody = styled.div`
  padding: 0 50px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonDiv = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  height: 33px;
  width: 100px;
  background-color: #6b9abb;
  border-radius: 10px;
  display: flex;
  margin: 10px;
`;

const TimeDiv = styled.div`
  margin: 50px 0 25px 0;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ScoreDiv = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;
const LeftTeam = styled.div`
  display: flex;
  width: 48%;
  flex-direction: row;
  float: right;
  justify-content: flex-end;
`;
const RightTeam = styled.div`
  display: flex;
  width: 48%;
  flex-direction: row;
  float: right;
  justify-content: flex-start;
`;

const DivideLine = styled.div`
  border-left: 1px solid black;
  display: flex;
`;

const RecordTeam = (props) => {
  const aMatch = JSON.parse(props.match.params.aMatch);

  // teamInfo, from aMatch, and should got other data from backend
  const [session, setSession] = useState();
  const [homeBall, setHomeBall] = useState();

  useEffect(() => {
    let updateSession = parseInt(localStorage.getItem(`${aMatch._id}-session`));
    let updateHomeBall = localStorage.getItem(`${aMatch._id}-homeBall`);
    if (!updateSession || !updateHomeBall) {
      updateSession = 1;
      updateHomeBall = true;
      localStorage.setItem(`${aMatch._id}-session`, updateSession);
      localStorage.setItem(`${aMatch._id}-homeBall`, updateHomeBall);
    }
    setSession(() => updateSession);
    setHomeBall(() => updateHomeBall);
  }, []);

  const handleSave = () => {
    console.log("in handleSave");
    saveData("home");
    saveData("away");
    saveWinTeam();
  };

  const saveWinTeam = async () => {
    const accumulateArr = (arr) => {
      return arr.reduce((accu, cur) => {
        return accu + cur;
      }, 0);
    };
    let winner;
    const homeArr = JSON.parse(
      localStorage.getItem(`${aMatch._id}-${aMatch.home._id}-quarterScore`)
    );
    const awayArr = JSON.parse(
      localStorage.getItem(`${aMatch._id}-${aMatch.away._id}-quarterScore`)
    );
    const homeScore = accumulateArr(homeArr);
    const awayScore = accumulateArr(awayArr);

    if (homeScore > awayScore) {
      winner = "home";
    } else {
      winner = "away";
    }

    try {
      const res = await Match.Update({ match_id: aMatch._id, winner: winner });
      console.log(
        "in recordTeam, updateMatchWinner: ",
        {
          match_id: aMatch._id,
          winner: winner,
        },
        res
      );
    } catch (err) {
      console.log("in recordTeam, updateMatchWinner fail");
    }
  };

  const saveData = async (teamType) => {
    const Key = `${aMatch._id}-${aMatch[teamType]._id}`;
    const quarterScore = JSON.parse(
      localStorage.getItem(`${Key}-quarterScore`)
    );
    const quarterFoul = JSON.parse(localStorage.getItem(`${Key}-quarterFoul`));
    const stopWatch = JSON.parse(localStorage.getItem(`${Key}-stopWatch`));
    const Data = {
      match_id: aMatch._id,
      team_id: aMatch[teamType]._id,
      score1: quarterScore[0],
      score2: quarterScore[1],
      score3: quarterScore[2],
      score4: quarterScore[3],
      foul1: quarterFoul[0],
      foul2: quarterFoul[1],
      foul3: quarterFoul[2],
      foul4: quarterFoul[3],
      stopWatch1: stopWatch[0],
      stopWatch2: stopWatch[1],
      stopWatch3: stopWatch[2],
      stopWatch4: stopWatch[3],
      stopWatch5: stopWatch[4],
    };

    try {
      const res = await RecordTeamAPI.Create(Data);
      console.log("in recordTeam, SaveData, response:", res);
    } catch (err) {
      console.log("in recordTeam, SaveData fail");
    }
  };

  return (
    <ContentBackground className="ant-layout-content">
      <ContentBody className="site-layout-content">
        <ButtonDiv>
          <StyledButton>??????</StyledButton>
          <StyledButton onClick={() => handleSave()}>????????????</StyledButton>
        </ButtonDiv>
        <TimeDiv>
          <RecordTime
            session={session}
            setSession={setSession}
            aMatch={aMatch}
          />
        </TimeDiv>
        <ScoreDiv>
          <LeftTeam>
            <TeamScore
              teamType={"home"}
              aMatch={aMatch}
              session={session}
              homeBall={homeBall}
              setHomeBall={setHomeBall}
            />
          </LeftTeam>
          <DivideLine />
          <RightTeam>
            <TeamScore
              teamType={"away"}
              aMatch={aMatch}
              session={session}
              homeBall={homeBall}
              setHomeBall={setHomeBall}
            />
          </RightTeam>
        </ScoreDiv>
      </ContentBody>
    </ContentBackground>
  );
};

export default RecordTeam;
