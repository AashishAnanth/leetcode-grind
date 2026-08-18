Start both the backend and frontend dev servers for the leetcode-grind app.

1. Start the FastAPI backend in the background:
```bash
cd /Users/aashishananth/Desktop/CS/agents/leetcode-grind/backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

2. Start the Vite frontend dev server in the background:
```bash
cd /Users/aashishananth/Desktop/CS/agents/leetcode-grind/frontend && npm run dev
```

Run both commands using the Bash tool with `run_in_background: true`. After starting both, report the URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs
