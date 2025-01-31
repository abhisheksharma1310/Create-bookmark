import { MongoClient, Db, ObjectId } from 'mongodb';

export interface MongoConnection {
  client: MongoClient;
  db: Db;
}

export interface BookmarkItem {
  _id?: ObjectId;
  id?: string;  // Make id optional since MongoDB will handle the identifier
  title: string;
  url?: string;
  children?: string[]; // Store child bookmark IDs as references
  isFolder: boolean;
  parentId?: string; // Reference to parent folder
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Type for creating new bookmarks
export type CreateBookmarkInput = Omit<BookmarkItem, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateBookmarkInput = Partial<Omit<BookmarkItem, '_id' | 'id' | 'createdAt' | 'updatedAt'>>;
