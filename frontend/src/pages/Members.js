import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const Members = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  const fetchHousehold = async () => {
    try {
      const { data } = await axiosInstance.get("/api/household", config);
      setHousehold(data.household);
    } catch (err) {
      toast.error("Failed to load household");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHousehold(); }, []);

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from the household?`)) return;
    try {
      await axiosInstance.delete(`/api/household/members/${userId}`, config);
      toast.success(`${name} removed`);
      fetchHousehold();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this household?")) return;
    try {
      await axiosInstance.post("/api/household/leave", {}, config);
      toast.success("You left the household");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    toast.success("Invite code copied!");
  };

  // all styles stay exactly the same
  const pageStyle = {
    padding: "32px",
    maxWidth: "700px",
    margin: "0 auto",
    background: "#fdf6ed",
    minHeight: "100vh",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e0c9b4",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 4px 16px rgba(59,31,15,0.06)",
  };

  const inviteBoxStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f5ede0",
    border: "1.5px dashed #c8a882",
    borderRadius: "10px",
    padding: "14px 18px",
    marginTop: "12px",
  };

  const codeStyle = {
    fontSize: "22px",
    fontWeight: "800",
    color: "#6b3a22",
    letterSpacing: "0.08em",
  };

  const memberRowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #f5ede0",
  };

  const avatarStyle = (color) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: color,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  });

  const badgeStyle = (role) => ({
    padding: "3px 10px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "600",
    background: role === "admin" ? "#3b1f0f" : "#f5ede0",
    color: role === "admin" ? "white" : "#6b3a22",
  });

  const colors = ["#6b3a22", "#a0522d", "#c8845a", "#8b6b58", "#5c3d2e"];

  if (loading) return (
    <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8b6b58" }}>Loading...</div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#2c1810", marginBottom: "6px" }}>
        👨‍👩‍👧 Household Members
      </h1>
      <p style={{ color: "#8b6b58", fontSize: "14px", marginBottom: "24px" }}>
        Manage your household and invite new members.
      </p>

      {/* Household info */}
      <div style={cardStyle}>
        <div style={{ fontSize: "13px", color: "#8b6b58", marginBottom: "4px" }}>Household</div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#2c1810" }}>
          {household?.name}
        </div>

        {isAdmin && (
          <>
            <div style={{ fontSize: "13px", color: "#8b6b58", marginTop: "20px", marginBottom: "4px" }}>
              🔗 Invite code — share this with family members
            </div>
            <div style={inviteBoxStyle}>
              <span style={codeStyle}>{household?.inviteCode}</span>
              <button
                onClick={copyCode}
                style={{
                  padding: "7px 16px",
                  background: "#6b3a22",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
          </>
        )}
      </div>

      {/* Members list */}
      <div style={cardStyle}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#2c1810", marginBottom: "4px" }}>
          Members ({household?.members?.length})
        </div>

        {household?.members?.map((m, i) => (
          <div key={m.user._id} style={memberRowStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={avatarStyle(colors[i % colors.length])}>
                {m.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#2c1810" }}>
                  {m.user.name}
                  {m.user._id === user?._id && (
                    <span style={{ color: "#8b6b58", fontWeight: "400", fontSize: "12px" }}> (you)</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#8b6b58" }}>{m.user.email}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={badgeStyle(m.role)}>{m.role}</span>
              {isAdmin && m.user._id !== user?._id && (
                <button
                  onClick={() => handleRemove(m.user._id, m.user.name)}
                  style={{
                    padding: "5px 12px",
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leave household (members only) */}
      {!isAdmin && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleLeave}
            style={{
              padding: "10px 24px",
              background: "transparent",
              color: "#991b1b",
              border: "1.5px solid #fca5a5",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Leave Household
          </button>
        </div>
      )}
    </div>
  );
};

export default Members;