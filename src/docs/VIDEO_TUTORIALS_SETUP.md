# 🎥 Video Tutorial System - Setup Guide

Complete video tutorial system using Supabase Storage (S3) with progress tracking.

## 📋 Features Implemented

✅ **Supabase Storage (S3)** for video hosting  
✅ **Signed URLs** with webhook for secure video access  
✅ **Progress Tracking** - saves last watched position  
✅ **Auto-navigation** - automatically goes to next video after completion  
✅ **Video Player** with full controls (play/pause, seek, volume, fullscreen)  
✅ **Tutorial Navigation** - list with watched/unwatched indicators  
✅ **FSD Architecture** - proper layered structure

## 🏗️ Architecture (FSD)

```
entities/tutorial/          # Tutorial entity with types and API
features/video-player/       # Video player with controls
widgets/tutorial-navigation/ # Navigation between tutorials
pages/tutorials/            # Main tutorial page
```

## 🚀 Setup Instructions

### 1. Run SQL Migration

Go to **Supabase Dashboard → SQL Editor** and execute:

```bash
/supabase/migrations/004_video_tutorials.sql
```

This will create:
- ✅ Storage bucket `tutorials`
- ✅ Storage policies for authenticated users
- ✅ Table `tutorials` (video metadata)
- ✅ Table `user_video_progress` (watch history)
- ✅ Indexes for performance

### 2. Upload Videos to Storage

**Go to Supabase Dashboard → Storage → tutorials**

Upload your video files (mp4, webm, etc.)

Example structure:
```
tutorials/
  ├── intro.mp4
  ├── a3-report-guide.mp4
  ├── vsm-tutorial.mp4
  └── qfd-basics.mp4
```

### 3. Add Tutorial Metadata

**Go to Supabase Dashboard → Table Editor → tutorials**

Click "Insert row" and add:

| Field | Example | Description |
|-------|---------|-------------|
| title | "Введение в Kaizen Center" | Video title |
| description | "Обзор возможностей" | Short description |
| duration | 300 | Duration in seconds (5 min = 300) |
| storage_path | "intro.mp4" | Path in Storage bucket |
| order_index | 1 | Display order (1, 2, 3...) |

**OR** use SQL:

```sql
INSERT INTO tutorials (title, description, duration, storage_path, order_index)
VALUES 
  ('Введение в Kaizen Center', 'Обзор возможностей платформы', 300, 'intro.mp4', 1),
  ('Создание A3 отчета', 'Пошаговая инструкция', 600, 'a3-report-guide.mp4', 2),
  ('Работа с VSM', 'Как создать карту потока', 480, 'vsm-tutorial.mp4', 3);
```

### 4. Access Tutorials

Navigate to `/tutorials` in your app or click **"Обучение"** in sidebar.

## 🎮 How It Works

### Frontend Flow

1. **TutorialsPage** loads list of tutorials for current user
2. Displays **VideoPlayer** with current tutorial
3. **TutorialNavigation** shows all videos with progress indicators
4. User can navigate with Next/Previous buttons or click any video
5. Progress is auto-saved every 5 seconds
6. On video end → marked as watched → auto-navigates to next

### Backend Flow

1. `GET /tutorials?userId={id}` - returns all tutorials with user progress
2. `GET /tutorials/{id}/video-url` - returns **signed URL** (valid 1 hour)
3. `POST /tutorials/progress` - saves watch progress and position

### Security

- Videos are **private** in Storage (not publicly accessible)
- Backend generates **signed URLs** that expire in 1 hour
- Only authenticated users can access videos
- Each user sees their own progress

## 📊 Database Schema

### tutorials
```sql
id              UUID PRIMARY KEY
title           TEXT
description     TEXT
duration        INTEGER (seconds)
thumbnail_url   TEXT
storage_path    TEXT (path in Storage)
order_index     INTEGER (display order)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### user_video_progress
```sql
id              UUID PRIMARY KEY
user_id         TEXT (Telegram ID or UUID)
tutorial_id     UUID REFERENCES tutorials
watched         BOOLEAN
last_position   INTEGER (seconds)
completed_at    TIMESTAMPTZ
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ

UNIQUE(user_id, tutorial_id)
```

## 🎯 API Endpoints

### Get Tutorials
```http
GET /tutorials?userId={userId}
```

Returns:
```json
[
  {
    "id": "uuid",
    "title": "Intro",
    "description": "...",
    "duration": 300,
    "storage_path": "intro.mp4",
    "order_index": 1,
    "watched": false,
    "lastPosition": 0
  }
]
```

### Get Video URL
```http
GET /tutorials/{tutorialId}/video-url
```

Returns:
```json
{
  "url": "https://...supabase.co/storage/v1/object/sign/tutorials/intro.mp4?token=..."
}
```

### Update Progress
```http
POST /tutorials/progress
Content-Type: application/json

{
  "userId": "796910945",
  "tutorialId": "uuid",
  "position": 120,
  "watched": false
}
```

## 🎨 UI Components

### VideoPlayer
- Play/Pause button
- Progress slider
- Volume control with mute
- Fullscreen support
- Loading indicator
- Time display (current / total)
- Auto-saves progress every 5 seconds
- Restores last watched position

### TutorialNavigation
- List of all videos
- Watched indicator (✓ checkmark)
- Current video badge
- Progress percentage for incomplete videos
- Next/Previous buttons
- Video counter (1/5)

## 📱 Responsive Design

- **Desktop**: Video player on left (2/3 width), navigation on right (1/3)
- **Mobile**: Stacked layout with video on top
- Safe area insets for Telegram Mini Apps
- Optimized for both web and TMA

## 🔐 Admin Access

Only admins can:
- Upload videos to Storage (via Supabase Dashboard)
- Add/edit tutorial metadata
- View all users' progress (future feature)

Regular users can:
- Watch videos
- Track their progress
- Navigate between tutorials

## 🐛 Troubleshooting

**Videos don't load?**
- Check Storage bucket `tutorials` exists
- Verify storage policies are set correctly
- Check `storage_path` matches actual filename in Storage

**Progress not saving?**
- Check `user_video_progress` table exists
- Verify user is authenticated
- Check browser console for errors

**Signed URL expired?**
- URLs are valid for 1 hour
- Backend generates new URL on each tutorial load
- User needs to refresh page if URL expired

## 📈 Future Enhancements

- [ ] Video thumbnails
- [ ] Subtitles/captions support
- [ ] Playback speed control
- [ ] Download for offline viewing
- [ ] Admin dashboard for analytics
- [ ] Video categories/chapters
- [ ] Quiz after video completion
- [ ] Certificates for completed courses

## 🎉 Ready to Use!

The tutorial system is fully integrated with:
- ✅ Sidebar navigation ("Обучение" menu item)
- ✅ Routing system (`/tutorials`)
- ✅ Auth system (requires login)
- ✅ Progress tracking per user
- ✅ Responsive design

Just upload videos and add metadata - users can start learning! 🚀
