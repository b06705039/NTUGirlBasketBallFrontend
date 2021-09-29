import React, { useState, useEffect } from "react";
import {
  Table,
  Drawer,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  message,
} from "antd";
import { Team, Player } from "../axios";
import { usePages } from "../hooks/usePages";
import Departments from "../department.json";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
export default function CheckTeams() {
  const { userInfo } = usePages();
  const { user_id, admin } = userInfo;
  const [data, setData] = useState([]);
  const [onEditTeam, setOnEditTeam] = useState(false);
  const [onNewTeam, setOnNewTeam] = useState(false);
  const [EditTeam, setEditTeam] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    if (!user_id) return;
    const response = await Team.GetTeamByID(user_id);
    if (response.code === 200) setData(response.data);
    setLoading(false);
  }, [userInfo]);
  const columns = [
    {
      title: "隊名",
      dataIndex: "name",
    },
    {
      title: "創建時間",
      dataIndex: "create_time",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "代表系所",
      dataIndex: "department",
      render: (value) => Departments["info"][value]["zh"],
    },
    {
      title: "編輯",
      render: (value) => {
        return (
          <Button
            type="primary"
            onClick={() => {
              setOnEditTeam(true);
              setEditTeam(value);
            }}
          >
            編輯
          </Button>
        );
      },
    },
  ];
  const statusOption = [
    { value: "未報名", text: "未報名" },
    { value: "未繳費", text: "未繳費" },
    { value: "已繳費", text: "已繳費" },
  ];
  const interGameOption = [
    { value: -1, text: "未晉級" },
    { value: 0, text: "晉級" },
  ];
  const AdministerColumns = [
    {
      title: "隊名",
      dataIndex: "name",
    },
    {
      title: "使用者",
      dataIndex: "user_id",
      render: (user) => <a href={`/profile/${user._id}`}>{user.account}</a>,
    },

    {
      title: "創建時間",
      dataIndex: "create_time",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "代表系所",
      dataIndex: "department",
      render: (value) => Departments["info"][value]["zh"],
    },
    {
      title: "狀態",
      render: (teamInfo) => {
        return (
          <Select
            defaultValue={teamInfo.status}
            onChange={async (value) => {
              const { _id } = teamInfo;
              const response = await Team.Status({
                team_id: _id,
                status: value,
              });
              if (response.code === 200) message.success("Success");
            }}
          >
            {statusOption.map(({ text, value }) => (
              <Option value={value}>{text}</Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "晉級編號",
      render: (teamInfo) => {
        return teamInfo.session_interGame <= 0 ? (
          <Select
            defaultValue={teamInfo.session_interGame}
            onChange={async (value) => {
              const { _id } = teamInfo;
              const response = await Team.Status({
                team_id: _id,
                session_interGame: value,
              });
              if (response.code === 200) message.success("Success");
            }}
          >
            {interGameOption.map(({ text, value }) => (
              <Option value={value}>{text}</Option>
            ))}
          </Select>
        ) : (
          teamInfo.session_interGame
        );
      },
    },
    {
      title: "檢視",
      render: (value) => {
        return (
          <Button
            type="primary"
            onClick={() => {
              setOnEditTeam(true);
              setEditTeam(value);
            }}
          >
            檢視
          </Button>
        );
      },
    },
  ];
  return (
    <div>
      <Button
        type="primary"
        style={{
          marginBottom: 10,
          marginLeft: 50,
          marginTop: 20,
        }}
        onClick={() => {
          setOnNewTeam(true);
        }}
        hidden={admin !== "team"}
      >
        新增隊伍
      </Button>

      <Table
        columns={admin === "administer" ? AdministerColumns : columns}
        dataSource={data}
        loading={loading}
        style={{
          marginRight: 50,
          marginBottom: 50,
          marginLeft: 50,
        }}
      />
      <TeamEditor
        value={EditTeam}
        visable={onEditTeam}
        setVisable={setOnEditTeam}
        setData={setData}
        editable={admin === "team"}
      />
      <CreateTeam
        visable={onNewTeam}
        setVisable={setOnNewTeam}
        setData={setData}
      />
    </div>
  );
}

function CreateTeam({ value, visable, setVisable, setData }) {
  const [form] = Form.useForm();
  const [isChanged, setIsChanged] = useState(false);
  const handleSubmit = async () => {
    const { name, department } = form.getFieldsValue();
    const response = await Team.Create(name, department);
    if (response.code !== 200) {
      message.error(response.message);
      form.setFields(response.data);
      return;
    }
    setData((data) => [...data, response.data]);
    setVisable(false);
  };
  const handleCancel = () => {
    form.setFieldsValue(value);
    setIsChanged(false);
    setVisable(false);
  };
  const formItemLayout = {
    labelCol: {
      sm: {
        span: 5,
      },
    },
    wrapperCol: {
      sm: {
        span: 15,
      },
    },
  };

  return (
    <Drawer
      title="編輯隊伍"
      placement="right"
      closable={true}
      width={800}
      onClose={() => {
        setVisable(false);
      }}
      visible={visable}
    >
      <div style={{ marginBottom: 30 }}>
        <Form
          form={form}
          initialValues={value}
          {...formItemLayout}
          hasFeedback
          onValuesChange={() => setIsChanged(true)}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="隊伍名稱"
            name="name"
            labelAlign="left"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input your team name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="隊伍系級"
            name="department"
            labelAlign="left"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input your department!",
              },
            ]}
          >
            <Select placeholder="Select your department">
              {Object.keys(Departments.info).map((part, index) => (
                <Option key={index} value={part}>
                  {Departments.info[part]["zh"]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

        <Button
          style={{ marginRight: 10 }}
          onClick={() => form.submit()}
          disabled={!isChanged}
          type="primary"
        >
          新增隊伍
        </Button>
        <Button style={{ marginRight: 10 }} onClick={handleCancel}>
          取消新稱
        </Button>
      </div>
    </Drawer>
  );
}

function TeamEditor({ value, visable, setVisable, setData, editable }) {
  const [form] = Form.useForm();
  const [onDelete, setOnDelete] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const handleDelete = async () => {
    const response = await Team.Delete(value._id);
    if (response.code === 200) {
      message.success("Delete Success");
      setData((data) => [...data].filter((team) => team._id !== value._id));
      setOnDelete(false);
      setVisable(false);
      return;
    }
    message.error(response.message);
  };
  const handleUpdate = async () => {
    const { name, department } = form.getFieldsValue();
    const response = await Team.Update(value._id, name, department);
    if (response.code !== 200) {
      message.error(response.message);
      form.setFields(response.data);
      return;
    }
    setData((data) =>
      [...data].map((team) => {
        if (team._id === value._id) {
          team.name = name;
          team.department = department;
        }
        return team;
      })
    );
    setVisable(false);
  };

  const handleCancel = () => {
    form.setFieldsValue(value);
    setIsChanged(false);
    setVisable(false);
  };
  useEffect(() => {
    form.setFieldsValue(value);
    setIsChanged(false);
  }, [value]);
  const formItemLayout = {
    labelCol: {
      sm: {
        span: 5,
      },
    },
    wrapperCol: {
      sm: {
        span: 15,
      },
    },
  };

  return (
    <Drawer
      title={editable ? "編輯隊伍" : "檢視隊伍"}
      placement="right"
      closable={true}
      width={800}
      onClose={() => {
        setVisable(false);
      }}
      visible={visable}
    >
      <div style={{ marginBottom: 30 }}>
        <Form
          form={form}
          initialValues={value}
          {...formItemLayout}
          hasFeedback
          onValuesChange={() => setIsChanged(true)}
          onFinish={handleUpdate}
        >
          <Form.Item
            label="隊伍名稱"
            name="name"
            labelAlign="left"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input your team name!",
              },
            ]}
          >
            <Input disabled={!editable} />
          </Form.Item>
          <Form.Item
            label="隊伍系級"
            name="department"
            labelAlign="left"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input your department!",
              },
            ]}
          >
            <Select placeholder="Select your department" disabled={!editable}>
              {Object.keys(Departments.info).map((part, index) => (
                <Option key={index} value={part}>
                  {Departments.info[part]["zh"]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

        <Button
          style={{ marginRight: 10 }}
          onClick={() => setOnDelete(true)}
          type="primary"
          danger
          hidden={!editable}
        >
          刪除隊伍
        </Button>
        <Button
          style={{ marginRight: 10 }}
          onClick={() => form.submit()}
          disabled={!isChanged}
          type="primary"
          hidden={!editable}
        >
          完成編輯
        </Button>
        <Button style={{ marginRight: 10 }} onClick={handleCancel}>
          {editable ? "取消編輯" : "返回"}
        </Button>
      </div>
      <PlayersTable teamID={value._id} visable={visable} editable={editable} />
      <Modal
        title={
          <div>
            <ExclamationCircleOutlined />
            刪除確認
          </div>
        }
        visible={onDelete}
        onOk={handleDelete}
        onCancel={() => setOnDelete(false)}
      >
        <h3 style={{ textAlign: "center" }}>{`確定要刪除 "${value.name}"`}</h3>
      </Modal>
    </Drawer>
  );
}

function PlayersTable({ teamID, editable }) {
  const [data, setData] = useState([]);
  const [onEditPlayer, setOnEditPlayer] = useState(false);
  const [onDeletePlayer, setOnDeletePlayer] = useState(false);
  const [playerID, setPlayerID] = useState({});
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  useEffect(async () => {
    setLoading(true);
    const response = await Player.GetAllPlayerByTeamID(teamID);
    if (response.code === 200) {
      setData(response.data);
    }
    setLoading(false);
  }, [teamID]);
  const DeletePlayer = async () => {
    const response = await Player.Delete(playerID);
    if (response.code === 200) {
      message.success("Delete Success");
      setData((data) => [...data].filter(({ _id }) => playerID !== _id));
      setOnEditPlayer(false);
      setOnDeletePlayer(false);
      return;
    }
    message.error(response.message);
    setOnDeletePlayer(false);
  };

  const EditPlayerSubmit = async () => {
    const playerObj = form.getFieldsValue();
    playerObj.player_id = playerID;
    const response = await Player.Update(playerObj);
    if (response.code === 200) {
      message.success(response.message);
      setOnEditPlayer(false);
      setData((data) =>
        [...data].map((player) => {
          if (player._id === playerID) {
            return response.data;
          }
          return player;
        })
      );
      return;
    }
    message.error(response.message);
  };

  const NewPlayerSubmit = async () => {
    const playerObj = form.getFieldsValue();
    playerObj.team_id = teamID;
    const response = await Player.Create(playerObj);
    if (response.code === 200) {
      message.success(response.message);
      setOnEditPlayer(false);
      setData((data) => [...data, response.data]);
      return;
    }
    message.error(response.message);
  };

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "學號",
      dataIndex: "studentID",
    },
    {
      title: "年級",
      dataIndex: "grade",
    },
    {
      title: "背號",
      dataIndex: "number",
    },
    {
      title: "創建時間",
      dataIndex: "create_time",
      render: (value) => new Date(value).toLocaleString(),
    },
  ];
  if (editable)
    columns.push({
      title: "設定",
      render: (value) => (
        <Button
          type="primary"
          onClick={() => {
            setOnEditPlayer(true);
            setPlayerID(value._id);
            form.setFieldsValue(value);
          }}
        >
          編輯
        </Button>
      ),
    });
  const formItemLayout = {
    labelCol: {
      sm: {
        span: 5,
      },
    },
    wrapperCol: {
      sm: {
        span: 15,
      },
    },
  };

  return (
    <React.Fragment>
      <Table columns={columns} dataSource={data} loading={loading} />
      <Button
        type="primary"
        onClick={() => {
          setOnEditPlayer(true);
          setPlayerID(null);
          form.resetFields();
        }}
        hidden={!editable}
      >
        新增球員
      </Button>
      <Modal
        title="編輯球員"
        visible={onEditPlayer}
        centered
        footer={[
          <Button onClick={() => setOnEditPlayer(false)}>取消編輯</Button>,
          <Button type="primary" onClick={() => form.submit()}>
            {playerID ? "完成編輯" : "新增球員"}
          </Button>,
          <Button
            danger
            type="primary"
            onClick={() => setOnDeletePlayer(true)}
            hidden={playerID === null}
          >
            刪除球員
          </Button>,
        ]}
      >
        <Form
          form={form}
          {...formItemLayout}
          hasFeedback
          onFinish={playerID === null ? NewPlayerSubmit : EditPlayerSubmit}
        >
          <Form.Item
            label="姓名"
            name="name"
            labelAlign="left"
            rules={[
              {
                required: true,
                message: "請輸入球員姓名",
              },
              {
                validator: (_, value) => {
                  if (
                    data.find(
                      ({ name, _id }) => name === value && _id !== playerID
                    )
                  )
                    return Promise.reject(new Error("此人姓名已登錄"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="學號"
            name="studentID"
            labelAlign="left"
            rules={[
              {
                required: true,
                message: "請輸入球員學號",
              },
              {
                validator: (_, value) => {
                  if (
                    data.find(
                      ({ studentID, _id }) =>
                        studentID === value && _id !== playerID
                    )
                  )
                    return Promise.reject(new Error("此人學號已登錄"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="年級"
            name="grade"
            labelAlign="left"
            rules={[
              {
                required: true,
                message: "請輸入球員姓名",
              },
            ]}
          >
            <Select>
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <Option value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="背號"
            name="number"
            labelAlign="left"
            rules={[
              {
                type: "number",
                max: 100,
                min: 0,
                message: "請輸入 0~100 的數字",
              },
              {
                required: true,
                message: "請輸入球員背號",
              },
              {
                validator: (_, value) => {
                  if (
                    data.find(
                      ({ number, _id }) => number === value && _id !== playerID
                    )
                  )
                    return Promise.reject(new Error("此人背號已登記"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={onDeletePlayer}
        onCancel={() => setOnDeletePlayer(false)}
        onOk={DeletePlayer}
        title={"確認刪除球員"}
      >{`確認刪除球員 ${form.getFieldValue("name")}`}</Modal>
    </React.Fragment>
  );
}
