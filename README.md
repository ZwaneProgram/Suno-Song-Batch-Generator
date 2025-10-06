# Suno Song Generator

A web-based interface for generating AI music using Suno's API. Built with Next.js and the open-source [suno-api](https://github.com/gcui-art/suno-api) project.

## Features

### Song Generation
- **Simple Mode**: Generate songs from text descriptions
- **Custom Mode**: Create songs with custom lyrics, style, and title
- **Batch Generation**: Generate up to 10 songs simultaneously
- **Multiple Forms**: Queue multiple songs with different prompts at once

### Song Management
- **Search & Filter**: Search songs by title or style tags
- **Multi-Select Download**: Select and download multiple songs at once
- **New Song Badges**: Visual indicators for unplayed songs
- **Play Tracking**: Automatically marks songs as played using localStorage

### User Interface
- Dark orange theme for comfortable extended use
- Responsive grid layout (1-4 columns depending on screen size)
- Real-time status updates (queued, streaming, complete, error)
- Audio preview with custom player controls
- Album artwork display

## Prerequisites

- Node.js 18+ installed
- A Suno account with active subscription (Premier recommended for batch generation)
- 2Captcha account with credits (for automatic CAPTCHA solving)

## Installation

### 1. Clone the suno-api project

```bash
git clone https://github.com/ZwaneProgram/Suno-Song-Batch-Generator.git
cd suno-api
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the suno-api root directory:

```env
SUNO_COOKIE=your_suno_cookie_here
TWOCAPTCHA_KEY=your_2captcha_api_key_here (optional)
BROWSER=chromium/firefox
BROWSER_GHOST_CURSOR=false
BROWSER_LOCALE=en
BROWSER_HEADLESS=true
```

#### Getting Your Suno Cookie

1. Go to [suno.com](https://suno.com) and log in
2. Open Developer Tools (F12)
3. Go to Network tab and refresh the page
4. Find any request to suno.com
5. Copy the entire Cookie header value
6. Paste it as `SUNO_COOKIE` in your `.env` file

### Generating Songs

**Simple Mode:**
1. Enter a song description (e.g., "A cheerful pop song about summer")
2. Click "Generate" or add more forms for batch generation
3. Wait for songs to complete (check status badge)

**Custom Mode:**
1. Write your custom lyrics
2. Specify the music style (e.g., "pop, rock, electronic")
3. Optionally add a title
4. Click "Generate"

**Batch Generation:**
1. Click "+ Add Another Song" to add up to 10 forms
2. Fill in different prompts/lyrics for each
3. Click "Generate X Songs" to submit all at once
4. Uses your Suno Premium account's concurrent job limit

### Managing Songs

**Search:**
- Use the search bar to filter by title or style
- Example: Search "ss.1 chill" to find all songs in that series

**Download:**
- Single: Click "Download" button on any completed song
- Multiple: Check songs you want, then click "Download (X)"

**Organize:**
- Name songs with consistent patterns (e.g., "Project Name (ss.1 #1)")
- Use search to quickly find related songs
- Track new songs with the "NEW" badge system

## Technical Details

### Architecture
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **API**: Open-source suno-api (Express-based proxy)
- **Storage**: localStorage for tracking played songs

### API Endpoints Used
- `/api/generate` - Simple song generation
- `/api/custom_generate` - Custom lyrics/style generation
- `/api/get` - Fetch all songs or specific song by ID
- `/api/get_limit` - Check remaining credits

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox (works, may need manual CAPTCHA solving)
- Safari (untested)

## Known Limitations

- **No song editing**: Titles and metadata cannot be changed after generation
- **No delete function**: Songs must be deleted directly on suno.com
- **localStorage only**: Played song tracking doesn't sync across devices
- **CAPTCHA dependency**: Requires 2Captcha service for automated generation
- **Cookie expiration**: Suno cookie needs to be refreshed periodically

### Service Suspended
```
This service has been suspended by its owner
```
**Solution**: Your Suno cookie has expired, get a fresh one

### Download Not Working
If downloads open in browser instead of saving:
- This is a CORS issue
- The app fetches files as blobs to bypass this
- Ensure you're using the latest version of the code

### Port Already in Use
If port 3000 is taken, Next.js will suggest 3001 automatically.
Click "Y" to accept the alternative port.

## Credits

- Built on [suno-api](https://github.com/gcui-art/suno-api) by gcui-art
- Powered by [Suno AI](https://suno.com)
- Uses [2Captcha](https://2captcha.com) for CAPTCHA solving


## License

This project follows the same license as the suno-api project (LGPL-3.0 or later).

## Disclaimer

This is an unofficial tool and is not affiliated with Suno AI. Use at your own risk and respect Suno's Terms of Service.