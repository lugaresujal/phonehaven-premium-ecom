import { useState, useRef } from "react";
import { Upload, Link, X, Loader2, AlertTriangle } from "lucide-react";
import { uploadImage } from "../../services/cms-api";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export function ImageUploader({ value, onChange, label = "Image", previewHeight = 80, minWidth = 1200, minHeight = 600 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"url" | "file">("url");
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);
  const [dimWarning, setDimWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkDimensions = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImgDimensions({ w, h });
      if (w < minWidth || h < minHeight) {
        setDimWarning(`Image is ${w}x${h}. Recommended minimum: ${minWidth}x${minHeight} for full-screen display.`);
      } else {
        setDimWarning("");
      }
    };
    img.onerror = () => {
      setImgDimensions(null);
      setDimWarning("");
    };
    img.src = src;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      checkDimensions(url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    if (url) {
      checkDimensions(url);
    } else {
      setImgDimensions(null);
      setDimWarning("");
    }
  };

  return (
    <div className="settings-form-group">
      <label>{label}</label>

      <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setTab("url")}
          style={{
            flex: 1,
            padding: "7px 12px",
            fontSize: 13,
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px 0 0 6px",
            background: tab === "url" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
            color: tab === "url" ? "#60a5fa" : "#94a3b8",
            cursor: "pointer",
          }}
        >
          <Link size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
          URL
        </button>
        <button
          type="button"
          onClick={() => setTab("file")}
          style={{
            flex: 1,
            padding: "7px 12px",
            fontSize: 13,
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0 6px 6px 0",
            background: tab === "file" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
            color: tab === "file" ? "#60a5fa" : "#94a3b8",
            cursor: "pointer",
          }}
        >
          <Upload size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
          Upload
        </button>
      </div>

      {tab === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://..."
        />
      )}

      {tab === "file" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: "2px dashed rgba(255,255,255,0.15)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              color: uploading ? "#94a3b8" : "#374151",
              cursor: uploading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Click to select image from computer
              </>
            )}
          </button>
        </div>
      )}

      {error && <p style={{ color: "#ef4444", fontSize: 12, margin: "6px 0 0" }}>{error}</p>}

      {dimWarning && (
        <p style={{ color: "#f59e0b", fontSize: 12, margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
          <AlertTriangle size={13} />
          {dimWarning}
        </p>
      )}

      {value && (
        <div style={{ position: "relative", marginTop: 10, display: "inline-block" }}>
          <img
            src={value}
            alt="Preview"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            style={{
              height: previewHeight,
              maxWidth: "100%",
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "#1e293b",
            }}
          />
          <button
            type="button"
            onClick={() => { onChange(""); setImgDimensions(null); setDimWarning(""); }}
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {imgDimensions && (
        <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>
          {imgDimensions.w} x {imgDimensions.h}px
        </p>
      )}
    </div>
  );
}
