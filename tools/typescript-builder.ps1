# Save current location
$origPath = $(Get-Location)
$resPath = Join-Path $PSScriptRoot "..\resources"
Write-Output "[INFO] Loading resources from $resPath"

$files = Get-ChildItem -Path $resPath -Filter package.json -Recurse -File | where-object { $_.fullname -notlike "*node_modules*" }

Write-Output "[INFO] Found $($files.count) package.json files"

function escapePath {
	param (
		[string] $path
	)
	$path = [Regex]::Escape($path)
	$path = $path -replace '\[', '`['
	$path = $path -replace '\]', '`]'
	$path = $path -replace '\\\\', '\'
	return $path
}

# Loop through each package.json file
foreach ($item in $files) {
	# Make sure the 
	# set-location to the folder of the package.json file
	$path = escapePath($item.DirectoryName)
	Write-Output "[INFO] Building in $path"
	Set-Location $path
	yarn &&	yarn build
}

Set-Location $origPath