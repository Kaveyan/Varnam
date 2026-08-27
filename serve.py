"""Static dev server for the Varnam Mind Care site.

Same as `python -m http.server`, but tells the browser never to cache.
Plain http.server sends no cache headers, so Chrome keeps serving an old
styles.css / script.js after you edit them and the page looks unchanged.

    python serve.py [port]        # defaults to 8899
"""

import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
    handler = partial(NoCacheHandler, directory=str(ROOT))
    print("Serving %s at http://localhost:%d  (no-cache)" % (ROOT, port))
    HTTPServer(("", port), handler).serve_forever()


if __name__ == "__main__":
    main()
