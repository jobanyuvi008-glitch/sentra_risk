import subprocess
import time

def run_script(script_name):
    print(f"⏳ Running {script_name}...")
    subprocess.run(["python", script_name], check=True) 

def start_continuous_engine():
    print("==================================================")
    print("🛡️ SENTRA RISK: CONTINUOUS SYNC ENGINE INITIATED 🛡️")
    print("==================================================")
    
    cycle_count = 1
    
    while True:
        print(f"\n--- STARTING SYNC CYCLE #{cycle_count} ---")
        
        try:
            # We removed json_generation.py so your custom added assets don't get deleted!
            
            # 1. Fetch live ML probabilities
            run_script("prob_generation.py")
            
            # 2. Calculate business financial impact
            run_script("finalcial_impact_gen.py")
            
            # 3. Calculate Expected Annual Loss
            run_script("expected_loss_gen.py")
            
            # 4. Push the finalized data to Neon PostgreSQL (Fixed filename!)
            run_script("migrate_to_postgre.py")
            
            print(f"✅ CYCLE #{cycle_count} COMPLETE. Database is live.")
            
        except Exception as e:
            print(f"⚠️ Cycle Failed: {e}. Retrying on next loop...")

        cycle_count += 1
        print("💤 Engine sleeping for 30 seconds. Press Ctrl+C to stop.\n")
        time.sleep(30)

if __name__ == "__main__":
    start_continuous_engine()