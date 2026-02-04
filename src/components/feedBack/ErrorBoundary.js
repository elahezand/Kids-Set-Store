"use client";
import React from "react";

export default function ErrorPage({ error, reset }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Oops! Something went wrong.</h1>
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
