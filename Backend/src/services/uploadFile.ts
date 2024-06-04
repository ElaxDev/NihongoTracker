import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import { firebaseConfig } from '../firebaseConfig';
import { initializeApp } from 'firebase/app';

initializeApp(firebaseConfig);

const storage = getStorage();

type fileResponse = {
  message: string;
  name: string;
  type: string;
  size: number;
  downloadURL: string;
};

async function uploadFile(file: Express.Multer.File): Promise<fileResponse> {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const storageRef = ref(
    storage,
    `${file.fieldname}s/${file.fieldname}-${uniqueSuffix}`
  );
  const metadata = { contentType: file.mimetype };
  const snapshot = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metadata
  );

  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    message: 'File uploaded successfully',
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
    downloadURL: downloadURL,
  };
}

export default uploadFile;
