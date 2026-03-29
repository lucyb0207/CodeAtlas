import ast
import os
import json
import sys

def parse_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            tree = ast.parse(f.read(), filename=file_path)
        except Exception:
            return []

    imports = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)

        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)

    return imports


def parse_folder(folder_path):
    graph = {
        "nodes": [],
        "links": [],
        "backLinks": {}
    }

    files = []

    for root, _, filenames in os.walk(folder_path):
        for f in filenames:
            if f.endswith(".py"):
                full = os.path.join(root, f)
                files.append(full)

    for file in files:
        file_id = os.path.relpath(file, folder_path)
        graph["nodes"].append({"id": file_id})

        imports = parse_file(file)

        for imp in imports:
            target = imp.replace(".", "/") + ".py"

            graph["links"].append({
                "source": file_id,
                "target": target
            })

            if not any(n["id"] == target for n in graph["nodes"]):
                graph["nodes"].append({"id": target})

            graph["backLinks"].setdefault(target, []).append(file_id)

    return graph


if __name__ == "__main__":
    folder = sys.argv[1]
    result = parse_folder(folder)
    print(json.dumps(result))