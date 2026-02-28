import React, { useEffect, useState } from "react";

export default function PatientHistory({ patientId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!patientId) return;

    fetch(`https://hospital-ms-huhk.vercel.app/patients/${patientId}/history`)
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .catch(err => console.error(err));

  }, [patientId]);

  return (
    <div>
      <h2>Historique du patient</h2>

      {history.length === 0 ? (
        <p>Aucune entrée</p>
      ) : (
        history.map(item => (
          <div key={item._id} style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8
          }}>
            <strong>{item.type}</strong> — {new Date(item.eventDate).toLocaleDateString()}
            <p>{item.description}</p>
          </div>
        ))
      )}
    </div>
  );
}