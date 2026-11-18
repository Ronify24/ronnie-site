"""Local static preview with byte-range support for video seeking."""
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.remaining = None
        requested = self.headers.get('Range')
        if not requested:
            return super().send_head()
        path = self.translate_path(self.path)
        try:
            file = open(path, 'rb')
        except (OSError, IsADirectoryError):
            return super().send_head()
        file.seek(0, 2)
        size = file.tell()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested)
        if not match or not any(match.groups()):
            file.close()
            return super().send_head()
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start > end or start >= size:
            file.close()
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.end_headers()
            return None
        self.remaining = end - start + 1
        file.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Length', str(self.remaining))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        return file

    def copyfile(self, source, output):
        if self.remaining is None:
            return super().copyfile(source, output)
        while self.remaining:
            chunk = source.read(min(65536, self.remaining))
            if not chunk:
                break
            output.write(chunk)
            self.remaining -= len(chunk)

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 4173), Handler).serve_forever()
