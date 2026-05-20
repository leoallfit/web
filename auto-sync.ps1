Set-Location "C:\Users\leone\web"

$status = git status --porcelain 2>&1
if ($status) {
    git add -A
    git commit -m "Auto-guardado $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
    git push origin main
}
