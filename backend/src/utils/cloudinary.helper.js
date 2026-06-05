const { v2: cloudinary } = require("cloudinary");

const CLOUDINARY_FOLDER = "recipehub/recipes";
const ALLOWED_PROTOCOLS = ["http:", "https:"];

const getCloudinaryConfig = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const hasCloudinaryCredentials = () => {
  const config = getCloudinaryConfig();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
};

const configureCloudinary = () => {
  if (!hasCloudinaryCredentials()) {
    const error = new Error("Cloudinary credentials are not configured");
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config(getCloudinaryConfig());
};

const validateImageUrl = (imageUrl) => {
  const normalizedUrl = imageUrl?.trim();

  if (!normalizedUrl) return "";

  let parsedUrl;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    const error = new Error("La URL de imagen no es valida");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    const error = new Error("La URL de imagen debe usar http o https");
    error.statusCode = 400;
    throw error;
  }

  return normalizedUrl;
};

const uploadRecipeImageFromUrl = async (imageUrl) => {
  const normalizedUrl = validateImageUrl(imageUrl);

  if (!normalizedUrl) {
    return {
      secureUrl: "",
      publicId: ""
    };
  }

  configureCloudinary();

  try {
    const result = await cloudinary.uploader.upload(normalizedUrl, {
      folder: CLOUDINARY_FOLDER,
      resource_type: "image"
    });

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    const uploadError = new Error("No se pudo importar la imagen a Cloudinary");
    uploadError.statusCode = 400;
    uploadError.details = error.message;
    throw uploadError;
  }
};

const deleteRecipeImage = async (publicId) => {
  if (!publicId) return;

  configureCloudinary();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image"
  });
};

module.exports = {
  deleteRecipeImage,
  uploadRecipeImageFromUrl,
  validateImageUrl
};
