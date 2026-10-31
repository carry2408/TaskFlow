<#
.SYNOPSIS
    Resets the TaskFlow database and seeds realistic enterprise dummy data.
.DESCRIPTION
    Wipes existing data safely across all tables and populates users, teams, projects,
    issues, sprints, labels, comments, history, and notifications.
#>

$scriptPath = Join-Path $PSScriptRoot "seed-dummy-data.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Error "Could not find seed-dummy-data.sql at $scriptPath"
    exit 1
}

Write-Host "Resetting TaskFlow database and seeding dummy data..." -ForegroundColor Cyan

Get-Content $scriptPath -Raw | docker exec -i taskflow_postgres psql -U taskflow_user -d taskflow_db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Database successfully reset & seeded with dummy data!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Admin Credentials:" -ForegroundColor Yellow
    Write-Host "  Email:    admin@taskflow.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "Other Accounts (All passwords: admin123):" -ForegroundColor Yellow
    Write-Host "  Sarah Connor (Project Manager): sarah.pm@taskflow.com" -ForegroundColor White
    Write-Host "  Alex Mercer  (Developer):       alex.dev@taskflow.com" -ForegroundColor White
    Write-Host "  Elena Rostova (Developer):      elena.dev@taskflow.com" -ForegroundColor White
    Write-Host "  Marcus Vance (QA Engineer):     marcus.qa@taskflow.com" -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Error "Failed to execute seed script. Please make sure the Docker container 'taskflow_postgres' is running."
}

