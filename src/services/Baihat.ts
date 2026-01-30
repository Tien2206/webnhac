
import { db } from "../firebase";
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  doc 
} from "firebase/firestore";
import { Song } from "../types";
// Bạn có thể đổi tên collection ở đây (ví dụ: "baihat" hoặc "songs")
const COLLECTION_NAME = "songs";

/**
 * Lấy danh sách bài hát từ Firestore, sắp xếp theo tên
 */
export const ngheBaiHatRealtime = (
  callback: (songs: Song[]) => void
) => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy("title", "asc"));

  return onSnapshot(q, (snapshot) => {
    const songs: Song[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as Song[];

    callback(songs);
  });
};
/**
 * Thêm một bài hát mới vào Database
 */
export const themBaiHat = async (song: Omit<Song, "id">) => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    return await addDoc(colRef, song);
  } catch (error) {
    console.error("Lỗi khi thêm bài hát:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin bài hát (ví dụ: trạng thái Like)
 */
export const capNhatBaiHat = async (id: string, data: Partial<Song>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Lỗi khi cập nhật bài hát:", error);
    throw error;
  }
};

/**
 * Xóa bài hát khỏi Database
 */
export const xoaBaiHat = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Lỗi khi xóa bài hát:", error);
    throw error;
  }
};
