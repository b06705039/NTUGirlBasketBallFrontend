import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Button, Table, Radio, Input, message } from "antd";
import { RecordPlayerAPI, Player } from "../axios";
import "antd/dist/antd.css";

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
  margin: 10px 0;
`;

const StyledButton = styled(Button)`
  height: 33px;
  width: 100px;
  background-color: #6b9abb;
  border-radius: 10px;
  display: flex;
  margin: 10px;
`;

const RadioGroup = styled(Radio.Group)`
  display: flex;
  flex-direction: row;
`;

const InputDiv = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px;
`;

const buttonDict = {
  num: "球員背號",
  steal: "抄截",
  assist: "助攻",
  block: "阻攻",
  "2point": "2分",
  "3point": "3分",
  bankShot: "籃板",
};
const columns = [];

Object.keys(buttonDict).map((type) => {
  columns.push({ title: buttonDict[type], dataIndex: type, key: type });
});

const RecordPlayer = (props) => {
  // should pass as props

  const aMatch = JSON.parse(props.match.params.data).aMatch;
  const teamType = JSON.parse(props.match.params.data).teamType;
  const teamId = aMatch[teamType]._id;

  const saveKey = `${aMatch._id}-${teamId}`;
  const [players, setPlayers] = useState();
  const [selectType, setSelectType] = useState("steal");
  const InputRef = useRef();
  const [numberTocolumn, setNumberToColumn] = useState();

  useEffect(async () => {
    let updatePlayers = JSON.parse(localStorage.getItem(`${saveKey}-players`));
    let updateNumberToColumn = JSON.parse(
      localStorage.getItem(`${saveKey}-numberToColumn`)
    );
    if (!updatePlayers || !updateNumberToColumn) {
      // get players from db
      const response = await Player.GetAllPlayerByTeamID(teamId);
      if (response.code !== 200) {
        message.error(response.message);
        return;
      }
      updatePlayers = [];
      updateNumberToColumn = {};
      response.data.map((player, index) => {
        console.log(player);
        // for players
        let newBtnDict = {};
        Object.keys(buttonDict).map((type) => {
          newBtnDict[type] = 0;
        });
        newBtnDict["num"] = player.number;
        updatePlayers.push(newBtnDict);
        // // for map
        updateNumberToColumn[player.number] = {
          index: index,
          player_id: player._id,
        };
      });
    }
    setPlayers(() => updatePlayers);
    setNumberToColumn(() => updateNumberToColumn);
    localStorage.setItem(`${saveKey}-players`, JSON.stringify(updatePlayers));
    localStorage.setItem(
      `${saveKey}-numberToColumn`,
      JSON.stringify(updateNumberToColumn)
    );
  }, []);

  const handleSave = async (e) => {
    const Key = `${aMatch._id}-${teamId}`;
    const playersData = JSON.parse(localStorage.getItem(`${Key}-players`));
    const numberToColumnDict = JSON.parse(
      localStorage.getItem(`${Key}-numberToColumn`)
    );

    await Promise.all(
      Object.entries(numberToColumnDict).map(async (player) => {
        const index = player[1].index;
        const data = {
          match_id: aMatch._id,
          team_id: teamId,
          player_id: player[1].player_id,
          steal: playersData[index].steal,
          assist: playersData[index].assist,
          block: playersData[index].block,
          plus2: playersData[index]["2point"],
          plus3: playersData[index]["3point"],
          bankShot: playersData[index].bankShot,
        };
        try {
          const res = await RecordPlayerAPI.Create(data);
        } catch (err) {
          console.log("in recordPlayer, SaveData fail");
        }
      })
    );
  };

  const handleClick = () => {
    const number = InputRef.current.state.value;
    const index = numberTocolumn[number].index;
    const type = selectType;
    const updatePlayers = [...players];
    console.log("into handle click", number, index, type);

    if (type === "2point") {
      updatePlayers[index][type] += 2;
    } else if (type === "3point") {
      updatePlayers[index][type] += 3;
    } else {
      updatePlayers[index][type] += 1;
    }

    setPlayers(() => updatePlayers);
  };

  return (
    <ContentBackground>
      <ContentBody>
        <ButtonDiv>
          <StyledButton>重置</StyledButton>
          <StyledButton onClick={() => handleSave()}>比賽結束</StyledButton>
        </ButtonDiv>
        <Table
          columns={columns}
          dataSource={players}
          scroll={{ x: "calc(700px + 50%)", y: 500 }}
        />

        <RadioGroup
          value={selectType}
          onChange={(e) => setSelectType(() => e.target.value)}
        >
          {Object.keys(buttonDict)
            .slice(1, Object.keys(buttonDict).length)
            .map((type, index) => (
              <Radio.Button key={index} value={type}>
                {buttonDict[type]}
              </Radio.Button>
            ))}
        </RadioGroup>
        <InputDiv>
          <Input ref={InputRef} />
          <Button onClick={handleClick}>+</Button>
          <Button onClick={handleClick}>-</Button>
        </InputDiv>
      </ContentBody>
    </ContentBackground>
  );
};

export default RecordPlayer;
