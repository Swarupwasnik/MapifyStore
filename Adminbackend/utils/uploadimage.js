// utils.js
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Assuming you're using uuid for unique file names

export const uploadImageFromPath = async (filePath) => {
  try {
    const fileName = `${uuidv4()}-${path.basename(filePath)}`;
    const destinationPath = path.join(__dirname, 'uploads', fileName); // Adjust the destination directory as needed

    // Copy the file to the destination (this is a basic example; adjust as necessary for your storage solution)
    fs.copyFileSync(filePath, destinationPath);

    // Return the URL or path to the uploaded file (adjust based on your setup)
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};
