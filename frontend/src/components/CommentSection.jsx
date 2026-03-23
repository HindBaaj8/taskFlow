import { useEffect, useState } from "react";
import api from "../api/api";

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const fetchComments = () =>
    api.get(`/comments/task/${taskId}`)
      .then(res => setComments(res.data));

  useEffect(() => { fetchComments(); }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await api.post("/comments", { content, taskId });
    setContent("");
    fetchComments();
  };

  return (
    <div style={{
      background: "white", borderRadius: 12,
      padding: 24, boxShadow: "0 2px 12px #00000015"
    }}>
      <h3 style={{ margin: "0 0 16px" }}>
        💬 Commentaires ({comments.length})
      </h3>

      {/* Liste commentaires */}
      {comments.length === 0 ? (
        <p style={{ color: "#999", fontSize: 14 }}>
          Aucun commentaire pour l'instant
        </p>
      ) : (
        comments.map(c => (
          <div key={c._id} style={{
            borderLeft: "3px solid #1a1a2e",
            paddingLeft: 12, marginBottom: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 14 }}>
                👤 {c.user?.name || "Utilisateur"}
              </strong>
              <small style={{ color: "#999" }}>
                {new Date(c.createdAt).toLocaleString()}
              </small>
            </div>
            <p style={{ margin: "4px 0 0", color: "#555", fontSize: 14 }}>
              {c.content}
            </p>
          </div>
        ))
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <textarea
          placeholder="Écrire un commentaire..."
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px",
            borderRadius: 8, border: "1px solid #ddd",
            fontSize: 14, height: 80, resize: "vertical",
            boxSizing: "border-box", marginBottom: 8
          }}
        />
        <button
          type="submit"
          style={{
            background: "#1a1a2e", color: "white",
            border: "none", padding: "8px 20px",
            borderRadius: 8, cursor: "pointer", fontSize: 14
          }}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}