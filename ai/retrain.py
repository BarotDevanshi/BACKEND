import subprocess
import sys

def run_script(script_name):
    print(f"🔄 Training {script_name}...")
    result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ Successfully trained {script_name}")
        print(result.stdout)
    else:
        print(f"❌ Failed to train {script_name}")
        print(result.stderr)

if __name__ == "__main__":
    print("🚀 Starting full model retraining pipeline...")
    run_script("train_model1.py")
    run_script("train_model2.py")
    print("🎉 All models retrained and artifacts saved successfully.")
