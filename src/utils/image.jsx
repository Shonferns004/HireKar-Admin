


export const generateImage = async (prompt) => {
  const res = await fetch("http://localhost:4000/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data.image; // URL or base64
};
