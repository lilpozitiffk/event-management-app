import os
import subprocess

import modal

app = modal.App("event-management-frontend")

image = modal.Image.from_dockerfile(
    "modal_frontend.Dockerfile",
    build_args={"VITE_API_URL": os.environ.get("VITE_API_URL", "")},
    add_python="3.11",
)


def _set_runtime_env() -> None:
    os.environ.setdefault("PORT", "3000")


@app.function(image=image, min_containers=1, buffer_containers=1, max_containers=3)
@modal.concurrent(max_inputs=20, target_inputs=10)
@modal.web_server(port=3000, startup_timeout=120)
def web():
    _set_runtime_env()
    server = subprocess.Popen(
        ["bash", "-lc", "cd /app/client && serve -s dist -l 3000"],
        stdout=None,
        stderr=None,
        env=os.environ.copy(),
    )
    return server.wait()
