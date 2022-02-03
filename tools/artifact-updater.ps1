# Example: ./artifact-updater.ps1 -p ../../artifacts
Param(
  [string]$type = "recommended",
  [Parameter(Mandatory = $true, HelpMessage = "Path to folder where artifacts are located")]
  [Alias("path", "p")]
  [string]$artifactsPath
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$origPath = $( Get-Location )
$artifactsInfo = 'https://changelogs-live.fivem.net/api/changelog/versions/win32/server'

$artifactsJson = Invoke-WebRequest -Uri $artifactsInfo
$artifactsJson = $artifactsJson | ConvertFrom-Json
if ($response.connectionTestStatus -match "FAIL")
{
  return $response.connectionTestStatus
}

$version = $artifactsJson.$type

Write-Host "=====================" -ForegroundColor Magenta
Write-Host "Updating artifacts..." -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

cd $artifactsPath
try
{
  $installedVersion = cat version
}
catch [System.IO.FileNotFoundException]
{
  $installedVersion = '1000'
}
if ($installedVersion -eq $version)
{
  Write-Host "No update available"
  cd $origPath
  return
}
Write-Host "Update available from $installedVersion to"$version

# Remove all files from in artifacts folder
Remove-Item -Recurse -Force *

# download new artifacts
$url = $artifactsJson.$( $type + "_download" )
Invoke-WebRequest -Uri $url -OutFile server.zip
Expand-Archive -LiteralPath server.zip -DestinationPath .

Remove-Item -Force server.zip

# update version file
Set-Content version $version

Write-Host "Update complete"
cd $origPath