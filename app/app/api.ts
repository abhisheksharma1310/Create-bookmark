// app/app/api.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { BookmarkItem, CreateBookmarkInput, UpdateBookmarkInput } from '@/types/mongodb';

// Helper function to transform MongoDB document to BookmarkItem
function transformBookmark(doc: any): BookmarkItem {
  return {
    ...doc,
    id: doc._id.toString(),
  };
}

// Helper function to build bookmark tree
async function buildBookmarkTree(bookmarks: BookmarkItem[], parentId: string | null = null) {
  const db = (await clientPromise).db(process.env.MONGODB_DB_NAME || 'bookmarks');
  const items = bookmarks.filter(b => b.parentId === parentId);
  
  for (const item of items) {
    if (item.isFolder && item.children?.length) {
      const childBookmarks = await db
        .collection<BookmarkItem>('bookmarks')
        .find({ _id: { $in: item.children.map(id => new ObjectId(id)) } })
        .toArray();
      const processedChildren = await buildBookmarkTree(childBookmarks.map(transformBookmark));
      item.children = processedChildren.map(child => child.id).filter((id): id is string => id !== undefined);
    }
  }
  
  return items;
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookmarks');
    
    const bookmarks = await db
      .collection<BookmarkItem>('bookmarks')
      .find({})
      .toArray();

    // Build the bookmark tree
    const bookmarkTree = await buildBookmarkTree(bookmarks.map(transformBookmark));

    return NextResponse.json({ bookmarks: bookmarkTree }, { status: 200 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookmarks');
    
    const body: CreateBookmarkInput = await request.json();
    
    const bookmark: Omit<BookmarkItem, '_id' | 'id'> = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<BookmarkItem>('bookmarks').insertOne(bookmark);
    
    // If this is a child bookmark/folder, update parent's children array
    if (bookmark.parentId) {
      await db.collection<BookmarkItem>('bookmarks').updateOne(
        { _id: new ObjectId(bookmark.parentId) },
        { $push: { children: result.insertedId.toString() } }
      );
    }

    return NextResponse.json(
      { 
        message: 'Bookmark created', 
        bookmark: {
          ...bookmark,
          id: result.insertedId.toString(),
          _id: result.insertedId,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookmarks');
    
    const body = await request.json();
    const { id, ...updateData }: { id: string } & UpdateBookmarkInput = body;
    
    const result = await db.collection<BookmarkItem>('bookmarks').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Bookmark updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookmarks');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    // Get the bookmark to check if it's a folder
    const bookmark = await db.collection<BookmarkItem>('bookmarks').findOne({
      _id: new ObjectId(id)
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // If it's a folder, recursively delete all children
    if (bookmark.isFolder && bookmark.children?.length) {
      await Promise.all(
        bookmark.children.map(childId =>
          db.collection<BookmarkItem>('bookmarks').deleteOne({
            _id: new ObjectId(childId)
          })
        )
      );
    }

    // Remove this bookmark/folder from its parent's children array
    if (bookmark.parentId) {
      await db.collection<BookmarkItem>('bookmarks').updateOne(
        { _id: new ObjectId(bookmark.parentId) },
        { $pull: { children: id } }
      );
    }

    // Delete the bookmark/folder itself
    await db.collection<BookmarkItem>('bookmarks').deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(
      { message: 'Bookmark deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}