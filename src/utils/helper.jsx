import { buildApiUrl } from "./api";


export const generateImage = async (prompt) => {
  const res = await fetch(buildApiUrl("/generate-image"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data.image; // URL or base64
};

