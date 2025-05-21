# VectorShift Integrations Assessment

This project is a technical assessment for VectorShift, demonstrating OAuth integrations with Airtable, Notion, and HubSpot using a FastAPI backend and a React (MUI) frontend. The app allows users to connect their accounts, fetch data, and view integration items in a clean UI.

---

## Features

- **OAuth2 Integration**: Securely connect to Airtable, Notion, and HubSpot using OAuth2.
- **Data Loading**: Fetch and display integration items (e.g., Airtable bases, Notion pages, HubSpot contacts).
- **Modern UI**: Responsive, user-friendly interface using Material UI (MUI).
- **State Management**: Global state handled with Zustand for a clean and scalable frontend architecture.
- **Temporary Credential Storage**: Uses Redis for secure, temporary storage of OAuth tokens and state.

---
### Prerequisites

- Python 3.10+
- Node.js 16+
- Redis server

### 1. **Clone the repository**

```sh
git clone <your-repo-url>
cd VectorShift-Assesment
```

### 2. **Backend Setup**

```sh
cd backend
python -m venv testenv
source testenv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # or create your own .env
```

**Edit `.env`** and add your client IDs and secrets for Airtable, Notion, and HubSpot.

### 3. **Start Redis**

```sh
redis-server
```

### 4. **Run the Backend**

```sh
uvicorn main:app --reload
```

### 5. **Frontend Setup**

```sh
cd ../frontend
npm install
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Enter a user and organization name.
2. Select an integration type (Airtable, Notion, or HubSpot).
3. Click "Connect" to authorize the app with the selected service.
4. Once connected, click "Load Data" to fetch and view integration items.

---

## Changes & Implementation Notes

- **Backend**
  - Completed `hubspot.py` with full OAuth2 flow and contact fetching.
  - Refactored `airtable.py` and `notion.py` to load credentials from `.env`.
  - Used Redis for secure, temporary storage of OAuth state and tokens.
  - All endpoints CORS-enabled for local frontend development.

- **Frontend**
  - Built a modern UI with Material UI (MUI).
  - Implemented global state management using Zustand (`store/Store.js`).
  - Refactored all integration components (`airtable.js`, `notion.js`, `hubspot.js`) to use Zustand.
  - Improved UX with loading indicators, connection status, and error handling.
  - Data loading and clearing is seamless and resets when switching integrations.

- **General**
  - `.gitignore` files added for both backend and frontend.
  - All sensitive credentials are loaded from environment variables and never hardcoded.

---

## Author

Assessment completed by [Abilash Konganar] for VectorShift.


