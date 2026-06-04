import { useState } from "react";

const normalizeImageUrl = (url) => {
  const cleanUrl = url?.trim();
  if (!cleanUrl) return "";
  if (cleanUrl.startsWith("www.")) return `https://${cleanUrl}`;
  return cleanUrl;
};

const RecipeImage = ({ className = "", imageUrl, label, title }) => {
  const [failedUrl, setFailedUrl] = useState("");
  const normalizedUrl = normalizeImageUrl(imageUrl);
  const hasError = failedUrl === normalizedUrl;

  if (!normalizedUrl || hasError) {
    return <div className={`image-placeholder ${className}`}>{label}</div>;
  }

  return <img className={className} src={normalizedUrl} alt={title} onError={() => setFailedUrl(normalizedUrl)} />;
};

export default RecipeImage;
