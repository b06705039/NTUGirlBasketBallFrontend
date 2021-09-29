import React, { useEffect, useState, useRef } from "react";
import { Select, Form, message } from "antd";
import Scheduler, { View } from "devextreme-react/scheduler";
import { LoadPanel } from "devextreme-react/load-panel";
import { Team, Time } from "../axios";
import { usePages } from "../hooks/usePages";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import "../css/scheduler.css";

const { Option } = Select;
const currentDate = new Date(2021, 1, 1);
const views = ["workWeek"];
const TimeRangeObject = { 1: "12:30", 2: "18:30", 3: "19:30" };

function Appointment() {
  return <div style={{ textAlign: "center", fontSize: 17 }}>{"無法出賽"}</div>;
}

const TimeCell = ({ date }) => {
  let text = TimeRangeObject[date.getHours()];
  return <div style={{ margin: "0 auto" }}>{text}</div>;
};

function DataCell(props) {
  let cellName = "",
    text = "";
  const WeekDay = props.data.startDate.getDay();
  if (
    props.data.startDate.getHours() === 1 &&
    (WeekDay === 2 || WeekDay === 4)
  ) {
    cellName = "disable-date";
    text = "No Game";
  }
  return <div className={cellName}>{text}</div>;
}

function App() {
  const [loading, setloading] = useState(true);
  const scheduler = useRef(null);
  const [timeNumbers, setNumbers] = useState([]);
  const [teams, setTeams] = useState([]);
  const { userInfo } = usePages();
  const { user_id, admin } = userInfo;
  const [form] = Form.useForm();
  const toAppointment = (number) => ({
    startDate: new Date(2021, 1, parseInt(number / 3) + 1, (number % 3) + 1),
    endDate: new Date(2021, 1, parseInt(number / 3) + 1, (number % 3) + 2),
  });
  const AddbusyTime = async (data) => {
    if (timeNumbers.length >= 3 && admin === "team") {
      message.error("僅能填寫3個無法出賽時段");
      return;
    }
    const newAppointment = data.cellData;
    const WeekDay = newAppointment.startDate.getDay();
    const Hour = newAppointment.startDate.getHours();
    if (Hour === 1 && (WeekDay === 2 || WeekDay === 4)) return;
    const TimeNumber = (WeekDay - 1) * 3 + Hour - 1;
    if (timeNumbers.includes(TimeNumber)) return;
    setNumbers((data) => [...data, TimeNumber]);
    if (admin === "team")
      await Time.TeamAppointment(form.getFieldValue("team"), TimeNumber);
    else await Time.RecorderAppointment(user_id, TimeNumber);
  };

  const DeleteAppointment = async (event) => {
    const WeekDay = event.appointmentData.startDate.getDay();
    const Hour = event.appointmentData.startDate.getHours();
    const TimeNumber = (WeekDay - 1) * 3 + Hour - 1;
    setNumbers((data) => [...data].filter((num) => num != TimeNumber));
    if (admin === "team")
      await Time.TeamAppointment(form.getFieldValue("team"), TimeNumber);
    else await Time.RecorderAppointment(user_id, TimeNumber);
  };

  const onTeamChanged = async (id) => {
    setNumbers([]);
    setloading(true);
    const timeResponse = await Time.GetTeamTimeByID(id);
    if (timeResponse.code === 200) setNumbers(timeResponse.data.time);
    setloading(false);
  };

  useEffect(async () => {
    if (admin === "team") {
      const response = await Team.GetTeamByID(user_id);
      if (response.code === 200) {
        setTeams(
          response.data.map((team) => ({ value: team._id, name: team.name }))
        );
        if (response.data.length > 0) {
          form.setFieldsValue({ team: response.data[0]._id });
          const timeResponse = await Time.GetTeamTimeByID(response.data[0]._id);
          if (timeResponse.code === 200) setNumbers(timeResponse.data.time);
        }
      }
      setloading(false);
      return;
    }
    const timeResponse = await Time.GetRecorderTimeByID(user_id);
    if (timeResponse.code === 200) setNumbers(timeResponse.data.time);
    setloading(false);
  }, []);

  return (
    <React.Fragment>
      <Form
        form={form}
        style={{
          marginLeft: 40,
          marginTop: 20,
          width: "30%",
        }}
        hidden={admin !== "team"}
      >
        <Form.Item label="選擇隊伍" name="team">
          <Select onChange={onTeamChanged}>
            {teams.map((team) => (
              <Option value={team.value}>{team.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <div id="scheduler-container" className="timer">
        <Scheduler
          appointmentComponent={Appointment}
          onAppointmentClick={DeleteAppointment}
          ref={scheduler}
          dataSource={timeNumbers.map((num) => toAppointment(num))}
          timeZone="Asia/Taipei"
          defaultCurrentDate={currentDate}
          startDayHour={1}
          endDayHour={4}
          cellDuration={60}
          dataCellComponent={DataCell}
          views={views}
          onCellClick={AddbusyTime}
          defaultCurrentView={views[0]}
          timeCellRender={TimeCell}
          editing={{
            allowAdding: false,
            allowDeleting: false,
            allowResizing: false,
            allowDragging: false,
            allowUpdating: false,
          }}
        >
          <View
            type="timelineWeek"
            name="Timeline Week"
            groupOrientation="horizontal"
            maxAppointmentsPerCell={1}
          />
        </Scheduler>
      </div>
      <LoadPanel
        shadingColor="rgba(0,0,0,0.4)"
        position={{ of: "#scheduler-container" }}
        visible={loading}
      />
    </React.Fragment>
  );
}

export default App;
