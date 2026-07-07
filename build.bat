@echo off
echo Building frontend...
call npm run build

echo Build complete!
echo Frontend is ready at dist/
echo To start server: npm run server
echo App will be available at http://localhost:5000
