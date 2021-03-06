import React, { useEffect, useState } from "react";
import { Card, Divider, Table } from "antd";
import Creater from "../images/b05502037.jpg";
import { User } from "../axios";
const { Meta } = Card;

export default function Contact() {
  const Row = {
    marginTop: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
  };

  const [administers, setAdministers] = useState([]);
  const columns = [
    { title: "名稱", dataIndex: "account" },
    { title: "信箱", dataIndex: "email" },
    { title: "系級", dataIndex: "department" },
  ];
  useEffect(async () => {
    const response = await User.GetAccount({ admin: "administer" });
    if (response.code === 200) setAdministers(response.data);
  }, []);
  return (
    <div>
      <Divider plain orientation="center">
        <h2>網站設計</h2>
      </Divider>
      <div style={Row}>
        <Card
          hoverable
          title="前端設計"
          style={{ width: 240, marginRight: 20 }}
          cover={<img src={Creater} style={{ width: 200, margin: "0 auto" }} />}
        >
          <Meta title="鍾詔東" description="NTUME" />
          thomson861106@gmail.com
        </Card>
        <Card
          hoverable
          title="後端設計"
          style={{ width: 240, marginRight: 20 }}
          cover={<img src={Creater} style={{ width: 200, margin: "0 auto" }} />}
        >
          <Meta title="鍾詔東" description="NTUME, R09522624" />
          thomson861106@gmail.com
        </Card>
      </div>
      <Divider plain orientation="center">
        <h2>主辦單位</h2>
      </Divider>
      <div style={{ marginLeft: "25%", marginRight: "25%" }}>
        <Table dataSource={administers} columns={columns} />
      </div>
    </div>
  );
}
