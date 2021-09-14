import React from "react";
import Scheduler, {
  AppointmentDragging,
  Resource,
  View,
} from "devextreme-react/scheduler";
import Draggable from "devextreme-react/draggable";
import ScrollView from "devextreme-react/scroll-view";
import notify from "devextreme/ui/notify";
import AppointmentFormat from "../components/Appointment";
import AppointmentTooltip from "../components/AppointmentTooltip";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import "../css/scheduler.css";
import { Match, Time } from "../axios";
import { LoadPanel } from "devextreme-react/load-panel";
const currentDate = new Date(2021, 4, 24);
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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.uploading = false;
    this.state = {
      appointments: [],
      busytime: {},
      recorders: {},
      teams: {},
      currentAppointment: null,
      loading: true,
    };
    this.scheduler = React.createRef();
  }
  startupload = () => {
    this.setState(() => ({ loading: true }));
    notify("Uploading");
  };
  endupload = () => {
    this.setState(() => ({ loading: false }));
    notify("Uploaded");
  };
  componentWillUnmount = () => {};

  componentDidMount = () => {
    (async () => {
      let allmatches = (await Match.GetALLMatch()).filter(
        (x) => x.stage === "preGame"
      );
      allmatches.forEach((match, index) => {
        match.text = `${match.home} vs ${match.away}`;
        match.startDate = new Date(match.startDate);
      });
      let responseTime = await Time.GetALLTime();
      let setbusytime = {},
        setrecorder = [],
        setteam = {},
        teamtime = {};
      responseTime.recorderTimes.forEach((x) => {
        setrecorder.push({ name: x.name, department: x.department, id: x.id });
        x.times.forEach((time) => {
          if (time in setbusytime) setbusytime[time].recorder.push(x.name);
          else {
            setbusytime[time] = { recorder: [x.name] };
          }
        });
      });
      responseTime.teamTimes.forEach((x) => {
        setteam[x.name] = x.department;
        teamtime[x.name] = x.times;
      });
      this.setState(() => ({
        appointments: allmatches,
        teams: setteam,
        recorders: setrecorder,
        busytime: setbusytime,
        teamtime,
        loading: false,
      }));
    })();
  };

  showTeamBusy = (home, away) => {
    let thisbusy = {};
    if (home in this.state.teamtime)
      this.state.teamtime[home].map((time) => {
        thisbusy[time] = `${home}: 無法出賽`;
        return true;
      });
    if (away in this.state.teamtime)
      this.state.teamtime[away].map((time) => {
        if (time in thisbusy) thisbusy[time] = `${home}, ${away}: 無法出賽`;
        else thisbusy[time] = `${away}: 無法出賽`;
        return true;
      });

    for (let time in thisbusy) {
      let element = document.getElementById(time + "-0");
      if (element !== null) {
        element.textContent = thisbusy[time];
        element.className = "unable-date";
      }
      let element2 = document.getElementById(time + "-1");
      if (element2 !== null) {
        element2.textContent = thisbusy[time];
        element2.className = "unable-date";
      }
    }
  };

  closeTeamBusy = () => {
    let elements = document.getElementsByClassName("unable-date");
    let number = elements.length;
    for (let i = 0; i < number; i++) {
      elements[i].textContent = "";
    }
  };

  render() {
    const { appointments } = this.state;
    return (
      <React.Fragment>
        <div
          id="scheduler-container"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Scheduler
            ref={this.scheduler}
            adaptivityEnabled={true}
            timeZone="Asia/Taipei"
            id="scheduler"
            dataSource={appointments.filter((x) => x.arranged === true)}
            defaultCurrentDate={currentDate}
            height={"100%"}
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
            dataCellComponent={this.DataCell}
            defaultCurrentView={views[0]}
            appointmentComponent={AppointmentFormat}
            appointmentTooltipComponent={AppointmentTooltip}
            onAppointmentFormOpening={this.onAppointmentFormOpening}
            onAppointmentUpdating={this.onAppointmentUpdating}
            onAppointmentAdded={this.onAppointmentAdd}
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
              onRemove={this.onAppointmentRemove}
              onAdd={this.onAppointmentAdd}
              onDragEnd={this.onAppointmentDragEnd}
              onDragStart={this.onAppointmentDragStart}
            />
          </Scheduler>
          <h1 style={{ marginLeft: 50 }}>賽程</h1>
          <ScrollView
            id="scroll"
            direction="both"
            height={50}
            width={"100%"}
            bounceEnabled={true}
            showScrollbar="always"
            useNative={false}
          >
            <Draggable
              id="DragList"
              data="dropArea"
              height={50}
              group={draggingGroupName}
              onDragStart={this.onListDragStart}
            >
              {this.state.appointments
                .filter((x) => x.arranged === false)
                .map((task, index) => {
                  task.key = index;
                  return (
                    <Draggable
                      key={index}
                      className="item dx-card dx-theme-text-color dx-theme-background-color"
                      clone={true}
                      group={draggingGroupName}
                      data={task}
                      width={200}
                      onDragStart={this.onItemDragStart}
                      onDragEnd={this.onItemDragEnd}
                    >
                      <div style={{ textAlign: "center" }}>{task.text}</div>
                    </Draggable>
                  );
                })}
            </Draggable>
          </ScrollView>
        </div>
        <LoadPanel
          shadingColor="rgba(0,0,0,0.4)"
          position={{ of: "#scheduler-container" }}
          visible={this.state.loading}
        />
      </React.Fragment>
    );
  }

  checkIfNoGame(startDate) {
    const WeekDay = startDate.getDay();
    if (startDate.getHours() === 1 && (WeekDay === 2 || WeekDay === 4)) {
      notify(`Games can not be arrange at Tuesday's and Thursday's noon.`);
      return true;
    }
    return false;
  }

  onAppointmentDragEnd = () => {
    this.closeTeamBusy();
  };
  onAppointmentDragStart = (e) => {
    this.showTeamBusy(e.itemData.home, e.itemData.away);
  };

  onAppointmentRemove = (e) => {
    if (e.itemData.arranged === true) {
      const index = this.state.appointments.indexOf(e.itemData);
      let newappointments = this.state.appointments;
      delete newappointments[index].startDate;
      delete newappointments[index].endDate;

      newappointments[index].recorder_id = null;
      newappointments[index].recorder = null;
      newappointments[index].arranged = false;
      this.setState({
        appointments: newappointments,
        currentAppointment: null,
      });
      const { id } = e.itemData;
      (async () => {
        this.startupload();
        await Match.Update(id, null, null, null);
        this.endupload();
      })();
    }
  };

  checkTeams = (home, away, startDate) => {
    if (
      home in this.state.teamtime &&
      this.state.teamtime[home].find((x) => startDate.toISOString() === x) !==
        undefined
    ) {
      notify(`${home} is not avaliable.`);
      return false;
    } else if (
      away in this.state.teamtime &&
      this.state.teamtime[away].find((x) => startDate.toISOString() === x) !==
        undefined
    ) {
      notify(`${away} is not avaliable.`);
      return false;
    }
    return true;
  };

  checkMatches = (id, home, away, startDate, field) => {
    let checkExist = this.state.appointments.find(
      (x) =>
        startDate !== null &&
        startDate !== undefined &&
        x.startDate !== null &&
        x.startDate !== undefined &&
        new Date(startDate).toISOString() ===
          new Date(x.startDate).toISOString() &&
        x.field === field
    );
    if (checkExist !== undefined) {
      return false;
    }
    let check = this.state.appointments.filter(
      // 取得當天所有已排的的比賽
      (x) =>
        x.arranged && // 已上排程
        id !== x.id && // 不是自己
        startDate.getDate() === x.startDate.getDate() // 同一天
    );
    check = check.filter(
      (x) =>
        x.home === home ||
        x.home === away ||
        x.away === home ||
        x.away === away || // 在當天有其他比賽
        (x.startDate === startDate && x.field === field) // 在同一個時段以及場地有比賽
    );
    return check.length === 0 ? true : false;
  };

  onAppointmentAdd = (e) => {
    if (this.uploading) {
      e.cancel = true;
      return;
    }
    if (e.itemData === undefined) {
      e.cancel = true;
      return;
    }
    if (e.itemData.startDate.getHours() === 0) {
      e.cancel = true;
      return;
    }

    if (this.checkIfNoGame(e.itemData.startDate)) {
      e.cancel = true;
      return;
    }

    if (
      !this.checkTeams(e.fromData.home, e.fromData.away, e.itemData.startDate)
    ) {
      e.cancel = true;
      return;
    }

    if (
      !this.checkMatches(
        e.fromData.id,
        e.fromData.home,
        e.fromData.away,
        e.itemData.startDate,
        e.itemData.field
      )
    ) {
      e.cancel = true;
      notify(
        `${e.fromData.home} or ${e.fromData.away} have game at the same time`
      );
      return;
    }

    if (e.fromData.arranged === false) {
      const index = this.state.appointments.indexOf(e.fromData);
      let newappointments = this.state.appointments;
      e.itemData.endDate = new Date(e.itemData.startDate);
      e.itemData.endDate.setHours(e.itemData.startDate.getHours() + 1);
      newappointments[index] = e.itemData;
      newappointments[index].arranged = true;
      this.setState({
        appointments: newappointments,
      });
      const { id, startDate, field, recorder_id } = e.itemData;
      (async () => {
        this.startupload();
        await Match.Update(id, startDate, field, recorder_id);
        this.endupload();
      })();
    }
  };

  onAppointmentUpdating = (e) => {
    if (this.uploading) {
      e.cancel = true;
      return;
    }
    if (e.oldData.recorder_id !== e.newData.recorder_id) return;
    if (e.newData.allDay) e.cancel = true;
    if (e.newData.startDate.getHours() === 0) {
      e.cancel = true;
      return;
    }

    if (this.checkIfNoGame(e.newData.startDate)) {
      e.cancel = true;
      return;
    }

    if (!this.checkTeams(e.oldData.home, e.oldData.away, e.newData.startDate)) {
      e.cancel = true;
      return;
    }

    if (
      !this.checkMatches(
        e.oldData.id,
        e.oldData.home,
        e.oldData.away,
        e.newData.startDate,
        e.newData.field
      )
    ) {
      e.cancel = true;
      notify(
        `${e.oldData.home} or ${e.oldData.away} have game at the same time`
      );
      return;
    }
    const { id, startDate, field, recorder_id } = e.newData;
    (async () => {
      this.startupload();
      await Match.Update(id, startDate, field, recorder_id);
      this.endupload();
    })();
  };

  onListDragStart(e) {
    e.cancel = true;
  }

  onItemDragStart = (e) => {
    e.itemData = e.fromData;
    this.showTeamBusy(e.fromData.home, e.fromData.away);
  };

  onItemDragEnd = (e) => {
    this.closeTeamBusy();
    if (e.toData) {
      e.cancel = true;
    }
  };

  onAppointmentFormOpening = (data) => {
    const { homeDepartment, awayDepartment, startDate, recorder_id } =
      data.appointmentData;
    if (!homeDepartment) {
      data.cancel = true;
      return;
    }
    if (this.checkIfNoGame(startDate)) {
      data.cancel = true;
      return;
    }
    let busyrecorders = [];
    if (startDate.toISOString() in this.state.busytime) {
      busyrecorders = this.state.busytime[startDate.toISOString()].recorder;
    }
    let options = this.state.recorders.filter((x) => {
      let output =
        x.department !== homeDepartment &&
        x.department !== awayDepartment &&
        busyrecorders.find((person) => person === x.name) === undefined;
      return output;
    });

    if (options.length === 0) {
      notify("Seem there are no avaliable recorders");
      data.cancel = true;
      return;
    }

    let form = data.form;
    form.option("items", [
      {
        colSpan: 2,
        label: {
          text: "Recorder",
        },
        editorType: "dxSelectBox",
        dataField: "recorder_id",
        value: recorder_id,
        editorOptions: {
          items: options,
          itemTemplate: function (option) {
            return `${option.name} ${option.department}`;
          },
          onValueChanged: (args) => {
            let target = options.find((x) => x.id === args.value);
            if (target !== undefined) form.updateData("recorder", target.name);
          },
          displayExpr: "name",
          valueExpr: "id",
        },
      },
    ]);
  };

  DataCell = (props) => {
    let cellName = "",
      text = "";
    let time = props.data.startDate.toISOString();
    const WeekDay = props.data.startDate.getDay();
    if (
      props.data.startDate.getHours() === 1 &&
      (WeekDay === 2 || WeekDay === 4)
    ) {
      cellName = "disable-date";
      text = "No Game";
    }
    return (
      <div className={cellName} id={`${time}-${props.data.groups.field}`}>
        {text}
      </div>
    );
  };
}

export default App;
