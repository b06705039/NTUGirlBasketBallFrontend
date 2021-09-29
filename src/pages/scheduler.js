import React, { useState, useEffect, useRef } from "react";
import { message, Modal, Image, Table, Select, Button, Form } from "antd";
import Scheduler, {
  AppointmentDragging,
  Resource,
  View,
} from "devextreme-react/scheduler";
import Draggable from "devextreme-react/draggable";
import ScrollView from "devextreme-react/scroll-view";
import AppointmentFormat from "../components/Appointment";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import "../css/scheduler.css";
import { Match, Time, User } from "../axios";
import { LoadPanel } from "devextreme-react/load-panel";
import { usePages } from "../hooks/usePages";
import { translateDepartment } from "../department";
const { Option } = Select;

const views = ["workWeek"];
const draggingGroupName = "appointmentsGroup";
const TimeRangeObject = { 1: "12:30", 2: "18:30", 3: "19:30" };

const FieldData = [
  {
    text: "Field A",
    id: 0,
    color: "#1e90ff",
  },
  {
    text: "Field B",
    id: 1,
    color: "#ff9747",
  },
];

const TimeCell = ({ date }) => {
  let text = TimeRangeObject[date.getHours()];
  return <div style={{ margin: "0 auto" }}>{text}</div>;
};

const testData = [];

export default function MyScheduler() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [arrangedMatches, setArranged] = useState(testData);
  const [teamBusyTime, setTeamBusyTime] = useState({});
  const [recorders, setRecorders] = useState([]);
  const [recorderBusyTime, setRecorderBusyTime] = useState({});
  const [onEditAppointment, setOnEdit] = useState(false);
  const [target, setTarget] = useState(null);
  const scheduler = useRef();
  const { userInfo } = usePages();
  const { user_id } = userInfo;

  const showTeamBusy = (match) => {
    const BusyTime = {};
    if (match.home._id in teamBusyTime)
      for (let time of teamBusyTime[match.home._id])
        BusyTime[time] = match.home.name;
    if (match.away._id in teamBusyTime)
      for (let time of teamBusyTime[match.away._id]) {
        if (time in BusyTime) BusyTime[time] += ` ${match.away.name}`;
        else BusyTime[time] = match.away.name;
      }
    const timeCells = document.getElementsByClassName("time-cell");
    for (let element of timeCells) {
      const TimeNumber = element.id.split("-")[0];
      if (TimeNumber.length === 0) continue;
      if (parseInt(TimeNumber) in BusyTime) {
        element.innerHTML = BusyTime[parseInt(TimeNumber)];
      }
    }
  };
  const closeTeamBusy = () => {
    const timeCells = document.getElementsByClassName("time-cell");
    for (let element of timeCells) {
      element.textContent = "";
    }
  };
  const onAppointmentDragEnd = () => {
    closeTeamBusy();
  };
  const onAppointmentDragStart = (e) => {
    showTeamBusy(e.itemData);
  };
  const onAppointmentRemove = async (e) => {
    setLoading(true);
    e.itemData.recorder = null;
    e.itemData.startDate = null;
    e.itemData.field = null;
    const response = await Match.UpdateScheduler(e.itemData);
    if (response.code !== 200) {
      message.error(response.message);
      return;
    }
    setMatches((data) => [...data, e.itemData]);
    setArranged((data) => [...data].filter((match) => match !== e.itemData));
    setLoading(false);
  };
  const getTimeNumber = (match) => {
    const Hour = match.startDate.getHours();
    const WeekDay = match.startDate.getDay();
    return (WeekDay - 1) * 3 + Hour - 1;
  };
  const BothTeamAvaliable = (match) => {
    const Teams = [];
    if (
      match.home._id in teamBusyTime &&
      teamBusyTime[match.home._id].includes(getTimeNumber(match))
    ) {
      Teams.push(match.home.name);
    }
    if (
      match.away._id in teamBusyTime &&
      teamBusyTime[match.away._id].includes(getTimeNumber(match))
    ) {
      Teams.push(match.away.name);
    }
    if (Teams.length === 0) return true;
    message.error(Teams.join(", ") + " 無法出賽");
    return false;
  };
  const MatchIsAvalidable = (match) => {
    const SameDayMatches = arrangedMatches.filter(
      (m) =>
        m._id !== match._id &&
        m.startDate.getDate() === match.startDate.getDate() &&
        m.startDate.getFullYear() === match.startDate.getFullYear()
    );
    if (
      SameDayMatches.find(
        (m) =>
          [match.home._id, match.away._id].includes(m.home._id) ||
          [match.home._id, match.away._id].includes(m.away._id)
      )
    ) {
      message.error("單日球隊只可有一場比賽");
      return false;
    }
    return true;
  };
  const onAppointmentClick = (e) => {
    setTarget(e.appointmentData);
    setOnEdit(true);
    e.cancel = true;
  };
  const onAppointmentAdd = async (e) => {
    if (!BothTeamAvaliable(e.itemData) || !MatchIsAvalidable(e.itemData)) {
      e.cancel = true;
      return;
    }
    const endDate = new Date(e.itemData.startDate);
    endDate.setHours(endDate.getHours() + 1);
    e.itemData.endDate = endDate;
    setLoading(true);
    const response = await Match.UpdateScheduler(e.itemData);
    if (response.code !== 200) {
      message.error(response.message);
      return;
    }
    setMatches((data) => [...data].filter((match) => match !== e.fromData));
    setArranged((data) => [...data, e.itemData]);
    setLoading(false);
  };
  const onAppointmentUpdating = async (e) => {
    if (!BothTeamAvaliable(e.newData) || !MatchIsAvalidable(e.newData)) {
      e.cancel = true;
      return;
    }
    e.newData.recorder = null;
    setLoading(true);
    const response = await Match.UpdateScheduler(e.newData);
    if (response.code !== 200) {
      e.cancel = true;
      message.error(response.message);
      return;
    }
    setLoading(false);
  };
  const onListDragStart = (e) => {
    e.cancel = true;
  };
  const onItemDragStart = (e) => {
    showTeamBusy(e.fromData);
    e.itemData = e.fromData;
  };
  const onItemDragEnd = () => {
    closeTeamBusy();
  };
  const DataCell = (props) => {
    const CellClassName = ["time-cell"];
    let text = "";
    const Hour = props.data.startDate.getHours();
    const WeekDay = props.data.startDate.getDay();
    const TimeNumber = (WeekDay - 1) * 3 + Hour - 1;
    if (Hour === 1 && (WeekDay === 2 || WeekDay === 4)) {
      CellClassName[0] = "disable-date";
      text = "無比賽";
    }

    return (
      <div
        id={`${TimeNumber}-${props.data.groups.field}`}
        className={CellClassName}
      >
        {text}
      </div>
    );
  };
  useEffect(async () => {
    if (!user_id) return;
    console.log("GetData", user_id);
    let response = await Match.GetALLMatch();
    if (response.code === 200) {
      setMatches(
        response.data
          .filter(
            (match) => match.startDate === null && match.home && match.away
          )
          .map((match) => {
            match.text = `${match.home.name} vs ${match.away.name}`;

            return match;
          })
      );
      setArranged(
        response.data
          .filter(
            (match) => match.startDate !== null && match.home && match.away
          )
          .map((match) => {
            match.text = `${match.home.name} vs ${match.away.name}`;
            match.startDate = new Date(match.startDate);
            match.endDate = new Date(match.startDate);
            match.endDate.setHours(match.endDate.getHours() + 1);
            return match;
          })
      );
    }
    response = await User.GetAccount({ admin: "recorder" });
    if (response.code === 200) setRecorders(response.data);

    response = await Time.GetALLTime();
    if (response.code === 200) {
      setTeamBusyTime(response.data.team);
      setRecorderBusyTime(response.data.recorder);
    }
    setLoading(false);
  }, [user_id]);

  return (
    <React.Fragment>
      <div
        id="scheduler-container"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Scheduler
          ref={scheduler}
          timeZone="Asia/Taipei"
          id="scheduler"
          dataSource={arrangedMatches}
          defaultCurrentDate={new Date(2021, 1, 1)}
          startDayHour={1}
          endDayHour={4}
          cellDuration={60}
          editing={{
            allowAdding: true,
            allowDeleting: true,
            allowResizing: false,
            allowDragging: true,
            allowUpdating: true,
          }}
          groupByDate={true}
          groups={["field"]}
          views={views}
          dataCellComponent={DataCell}
          defaultCurrentView={views[0]}
          appointmentComponent={AppointmentFormat}
          appointmentTooltipComponent={null}
          onAppointmentClick={onAppointmentClick}
          onAppointmentUpdating={onAppointmentUpdating}
          onAppointmentAdded={onAppointmentAdd}
          onAppointmentFormOpening={(e) => {
            e.cancel = true;
          }}
          timeCellRender={TimeCell}
        >
          <Resource
            fieldExpr="field"
            allowMultiple={false}
            dataSource={FieldData}
            label="Field"
          />
          <View
            type="timelineWeek"
            name="Timeline Week"
            groupOrientation="horizontal"
            maxAppointmentsPerCell={1}
          />
          <AppointmentDragging
            group={draggingGroupName}
            onRemove={onAppointmentRemove}
            onAdd={onAppointmentAdd}
            onDragEnd={onAppointmentDragEnd}
            onDragStart={onAppointmentDragStart}
          />
        </Scheduler>
        <h1 style={{ marginLeft: 50 }}>賽程</h1>
        <ScrollView
          id="scroll"
          direction="both"
          height={100}
          width={"100%"}
          bounceEnabled={true}
          showScrollbar="always"
          useNative={false}
        >
          <Draggable
            id="DragList"
            data="dropArea"
            group={draggingGroupName}
            onDragStart={onListDragStart}
            height={100}
          >
            {matches.map((task, index) => {
              task.key = index;
              return (
                <Draggable
                  key={index}
                  className="item dx-card dx-theme-text-color dx-theme-background-color"
                  clone={true}
                  group={draggingGroupName}
                  data={task}
                  width={200}
                  onDragStart={onItemDragStart}
                  onDragEnd={onItemDragEnd}
                >
                  <div
                    style={{ textAlign: "center" }}
                    onDoubleClick={() => {
                      setTarget(task);
                      setOnEdit(true);
                    }}
                  >
                    {task.text}
                  </div>
                </Draggable>
              );
            })}
          </Draggable>
        </ScrollView>
      </div>
      <LoadPanel
        shadingColor="rgba(0,0,0,0.4)"
        position={{ of: "#scheduler-container" }}
        visible={loading}
      />
      <AppointmentForm
        visable={onEditAppointment}
        setVisable={setOnEdit}
        target={target}
        setAppointments={setArranged}
        recorders={recorders}
        recorderBusyTime={recorderBusyTime}
      />
    </React.Fragment>
  );
}

function AppointmentForm({
  target,
  visable,
  setVisable,
  setAppointments,
  recorders,
  recorderBusyTime,
}) {
  const time = ["12:30-13:30", "18:30-19:30", "19:30-20:30"];
  let data = {
    _id: "none",
    startDate: new Date(),
    text: "錯誤比賽",
    home: {},
    away: {},
    field: 0,
  };
  if (target) data = target;
  const Hour = data.startDate.getHours();
  const WeekDay = data.startDate.getDay();
  const TimeNumber = (WeekDay - 1) * 3 + Hour - 1;
  const fieldPicture = {
    0: "https://i.imgur.com/uR9JIRI.png",
    1: "https://i.imgur.com/C378EBB.png",
  };
  const onRecorderChanged = async (value) => {
    const response = await Match.UpdateScheduler({
      _id: target._id,
      recorder: value,
    });
    if (response.code === 200)
      setAppointments((data) =>
        data.map((match) => {
          if (match._id === _id) match.recorder = response.data.recorder;
          return match;
        })
      );
  };
  const { _id, home, away, text, startDate, field, recorder } = data;

  const columns = [
    { title: "隊名", dataIndex: "name" },
    {
      title: "學系",
      dataIndex: "department",
      render: (value) => translateDepartment(value),
    },
    { title: "報名狀態", dataIndex: "status" },
    { title: "預賽編號", dataIndex: "session_preGame" },
  ];
  return (
    <Modal
      title={"賽事資訊"}
      visible={visable}
      footer={[<Button onClick={() => setVisable(false)}>返回</Button>]}
      onCancel={() => setVisable(false)}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          hidden={field === null}
          width={200}
          height={200}
          src={fieldPicture[field]}
          preview={false}
        />

        <h3>{`比賽日期: ${
          field !== null ? startDate.toLocaleDateString() : "尚未安排"
        } ${field !== null ? time[startDate.getHours() - 1] : ""}`}</h3>
        <h3>{`${text} ${field === 0 ? "中央場 A" : "中央場 B"}`}</h3>
        <Table columns={columns} dataSource={[home, away]} pagination={false} />
        <Form>
          <Form.Item label="紀錄員">
            <Select
              placeholder={field !== null ? "尚未指派紀錄員" : "請先選擇時段"}
              onChange={onRecorderChanged}
              disabled={field === null}
              value={recorder ? recorder._id : null}
            >
              {recorders
                .filter(
                  (user) =>
                    !(
                      user._id in recorderBusyTime &&
                      recorderBusyTime[user._id].includes(TimeNumber)
                    )
                )
                .map((user) => (
                  <Option value={user._id}>
                    {`${user.account} (${translateDepartment(
                      user.department
                    )})`}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
