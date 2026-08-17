# 🌌 Film Galaxy

Film Galaxy (originally MovieVerse) is a premium, feature-rich movie search and exploration portal. It leverages a modern front-end stack including **React 18**, **TypeScript**, **Tailwind CSS**, and **Framer Motion** to deliver a responsive glassmorphic design and standard-defining cinematic animations.

All metadata is powered dynamically by the [OMDb API](https://www.omdbapi.com/).

---

## ✨ Features

### 🎬 1. Premium Cinematic UI
*   **Glassmorphic Design**: Clean layouts using backdrop-blur gradients tailored for dark mode.
*   **Skeleton Loader Placeholders**: Smooth animated loading states during card fetches.
*   **Cover Zoom Effects**: Micro-interactions for hover states, button scales, and watchlist checks.

### 🔍 2. Advanced Search & Autocomplete
*   **Debounced Autocomplete Suggestions**: Shows instant matching titles as you type, limiting API request volume.
*   **Search Pagination**: Browse through all search results via a clean and responsive paginator (Page X of N).
*   **Search Filters & Sorting**: Refine results by content type (Movies, TV Shows, Episodes) and Release Year. Sort current results by rating, year, or title.

### 🧬 3. Multi-Source Review Gauges
*   Visual breakdown charts parsing metadata from multiple reviews aggregates: **IMDb**, **Rotten Tomatoes**, and **Metacritic**.

### 💼 4. Custom Curated Collections (Watchlists)
*   Create and name multiple custom watchlists (e.g. *"Date Night"*, *"Action Classics"*) saved locally in the browser (`localStorage`).
*   Easily toggle any movie in and out of lists via checkboxes directly inside the movie details modal.

### 🔗 5. Deep-Linking & YouTube Trailers
*   **Deep-linking Router**: Share links directly to a specific movie (e.g., `#/movie/tt0137523`). The details modal opens automatically on page load.
*   **Trailer Redirect**: Click "Watch Trailer" to search YouTube for the movie's official trailer.
*   **Cast Discoverability**: Click on actor or director tags to automatically fire a search for their other works.

---

## 🛠️ Tech Stack

*   **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **API Data**: [OMDb API](https://www.omdbapi.com/)

---

## 🚀 Getting Started

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
*   [npm](https://www.npmjs.com/)

### 📦 Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/Sagar42Swami/Film-Galaxy.git
   cd Film-Galaxy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your OMDb API key:
   ```env
   VITE_API_KEY=your_omdb_api_key_here
   ```
   *(Note: A default fallback key is integrated, but setting your own prevents hitting daily limits)*

### 💻 Running Locally
To launch the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application!

### 🏗️ Building for Production
To generate a fully optimized, compiled production build:
```bash
npm run build
```
The output files will be built inside the `/dist` directory.

---

## 📂 Project Structure

```text
├── .bolt/                  # Development presets
├── dist/                   # Production build outputs
├── src/
│   ├── components/         # React presentation components
│   │   ├── MovieCard.tsx
│   │   ├── MovieDetailsModal.tsx
│   │   ├── Navbar.tsx
│   │   ├── SearchBar.tsx
│   │   └── SkeletonCard.tsx
│   ├── context/            # Global watchlists state provider
│   │   └── FavoritesContext.tsx
│   ├── hooks/              # Custom utilities
│   │   └── useDebounce.ts
│   ├── App.tsx             # Layout and routing logic
│   ├── main.tsx            # Mounting entrypoint
│   ├── types.ts            # TypeScript interfaces
│   └── index.css           # Tailwind declarations
├── tailwind.config.js      # Styling custom configurations
└── package.json            # Scripts & dependencies
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
