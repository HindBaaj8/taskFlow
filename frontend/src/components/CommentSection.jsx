import { useEffect, useState } from "react";
import api from "../api/api";

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/task/${taskId}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post("/comments", { content, taskId });
      setContent("");
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="comment-section">
      <h3>Commentaires</h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Ajouter un commentaire..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" className="btn-send">
          Envoyer
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="no-comments">Aucun commentaire pour l'instant.</p>
      ) : (
        comments.map((c) => (
          <div key={c._id} className="comment-item">
            <p className="comment-meta">
              👤 {c.user?.name || "Utilisateur"} —{" "}
              {new Date(c.createdAt).toLocaleDateString()}
            </p>
            <p className="comment-content">{c.content}</p>
          </div>
        ))
      )}
    </div>
  );
}