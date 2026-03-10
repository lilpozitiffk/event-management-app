import os
import subprocess

import modal

app = modal.App("event-management-full")

image = modal.Image.from_dockerfile("modal.Dockerfile", add_python="3.11")
db_secret = modal.Secret.from_name("neon-db")


def _run(cmd: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["bash", "-lc", cmd], check=check, env=os.environ.copy())


def _set_runtime_env() -> None:
    os.environ.setdefault("PORT", "3000")
    os.environ.setdefault("SERVE_STATIC", "false")


@app.function(image=image, secrets=[db_secret], min_containers=1, buffer_containers=1, max_containers=3)
@modal.concurrent(max_inputs=10, target_inputs=5)
@modal.web_server(port=3000, startup_timeout=120)
def web():
    _set_runtime_env()
    server = subprocess.Popen(
        ["bash", "-lc", "cd /app/server && node dist/main.js"],
        stdout=None,
        stderr=None,
        env=os.environ.copy(),
    )
    return server.wait()


@app.function(image=image, secrets=[db_secret])
def seed_db():
    _set_runtime_env()
    _run("cd /app/server && npm run seed")


@app.function(image=image, secrets=[db_secret])
def reset_db():
    _set_runtime_env()
    _run("cd /app/server && npm run reset-db")
    _run("cd /app/server && npm run seed")
