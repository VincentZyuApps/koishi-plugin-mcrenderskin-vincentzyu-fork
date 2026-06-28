## 📖 Usage

### 🗃️ extract_default_wall.py — Extract default wallpaper base64 from bundle
```bash
python ./scripts/extract_default_wall.py </path/to/index.js>
# uv run .\scripts\extract_default_wall.py G:\GGames\Minecraft\shuyeyun\qq-bot\AAA_from_npm_AAA\koishi-plugin-mcrenderskin-custplugin\lib\index.js
```

### ✂️ subfont.py — Subset font to keep only specified characters
```bash
uv venv
uv pip install fonttools
uv run python ./scripts/subfont.py </path/to/font.ttf>
# uv run python .\scripts\subfont.py G:\GGames\Minecraft\shuyeyun\qq-bot\koishi-dev\koishi-dev-8\data\fonts\MinecraftAE.ttf
```

### 🔍 analyze_font.py — Analyze font info (glyphs, tables, character map)
```bash
uv venv
uv pip install fonttools
uv run python ./scripts/analyze_font.py </path/to/font.ttf>
# uv run python .\scripts\analyze_font.py G:\GGames\Minecraft\shuyeyun\qq-bot\koishi-dev\koishi-dev-8\external\mcrenderskin-vincentzyu-fork\assets\fonts\MinecraftAE.sub.ttf
```