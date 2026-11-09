import http.server
import socketserver
import webbrowser
import threading
import os

PORT = 8080
URL  = f"http://localhost:{PORT}"

os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.SimpleHTTPRequestHandler
handler.log_message = lambda *a: None  # tắt log request lộn xộn

print("")
print("  🌸  Thiệp Kỷ Yếu đang chạy!")
print("  ─────────────────────────────────────")
print(f"  🔗  http://localhost:{PORT}")
print("  ─────────────────────────────────────")
print("  ✅  Trình duyệt sẽ tự mở...")
print("  ⛔  Nhấn Ctrl+C để dừng server")
print("")

with socketserver.TCPServer(("", PORT), handler) as httpd:
    threading.Timer(1.0, lambda: webbrowser.open(URL)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  🛑  Đã dừng server. Tạm biệt! 🌸")
