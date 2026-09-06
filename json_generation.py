import json
import random

# 1. Base Assets
base_assets = [
    {"prefix": "DB", "names": ["Core Banking Database", "HR Employee DB", "Customer Analytics DB", "Transaction Ledger", "Backup Archive"], "crit_range": (7, 10), "records_range": (50000, 500000)},
    {"prefix": "WEB", "names": ["Public Corporate Website", "Internet Banking Portal", "Admin Dashboard", "Investor Relations Page", "API Gateway"], "crit_range": (5, 9), "records_range": (0, 10000)},
    {"prefix": "NET", "names": ["Employee VPN Gateway", "Core Router", "Internal Firewall", "Datacenter Switch", "Load Balancer"], "crit_range": (8, 10), "records_range": (0, 0)},
    {"prefix": "APP", "names": ["Payment Processing Service", "Email Notification Service", "User Auth Service", "Employee HR Portal", "PDF Generator"], "crit_range": (6, 10), "records_range": (5000, 50000)}
]

# 2. Base Vulnerabilities
base_vulnerabilities = [
    {"cve": "CVE-2019-11043", "name": "PHP Env-Injection", "sev": 7.5, "fix": "Update PHP to 7.3.11", "cost_range": (2, 5)},
    {"cve": "CVE-2021-44228", "name": "Log4j Remote Code Execution", "sev": 9.8, "fix": "Update Log4j to v2.17.1", "cost_range": (3, 8)},
    {"cve": "MISCONF-01", "name": "Missing Multi-Factor Authentication", "sev": 8.0, "fix": "Implement strict MFA policy", "cost_range": (1, 5)},
    {"cve": "CVE-2021-26855", "name": "Microsoft Exchange ProxyLogon", "sev": 9.8, "fix": "Apply MS Security Update", "cost_range": (4, 10)},
    {"cve": "MISCONF-02", "name": "Publicly Accessible S3 Bucket", "sev": 8.5, "fix": "Enable Block Public Access", "cost_range": (1, 2)}
]

generated_data = []
asset_counters = {"DB": 1, "WEB": 1, "NET": 1, "APP": 1}

# Create 40 corporate assets
corporate_assets = []
for _ in range(40):
    category = random.choice(base_assets)
    prefix = category["prefix"]
    
    corporate_assets.append({
        "id": f"{prefix}-{asset_counters[prefix]:03d}",
        "name": random.choice(category["names"]),
        "crit": random.randint(category["crit_range"][0], category["crit_range"][1]),
        "records": random.randint(category["records_range"][0], category["records_range"][1]),
        "internet": random.choice([True, False])
    })
    asset_counters[prefix] += 1

# Assign vulnerabilities until we reach 100 rows
while len(generated_data) < 100:
    asset = random.choice(corporate_assets)
    vuln = random.choice(base_vulnerabilities)
    
    # Prevent exact duplicate
    if any(d['asset_id'] == asset['id'] and d['vulnerability_cve'] == vuln['cve'] for d in generated_data):
        continue

    row = {
        "asset_id": asset["id"],
        "asset_name": asset["name"],
        "business_criticality": asset["crit"],
        "sensitive_data_records": asset["records"],
        "vulnerability_cve": vuln["cve"],
        "vulnerability_name": vuln["name"],
        "cvss_severity": vuln["sev"],
        "internet_exposed": asset["internet"],
        "remediation_cost_lakhs": random.randint(vuln["cost_range"][0], vuln["cost_range"][1]),
        "remediation_action": vuln["fix"]
    }
    
    generated_data.append(row)

with open('data.json', 'w') as f:
    json.dump(generated_data, f, indent=4)

print("✅ 'data.json' generated with raw data for backend calculations.")