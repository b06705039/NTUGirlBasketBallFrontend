import React, { useState, useContext, useEffect } from "react";
import { pagesMenu } from "./pagesMenu";
import { CheckToken } from "../axios";

// 加入下面這行 const { ..., pageName } = pagesMenu()
const {
  News,
  PreGamePage,
  Default,
  Try,
  Scheduler,
  Timer,
  InterGamePage,
  PostNews,
  InChargeGame,
  Checkteam,
  SchedulerRead,
  Contact,
  ManageUser,
} = pagesMenu();

// 找到相對應頁面，改後面的component
const zhPage = {
  news: ["最新消息", News],
  schedule: ["安排賽程時間", Scheduler],
  scheduleRead: ["賽程時間表", SchedulerRead],
  gameResult: ["比賽結果", Default],
  adminInfo: ["主辦介紹", Default],
  contact: ["聯絡資訊", Contact],
  main: ["首頁", News],
  teamInfo: ["球隊資訊", Try],
  preGame: ["安排預賽賽程", PreGamePage],
  interGame: ["安排複賽循環", InterGamePage],
  annouce: ["發布消息", PostNews],
  inChargeGame: ["負責賽事", InChargeGame],
  register: ["報名", Default],
  scheduleTime: ["填寫賽程時間", Timer],
  Checkteam: ["確認隊伍資訊", Checkteam],
  ManageUser: ["管理使用者", ManageUser],
};
const idPage = {
  public: ["main", "scheduleRead", "gameResult", "contact"],
  administer: [
    "main",
    "preGame",
    "interGame",
    "schedule",
    "annouce",
    "Checkteam",
    "ManageUser",
  ],
  recorder: ["main", "inChargeGame", "scheduleTime", "scheduleRead"],
  team: ["main", "register", "Checkteam", "scheduleTime", "scheduleRead"],
};

const Pages = React.createContext();

export function usePages() {
  return useContext(Pages);
}

const userForm = {
  account: null,
  active: null,
  admin: "public",
  email: null,
  token: null,
  user_id: null,
  username: null,
};

export function PagesProvider({ children }) {
  const [userInfo, setUserInfo] = useState(userForm);
  const [id, setId] = useState(userForm.admin);
  const [pageList, setPageList] = useState(idPage[id]);
  const [zhPageList, setZhPageList] = useState(
    pageList.map((page) => zhPage[page])
  );
  const [curPage, setCurPage] = useState(zhPageList[0]);

  const logout = () => {
    setUserInfo(userForm);
    localStorage.removeItem("userInfo");
  };

  useEffect(() => {
    async function getData() {
      const token = localStorage.getItem("userInfo");
      if (!token) return;
      const response = await CheckToken(token);
      if (response.code === 200) {
        setUserInfo(response.data);
        const updatePageList = idPage[response.data.admin];
        setId(response.data.admin);
        setPageList(updatePageList);
        setZhPageList(updatePageList.map((page) => zhPage[page]));
        setCurPage(zhPage[updatePageList[0]]);
        return;
      }
      setUserInfo(userForm);
      localStorage.removeItem("userInfo");
    }
    getData();
  }, []);

  useEffect(() => {
    setId(() => userInfo.admin);
  }, [userInfo]);

  useEffect(() => {
    const updateId = userInfo["admin"];
    const updatePageList = idPage[updateId];
    setId(updateId);
    setPageList(updatePageList);
    setZhPageList(updatePageList.map((page) => zhPage[page]));
    setCurPage(zhPage[updatePageList[0]]);
  }, [userInfo]);

  const value = {
    id,
    setId,
    zhPageList,
    curPage,
    setCurPage,
    userInfo,
    setUserInfo,
    logout,
  };

  return <Pages.Provider value={value}>{children}</Pages.Provider>;
}
