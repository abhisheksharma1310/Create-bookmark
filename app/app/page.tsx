"use client";

import { useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Bookmark, ChevronRight, FolderPlus, Plus, Search, Trash2, Edit, Folder } from "lucide-react";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
  isFolder: boolean;
}

interface State {
  bookmarks: BookmarkItem[];
  searchQuery: string;
  newBookmarkTitle: string;
  newBookmarkUrl: string;
  newCategoryTitle: string;
  selectedFolderId: string | null;
  expandedFolders: Set<string>;
  editingItem: BookmarkItem | null;
  isEditDialogOpen: boolean;
  deleteConfirmOpen: boolean;
  itemToDelete: BookmarkItem | null;
  isAddDialogOpen: boolean;
  addDialogType: 'bookmark' | 'folder' | null;
}

type Action =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_NEW_BOOKMARK_TITLE'; payload: string }
  | { type: 'SET_NEW_BOOKMARK_URL'; payload: string }
  | { type: 'SET_NEW_CATEGORY_TITLE'; payload: string }
  | { type: 'SET_SELECTED_FOLDER_ID'; payload: string | null }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'SET_EDITING_ITEM'; payload: BookmarkItem | null }
  | { type: 'SET_IS_EDIT_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_DELETE_CONFIRM_OPEN'; payload: boolean }
  | { type: 'SET_ITEM_TO_DELETE'; payload: BookmarkItem | null }
  | { type: 'SET_IS_ADD_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_ADD_DIALOG_TYPE'; payload: 'bookmark' | 'folder' | null }
  | { type: 'ADD_BOOKMARK'; payload: { parentId: string | null; bookmark: BookmarkItem } }
  | { type: 'ADD_CATEGORY'; payload: { parentId: string | null; category: BookmarkItem } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; newTitle: string; newUrl?: string } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_NEW_BOOKMARK_TITLE':
      return { ...state, newBookmarkTitle: action.payload };
    case 'SET_NEW_BOOKMARK_URL':
      return { ...state, newBookmarkUrl: action.payload };
    case 'SET_NEW_CATEGORY_TITLE':
      return { ...state, newCategoryTitle: action.payload };
    case 'SET_SELECTED_FOLDER_ID':
      return { ...state, selectedFolderId: action.payload };
    case 'TOGGLE_FOLDER':
      const nextExpandedFolders = new Set(state.expandedFolders);
      if (nextExpandedFolders.has(action.payload)) {
        nextExpandedFolders.delete(action.payload);
      } else {
        nextExpandedFolders.add(action.payload);
      }
      return { ...state, expandedFolders: nextExpandedFolders };
    case 'SET_EDITING_ITEM':
      return { ...state, editingItem: action.payload };
    case 'SET_IS_EDIT_DIALOG_OPEN':
      return { ...state, isEditDialogOpen: action.payload };
    case 'SET_DELETE_CONFIRM_OPEN':
      return { ...state, deleteConfirmOpen: action.payload };
    case 'SET_ITEM_TO_DELETE':
      return { ...state, itemToDelete: action.payload };
    case 'SET_IS_ADD_DIALOG_OPEN':
      return { ...state, isAddDialogOpen: action.payload };
    case 'SET_ADD_DIALOG_TYPE':
      return { ...state, addDialogType: action.payload };
    case 'ADD_BOOKMARK':
      const addToFolder = (items: BookmarkItem[]): BookmarkItem[] => {
        return items.map(item => {
          if (item.id === action.payload.parentId) {
            return {
              ...item,
              children: [...(item.children || []), action.payload.bookmark],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToFolder(item.children),
            };
          }
          return item;
        });
      };
      return {
        ...state,
        bookmarks: action.payload.parentId ? addToFolder(state.bookmarks) : [...state.bookmarks, action.payload.bookmark],
        newBookmarkTitle: '',
        newBookmarkUrl: '',
        isAddDialogOpen: false,
      };
    case 'ADD_CATEGORY':
      const addCategoryToFolder = (items: BookmarkItem[]): BookmarkItem[] => {
        return items.map(item => {
          if (item.id === action.payload.parentId) {
            return {
              ...item,
              children: [...(item.children || []), action.payload.category],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addCategoryToFolder(item.children),
            };
          }
          return item;
        });
      };
      return {
        ...state,
        bookmarks: action.payload.parentId ? addCategoryToFolder(state.bookmarks) : [...state.bookmarks, action.payload.category],
        newCategoryTitle: '',
        isAddDialogOpen: false,
        expandedFolders: new Set([...state.expandedFolders, action.payload.category.id]),
      };
    case 'DELETE_ITEM':
      const deleteFromItems = (items: BookmarkItem[]): BookmarkItem[] => {
        return items.filter(item => {
          if (item.id === action.payload) {
            return false;
          }
          if (item.children) {
            return {
              ...item,
              children: deleteFromItems(item.children),
            };
          }
          return true;
        });
      };
      return {
        ...state,
        bookmarks: deleteFromItems(state.bookmarks),
        deleteConfirmOpen: false,
        itemToDelete: null,
      };
    case 'UPDATE_ITEM':
      const updateInItems = (items: BookmarkItem[]): BookmarkItem[] => {
        return items.map(item => {
          if (item.id === action.payload.itemId) {
            return {
              ...item,
              title: action.payload.newTitle,
              ...(action.payload.newUrl !== undefined && { url: action.payload.newUrl }),
            };
          }
          if (item.children) {
            return {
              ...item,
              children: updateInItems(item.children),
            };
          }
          return item;
        });
      };
      return {
        ...state,
        bookmarks: updateInItems(state.bookmarks),
        isEditDialogOpen: false,
        editingItem: null,
      };
    default:
      return state;
  }
}

const initialState: State = {
  bookmarks: [
    {
      id: "1",
      title: "Development",
      isFolder: true,
      children: [
        {
          id: "2",
          title: "Frontend",
          isFolder: true,
          children: [
            {
              id: "3",
              title: "React Documentation",
              url: "https://react.dev",
              isFolder: false,
            },
          ],
        },
      ],
    },
  ],
  searchQuery: "",
  newBookmarkTitle: "",
  newBookmarkUrl: "",
  newCategoryTitle: "",
  selectedFolderId: null,
  expandedFolders: new Set(["1", "2"]),
  editingItem: null,
  isEditDialogOpen: false,
  deleteConfirmOpen: false,
  itemToDelete: null,
  isAddDialogOpen: false,
  addDialogType: null,
};

export default function BookmarkApp() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    bookmarks,
    searchQuery,
    newBookmarkTitle,
    newBookmarkUrl,
    newCategoryTitle,
    selectedFolderId,
    expandedFolders,
    editingItem,
    isEditDialogOpen,
    deleteConfirmOpen,
    itemToDelete,
    isAddDialogOpen,
    addDialogType,
  } = state;

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FOLDER', payload: folderId });
  };

  const addBookmark = (parentId: string | null) => {
    if (!newBookmarkTitle) return;

    const newBookmark: BookmarkItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newBookmarkTitle,
      url: newBookmarkUrl,
      isFolder: false,
    };

    dispatch({ type: 'ADD_BOOKMARK', payload: { parentId, bookmark: newBookmark } });
  };

  const addCategory = (parentId: string | null) => {
    if (!newCategoryTitle) return;

    const newCategory: BookmarkItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newCategoryTitle,
      isFolder: true,
      children: [],
    };

    dispatch({ type: 'ADD_CATEGORY', payload: { parentId, category: newCategory } });
  };

  const handleDeleteClick = (item: BookmarkItem) => {
    dispatch({ type: 'SET_ITEM_TO_DELETE', payload: item });
    dispatch({ type: 'SET_DELETE_CONFIRM_OPEN', payload: true });
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch({ type: 'DELETE_ITEM', payload: itemToDelete.id });
    }
  };

  const updateItem = (itemId: string, newTitle: string, newUrl?: string) => {
    if (!newTitle) return;
    dispatch({ type: 'UPDATE_ITEM', payload: { itemId, newTitle, newUrl } });
  };

  const handleContextMenuAction = (action: 'add-bookmark' | 'add-folder' | 'rename' | 'edit', item: BookmarkItem) => {
    dispatch({ type: 'SET_SELECTED_FOLDER_ID', payload: item.isFolder ? item.id : null });
    dispatch({ type: 'SET_EDITING_ITEM', payload: action === 'rename' || action === 'edit' ? item : null });

    if (action === 'add-bookmark' || action === 'add-folder') {
      dispatch({ type: 'SET_ADD_DIALOG_TYPE', payload: action === 'add-bookmark' ? 'bookmark' : 'folder' });
      dispatch({ type: 'SET_IS_ADD_DIALOG_OPEN', payload: true });
      dispatch({ type: 'SET_NEW_BOOKMARK_TITLE', payload: "" });
      dispatch({ type: 'SET_NEW_BOOKMARK_URL', payload: "" });
      dispatch({ type: 'SET_NEW_CATEGORY_TITLE', payload: "" });
    } else {
      dispatch({ type: 'SET_IS_EDIT_DIALOG_OPEN', payload: true });
      if (item.isFolder) {
        dispatch({ type: 'SET_NEW_CATEGORY_TITLE', payload: item.title });
      } else {
        dispatch({ type: 'SET_NEW_BOOKMARK_TITLE', payload: item.title });
        dispatch({ type: 'SET_NEW_BOOKMARK_URL', payload: item.url || "" });
      }
    }
  };

  const renderBookmarkItem = (item: BookmarkItem, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);


    return (
      <div key={item.id} style={{ paddingLeft: `${depth * 1.5}rem` }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="flex items-center py-2 px-4 hover:bg-muted/50 rounded-lg group">
              {item.isFolder ? (
                <>
                  <button
                    onClick={(e) => toggleFolder(item.id, e)}
                    className="p-1 hover:bg-muted rounded-sm transition-colors"
                  >
                    <ChevronRight
                      className={`h-4 w-4 mr-2 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''
                        }`}
                    />
                  </button>
                  <div className="flex-1 cursor-pointer" onClick={(e) => toggleFolder(item.id, e)}>
                    {item.title}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenuAction('add-bookmark', item);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-1 hover:underline">
                    {item.title}
                  </a>
                </>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {item.isFolder ? (
              <>
                <ContextMenuItem onClick={() => handleContextMenuAction('add-bookmark', item)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Bookmark
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleContextMenuAction('add-folder', item)}>
                  <Folder className="w-4 h-4 mr-2" /> Add Folder
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleContextMenuAction('rename', item)}>
                  <Edit className="w-4 h-4 mr-2" /> Rename
                </ContextMenuItem>
                <ContextMenuItem className="text-destructive" onClick={() => handleDeleteClick(item)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </ContextMenuItem>
              </>
            ) : (
              <>
                <ContextMenuItem onClick={() => handleContextMenuAction('edit', item)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </ContextMenuItem>
                <ContextMenuItem className="text-destructive" onClick={() => handleDeleteClick(item)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        {item.isFolder && isExpanded && item.children?.map((child) => renderBookmarkItem(child, depth + 1))}
      </div>
    );
  };

  const filterBookmarks = (query: string, items: BookmarkItem[]): BookmarkItem[] => {
    return items.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.url && item.url.toLowerCase().includes(query.toLowerCase()));

      if (item.children) {
        const filteredChildren = filterBookmarks(query, item.children);
        return matchesQuery || filteredChildren.length > 0;
      }

      return matchesQuery;
    });
  };

  const filteredBookmarks = searchQuery ? filterBookmarks(searchQuery, bookmarks) : bookmarks;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
            <Bookmark className="h-6 w-6" />
            <span className="text-xl font-semibold">BookmarkNest</span>
          </Link>
          <Button
            className="w-full"
            size="sm"
            onClick={() => {
              dispatch({ type: 'SET_SELECTED_FOLDER_ID', payload: null });
              dispatch({ type: 'SET_NEW_CATEGORY_TITLE', payload: "" });
              dispatch({ type: 'SET_ADD_DIALOG_TYPE', payload: 'folder' });
              dispatch({ type: 'SET_IS_ADD_DIALOG_OPEN', payload: true });
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> New Category
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {filteredBookmarks.map((item) => renderBookmarkItem(item))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookmarks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            />
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome to BookmarkNest</h2>
            <p className="text-muted-foreground mb-6">
              Start organizing your bookmarks by creating categories and adding your favorite websites.
            </p>
            <Button
              onClick={() => {
                dispatch({ type: 'SET_SELECTED_FOLDER_ID', payload: null });
                dispatch({ type: 'SET_NEW_BOOKMARK_TITLE', payload: "" });
                dispatch({ type: 'SET_NEW_BOOKMARK_URL', payload: "" });
                dispatch({ type: 'SET_ADD_DIALOG_TYPE', payload: 'bookmark' });
                dispatch({ type: 'SET_IS_ADD_DIALOG_OPEN', payload: true });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Bookmark
            </Button>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={() => dispatch({ type: 'SET_IS_ADD_DIALOG_OPEN', payload: !isAddDialogOpen })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addDialogType === 'bookmark'
                ? `Add ${selectedFolderId ? 'to Folder' : 'New'} Bookmark`
                : `Add ${selectedFolderId ? 'to Folder' : 'New'} Category`
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {addDialogType === 'bookmark' ? (
              <>
                <Input
                  placeholder="Title"
                  value={newBookmarkTitle}
                  onChange={(e) => dispatch({ type: 'SET_NEW_BOOKMARK_TITLE', payload: e.target.value })}
                />
                <Input
                  placeholder="URL"
                  value={newBookmarkUrl}
                  onChange={(e) => dispatch({ type: 'SET_NEW_BOOKMARK_URL', payload: e.target.value })}
                />
                <Button
                  onClick={() => addBookmark(selectedFolderId)}
                  className="w-full"
                  disabled={!newBookmarkTitle}
                >
                  Add Bookmark
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Category Name"
                  value={newCategoryTitle}
                  onChange={(e) => dispatch({ type: 'SET_NEW_CATEGORY_TITLE', payload: e.target.value })}
                />
                <Button
                  onClick={() => addCategory(selectedFolderId)}
                  className="w-full"
                  disabled={!newCategoryTitle}
                >
                  Add Category
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={() => dispatch({ type: 'SET_IS_EDIT_DIALOG_OPEN', payload: !isEditDialogOpen })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem?.isFolder ? 'Edit Folder' : 'Edit Bookmark'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Title"
              value={editingItem?.isFolder ? newCategoryTitle : newBookmarkTitle}
              onChange={(e) => editingItem?.isFolder ? dispatch({ type: 'SET_NEW_CATEGORY_TITLE', payload: e.target.value }) : dispatch({ type: 'SET_NEW_BOOKMARK_TITLE', payload: e.target.value })}
            />
            {!editingItem?.isFolder && (
              <Input
                placeholder="URL"
                value={newBookmarkUrl}
                onChange={(e) => dispatch({ type: 'SET_NEW_BOOKMARK_URL', payload: e.target.value })}
              />
            )}
            <Button
              onClick={() => {
                if (editingItem) {
                  updateItem(
                    editingItem.id,
                    editingItem.isFolder ? newCategoryTitle : newBookmarkTitle,
                    !editingItem.isFolder ? newBookmarkUrl : undefined
                  );
                  dispatch({ type: 'SET_IS_EDIT_DIALOG_OPEN', payload: false });
                  dispatch({ type: 'SET_EDITING_ITEM', payload: null });
                }
              }}
              className="w-full"
              disabled={editingItem?.isFolder ? !newCategoryTitle : !newBookmarkTitle}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={() => dispatch({ type: 'SET_DELETE_CONFIRM_OPEN', payload: !deleteConfirmOpen })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.isFolder
                ? "This will permanently delete this folder and all its contents."
                : "This will permanently delete this bookmark."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => dispatch({ type: 'SET_ITEM_TO_DELETE', payload: null })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
