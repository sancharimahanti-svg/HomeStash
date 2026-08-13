import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const HouseholdSetup = () => {
  const [mode, setMode] = useState(null); // "create" | "join"
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleCreate = async () => {
    if (!householdName.trim()) return toast.error("Enter a household name");
    setLoading(true);
    try {
      await axiosInstance.post("/api/household/create", {
        name: householdName,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Household created!");
      // refresh user in localStorage then go to dashboard
      const me = await axiosInstance.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(me.data.user));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create household");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return toast.error("Enter an invite code");
    setLoading(true);
    try {
      await axiosInstance.post("/api/household/join", {
        inviteCode: inviteCode.trim().toUpperCase(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Joined household!");
      const me = await axiosInstance.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(me.data.user));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };

  // ... all your styles stay exactly the same
  const containerStyle = {
    minHeight: "100vh",
    background: "#fdf6ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e0c9b4",
    padding: "40px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 8px 30px rgba(59,31,15,0.08)",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "800",
    color: "#2c1810",
    marginBottom: "8px",
  };

  const subStyle = {
    fontSize: "14px",
    color: "#8b6b58",
    marginBottom: "32px",
  };

  const btnRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "28px",
  };

  const modeBtn = (active) => ({
    padding: "14px",
    borderRadius: "10px",
    border: `2px solid ${active ? "#6b3a22" : "#e0c9b4"}`,
    background: active ? "#6b3a22" : "#fdf6ed",
    color: active ? "white" : "#5c3d2e",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #e0c9b4",
    background: "#fdf6ed",
    fontSize: "14px",
    color: "#2c1810",
    marginBottom: "16px",
    outline: "none",
  };

  const submitBtn = {
    width: "100%",
    padding: "13px",
    background: "#6b3a22",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏠</div>
        <div style={titleStyle}>Set up your household</div>
        <div style={subStyle}>
          Create a new household or join one with an invite code.
        </div>

        <div style={btnRowStyle}>
          <button style={modeBtn(mode === "create")} onClick={() => setMode("create")}>
            ➕ Create new
          </button>
          <button style={modeBtn(mode === "join")} onClick={() => setMode("join")}>
            🔗 Join existing
          </button>
        </div>

        {mode === "create" && (
          <>
            <label style={{ fontSize: "13px", color: "#5c3d2e", fontWeight: "600" }}>
              Household name
            </label>
            <input
              style={{ ...inputStyle, marginTop: "6px" }}
              placeholder='e.g. "The Sharma Family"'
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
            />
            <button style={submitBtn} onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Create Household"}
            </button>
          </>
        )}

        {mode === "join" && (
          <>
            <label style={{ fontSize: "13px", color: "#5c3d2e", fontWeight: "600" }}>
              Invite code
            </label>
            <input
              style={{ ...inputStyle, marginTop: "6px" }}
              placeholder="e.g. STASH-A3X9K2"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            />
            <button style={submitBtn} onClick={handleJoin} disabled={loading}>
              {loading ? "Joining..." : "Join Household"}
            </button>
          </>
        )}

        {!mode && (
          <div style={{
            textAlign: "center",
            color: "#8b6b58",
            fontSize: "13px",
            padding: "20px 0",
          }}>
            👆 Choose an option above to get started
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdSetup;