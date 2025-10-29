@echo off
echo Starting Firefox with remote debugging enabled...
echo.
echo Once Firefox opens, navigate to your app and then run:
echo   npm run firefox-logs -- --url=YOUR_URL
echo.
"C:\Program Files\Mozilla Firefox\firefox.exe" --remote-debugging-port 9222
