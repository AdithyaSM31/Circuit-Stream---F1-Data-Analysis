# Generate Android Icons from logo.png
Add-Type -AssemblyName System.Drawing

$sourcePath = "public\logo.png"
$sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath))

# Define icon sizes for Android
$iconSizes = @{
    "android\app\src\main\res\mipmap-mdpi\ic_launcher.png" = 48
    "android\app\src\main\res\mipmap-hdpi\ic_launcher.png" = 72
    "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" = 96
    "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" = 144
    "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" = 192
    "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png" = 48
    "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png" = 72
    "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png" = 96
    "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png" = 144
    "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png" = 192
}

foreach ($path in $iconSizes.Keys) {
    $size = $iconSizes[$path]
    $targetPath = $path
    
    # Create directory if it doesn't exist
    $targetDir = Split-Path -Parent $targetPath
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    # Resize image
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
    
    # Save image
    $bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "Created: $targetPath ($size x $size)"
}

$sourceImage.Dispose()
Write-Host "`nAll icons generated successfully!"
