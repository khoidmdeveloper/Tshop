# 1. Tự động lùng sục đường dẫn của semgrep.exe trong các thư mục Python
Write-Host "Locating semgrep.exe on your Windows system..." -ForegroundColor Cyan

$semgrepPath = $null
$semgrepDir = $null

# Thử tìm bằng lệnh hệ thống trước
if (Get-Command semgrep -ErrorAction SilentlyContinue) {
    $semgrepPath = (Get-Command semgrep).Source
    $semgrepDir = Split-Path $semgrepPath
} else {
    # Nếu không thấy, đi tìm trong thư mục AppData và Program Files của Python
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
    if ($pythonPath) {
        $pythonDir = Split-Path $pythonPath
        $possiblePaths = @(
            (Join-Path $pythonDir "Scripts\semgrep.exe"),
            (Join-Path $env:APPDATA "Python\Python*\Scripts\semgrep.exe"),
            (Join-Path $env:LOCALAPPDATA "Programs\Python\Python*\Scripts\semgrep.exe")
        )
        
        foreach ($pathPattern in $possiblePaths) {
            $foundFiles = Resolve-Path $pathPattern -ErrorAction SilentlyContinue
            if ($foundFiles) {
                $semgrepPath = $foundFiles[0].Path
                $semgrepDir = Split-Path $semgrepPath
                break
            }
        }
    }
}

# Nếu lục tung máy lên vẫn không thấy thì tiến hành cài đặt lại để sinh file .exe
if (-not $semgrepPath) {
    Write-Host "Semgrep executable not found. Running forced installation via pip..." -ForegroundColor Yellow
    python -m pip install semgrep --quiet
    
    $pythonPath = (Get-Command python).Source
    $pythonDir = Split-Path $pythonPath
    $semgrepPath = Join-Path $pythonDir "Scripts\semgrep.exe"
    $semgrepDir = Split-Path $semgrepPath
}

# Kiểm tra cuối cùng trước khi chạy thực nghiệm
if (-not $semgrepPath -or -not (Test-Path $semgrepPath)) {
    Write-Error "CRITICAL: Could not find semgrep.exe. Please run 'pip show semgrep' in terminal to check where it is installed."
    exit 1
}

Write-Host "Success! Found Semgrep at: $semgrepPath" -ForegroundColor Green

# 🔥 Vá lỗi pysemgrep: Tạm thời thêm thư mục Scripts vào PATH của phiên làm việc này
Write-Host "Injecting Semgrep directory to temporary PATH to fix pysemgrep wrapper issue..." -ForegroundColor Cyan
$env:PATH = "$semgrepDir;" + $env:PATH

# 2. Khởi tạo thư mục lưu kết quả thực nghiệm
$absoluteOutputDir = Join-Path $PSScriptRoot "scan_results"
if (-not (Test-Path $absoluteOutputDir)) {
    New-Item -ItemType Directory -Force -Path $absoluteOutputDir | Out-Null
} else {
    Remove-Item (Join-Path $absoluteOutputDir "*") -Force -ErrorAction SilentlyContinue
}

# 🎯 ĐỊNH NGHĨA FILE KẾT QUẢ DUY NHẤT
$singleResultFile = Join-Path $absoluteOutputDir "semgrep_report.json"
$logFile = Join-Path $absoluteOutputDir "time_log.txt"

Write-Host "`nStart 20 experimental scans and saving data to 1 single file..." -ForegroundColor Green

# 3. Vòng lặp thực nghiệm quét 20 lần
for ($i = 1; $i -le 20; $i++) {
    Write-Host "Executing Scan $i/20..." -ForegroundColor Yellow

    # Đo thời gian bằng đường dẫn tuyệt đối kèm PATH đã được vá lỗi
    # Toàn bộ dữ liệu JSON của 20 lần quét sẽ ghi đè và cập nhật vào đúng file semgrep_report.json
    $time = Measure-Command {
        & $semgrepPath scan --config=auto --json --output "$singleResultFile" --metrics=on
    }

    $seconds = $time.TotalSeconds
    $logLine = "Scan $i - $seconds seconds"

    Add-Content -Path $logFile -Value $logLine -Encoding UTF8
    Write-Host "Finished Scan $i in $seconds seconds" -ForegroundColor Gray
}

Write-Host "`nComplete! All temporary data cleared." -ForegroundColor Green
Write-Host "Your final results are inside: $absoluteOutputDir" -ForegroundColor Green
Write-Host "  - Time Log: time_log.txt" -ForegroundColor Cyan
Write-Host "  - Scan Report: semgrep_report.json" -ForegroundColor Cyan