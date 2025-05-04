import React, { useState, useEffect } from "react";

const NoteBlock = ({ title, pdfExporting }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [tempContent, setTempContent] = useState("");

  useEffect(() => {
    if (pdfExporting) {
      setIsAdding(false); // Close editing on export
    }
  }, [pdfExporting]);

  const handleSubmit = () => {
    if (tempTitle.trim() && tempContent.trim()) {
      setNote({ title: tempTitle, content: tempContent });
      setTempTitle("");
      setTempContent("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTempTitle("");
    setTempContent("");
  };

  const handleEdit = () => {
    setTempTitle(note.title);
    setTempContent(note.content);
    setIsAdding(true);
  };

  const handleDelete = () => {
    setNote(null);
    setTempTitle("");
    setTempContent("");
    setIsAdding(false);
  };

  const isVisibleInPDF = !!note;

  if (pdfExporting && !isVisibleInPDF) {
    return null; // Skip rendering if exporting and no note
  }

  return (
    <div className="report-section">
      <h3>{title}</h3>

      {!note && !isAdding && (
        <button className="add-note" onClick={() => setIsAdding(true)}>
          +
        </button>
      )}

      {isAdding && (
        <div className="note-adding">
          <input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            placeholder="Content"
          />
          <div className="note-actions">
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {note && !isAdding && (
        <div className="note-preview">
          <h4>{note.title}</h4>
          <p>{note.content}</p>
          {!pdfExporting && (
            <div className="note-actions">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteBlock;
