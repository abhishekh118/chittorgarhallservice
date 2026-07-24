import { useEffect, useState } from "react";
import API from "../api";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const load = () => API.get("/public/groups/mine").then((res) => setGroups(res.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await API.post("/public/groups", { name, description: "Local buying, sharing and coordination group" });
      setName("");
      setMessage("Group created");
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create");
    }
  };

  const join = async () => {
    try {
      await API.post("/public/groups/join", { code });
      setCode("");
      setMessage("Group joined");
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to join");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="page-banner"><span className="eyebrow">Community</span><h1>Local Groups</h1><p>Create or join groups to connect, buy items together, share requirements and coordinate locally.</p></div>
        {message && <div className="info-message">{message}</div>}
        <div className="two-panels">
          <div className="panel"><h3>Create group</h3><input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn primary" onClick={create}>Create</button></div>
          <div className="panel"><h3>Join group</h3><input placeholder="6 digit group code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /><button className="btn ghost" onClick={join}>Join</button></div>
        </div>
        <div className="group-grid">
          {groups.map((group) => (
            <article className="group-card" key={group._id}>
              <h3>{group.name}</h3><p>Code: <b>{group.code}</b></p><p>{group.members?.length || 0} members</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
