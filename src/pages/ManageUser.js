import React, { useEffect, useState } from "react";
import { usePages } from "../hooks/usePages";
import { User } from "../axios";
import { Table, Select, message } from "antd";
import { translateDepartment, DepartmentOptions } from "../department";
const { Option } = Select;

export default function ManageUser() {
  const { userInfo } = usePages();
  const { admin } = userInfo;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    if (admin === "administer") {
      const response = await User.GetAccount();
      if (response.code === 200) setData(response.data);
    } else {
      const response = await User.GetAccount({ admin: { $ne: "administer" } });
      if (response.code === 200) setData(response.data);
    }
    setLoading(false);
  }, []);
  const admins = {
    administer: "主辦單位",
    recorder: "記錄員",
    team: "系隊",
  };
  const columns = [
    { title: "使用者名稱", dataIndex: "account" },
    {
      title: "使用者學系",
      dataIndex: "department",
      render: (value) => translateDepartment(value),
      filters: DepartmentOptions,
      onFilter: (value, user) => value === user.department,
    },
    { title: "使用者信箱", dataIndex: "email" },
    {
      title: "使用者類別",
      dataIndex: "admin",
      onFilter: (value, user) => value === user.admin,
      filters: [
        { text: "主辦單位", value: "administer" },
        { text: "系隊", value: "team" },
        { text: "記錄員", value: "recorder" },
      ],

      render: (value) => admins[value],
    },
    {
      title: "使用者狀態",
      render: ({ active, _id }) => (
        <Select
          defaultValue={active}
          onChange={async (value) => {
            const response = await User.AccountActive(_id);
            if (response.code === 200) {
              message.success("Success");
              setData((data) =>
                [...data].map((user) => {
                  if (user._id === _id) user.active = value;
                  return user;
                })
              );
            }
          }}
        >
          <Option value={true}>已啟用</Option>
          <Option value={false}>未啟用</Option>
        </Select>
      ),
    },
  ];
  return (
    <div>
      <Table dataSource={data} loading={loading} columns={columns} />
    </div>
  );
}
