import React, { useState, useEffect } from "react";
import { subscribeUser } from "../utils/pushNotification";

const NotificationButton = ({ user }) => {
    const [status, setStatus] = useState("idle"); // idle | loading | subscribed | denied | unsupported

    useEffect(() => {
        if (!('Notification' in window)) {
            setStatus("unsupported");
            return;
        }
        if (Notification.permission === "granted") {
            setStatus("subscribed");
        } else if (Notification.permission === "denied") {
            setStatus("denied");
        }
    }, []);

    const handleEnable = async () => {
        if (!user?._id) return;
        setStatus("loading");
        const result = await subscribeUser(user._id);
        if (result) {
            setStatus("subscribed");
        } else {
            const perm = Notification?.permission;
            setStatus(perm === "denied" ? "denied" : "idle");
        }
    };

    const buttonStyles = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "14px",
        border: "none",
        cursor: status === "subscribed" || status === "denied" || status === "loading" ? "default" : "pointer",
        fontWeight: 700,
        fontSize: "0.9rem",
        fontFamily: "'Outfit', sans-serif",
        transition: "all 0.2s ease",
        ...getStatusStyle(status),
    };

    return (
        <button
            id="notification-toggle-btn"
            onClick={status === "idle" ? handleEnable : undefined}
            style={buttonStyles}
            disabled={status === "loading" || status === "subscribed" || status === "denied" || status === "unsupported"}
            title={getTooltip(status)}
        >
            {getLabel(status)}
        </button>
    );
};

function getStatusStyle(status) {
    switch (status) {
        case "subscribed":
            return { background: "rgba(16, 185, 129, 0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" };
        case "loading":
            return { background: "rgba(99, 102, 241, 0.12)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.25)" };
        case "denied":
            return { background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" };
        case "unsupported":
            return { background: "rgba(156, 163, 175, 0.1)", color: "#9CA3AF", border: "1px solid rgba(156,163,175,0.2)" };
        default:
            return { background: "rgba(99, 102, 241, 0.1)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.2)" };
    }
}

function getLabel(status) {
    switch (status) {
        case "subscribed": return <><span>🔔</span> Notifications On</>;
        case "loading":    return <><span>⏳</span> Enabling...</>;
        case "denied":     return <><span>🔕</span> Blocked</>;
        case "unsupported":return <><span>❌</span> Not Supported</>;
        default:           return <><span>🔔</span> Enable Notifications</>;
    }
}

function getTooltip(status) {
    switch (status) {
        case "subscribed": return "Notifications are active!";
        case "denied":     return "Notifications blocked. Enable them in browser settings.";
        case "unsupported":return "Push notifications not supported in this browser.";
        default:           return "Enable smart notifications for mood, sleep, and task updates";
    }
}

export default NotificationButton;