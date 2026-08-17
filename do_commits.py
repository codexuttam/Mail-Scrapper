import os
import subprocess

file_to_change = "core_updates.md"
if not os.path.exists(file_to_change):
    with open(file_to_change, "w") as f:
        f.write("# Core Updates\n\n")

for i in range(1, 16):
    with open(file_to_change, "a") as f:
        f.write(f"Update {i}: Implementation of core feature {i}\n")
    subprocess.run(["git", "add", file_to_change])
    subprocess.run(["git", "commit", "-m", f"feat: core update {i}"])
    subprocess.run(["git", "push", "origin", "main"])
