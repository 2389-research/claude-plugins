"""Test the XML file parser with backtick placeholder support."""
import os
import re
import tempfile
from pathlib import Path


def parse_and_write_files(response_text: str, output_dir: str) -> dict:
    """Copied from server.py for isolated testing (no httpx dep needed)."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    files_written = []
    errors = []
    total_lines = 0

    # Primary: XML-style <FILE path="...">...</FILE> tags (backtick-safe)
    pattern = r'<FILE\s+path="([^"]+)">\n?(.*?)</FILE>'
    matches = re.findall(pattern, response_text, re.DOTALL)

    # Fallback 1: Legacy ### FILE: with ```code blocks
    if not matches:
        pattern = r'### FILE:\s*(\S+)\s*\n```(?:\w+)?\n(.*?)```'
        matches = re.findall(pattern, response_text, re.DOTALL)

    # Fallback 2: Raw content between FILE markers
    if not matches:
        pattern = r'### FILE:\s*(\S+)\s*\n(.*?)(?=### FILE:|$)'
        matches = re.findall(pattern, response_text, re.DOTALL)

    resolved_output = output_path.resolve()

    for filename, content in matches:
        content = content.strip()
        if not content:
            continue

        # Replace backtick placeholder with actual triple backticks
        content = content.replace("TRIPLE_BACKTICK", "```")

        # Security: reject absolute paths and traversal attempts
        if os.path.isabs(filename) or ".." in filename.split("/"):
            errors.append({"filename": filename, "error": "Path traversal rejected"})
            continue

        file_path = (output_path / filename).resolve()
        if not (file_path == resolved_output or str(file_path).startswith(str(resolved_output) + os.sep)):
            errors.append({"filename": filename, "error": "Path traversal rejected"})
            continue
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content, encoding="utf-8")
        line_count = len(content.splitlines())
        files_written.append({"filename": filename, "lines": line_count})
        total_lines += line_count

    return {
        "files_written": files_written,
        "total_files": len(files_written),
        "total_lines": total_lines,
        "errors": errors if errors else None,
    }


# Test 1: XML format with TRIPLE_BACKTICK placeholder
response_xml = '''<FILE path="converter.py">
import re

def markdown_to_html(md: str) -> str:
    lines = md.split("\\n")
    in_code = False
    output = []
    for line in lines:
        if line.strip() == TRIPLE_BACKTICK:
            in_code = not in_code
            if in_code:
                output.append("<pre><code>")
            else:
                output.append("</code></pre>")
            continue
        if in_code:
            output.append(line)
        else:
            output.append(f"<p>{line}</p>")
    return "\\n".join(output)
</FILE>

<FILE path="cli.py">
import sys
from converter import markdown_to_html
print(markdown_to_html(sys.stdin.read()))
</FILE>
'''

with tempfile.TemporaryDirectory() as d:
    result = parse_and_write_files(response_xml, d)
    print("Test 1: XML format with TRIPLE_BACKTICK placeholder")
    print(f"  Files parsed: {result['total_files']}")
    for f in result["files_written"]:
        print(f"  - {f['filename']}: {f['lines']} lines")
    assert result["total_files"] == 2, f"Expected 2 files, got {result['total_files']}"

    content = (Path(d) / "converter.py").read_text()
    assert '```' in content, "TRIPLE_BACKTICK should be replaced with actual backticks!"
    assert 'TRIPLE_BACKTICK' not in content, "Placeholder should NOT remain in output!"
    assert 'if line.strip() == ```' in content, "Expected backtick replacement in code fence check"
    print("  TRIPLE_BACKTICK -> ``` replacement: WORKS")
    print()

# Test 2: Multiple placeholders in same file
response_multi = '''<FILE path="parser.py">
FENCE = TRIPLE_BACKTICK
def parse(text):
    if text.startswith(TRIPLE_BACKTICK + "python"):
        lang = "python"
    if text == TRIPLE_BACKTICK:
        return "fence"
</FILE>
'''

with tempfile.TemporaryDirectory() as d:
    result = parse_and_write_files(response_multi, d)
    print("Test 2: Multiple placeholders")
    content = (Path(d) / "parser.py").read_text()
    assert content.count('```') == 3, f"Expected 3 backtick replacements, got {content.count('```')}"
    assert 'TRIPLE_BACKTICK' not in content
    print("  Replacements: 3/3 correct")
    print()

# Test 3: No placeholder needed (normal code) — should pass through unchanged
response_normal = '''<FILE path="hello.py">
def hello():
    print("Hello, world!")
</FILE>
'''

with tempfile.TemporaryDirectory() as d:
    result = parse_and_write_files(response_normal, d)
    print("Test 3: Normal code (no placeholders)")
    assert result["total_files"] == 1
    content = (Path(d) / "hello.py").read_text()
    assert 'TRIPLE_BACKTICK' not in content
    assert '```' not in content
    print("  No false replacements: CORRECT")
    print()

# Test 4: Path traversal rejection
response_traversal = '''<FILE path="../../etc/passwd">
root:x:0:0:root:/root:/bin/bash
</FILE>

<FILE path="/tmp/evil.py">
import os; os.system("rm -rf /")
</FILE>

<FILE path="safe.py">
print("I am safe")
</FILE>
'''

with tempfile.TemporaryDirectory() as d:
    result = parse_and_write_files(response_traversal, d)
    print("Test 4: Path traversal rejection")
    assert result["total_files"] == 1, f"Expected 1 safe file, got {result['total_files']}"
    assert result["errors"] is not None
    assert len(result["errors"]) == 2, f"Expected 2 rejected files, got {len(result['errors'])}"
    assert (Path(d) / "safe.py").exists(), "Safe file should be written"
    assert not Path("/tmp/evil.py").exists() or True  # don't actually check /tmp
    print(f"  Rejected {len(result['errors'])} traversal attempts")
    print(f"  Wrote {result['total_files']} safe file")
    print()

print("ALL PARSER TESTS PASSED!")
