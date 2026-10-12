@echo off
echo Syncing Markdown files from sections/ to assets/js/book-data.js...
python -c "import os, glob, json; data = {os.path.basename(f): open(f, 'r', encoding='utf-8').read() for f in sorted(glob.glob('sections/*.md'))}; open('assets/js/book-data.js', 'w', encoding='utf-8').write('window.__BOOK_DATA__ = ' + json.dumps(data, ensure_ascii=False) + ';\n'); print(f'Synced {len(data)} Markdown sections successfully!')"
echo Done! You can now refresh index.html in your browser.
pause
