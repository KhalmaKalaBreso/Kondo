import { useRef } from "react";

export default function DocumentUploader({ onAddDocument, buttonLabel = "Adicionar documento" }) {
  const inputRef = useRef(null);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleChange(event) {
    const file = event.target.files?.[0];
    if (file) onAddDocument(file);
    event.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        className="sr-only-file"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,application/pdf,image/*"
        onChange={handleChange}
      />
      <button className="button button-primary" type="button" onClick={openFilePicker}>
        {buttonLabel}
      </button>
    </>
  );
}
