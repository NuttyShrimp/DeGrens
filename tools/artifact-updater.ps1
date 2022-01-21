[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$origPath = $( Get-Location )
$artifactsPath = 'C:\Users\janle\Documents\fivem_artifacts'
$artifactsInfo = 'https://changelogs-live.fivem.net/api/changelog/versions/win32/server'

$artifactsJson = Invoke-WebRequest -Uri $artifactsInfo
$artifactsJson = $artifactsJson | ConvertFrom-Json
if ($response.connectionTestStatus -match "FAIL")
{
  return $response.connectionTestStatus
}

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
if ($installedVersion -eq $artifactsJson.latest)
{
  Write-Host "No update available"
  cd $origPath
  return
}
Write-Host "Update available from $installedVersion to"$artifactsJson.latest

# Remove all files from in artifacts folder
Remove-Item -Recurse -Force *

# download new artifacts
$url = $artifactsJson.latest_download
Invoke-WebRequest -Uri $url -OutFile server.zip
Expand-Archive -LiteralPath server.zip -DestinationPath .

Remove-Item -Force server.zip

# update version file
$version = $artifactsJson.latest
Set-Content version $version

Write-Host "Update complete"
cd $origPath