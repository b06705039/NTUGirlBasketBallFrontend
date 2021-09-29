import React, { useState, useEffect, useRef } from "react";
import { Modal, Image, Table, Select, Button, Form } from "antd";
import Scheduler, { Resource, View } from "devextreme-react/scheduler";
import { translateDepartment } from "../department";
import AppointmentFormat from "../components/Appointment";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import "../css/scheduler.css";
import { Match, User } from "../axios";
import { LoadPanel } from "devextreme-react/load-panel";
import { usePages } from "../hooks/usePages";

const views = ["workWeek"];

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
  const [arrangedMatches, setArranged] = useState(testData);
  const [recorders, setRecorders] = useState([]);
  const [onEditAppointment, setOnEdit] = useState(false);
  const [target, setTarget] = useState(null);
  const scheduler = useRef();
  const { userInfo } = usePages();
  const { user_id } = userInfo;

  const onAppointmentClick = (e) => {
    setTarget(e.appointmentData);
    setOnEdit(true);
    e.cancel = true;
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
    let response = await Match.GetALLMatch();
    if (response.code === 200) {
      setArranged(
        response.data
          .filter((match) => match.startDate !== null)
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
          adaptivityEnabled={true}
          timeZone="Asia/Taipei"
          id="scheduler"
          dataSource={arrangedMatches}
          defaultCurrentDate={new Date(2021, 1, 1)}
          height={"100%"}
          startDayHour={1}
          endDayHour={4}
          cellDuration={60}
          editing={{
            allowAdding: false,
            allowDeleting: false,
            allowResizing: false,
            allowDragging: false,
            allowUpdating: false,
          }}
          groupByDate={true}
          groups={["field"]}
          views={views}
          dataCellComponent={DataCell}
          defaultCurrentView={views[0]}
          appointmentComponent={AppointmentFormat}
          appointmentTooltipComponent={null}
          onAppointmentClick={onAppointmentClick}
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
        </Scheduler>
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
  const fieldPicture = {
    0: "https://i.imgur.com/uR9JIRI.png",
    1: "https://i.imgur.com/C378EBB.png",
  };

  const { home, away, text, startDate, field, recorder } = data;
  const columns = [
    { title: "隊名", dataIndex: "name" },
    {
      title: "學系",
      dataIndex: "department",
      render: (value) => translateDepartment(value),
    },
    { title: "狀態", dataIndex: "status" },
    { title: "預賽編號", dataIndex: "session_preGame" },
  ];
  return (
    <Modal
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
          width={200}
          height={200}
          src={fieldPicture[field]}
          preview={false}
        />

        <h3>{`比賽日期: ${startDate.toLocaleDateString()} ${
          time[startDate.getHours() - 1]
        }`}</h3>
        <h3>{`${text} ${field === 0 ? "中央場 A" : "中央場 B"}`}</h3>
        <Table columns={columns} dataSource={[home, away]} pagination={false} />
        <Form>
          <Form.Item label="紀錄員">
            {recorder ? (
              <a href={`/profile/${recorder._id}`}>{recorder.account}</a>
            ) : (
              "尚未指派"
            )}
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
