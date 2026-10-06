import yaml

with open(".github/workflows/ci.yml") as f:
    wf = yaml.safe_load(f)

print("Workflow :", wf["name"])
print("Triggers :", ", ".join(wf.get(True, wf.get("on")).keys()))   # PyYAML reads the key `on` as True
print()
for job_id, job in wf["jobs"].items():
    print(f"Job '{job_id}'  runner: {job['runs-on']}  needs: {job.get('needs', '-')}")
    if "strategy" in job:
        print("   matrix:", job["strategy"]["matrix"])
    for i, step in enumerate(job["steps"], 1):
        kind = "uses " + step["uses"] if "uses" in step else "run"
        print(f"   step {i}: {step['name']}  ({kind})")
