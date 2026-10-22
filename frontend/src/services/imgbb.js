const IMGBB_API_KEY =
  import.meta.env.VITE_IMGBB_API_KEY || "a4b69a78d1aa18f8b4fcb857883f4b20";

/**
 * Envia um arquivo de imagem para o ImgBB e retorna a URL direta.
 * @param {File} imageFile - Objeto File vindo do <input type="file" />
 * @returns {Promise<string>} URL da imagem hospedada no ImgBB
 */
export const uploadImageToImgBB = async (imageFile) => {
  if (!imageFile) {
    throw new Error("Selecione um arquivo de imagem válido.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (data.success) {
      // Retorna a URL direta da imagem no ImgBB
      return data.data.url || data.data.display_url;
    } else {
      throw new Error(
        data.error?.message || "Falha ao enviar imagem para o ImgBB.",
      );
    }
  } catch (error) {
    console.error("Erro no serviço ImgBB:", error);
    throw error;
  }
};
