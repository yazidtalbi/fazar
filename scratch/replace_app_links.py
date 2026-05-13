import os
import re

def replace_in_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Replace /app with / in common URL patterns
    # href="/app" -> href="/"
    # href="/app/..." -> href="/..."
    # router.push("/app") -> router.push("/")
    # router.push("/app/...") -> router.push("/...")
    # redirect("/app") -> redirect("/")
    # redirect("/app/...") -> redirect("/...")
    
    # Regex to catch /app or /app/ inside quotes
    patterns = [
        (r'href="/app"', 'href="/"'),
        (r'href="/app/', 'href="/'),
        (r'push\("/app"\)', 'push("/")'),
        (r'push\("/app/', 'push("/'),
        (r'replace\("/app"\)', 'replace("/")'),
        (r'replace\("/app/', 'replace("/'),
        (r'redirect\("/app"\)', 'redirect("/")'),
        (r'redirect\("/app/', 'redirect("/'),
        (r'Link href="/app"', 'Link href="/"'),
        (r'Link href="/app/', 'Link href="/'),
        (r'pathname === "/app"', 'pathname === "/"'),
        (r'pathname \+\+\+ "/app/"', 'pathname +++ "/"'), # not really common but safe
    ]
    
    new_content = content
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        return True
    return False

def main():
    root_dirs = ['app', 'components']
    for root_dir in root_dirs:
        for root, dirs, files in os.walk(root_dir):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    file_path = os.path.join(root, file)
                    # Skip the nuqs adapter
                    if 'nuqs-adapter' in file_path:
                        continue
                    if replace_in_file(file_path):
                        print(f"Updated: {file_path}")

if __name__ == "__main__":
    main()
