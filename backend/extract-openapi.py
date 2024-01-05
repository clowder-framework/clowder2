# extract-openapi.py
# Based on https://www.doctave.com/blog/python-export-fastapi-openapi-spec
import argparse
import filecmp
import json
import os
import sys

import yaml
from uvicorn.importer import import_from_string

parser = argparse.ArgumentParser(prog="extract-openapi.py")
parser.add_argument("app", help='App import string. Eg. "app.main:app"')
parser.add_argument(
    "--app-dir", help="Directory containing the app", default="backend/app"
)
parser.add_argument(
    "--out", help="Output file ending in .json or .yaml", default="openapi.json"
)

if __name__ == "__main__":
    args = parser.parse_args()

    if args.app_dir is not None:
        print(f"adding {args.app_dir} to sys.path")
        sys.path.insert(0, args.app_dir)

    print(f"importing app from {args.app}")
    app = import_from_string(args.app)
    openapi = app.openapi()
    version = openapi.get("openapi", "unknown version")

    print(f"writing openapi spec v{version}")
    old_file = args.out
    new_file = "new_" + args.out
    with open(new_file, "w") as f:
        if new_file.endswith(".json"):
            json.dump(openapi, f, indent=2)
        else:
            yaml.dump(openapi, f, sort_keys=False)

    if os.path.isfile(old_file) and filecmp.cmp(old_file, new_file, shallow=False):
        print("no changes")
        os.remove(new_file)
    else:
        print("spec updated")
        os.rename(new_file, old_file)
        print(f"spec written to {args.out}")
